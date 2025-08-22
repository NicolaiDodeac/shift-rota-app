import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { calendarClient, ensureCalendarId } from "@/lib/google";
import { prisma } from "@/lib/db";
import { getOrCreateUserByEmail } from "@/lib/users";
import { DateTime } from "luxon";

const BodySchema = z.object({
  start: z.string(), // 'YYYY-MM-DD'
  end: z.string(), // 'YYYY-MM-DD'
  useDedicatedCalendar: z.boolean().optional(),
  dedicatedCalendarName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
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

    const anySession = session as any;
    const calendar = calendarClient(
      anySession.accessToken,
      anySession.refreshToken
    );

    let calendarId = "primary";
    if (parsed.data.useDedicatedCalendar) {
      try {
        calendarId = await ensureCalendarId(
          calendar,
          parsed.data.dedicatedCalendarName || "Shift Rota",
          "11"
        );
      } catch (e: any) {
        return NextResponse.json(
          { message: "Failed to find dedicated calendar", details: e?.message },
          { status: 500 }
        );
      }
    }

    // Delete from Google Calendar
    const timeMin = new Date(parsed.data.start + "T00:00:00Z").toISOString();
    const timeMax = new Date(parsed.data.end + "T23:59:59Z").toISOString();

    let deleted = 0;
    let pageToken: string | undefined = undefined;

    do {
      const events: any = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        maxResults: 2500,
        pageToken,
      });

      for (const item of events.data.items ?? []) {
        if (!item.id) continue;
        try {
          await calendar.events.delete({ calendarId, eventId: item.id });
          deleted++;
        } catch (e) {
          console.warn("Delete failed for", item.id, e);
        }
      }
      pageToken = events.data.nextPageToken || undefined;
    } while (pageToken);

    // Delete from our DB
    const tz =
      (await prisma.settings.findUnique({ where: { userId: user.id } }))?.tz ||
      "Europe/London";
    const startUTC = DateTime.fromISO(parsed.data.start, { zone: tz })
      .startOf("day")
      .toUTC();
    const endUTC = DateTime.fromISO(parsed.data.end, { zone: tz })
      .endOf("day")
      .toUTC();

    const dbDel = await prisma.shiftInstance.deleteMany({
      where: {
        userId: user.id,
        startUTC: { gte: startUTC.toJSDate(), lte: endUTC.toJSDate() },
      },
    });

    return NextResponse.json({ 
      deleted, 
      dbDeleted: dbDel.count, 
      calendarId 
    });
  } catch (error: any) {
    console.error("Delete route error:", error);
    return NextResponse.json(
      { message: "Server error", details: error?.message },
      { status: 500 }
    );
  }
}
