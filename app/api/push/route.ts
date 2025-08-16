export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { auth } from "@/auth";

import { NextResponse } from "next/server";
import { calendarClient, ensureCalendarId } from "@/lib/google";
import { z } from "zod";

const BodySchema = z.object({
  timezone: z.string(),
  events: z.array(
    z.object({
      id: z.string(),
      startISO: z.string(),
      endISO: z.string(),
      title: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
    })
  ),
  useDedicatedCalendar: z.boolean().optional(),
  dedicatedCalendarName: z.string().optional(),
  dedicatedCalendarColorId: z.string().optional(),
});

// --- throttling & backoff helpers ---
const BASE_SLEEP_MS = 120; // small base delay between calls
const MAX_RETRIES = 6; // exponential backoff retries
const MAX_JITTER_MS = 120; // add randomness so bursts don't align

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRateLimited(e: any) {
  const status = e?.code || e?.response?.status;
  const reason =
    e?.errors?.[0]?.reason ||
    e?.response?.data?.error?.errors?.[0]?.reason ||
    e?.response?.data?.error?.status ||
    e?.message;
  return (
    (status === 403 || status === 429 || status === 500 || status === 503) &&
    (String(reason).includes("rateLimitExceeded") ||
      String(reason).includes("userRateLimitExceeded") ||
      String(reason).includes("backendError"))
  );
}

async function withBackoff<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let attempt = 0;
  let delay = BASE_SLEEP_MS;
  while (true) {
    try {
      return await fn();
    } catch (e: any) {
      if (attempt < MAX_RETRIES && isRateLimited(e)) {
        const jitter = Math.floor(Math.random() * MAX_JITTER_MS);
        await sleep(delay + jitter);
        delay = Math.min(delay * 2, 4000); // cap growth
        attempt++;
        continue;
      }
      throw e;
    }
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { accessToken, refreshToken, user } = session as any;
    const calendar = calendarClient(accessToken, refreshToken);

    // choose target calendar
    let calendarId = "primary";
    if (parsed.data.useDedicatedCalendar) {
      try {
        calendarId = await ensureCalendarId(
          calendar,
          parsed.data.dedicatedCalendarName || "Shift Rota",
          parsed.data.dedicatedCalendarColorId || "11"
        );
      } catch (e: any) {
        const status = e?.code || e?.response?.status || 500;
        const details = e?.response?.data || e?.message || String(e);
        return NextResponse.json(
          {
            message:
              "Failed to ensure dedicated calendar. Make sure scope is https://www.googleapis.com/auth/calendar and re-consent.",
            details,
          },
          { status }
        );
      }
    }

    // upsert events with pacing + backoff
    let upserted = 0;
    for (const ev of parsed.data.events) {
      const resource = {
        id: ev.id,
        summary: ev.title,
        description: ev.description,
        location: ev.location,
        start: { dateTime: ev.startISO, timeZone: "UTC" },
        end: { dateTime: ev.endISO, timeZone: "UTC" },
        reminders: { useDefault: true },
        source: {
          title: "Shift Rota",
          url: process.env.NEXTAUTH_URL || "https://example.com",
        },
      };

      try {
        await withBackoff(`update:${ev.id}`, () =>
          calendar.events.update({
            calendarId,
            eventId: ev.id,
            requestBody: resource,
            // sendUpdates: 'none'  // uncomment to avoid attendee emails
          })
        );
        upserted++;
      } catch (e: any) {
        const status = e?.code || e?.response?.status;

        if (status === 404) {
          await withBackoff(`insert:${ev.id}`, () =>
            calendar.events.insert({
              calendarId,
              requestBody: resource,
              // sendUpdates: 'none'
            })
          );
          upserted++;
        } else if (status === 409) {
          const newId = ev.id + "-" + Math.random().toString(36).slice(2, 8);
          await withBackoff(`insert-collision:${ev.id}`, () =>
            calendar.events.insert({
              calendarId,
              requestBody: { ...resource, id: newId },
              // sendUpdates: 'none'
            })
          );
          upserted++;
        } else if (isRateLimited(e)) {
          // Final attempt failed after retries
          const details = e?.response?.data || e?.message || String(e);
          return NextResponse.json(
            {
              message:
                "Rate limit exceeded while writing events (after retries). Try a smaller range.",
              details,
            },
            { status: 429 }
          );
        } else {
          const details = e?.response?.data || e?.message || String(e);
          return NextResponse.json(
            {
              message: "Google Calendar error while upserting events",
              details,
            },
            { status: status || 500 }
          );
        }
      }

      // gentle pacing between calls to avoid bursts
      await sleep(BASE_SLEEP_MS);
    }

    return NextResponse.json({ upserted, calendarId });
  } catch (e: any) {
    const details = e?.response?.data || e?.message || String(e);
    return NextResponse.json(
      { message: "Server error", details },
      { status: 500 }
    );
  }
}
