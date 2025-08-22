-- Fix Database Schema - Complete Solution
-- This will properly align your Supabase database with the Prisma schema

-- ========================================
-- STEP 1: Drop ALL RLS Policies and Disable RLS
-- ========================================

-- Drop ALL RLS policies (comprehensive list with all possible variations)
-- User table policies
DROP POLICY IF EXISTS "users_select_own" ON "User";
DROP POLICY IF EXISTS "users_insert_self" ON "User";
DROP POLICY IF EXISTS "users_update_own" ON "User";
DROP POLICY IF EXISTS "users_delete_own" ON "User";
DROP POLICY IF EXISTS "users_select_policy" ON "User";
DROP POLICY IF EXISTS "users_insert_policy" ON "User";
DROP POLICY IF EXISTS "users_update_policy" ON "User";
DROP POLICY IF EXISTS "users_delete_policy" ON "User";
DROP POLICY IF EXISTS "users_update_self" ON "User";
DROP POLICY IF EXISTS "users_insert_own" ON "User";
DROP POLICY IF EXISTS "users_select_self" ON "User";
DROP POLICY IF EXISTS "users_delete_self" ON "User";
DROP POLICY IF EXISTS "user_select_policy" ON "User";
DROP POLICY IF EXISTS "user_insert_policy" ON "User";
DROP POLICY IF EXISTS "user_update_policy" ON "User";
DROP POLICY IF EXISTS "user_delete_policy" ON "User";

-- Settings table policies
DROP POLICY IF EXISTS "settings_select_own" ON "Settings";
DROP POLICY IF EXISTS "settings_insert_own" ON "Settings";
DROP POLICY IF EXISTS "settings_update_own" ON "Settings";
DROP POLICY IF EXISTS "settings_delete_own" ON "Settings";
DROP POLICY IF EXISTS "settings_select_policy" ON "Settings";
DROP POLICY IF EXISTS "settings_insert_policy" ON "Settings";
DROP POLICY IF EXISTS "settings_update_policy" ON "Settings";
DROP POLICY IF EXISTS "settings_delete_policy" ON "Settings";
DROP POLICY IF EXISTS "settings_insert_self" ON "Settings";
DROP POLICY IF EXISTS "settings_update_self" ON "Settings";
DROP POLICY IF EXISTS "settings_select_self" ON "Settings";
DROP POLICY IF EXISTS "settings_delete_self" ON "Settings";
DROP POLICY IF EXISTS "setting_select_policy" ON "Settings";
DROP POLICY IF EXISTS "setting_insert_policy" ON "Settings";
DROP POLICY IF EXISTS "setting_update_policy" ON "Settings";
DROP POLICY IF EXISTS "setting_delete_policy" ON "Settings";

-- ShiftInstance table policies (including "shifts" variations)
DROP POLICY IF EXISTS "shift_instances_select_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_insert_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_update_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_delete_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_select_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_insert_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_update_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_delete_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_insert_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_update_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_select_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instances_delete_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instance_select_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instance_insert_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instance_update_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_instance_delete_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_select_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_insert_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_update_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_delete_own" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_select_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_insert_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_update_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_delete_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_insert_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_update_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_select_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shifts_delete_self" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_select_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_insert_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_update_policy" ON "ShiftInstance";
DROP POLICY IF EXISTS "shift_delete_policy" ON "ShiftInstance";

-- WeekLedger table policies (including "weeks" variations)
DROP POLICY IF EXISTS "week_ledgers_select_own" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_insert_own" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_update_own" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_delete_own" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_select_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_insert_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_update_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_delete_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_insert_self" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_update_self" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_select_self" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledgers_delete_self" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledger_select_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledger_insert_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledger_update_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_ledger_delete_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_select_own" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_insert_own" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_update_own" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_delete_own" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_select_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_insert_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_update_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_delete_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_insert_self" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_update_self" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_select_self" ON "WeekLedger";
DROP POLICY IF EXISTS "weeks_delete_self" ON "WeekLedger";
DROP POLICY IF EXISTS "week_select_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_insert_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_update_policy" ON "WeekLedger";
DROP POLICY IF EXISTS "week_delete_policy" ON "WeekLedger";

-- Disable RLS on all tables
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftInstance" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "WeekLedger" DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 2: Drop Foreign Key Constraints
-- ========================================

-- Drop foreign key constraints before changing column types
ALTER TABLE "Settings" DROP CONSTRAINT IF EXISTS "Settings_userId_fkey";
ALTER TABLE "ShiftInstance" DROP CONSTRAINT IF EXISTS "ShiftInstance_userId_fkey";
ALTER TABLE "WeekLedger" DROP CONSTRAINT IF EXISTS "WeekLedger_userId_fkey";

-- ========================================
-- STEP 3: Add Missing Columns
-- ========================================

-- Add updatedAt to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ALTER COLUMN "updatedAt" SET NOT NULL;

-- Add createdAt and updatedAt to Settings table
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Settings" ALTER COLUMN "createdAt" SET NOT NULL;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Settings" ALTER COLUMN "updatedAt" SET NOT NULL;

-- ========================================
-- STEP 4: Remove Deprecated Columns from ShiftInstance
-- ========================================

-- Remove columns that are no longer in the Prisma schema
ALTER TABLE "ShiftInstance" DROP COLUMN IF EXISTS "startLocalISO";
ALTER TABLE "ShiftInstance" DROP COLUMN IF EXISTS "endLocalISO";
ALTER TABLE "ShiftInstance" DROP COLUMN IF EXISTS "kind";
ALTER TABLE "ShiftInstance" DROP COLUMN IF EXISTS "title";

-- ========================================
-- STEP 5: Change Column Types from UUID to TEXT
-- ========================================

-- Change User table ID columns
ALTER TABLE "User" ALTER COLUMN "id" TYPE TEXT;

-- Change Settings table ID columns
ALTER TABLE "Settings" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "Settings" ALTER COLUMN "userId" TYPE TEXT;

-- Change ShiftInstance table ID columns
ALTER TABLE "ShiftInstance" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "ShiftInstance" ALTER COLUMN "userId" TYPE TEXT;

-- Change WeekLedger table ID columns
ALTER TABLE "WeekLedger" ALTER COLUMN "id" TYPE TEXT;
ALTER TABLE "WeekLedger" ALTER COLUMN "userId" TYPE TEXT;

-- ========================================
-- STEP 6: Recreate Foreign Key Constraints
-- ========================================

-- Recreate foreign key constraints with TEXT types
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "ShiftInstance" ADD CONSTRAINT "ShiftInstance_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "WeekLedger" ADD CONSTRAINT "WeekLedger_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- ========================================
-- STEP 7: Re-enable RLS and Create New Policies
-- ========================================

-- Re-enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShiftInstance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WeekLedger" ENABLE ROW LEVEL SECURITY;

-- Create new policies for TEXT-based IDs
CREATE POLICY "users_select_own" ON "User" FOR SELECT USING (auth.uid()::text = "id");
CREATE POLICY "users_insert_own" ON "User" FOR INSERT WITH CHECK (auth.uid()::text = "id");
CREATE POLICY "users_update_own" ON "User" FOR UPDATE USING (auth.uid()::text = "id");
CREATE POLICY "users_delete_own" ON "User" FOR DELETE USING (auth.uid()::text = "id");

CREATE POLICY "settings_select_own" ON "Settings" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "settings_insert_own" ON "Settings" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "settings_update_own" ON "Settings" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "settings_delete_own" ON "Settings" FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "shift_instances_select_own" ON "ShiftInstance" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "shift_instances_insert_own" ON "ShiftInstance" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "shift_instances_update_own" ON "ShiftInstance" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "shift_instances_delete_own" ON "ShiftInstance" FOR DELETE USING (auth.uid()::text = "userId");

CREATE POLICY "week_ledgers_select_own" ON "WeekLedger" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "week_ledgers_insert_own" ON "WeekLedger" FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY "week_ledgers_update_own" ON "WeekLedger" FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY "week_ledgers_delete_own" ON "WeekLedger" FOR DELETE USING (auth.uid()::text = "userId");

-- ========================================
-- STEP 8: Verify Changes
-- ========================================

-- Check the final schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('User', 'Settings', 'ShiftInstance', 'WeekLedger')
ORDER BY table_name, ordinal_position;
