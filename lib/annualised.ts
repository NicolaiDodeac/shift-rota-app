import { DateTime } from "luxon";
import { startOfWeekSunday } from "./time";

type ShiftRow = {
  startUTC: Date;
  endUTC: Date;
  tz: string;
  scheduledMin: number;
};

export type WeekStats = {
  tz: string;
  weekStartISO: string;
  weekEndISO: string;
  scheduledMinutes: number;
  basicMinutes: number; // <= 48h part
  overtimeMinutes: number; // > 48h part (already ×1.5)
  bankedMinutes: number; // basic + overtime
  confirmed: boolean;
  days: { date: string; minutes: number }[];
};

// Split weekly hours based on settings
export function splitWeeklyBanking(
  totalMinutes: number, 
  basicHoursCap: number = 48, 
  overtimeMultiplier: number = 1.5
) {
  const maxBasic = basicHoursCap * 60;
  const basic = Math.min(totalMinutes, maxBasic);
  const over = Math.max(0, totalMinutes - maxBasic);
  const overtime = Math.round(over * overtimeMultiplier);
  const banked = basic + overtime;
  return { basic, overtime, banked };
}

// Build WeekStats from raw ShiftInstance rows (already saved in DB)
export function buildWeekStatsFromShifts(
  shifts: ShiftRow[],
  tz: string,
  basicHoursCap: number = 48,
  overtimeMultiplier: number = 1.5
): WeekStats[] {
  const buckets = new Map<
    string,
    { minutes: number; days: Map<string, number> }
  >();
  
  for (const s of shifts) {
    const d = DateTime.fromJSDate(s.startUTC).setZone(tz);
    const sun = startOfWeekSunday(d).toISODate()!;
    const dayKey = d.toISODate()!;
    const b = buckets.get(sun) ?? { minutes: 0, days: new Map() };
    b.minutes += s.scheduledMin;
    b.days.set(dayKey, (b.days.get(dayKey) || 0) + s.scheduledMin);
    buckets.set(sun, b);
  }

  const out: WeekStats[] = [];
  for (const [sun, b] of Array.from(buckets.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const weekStart = DateTime.fromISO(sun, { zone: tz }).startOf("day");
    const weekEnd = weekStart.plus({ days: 6 }).endOf("day");
    const { basic, overtime, banked } = splitWeeklyBanking(b.minutes, basicHoursCap, overtimeMultiplier);

    out.push({
      tz,
      weekStartISO: weekStart.toUTC().toJSDate().toISOString(),
      weekEndISO: weekEnd.toUTC().toJSDate().toISOString(),
      scheduledMinutes: b.minutes,
      basicMinutes: basic,
      overtimeMinutes: overtime,
      bankedMinutes: banked,
      confirmed: false,
      days: Array.from(b.days.entries())
        .sort()
        .map(([date, m]) => ({ date, minutes: m })),
    });
  }
  return out;
}

// Enhanced annualised target calculation based on business rules
export function computeYearTargetHours(
  employmentStartISO: string,
  contractYearStartISO: string,
  settings?: {
    contractedWeeklyHours: number;
    holidayWeeksFirstYear: number;
    holidayWeeksSubsequent: number;
    bankHolidayHours: number;
    serviceLengthWeeks: number;
    useFirstYearRates: boolean;
  }
) {
  const start = DateTime.fromISO(employmentStartISO).startOf("day");
  const cyStart = DateTime.fromISO(contractYearStartISO).startOf("day");
  
  // Use settings if provided, otherwise use defaults
  const weeklyHours = settings?.contractedWeeklyHours ?? 42;
  const firstYearHolidayWeeks = settings?.holidayWeeksFirstYear ?? 5.6;
  const subsequentHolidayWeeks = settings?.holidayWeeksSubsequent ?? 7.29;
  const bankHolidays = settings?.bankHolidayHours ?? 96;
  const serviceWeeks = settings?.serviceLengthWeeks ?? 0;
  const useFirstYear = settings?.useFirstYearRates ?? true;

  // Calculate holiday hours based on service length
  let holidayHours: number;
  if (useFirstYear || serviceWeeks < 52) {
    // First year calculation: 42 × 5.6 = 235.2 hours
    holidayHours = weeklyHours * firstYearHolidayWeeks;
  } else {
    // Subsequent years: 42 × 7.29 = 306 hours
    holidayHours = weeklyHours * subsequentHolidayWeeks;
  }

  // Calculate annual target
  const annualHours = (weeklyHours * 52) - holidayHours - bankHolidays;

  // If starting mid-contract year, pro-rate
  const cyEnd = cyStart.plus({ years: 1 }).minus({ milliseconds: 1 });
  const weeksRemaining = Math.max(
    0,
    Math.floor(cyEnd.diff(cyStart, "weeks").weeks)
  );

  if (weeksRemaining < 52) {
    return Math.round((annualHours / 52) * weeksRemaining);
  }

  return Math.round(annualHours);
}
