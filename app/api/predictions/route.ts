import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, resetPrismaClient } from "@/lib/db";
import { findManyWithRetry } from "@/lib/db-utils";
import { getOrCreateUserByEmail, getOrCreateUserSettings } from "@/lib/users";
import { currentContractYearStart } from "@/lib/time";
import { computeYearTargetHours, buildWeekStatsFromShifts } from "@/lib/annualised";
import { DateTime } from "luxon";

export type PredictionData = {
  currentStatus: {
    confirmedHours: number;
    predictedHours: number;
    targetHours: number;
    weeksRemaining: number;
    weeksElapsed: number;
    totalWeeks: number;
  };
  projections: {
    onTrack: boolean;
    projectedEndHours: number;
    hoursNeeded: number;
    overtimeRecommendations: {
      weeklyOvertimeNeeded: number;
      totalOvertimeNeeded: number;
      isAchievable: boolean;
      specificWeeks: Array<{
        weekStart: string;
        weekEnd: string;
        currentHours: number;
        targetHours: number;
        overtimeNeeded: number;
      }>;
    };
  };
  weeklyBreakdown: {
    confirmed: Array<{
      weekStart: string;
      weekEnd: string;
      hours: number;
      confirmed: boolean;
    }>;
    predicted: Array<{
      weekStart: string;
      weekEnd: string;
      hours: number;
      confirmed: boolean;
    }>;
    gaps: Array<{
      weekStart: string;
      weekEnd: string;
      predictedHours: number;
      targetHours: number;
      gap: number;
      overtimeNeeded: number;
    }>;
  };
};

function calculateOvertimeRecommendations(
  targetHours: number,
  confirmedHours: number,
  predictedHours: number,
  weeksRemaining: number,
  weeklyBreakdown: PredictionData['weeklyBreakdown']
): PredictionData['projections']['overtimeRecommendations'] {
  const totalNeeded = targetHours - confirmedHours;
  const predictedShortfall = totalNeeded - predictedHours;
  
  if (predictedShortfall > 0) {
    const weeklyOvertimeNeeded = predictedShortfall / weeksRemaining;
    const isAchievable = weeklyOvertimeNeeded <= 20; // Max realistic overtime per week
    
    // Find specific weeks that need overtime
    const specificWeeks = weeklyBreakdown.gaps
      .filter(gap => gap.overtimeNeeded > 0)
      .slice(0, 5) // Top 5 weeks needing overtime
      .map(gap => ({
        weekStart: gap.weekStart,
        weekEnd: gap.weekEnd,
        currentHours: gap.predictedHours,
        targetHours: gap.targetHours,
        overtimeNeeded: gap.overtimeNeeded
      }));
    
    return {
      weeklyOvertimeNeeded,
      totalOvertimeNeeded: predictedShortfall,
      isAchievable,
      specificWeeks
    };
  }
  
  return {
    weeklyOvertimeNeeded: 0,
    totalOvertimeNeeded: 0,
    isAchievable: true,
    specificWeeks: []
  };
}

function forecastProgress(
  currentConfirmed: number,
  currentPredicted: number,
  targetHours: number,
  weeksElapsed: number,
  totalWeeks: number
): { projectedEndHours: number; onTrack: boolean; hoursNeeded: number } {
  const weeksRemaining = totalWeeks - weeksElapsed;
  const projectedEnd = currentConfirmed + (currentPredicted * (weeksRemaining / totalWeeks));
  
  return {
    projectedEndHours: Math.round(projectedEnd * 10) / 10,
    onTrack: projectedEnd >= targetHours,
    hoursNeeded: Math.max(0, targetHours - projectedEnd)
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    
    // Get user and settings
    let user, settings;
    try {
      user = await getOrCreateUserByEmail(email);
      settings = await getOrCreateUserSettings(user.id);
    } catch (dbError: any) {
      if (dbError?.message?.includes('prepared statement') || dbError?.code === '26000') {
        console.log('Resetting Prisma client due to connection error...');
        await resetPrismaClient();
        user = await getOrCreateUserByEmail(email);
        settings = await getOrCreateUserSettings(user.id);
      } else {
        throw dbError;
      }
    }

    const tz = settings.tz;
    const cyStart = settings?.contractYearStart
      ? settings.contractYearStart
      : currentContractYearStart(tz).toUTC().toJSDate();

    const cyEnd = new Date(new Date(cyStart).getTime());
    cyEnd.setUTCFullYear(cyEnd.getUTCFullYear() + 1);

    const now = DateTime.now().setZone(tz);
    const contractStart = DateTime.fromJSDate(cyStart).setZone(tz);
    const contractEnd = DateTime.fromJSDate(cyEnd).setZone(tz);
    
    const totalWeeks = Math.ceil(contractEnd.diff(contractStart, 'weeks').weeks);
    const weeksElapsed = Math.ceil(now.diff(contractStart, 'weeks').weeks);
    const weeksRemaining = Math.max(0, totalWeeks - weeksElapsed);

    // Get all shifts for the contract year (confirmed + scheduled)
    const allShifts = await findManyWithRetry(
      prisma.shiftInstance,
      {
        where: {
          userId: user.id,
          startUTC: {
            gte: cyStart,
            lt: cyEnd,
          },
        },
        orderBy: { startUTC: "asc" },
        select: { startUTC: true, endUTC: true, tz: true, scheduledMin: true },
      }
    ) as Array<{ startUTC: Date; endUTC: Date; tz: string; scheduledMin: number }>;

    // Get confirmed weeks
    const confirmedWeeks = await findManyWithRetry(
      prisma.weekLedger,
      {
        where: {
          userId: user.id,
          weekStartUTC: { gte: cyStart, lt: cyEnd },
          confirmed: true,
        },
      }
    ) as Array<{ weekStartUTC: Date; bankedMin: number }>;

    // Build week stats from all shifts
    const allWeekStats = buildWeekStatsFromShifts(
      allShifts,
      tz,
      settings?.basicHoursCap ?? 48,
      settings?.overtimeMultiplier ?? 1.5
    );

    // Calculate confirmed hours
    const confirmedHours = confirmedWeeks.reduce((acc: number, week) => acc + (week.bankedMin / 60), 0);

    // Calculate predicted hours (all scheduled shifts minus confirmed)
    const predictedHours = allWeekStats.reduce((acc: number, week) => {
      const isConfirmed = confirmedWeeks.some((cw: { weekStartUTC: Date }) => 
        DateTime.fromJSDate(cw.weekStartUTC).toISODate() === 
        DateTime.fromISO(week.weekStartISO).toISODate()
      );
      return acc + (isConfirmed ? 0 : week.scheduledMinutes / 60);
    }, 0);

    // Calculate target hours
    const targetHours = computeYearTargetHours(
      (settings?.employmentStart ?? cyStart).toISOString(),
      cyStart.toISOString(),
      {
        contractedWeeklyHours: settings.contractedWeeklyHours,
        holidayWeeksFirstYear: settings.holidayWeeksFirstYear,
        holidayWeeksSubsequent: settings.holidayWeeksSubsequent,
        bankHolidayHours: settings.bankHolidayHours,
        serviceLengthWeeks: settings.serviceLengthWeeks,
        useFirstYearRates: settings.useFirstYearRates,
      }
    );

    // Calculate weekly target
    const weeklyTargetHours = targetHours / totalWeeks;

    // Build weekly breakdown
    const weeklyBreakdown = {
      confirmed: allWeekStats
        .filter(week => confirmedWeeks.some((cw: { weekStartUTC: Date }) => 
          DateTime.fromJSDate(cw.weekStartUTC).toISODate() === 
          DateTime.fromISO(week.weekStartISO).toISODate()
        ))
        .map(week => ({
          weekStart: week.weekStartISO,
          weekEnd: week.weekEndISO,
          hours: week.scheduledMinutes / 60,
          confirmed: true
        })),
      predicted: allWeekStats
        .filter(week => !confirmedWeeks.some((cw: { weekStartUTC: Date }) => 
          DateTime.fromJSDate(cw.weekStartUTC).toISODate() === 
          DateTime.fromISO(week.weekStartISO).toISODate()
        ))
        .map(week => ({
          weekStart: week.weekStartISO,
          weekEnd: week.weekEndISO,
          hours: week.scheduledMinutes / 60,
          confirmed: false
        })),
      gaps: allWeekStats
        .filter(week => !confirmedWeeks.some((cw: { weekStartUTC: Date }) => 
          DateTime.fromJSDate(cw.weekStartUTC).toISODate() === 
          DateTime.fromISO(week.weekStartISO).toISODate()
        ))
        .map(week => {
          const predictedHours = week.scheduledMinutes / 60;
          const gap = Math.max(0, weeklyTargetHours - predictedHours);
          return {
            weekStart: week.weekStartISO,
            weekEnd: week.weekEndISO,
            predictedHours,
            targetHours: weeklyTargetHours,
            gap,
            overtimeNeeded: gap
          };
        })
        .filter(gap => gap.overtimeNeeded > 0)
    };

    // Calculate projections
    const projections = forecastProgress(
      confirmedHours as number,
      predictedHours as number,
      targetHours,
      weeksElapsed,
      totalWeeks
    );

    // Calculate overtime recommendations
    const overtimeRecommendations = calculateOvertimeRecommendations(
      targetHours,
      confirmedHours as number,
      predictedHours as number,
      weeksRemaining,
      weeklyBreakdown
    );

    const predictionData: PredictionData = {
      currentStatus: {
        confirmedHours: Math.round((confirmedHours as number) * 10) / 10,
        predictedHours: Math.round((predictedHours as number) * 10) / 10,
        targetHours,
        weeksRemaining,
        weeksElapsed,
        totalWeeks
      },
      projections: {
        ...projections,
        overtimeRecommendations
      },
      weeklyBreakdown
    };

    return NextResponse.json(predictionData);
  } catch (error: any) {
    console.error("Error in predictions route:", error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        details: String(error?.message || error)
      },
      { status: 500 }
    );
  }
}
