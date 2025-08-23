import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { calendarClient, ensureCalendarId } from "@/lib/google";
import { prisma } from "@/lib/db";
import { getOrCreateUserByEmail } from "@/lib/users";
import { minutesBetweenUTC } from "@/lib/time";

const BodySchema = z.object({
  timezone: z.string(),
  events: z.array(
    z.object({
      id: z.string(),
      startISO: z.string(),
      endISO: z.string(),
      localStart: z.string().optional(),
      localEnd: z.string().optional(),
      title: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      type: z.enum(["day", "night"]).optional(),
    })
  ),
  useDedicatedCalendar: z.boolean().optional(),
  dedicatedCalendarName: z.string().optional(),
  dedicatedCalendarColorId: z.string().optional(),
});

// Rate limiting helpers
const BASE_SLEEP_MS = 120;
const MAX_RETRIES = 6;
const MAX_JITTER_MS = 120;

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
        delay = Math.min(delay * 2, 4000);
        attempt++;
        continue;
      }
      throw e;
    }
  }
}

export async function GET(req: Request) {
  console.log("GET /api/push called");
  return NextResponse.json({ message: "Push route is working" });
}

export async function POST(req: Request) {
  console.log("POST /api/push called");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  try {
    const session = await auth();
    console.log("Session:", session ? "exists" : "null");
    if (!session?.user?.email) {
      console.log("No session or email");
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

    const email = session.user.email;
    const user = await getOrCreateUserByEmail(email);

    // Google calendar client
    const anySession = session as any;
    const calendar = calendarClient(
      anySession.accessToken,
      anySession.refreshToken
    );

    // Choose calendar id (primary or dedicated)
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

    const tz = parsed.data.timezone;
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
        await withBackoff(`update:${ev.id}`, async () => {
          try {
            await calendar.events.update({
              calendarId,
              eventId: ev.id,
              requestBody: resource,
            });
          } catch (e: any) {
            const status = e?.code || e?.response?.status;
            if (status === 404) {
              await calendar.events.insert({ calendarId, requestBody: resource });
            } else if (status === 409) {
              const newId = ev.id + "-" + Math.random().toString(36).slice(2, 8);
              await calendar.events.insert({
                calendarId,
                requestBody: { ...resource, id: newId },
              });
            } else {
              throw e;
            }
          }
        });
        upserted++;

        // Persist ShiftInstance in DB
        const scheduledMin = minutesBetweenUTC(
          ev.localStart ?? ev.startISO,
          ev.localEnd ?? ev.endISO,
          tz
        );

        // Try to find existing shift instance
        const existingShift = await prisma.shiftInstance.findFirst({
          where: {
            userId: user.id,
            sourceKey: ev.id,
          },
        });

        if (existingShift) {
          // Update existing
          await prisma.shiftInstance.update({
            where: { id: existingShift.id },
            data: {
              calendarId,
              tz,
              startUTC: new Date(ev.startISO),
              endUTC: new Date(ev.endISO),
              scheduledMin,
            },
          });
        } else {
          // Create new
          await prisma.shiftInstance.create({
            data: {
              userId: user.id,
              sourceKey: ev.id,
              calendarId,
              tz,
              startUTC: new Date(ev.startISO),
              endUTC: new Date(ev.endISO),
              scheduledMin,
            },
          });
        }

        // Gentle pacing between calls
        await sleep(BASE_SLEEP_MS);
      } catch (err: any) {
        console.error("Calendar/DB error:", err);
        if (isRateLimited(err)) {
          return NextResponse.json(
            {
              message:
                "Rate limit exceeded while writing events (after retries). Try a smaller range.",
              details: err?.response?.data || err?.message || String(err),
            },
            { status: 429 }
          );
        }
        throw err;
      }
    }

    return NextResponse.json({ upserted, calendarId });
  } catch (error: any) {
    console.error("Push route error:", error);
    const details = error?.response?.data || error?.message || String(error);
    return NextResponse.json(
      { message: "Server error", details },
      { status: 500 }
    );
  }
}
