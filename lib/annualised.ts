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

// 48h basic cap; over @ 1.5x
export function splitWeeklyBanking(totalMinutes: number) {
  const maxBasic = 48 * 60;
  const basic = Math.min(totalMinutes, maxBasic);
  const over = Math.max(0, totalMinutes - maxBasic);
  const overtime = Math.round(over * 1.5);
  const banked = basic + overtime;
  return { basic, overtime, banked };
}

// Build WeekStats from raw ShiftInstance rows (already saved in DB)
export function buildWeekStatsFromShifts(
  shifts: ShiftRow[],
  tz: string
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
    const { basic, overtime, banked } = splitWeeklyBanking(b.minutes);

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

// Annualised target
// After 52 weeks' service at contract-year start -> 1878 h
// First year -> 1920 h; if starting mid contract-year, prorate by remaining weeks.
export function computeYearTargetHours(
  employmentStartISO: string,
  contractYearStartISO: string
) {
  const start = DateTime.fromISO(employmentStartISO).startOf("day");
  const cyStart = DateTime.fromISO(contractYearStartISO).startOf("day");
  const weeksServiceAtCY = Math.floor(cyStart.diff(start, "weeks").weeks);

  if (weeksServiceAtCY >= 52) return 1878;

  const firstYear = 1920;
  const cyEnd = cyStart.plus({ years: 1 }).minus({ milliseconds: 1 });
  const weeksRemaining = Math.max(
    0,
    Math.floor(cyEnd.diff(cyStart, "weeks").weeks)
  );
  return Math.round((firstYear / 52) * weeksRemaining);
}
