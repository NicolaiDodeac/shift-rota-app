// app/api/summary/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getOrCreateUserByEmail, getOrCreateUserSettings } from "@/lib/users";
import { DateTime } from "luxon";
import { buildWeekStatsFromShifts } from "@/lib/annualised";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    const user = await getOrCreateUserByEmail(email);

    const url = new URL(req.url);
    const weeksBack = Number(url.searchParams.get("weeks") || 12);

    const settings = await getOrCreateUserSettings(user.id);
    const tz = settings.tz;

    const end = DateTime.now().setZone(tz).endOf("day");
    const start = end.minus({ weeks: weeksBack }).startOf("day");

    const rows = await prisma.shiftInstance.findMany({
      where: {
        userId: user.id,
        startUTC: {
          gte: start.toUTC().toJSDate(),
          lte: end.toUTC().toJSDate(),
        },
      },
      orderBy: { startUTC: "asc" },
      select: { startUTC: true, endUTC: true, tz: true, scheduledMin: true },
    });

    const weeks = buildWeekStatsFromShifts(rows, tz);

    // overlay confirmed snapshots
    const weekStartDates = weeks.map((w) => new Date(w.weekStartISO));
    const snaps = await prisma.weekLedger.findMany({
      where: { userId: user.id, weekStartUTC: { in: weekStartDates } },
      select: {
        weekStartUTC: true,
        scheduledMin: true,
        basicMin: true,
        overtimeMin: true,
        bankedMin: true,
        confirmed: true,
      },
    });

    type Snap = (typeof snaps)[number];

    const merged = weeks.map((w) => {
      const snap = snaps.find(
        (s: Snap) => +s.weekStartUTC === +new Date(w.weekStartISO)
      );
      return snap
        ? {
            ...w,
            scheduledMinutes: snap.scheduledMin,
            basicMinutes: snap.basicMin,
            overtimeMinutes: snap.overtimeMin,
            bankedMinutes: snap.bankedMin,
            confirmed: snap.confirmed,
          }
        : w;
    });

    return NextResponse.json({ tz, weeks: merged });
  } catch (err: any) {
    console.error("/api/summary error", err);
    return NextResponse.json(
      { message: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
