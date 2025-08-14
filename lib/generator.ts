import { DateTime } from "luxon";

export type ShiftType = "day" | "night";

// NEW: rotation mode to choose the rule
export type RotationMode = "twoBlock" | "fortnight";
// twoBlock = 4D off 4D off 4N off 4N off (repeat)
// fortnight = flip every N weeks (old behaviour)

export type ShiftConfig = {
  timezone: string; // e.g., 'Europe/London'
  rangeStart: string; // 'YYYY-MM-DD'
  rangeEnd: string; // 'YYYY-MM-DD'
  anchorOnDate: string; // first ON day of a 4-on block
  startMode: ShiftType; // 'day' or 'night' for the FIRST period
  rotationWeeks: number; // used only by 'fortnight' mode (e.g., 2)
  dayStart: string; // '07:30'
  nightStart: string; // '19:30'
  hoursPerShift: number; // 12 by default
  dayTitle?: string;
  nightTitle?: string;
  description?: string;
  location?: string;

  // keeps each 4-on block a single type
  lockTypePerCluster?: boolean; // default true

  // NEW: choose the flip rule (default 'twoBlock' for your rota)
  rotationMode?: RotationMode; // default 'twoBlock'
};

export type ShiftEvent = {
  id: string;
  startISO: string; // UTC ISO
  endISO: string; // UTC ISO
  localStart: string; // local ISO in tz
  localEnd: string; // local ISO in tz
  type: ShiftType;
  title: string;
  description?: string;
  location?: string;
};

// --- DST-safe calendar day difference (ignores hour offsets) ---
function calendarDayDiff(a: DateTime, b: DateTime): number {
  const au = Date.UTC(a.year, a.month - 1, a.day);
  const bu = Date.UTC(b.year, b.month - 1, b.day);
  return Math.floor((bu - au) / 86_400_000); // 24*60*60*1000
}

function opposite(x: ShiftType): ShiftType {
  return x === "day" ? "night" : "day";
}

/** true if date is in ON portion (days 0..3) of the 8-day cycle. */
function isOnDay(date: DateTime, anchor: DateTime): boolean {
  const daysSince = calendarDayDiff(anchor.startOf("day"), date.startOf("day"));
  const mod = ((daysSince % 8) + 8) % 8; // normalize negatives
  return mod >= 0 && mod <= 3; // 0,1,2,3 are ON days
}

/** NEW: Pick Day/Night by the selected rotation mode. */
function shiftTypeForByMode(
  refDate: DateTime, // reference date we base the decision on
  anchor: DateTime,
  startMode: ShiftType,
  rotationMode: RotationMode,
  rotationWeeks: number
): ShiftType {
  const daysSince = calendarDayDiff(
    anchor.startOf("day"),
    refDate.startOf("day")
  );

  if (rotationMode === "twoBlock") {
    // 8-day cycles: each cycle is (4 on + 4 off).
    // Group by pairs of cycles → flip after every 2 cycles (16 days).
    const cycleIndex = Math.floor(daysSince / 8); // ...,-2,-1,0,1,2,3,...
    const twoBlockIndex = Math.floor(cycleIndex / 2); // stays same for two cycles
    const flip = twoBlockIndex % 2 !== 0;
    return flip ? opposite(startMode) : startMode;
  } else {
    // 'fortnight' legacy: flip every rotationWeeks * 7 calendar days
    const block = Math.floor(daysSince / (rotationWeeks * 7));
    const flip = block % 2 !== 0;
    return flip ? opposite(startMode) : startMode;
  }
}

export function generateShiftEvents(cfg: ShiftConfig): ShiftEvent[] {
  const tz = cfg.timezone || "Europe/London";
  const rangeStart = DateTime.fromISO(cfg.rangeStart, { zone: tz }).startOf(
    "day"
  );
  const rangeEnd = DateTime.fromISO(cfg.rangeEnd, { zone: tz }).endOf("day");
  const anchor = DateTime.fromISO(cfg.anchorOnDate, { zone: tz }).startOf(
    "day"
  );

  const [dH, dM] = cfg.dayStart.split(":").map(Number);
  const [nH, nM] = cfg.nightStart.split(":").map(Number);
  const hours = cfg.hoursPerShift ?? 12;

  const dayTitle = cfg.dayTitle || "Day Shift";
  const nightTitle = cfg.nightTitle || "Night Shift";

  const lockTypePerCluster = cfg.lockTypePerCluster ?? true; // NEW: default true
  const rotationMode: RotationMode = cfg.rotationMode ?? "twoBlock"; // NEW: default twoBlock

  const out: ShiftEvent[] = [];
  for (let dt = rangeStart; dt <= rangeEnd; dt = dt.plus({ days: 1 })) {
    // 8-day cadence (4 on → 4 off)
    const daysSince = calendarDayDiff(anchor.startOf("day"), dt.startOf("day"));
    const mod8 = ((daysSince % 8) + 8) % 8;
    const isOn = mod8 >= 0 && mod8 <= 3;
    if (!isOn) continue;

    // Pick the 'reference' date for deciding Day/Night
    // If locked, use the FIRST day of this 4-on cluster so the entire 4-on has the same type.
    const clusterStart = dt.minus({ days: mod8 }).startOf("day"); // NEW
    const ref = lockTypePerCluster ? clusterStart : dt; // NEW

    const type = shiftTypeForByMode(
      // NEW
      ref,
      anchor,
      cfg.startMode,
      rotationMode,
      cfg.rotationWeeks || 2
    );

    const startLocal =
      type === "day"
        ? dt.set({ hour: dH, minute: dM, second: 0, millisecond: 0 })
        : dt.set({ hour: nH, minute: nM, second: 0, millisecond: 0 });

    const endLocal = startLocal.plus({ hours });

    // Convert to UTC for ICS/Google
    const startUTC = startLocal.toUTC();
    const endUTC = endLocal.toUTC();

    const title = type === "day" ? dayTitle : nightTitle;

    // Date-only ID so re-runs update the same day (no dupes)
    const id = `shift${dt.toFormat("yyyyLLdd")}`;

    out.push({
      id,
      startISO: startUTC.toISO(),
      endISO: endUTC.toISO(),
      localStart: startLocal.toISO(),
      localEnd: endLocal.toISO(),
      type,
      title,
      description: cfg.description,
      location: cfg.location,
    });
  }
  return out;
}
