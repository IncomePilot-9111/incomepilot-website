-- ============================================================
-- PolarisPilot / Valkoda -- Supabase RLS Verification Audit
--
-- PURPOSE:
--   Verify that every public table used by the web dashboard has
--   Row Level Security enabled and at minimum a user-scoped SELECT
--   policy. Run this in the Supabase Dashboard SQL Editor
--   (Read-Only mode is fine).
--
-- HOW TO USE:
--   1. Open Supabase Dashboard -> SQL Editor
--   2. Paste this entire file
--   3. Run it
--   4. Check the result sets -- see comments for what to look for
--
-- DO NOT run any destructive SQL (there is none here -- this is
-- read-only diagnostics only).
-- ============================================================


-- ── 1. RLS enabled/disabled for all public tables ────────────────────────────
--
-- WHAT TO CHECK:
--   rowsecurity = TRUE  for every table below.
--   If any table shows FALSE, run:
--     ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
--
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'premium_entitlements',
    'income_entries',
    'expense_entries',
    'goal_plans',
    'planned_shifts',
    'rental_bookings',
    'freelance_entries',
    'salary_employment_profiles',
    'salary_leave_entries',
    'premium_xp_ledger',
    'tax_reports_profile',
    'workspace_preferences'
  )
ORDER BY tablename;


-- ── 2. RLS policies per table ─────────────────────────────────────────────────
--
-- WHAT TO CHECK:
--   Each table should have at minimum a SELECT policy that includes
--   a predicate like: auth.uid() = user_id
--
--   Tables that MUST be write-only from service role (no direct user writes):
--     premium_entitlements -- only written by /api/premium/status and webhook
--
--   Tables where users own their own rows (should have user_id filter):
--     income_entries, expense_entries, goal_plans, planned_shifts,
--     rental_bookings, freelance_entries, salary_employment_profiles,
--     salary_leave_entries, premium_xp_ledger, tax_reports_profile,
--     workspace_preferences
--
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd         AS operation,
  qual        AS using_expression,
  with_check  AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'premium_entitlements',
    'income_entries',
    'expense_entries',
    'goal_plans',
    'planned_shifts',
    'rental_bookings',
    'freelance_entries',
    'salary_employment_profiles',
    'salary_leave_entries',
    'premium_xp_ledger',
    'tax_reports_profile',
    'workspace_preferences'
  )
ORDER BY tablename, cmd, policyname;


-- ── 3. Tables with RLS enabled but ZERO policies (locked out) ────────────────
--
-- WHAT TO CHECK:
--   If a table appears here it has RLS ON but no policies defined.
--   This means ALL access is blocked (even authenticated users cannot read it).
--   This is only correct for tables that should be service-role-only.
--
SELECT
  t.tablename,
  'RLS enabled but no policies defined' AS warning
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.schemaname = t.schemaname
  AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = TRUE
  AND p.policyname IS NULL
  AND t.tablename IN (
    'profiles',
    'premium_entitlements',
    'income_entries',
    'expense_entries',
    'goal_plans',
    'planned_shifts',
    'rental_bookings',
    'freelance_entries',
    'salary_employment_profiles',
    'salary_leave_entries',
    'premium_xp_ledger',
    'tax_reports_profile',
    'workspace_preferences'
  )
ORDER BY t.tablename;


-- ── 4. Tables with RLS DISABLED (open to anon queries) ────────────────────────
--
-- WHAT TO CHECK:
--   Any table listed here can be read by anyone with the anon key using the
--   Supabase JS SDK directly (bypassing the web app entirely).
--   All user-data tables should NOT appear in this list.
--
SELECT
  tablename,
  'WARNING: RLS is disabled -- data is accessible with anon key' AS warning
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = FALSE
  AND tablename IN (
    'profiles',
    'premium_entitlements',
    'income_entries',
    'expense_entries',
    'goal_plans',
    'planned_shifts',
    'rental_bookings',
    'freelance_entries',
    'salary_employment_profiles',
    'salary_leave_entries',
    'premium_xp_ledger',
    'tax_reports_profile',
    'workspace_preferences'
  )
ORDER BY tablename;


-- ── 5. Verify premium_entitlements has no user INSERT/UPDATE policy ────────────
--
-- WHAT TO CHECK:
--   premium_entitlements should have ONLY a SELECT policy for users.
--   INSERT and UPDATE must be service-role only (no policy = blocked for anon/authenticated).
--   If INSERT or UPDATE policies exist for non-service-role roles, that is a vulnerability.
--
SELECT
  policyname,
  roles,
  cmd AS operation,
  qual AS using_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename   = 'premium_entitlements'
ORDER BY cmd;


-- ── 6. Summary: tables with missing SELECT policy for authenticated users ─────
--
-- WHAT TO CHECK:
--   If a user-data table is missing a SELECT policy scoped to auth.uid() = user_id,
--   authenticated users may see other users' data (if RLS is disabled) or no data at
--   all (if RLS is enabled with no policy).
--
SELECT
  t.tablename,
  CASE
    WHEN t.rowsecurity = FALSE THEN 'RISK: RLS disabled'
    WHEN p.policyname IS NULL  THEN 'RISK: RLS enabled but no SELECT policy'
    ELSE 'OK: policy exists'
  END AS select_status
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.schemaname = t.schemaname
  AND p.tablename  = t.tablename
  AND p.cmd        = 'SELECT'
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles',
    'premium_entitlements',
    'income_entries',
    'expense_entries',
    'goal_plans',
    'planned_shifts',
    'rental_bookings',
    'freelance_entries',
    'salary_employment_profiles',
    'salary_leave_entries',
    'premium_xp_ledger',
    'tax_reports_profile',
    'workspace_preferences'
  )
ORDER BY t.tablename;
