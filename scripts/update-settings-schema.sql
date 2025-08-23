-- Update Settings table with new columns for business rules
-- Run this in your Supabase SQL Editor

-- Add new columns to Settings table
ALTER TABLE "Settings" 
ADD COLUMN IF NOT EXISTS "contractedWeeklyHours" INTEGER DEFAULT 42,
ADD COLUMN IF NOT EXISTS "contractedAnnualHours" INTEGER DEFAULT 1920,
ADD COLUMN IF NOT EXISTS "hoursPerShift" INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS "daysPerWeek" INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS "basicHoursCap" INTEGER DEFAULT 48,
ADD COLUMN IF NOT EXISTS "overtimeMultiplier" DOUBLE PRECISION DEFAULT 1.5,
ADD COLUMN IF NOT EXISTS "holidayWeeksFirstYear" DOUBLE PRECISION DEFAULT 5.6,
ADD COLUMN IF NOT EXISTS "holidayWeeksSubsequent" DOUBLE PRECISION DEFAULT 7.29,
ADD COLUMN IF NOT EXISTS "bankHolidayHours" INTEGER DEFAULT 96,
ADD COLUMN IF NOT EXISTS "serviceLengthWeeks" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "useFirstYearRates" BOOLEAN DEFAULT true;

-- Update existing records with default values
UPDATE "Settings" 
SET 
  "contractedWeeklyHours" = COALESCE("contractedWeeklyHours", 42),
  "contractedAnnualHours" = COALESCE("contractedAnnualHours", 1920),
  "hoursPerShift" = COALESCE("hoursPerShift", 12),
  "daysPerWeek" = COALESCE("daysPerWeek", 4),
  "basicHoursCap" = COALESCE("basicHoursCap", 48),
  "overtimeMultiplier" = COALESCE("overtimeMultiplier", 1.5),
  "holidayWeeksFirstYear" = COALESCE("holidayWeeksFirstYear", 5.6),
  "holidayWeeksSubsequent" = COALESCE("holidayWeeksSubsequent", 7.29),
  "bankHolidayHours" = COALESCE("bankHolidayHours", 96),
  "serviceLengthWeeks" = COALESCE("serviceLengthWeeks", 0),
  "useFirstYearRates" = COALESCE("useFirstYearRates", true);

-- Verify the changes
SELECT 
  "id",
  "userId",
  "tz",
  "contractedWeeklyHours",
  "contractedAnnualHours",
  "hoursPerShift",
  "daysPerWeek",
  "basicHoursCap",
  "overtimeMultiplier",
  "holidayWeeksFirstYear",
  "holidayWeeksSubsequent",
  "bankHolidayHours",
  "serviceLengthWeeks",
  "useFirstYearRates"
FROM "Settings"
LIMIT 5;
