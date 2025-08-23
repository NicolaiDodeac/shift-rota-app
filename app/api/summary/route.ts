// app/api/summary/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, resetPrismaClient } from "@/lib/db";
import { getOrCreateUserByEmail, getOrCreateUserSettings } from "@/lib/users";
import { DateTime } from "luxon";
import { buildWeekStatsFromShifts } from "@/lib/annualised";

// Helper function to handle Prisma connection errors
async function withConnectionRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // If it's a connection error, try resetting the connection
    if (error?.message?.includes('prepared statement') || error?.code === '26000') {
      console.log('Resetting Prisma client due to connection error...');
      await resetPrismaClient();
      return await operation();
    } else {
      throw error;
    }
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;
    
    // Try to get user with connection reset on error
    let user;
    try {
      user = await getOrCreateUserByEmail(email);
    } catch (dbError: any) {
      // If it's a connection error, try resetting the connection
      if (dbError?.message?.includes('prepared statement') || dbError?.code === '26000') {
        console.log('Resetting Prisma client due to connection error...');
        await resetPrismaClient();
        user = await getOrCreateUserByEmail(email);
      } else {
        throw dbError;
      }
    }

    const url = new URL(req.url);
    const weeksBack = Number(url.searchParams.get("weeks") || 12);

    // Try to get settings, fallback to default if not found
    let settings;
    let tz = "Europe/London";
    try {
      settings = await getOrCreateUserSettings(user.id);
      tz = settings.tz;
    } catch (error) {
      console.log("Settings not found, using default timezone:", tz);
    }

    const end = DateTime.now().setZone(tz).endOf("day");
    const start = end.minus({ weeks: weeksBack }).startOf("day");

    // Use connection retry for the main query
    const rows = await withConnectionRetry(async () => {
      return await prisma.shiftInstance.findMany({
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
    });

    const weeks = buildWeekStatsFromShifts(
      rows, 
      tz, 
      settings?.basicHoursCap ?? 48,
      settings?.overtimeMultiplier ?? 1.5
    );

    // overlay confirmed snapshots with connection retry
    const weekStartDates = weeks.map((w) => new Date(w.weekStartISO));
    const snaps = await withConnectionRetry(async () => {
      return await prisma.weekLedger.findMany({
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
    console.error("Error stack:", err?.stack);
    console.error("Error details:", {
      message: err?.message,
      code: err?.code,
      name: err?.name
    });
    return NextResponse.json(
      { 
        message: "Server error", 
        details: String(err?.message || err),
        errorType: err?.name,
        errorCode: err?.code
      },
      { status: 500 }
    );
  }
}
