import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, resetPrismaClient } from "@/lib/db";
import { findManyWithRetry } from "@/lib/db-utils";
import { getOrCreateUserByEmail, getOrCreateUserSettings } from "@/lib/users";
import { currentContractYearStart } from "@/lib/time";
import { computeYearTargetHours } from "@/lib/annualised";

// Define the type for week ledger entries
type WeekLedgerEntry = {
  basicMin: number;
  overtimeMin: number;
  bankedMin: number;
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    
    // Try to get user and settings with connection reset on error
    let user, settings;
    try {
      user = await getOrCreateUserByEmail(email);
      settings = await getOrCreateUserSettings(user.id);
    } catch (dbError: any) {
      // If it's a connection error, try resetting the connection
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

    // Get confirmed weeks with automatic connection retry
    const confirmedWeeks = await findManyWithRetry(
      prisma.weekLedger,
      {
        where: {
          userId: user.id,
          weekStartUTC: { gte: cyStart, lt: cyEnd },
          confirmed: true,
        },
      }
    ) as WeekLedgerEntry[];

    const basicMin = confirmedWeeks.reduce((a, r) => a + r.basicMin, 0);
    const overtimeMin = confirmedWeeks.reduce((a, r) => a + r.overtimeMin, 0);
    const bankedMin = confirmedWeeks.reduce((a, r) => a + r.bankedMin, 0);

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

    return NextResponse.json({
      tz,
      contractYearStartISO: cyStart.toISOString(),
      targetHours,
      basicHours: +(basicMin / 60).toFixed(1),
      overtimeHours: +(overtimeMin / 60).toFixed(1),
      bankedHours: +(bankedMin / 60).toFixed(1),
      balanceHours: +(targetHours - bankedMin / 60).toFixed(1),
      confirmedWeeks: confirmedWeeks.length,
    });
  } catch (error: any) {
    console.error("Error in dashboard route:", error);
    console.error("Error stack:", error?.stack);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      name: error?.name
    });
    return NextResponse.json(
      { 
        message: "Internal server error",
        details: String(error?.message || error),
        errorType: error?.name,
        errorCode: error?.code
      },
      { status: 500 }
    );
  }
}
