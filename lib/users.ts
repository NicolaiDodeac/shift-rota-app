import { prisma } from "./db";

export async function getOrCreateUserByEmail(email: string) {
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
}

export async function getOrCreateUserSettings(userId: string) {
  return prisma.settings.upsert({
    where: { userId },
    update: {},
    create: { 
      userId,
      tz: "Europe/London",
      contractYearStart: new Date(),
      employmentStart: new Date(),
      contractedWeeklyHours: 42,   // Standard 42-hour weekly contract
      contractedAnnualHours: 1920, // First year target (42×52 - 235.2)
      hoursPerShift: 12,           // Standard 12-hour shifts
      daysPerWeek: 4,              // 4 days on in the pattern
      basicHoursCap: 48,           // Hours before overtime kicks in
      overtimeMultiplier: 1.5,     // Time and a half
      holidayWeeksFirstYear: 5.6,  // First year holiday entitlement
      holidayWeeksSubsequent: 7.29, // After 52 weeks service
      bankHolidayHours: 96,        // 8 bank holidays × 12 hours
      serviceLengthWeeks: 0,       // Start with 0 weeks service
      useFirstYearRates: true,     // Use first year calculations by default
    },
  });
}
