import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma, resetPrismaClient } from "@/lib/db";
import { getOrCreateUserByEmail, getOrCreateUserSettings } from "@/lib/users";
import { z } from "zod";

const UpdateSettingsSchema = z.object({
  tz: z.string().min(1),
  contractYearStart: z.string().datetime(),
  employmentStart: z.string().datetime(),
  contractedWeeklyHours: z.number().min(1).max(168),
  contractedAnnualHours: z.number().min(1).max(8760),
  hoursPerShift: z.number().min(1).max(24),
  daysPerWeek: z.number().min(1).max(7),
  basicHoursCap: z.number().min(1).max(168),
  overtimeMultiplier: z.number().min(1).max(3),
  holidayWeeksFirstYear: z.number().min(0).max(52),
  holidayWeeksSubsequent: z.number().min(0).max(52),
  bankHolidayHours: z.number().min(0).max(8760),
  serviceLengthWeeks: z.number().min(0).max(520), // Max 10 years
  useFirstYearRates: z.boolean(),
});

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

    // Cast settings to ensure all properties are available
    const fullSettings = settings as any;

    return NextResponse.json({
      tz: fullSettings.tz,
      contractYearStart: fullSettings.contractYearStart.toISOString(),
      employmentStart: fullSettings.employmentStart.toISOString(),
      contractedWeeklyHours: fullSettings.contractedWeeklyHours,
      contractedAnnualHours: fullSettings.contractedAnnualHours,
      hoursPerShift: fullSettings.hoursPerShift,
      daysPerWeek: fullSettings.daysPerWeek,
      basicHoursCap: fullSettings.basicHoursCap,
      overtimeMultiplier: fullSettings.overtimeMultiplier,
      holidayWeeksFirstYear: fullSettings.holidayWeeksFirstYear,
      holidayWeeksSubsequent: fullSettings.holidayWeeksSubsequent,
      bankHolidayHours: fullSettings.bankHolidayHours,
      serviceLengthWeeks: fullSettings.serviceLengthWeeks,
      useFirstYearRates: fullSettings.useFirstYearRates,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { message: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = UpdateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid payload", issues: parsed.error.issues },
        { status: 400 }
      );
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

    // Use connection retry for the update operation
    const updatedSettings = await withConnectionRetry(async () => {
      return await (prisma.settings.update as any)({
        where: { userId: user.id },
        data: {
          tz: parsed.data.tz,
          contractYearStart: new Date(parsed.data.contractYearStart),
          employmentStart: new Date(parsed.data.employmentStart),
          contractedWeeklyHours: parsed.data.contractedWeeklyHours,
          contractedAnnualHours: parsed.data.contractedAnnualHours,
          hoursPerShift: parsed.data.hoursPerShift,
          daysPerWeek: parsed.data.daysPerWeek,
          basicHoursCap: parsed.data.basicHoursCap,
          overtimeMultiplier: parsed.data.overtimeMultiplier,
          holidayWeeksFirstYear: parsed.data.holidayWeeksFirstYear,
          holidayWeeksSubsequent: parsed.data.holidayWeeksSubsequent,
          bankHolidayHours: parsed.data.bankHolidayHours,
          serviceLengthWeeks: parsed.data.serviceLengthWeeks,
          useFirstYearRates: parsed.data.useFirstYearRates,
        },
      });
    });

    // Cast the result to ensure all properties are available
    const fullUpdatedSettings = updatedSettings as any;

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: {
        tz: fullUpdatedSettings.tz,
        contractYearStart: fullUpdatedSettings.contractYearStart.toISOString(),
        employmentStart: fullUpdatedSettings.employmentStart.toISOString(),
        contractedWeeklyHours: fullUpdatedSettings.contractedWeeklyHours,
        contractedAnnualHours: fullUpdatedSettings.contractedAnnualHours,
        hoursPerShift: fullUpdatedSettings.hoursPerShift,
        daysPerWeek: fullUpdatedSettings.daysPerWeek,
        basicHoursCap: fullUpdatedSettings.basicHoursCap,
        overtimeMultiplier: fullUpdatedSettings.overtimeMultiplier,
        holidayWeeksFirstYear: fullUpdatedSettings.holidayWeeksFirstYear,
        holidayWeeksSubsequent: fullUpdatedSettings.holidayWeeksSubsequent,
        bankHolidayHours: fullUpdatedSettings.bankHolidayHours,
        serviceLengthWeeks: fullUpdatedSettings.serviceLengthWeeks,
        useFirstYearRates: fullUpdatedSettings.useFirstYearRates,
      },
    });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
