-- ============================================================
-- Migration 003: RLS policies for public.premium_entitlements
-- Run this in: Supabase Dashboard -> SQL Editor
--
-- The table already exists with the schema described in context.
-- This adds Row Level Security so that:
--   - Users can SELECT their own entitlement row (dashboard reads)
--   - No user can INSERT or UPDATE directly (writes go through service role)
-- ============================================================

-- Enable RLS (safe to re-run)
ALTER TABLE public.premium_entitlements ENABLE ROW LEVEL SECURITY;

-- Users can read their own premium status
-- (used by the dashboard server component via the anon client)
DROP POLICY IF EXISTS "premium_entitlements_select_own" ON public.premium_entitlements;
CREATE POLICY "premium_entitlements_select_own"
  ON public.premium_entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT or UPDATE policies for users.
-- All writes go through the Supabase service-role client
-- in /api/premium/status and /api/revenuecat/webhook.
