import { DateTime } from "luxon";

// DST-safe minutes between two ISO datetimes interpreted in tz (then diffed in UTC)
export function minutesBetweenUTC(
  startISO: string,
  endISO: string,
  tz: string
) {
  const s = DateTime.fromISO(startISO, { zone: tz }).toUTC();
  const e = DateTime.fromISO(endISO, { zone: tz }).toUTC();
  return Math.max(0, Math.round(e.diff(s, "minutes").minutes));
}

// Week starts on Sunday per your policy
export function startOfWeekSunday(d: DateTime) {
  return d.startOf("week").minus({ days: 1 }).startOf("day");
}

// “Which contract year is ‘now’ in?” Default July 1
export function currentContractYearStart(
  tz: string,
  anchorMonth = 7,
  anchorDay = 1
) {
  const now = DateTime.now().setZone(tz);
  const thisYearStart = DateTime.fromObject(
    { year: now.year, month: anchorMonth, day: anchorDay },
    { zone: tz }
  ).startOf("day");
  return now < thisYearStart
    ? thisYearStart.minus({ years: 1 })
    : thisYearStart;
}
