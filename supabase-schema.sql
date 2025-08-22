-- Supabase Schema for Shift Rota App
-- Run this in Supabase Dashboard → SQL Editor

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create unique index on email
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Create Settings table
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tz" TEXT NOT NULL DEFAULT 'Europe/London',
    "contractYearStart" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC')::date,
    "employmentStart" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'UTC')::date,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId
CREATE UNIQUE INDEX IF NOT EXISTS "Settings_userId_key" ON "Settings"("userId");

-- Create ShiftInstance table
CREATE TABLE IF NOT EXISTS "ShiftInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "tz" TEXT NOT NULL,
    "startUTC" TIMESTAMP(3) NOT NULL,
    "endUTC" TIMESTAMP(3) NOT NULL,
    "scheduledMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftInstance_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId + sourceKey
CREATE UNIQUE INDEX IF NOT EXISTS "ShiftInstance_userId_sourceKey_key" ON "ShiftInstance"("userId", "sourceKey");

-- Create WeekLedger table
CREATE TABLE IF NOT EXISTS "WeekLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartUTC" TIMESTAMP(3) NOT NULL,
    "weekEndUTC" TIMESTAMP(3) NOT NULL,
    "scheduledMin" INTEGER NOT NULL,
    "basicMin" INTEGER NOT NULL,
    "overtimeMin" INTEGER NOT NULL,
    "bankedMin" INTEGER NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekLedger_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId + weekStartUTC
CREATE UNIQUE INDEX IF NOT EXISTS "WeekLedger_userId_weekStartUTC_key" ON "WeekLedger"("userId", "weekStartUTC");

-- Add foreign key constraints
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShiftInstance" ADD CONSTRAINT "ShiftInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WeekLedger" ADD CONSTRAINT "WeekLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
