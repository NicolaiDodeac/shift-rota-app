import { computeYearTargetHours } from "@/lib/annualised";
import { prisma } from "@/lib/db";

// ...snip (above)
const confirmedWeeks = await prisma.weekLedger.findMany({
  where: {
    userId: user.id,
    weekStartUTC: { gte: cyStart, lt: cyEnd },
    confirmed: true,
  },
});

// ✅ give the reducer accumulator a type
const basicMin = confirmedWeeks.reduce<number>((acc, r) => acc + r.basicMin, 0);
const overtimeMin = confirmedWeeks.reduce<number>(
  (acc, r) => acc + r.overtimeMin,
  0
);
const bankedMin = confirmedWeeks.reduce<number>(
  (acc, r) => acc + r.bankedMin,
  0
);

// (this is fine as-is; cyStart is a Date already)
const targetHours = computeYearTargetHours(
  (settings?.employmentStart ?? cyStart).toISOString(),
  cyStart.toISOString()
);
// ...snip (below)
