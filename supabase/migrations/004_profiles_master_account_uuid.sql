-- ============================================================
-- Migration 004: Add master_account_uuid to public.profiles
-- Run this in: Supabase Dashboard -> SQL Editor
--
-- master_account_uuid is the RevenueCat appUserID used by the
-- mobile app. The website never sets this value — the Flutter app
-- writes it when the user first opens the app.
--
-- The column is nullable: users who have not yet opened the app
-- will have NULL here and will not be premium on the website until
-- the app sets the value.
--
-- The index enables the webhook reverse-lookup:
--   master_account_uuid (from RevenueCat event) → profiles.id
--   (auth.users.id) → premium_entitlements.user_id
-- ============================================================

-- Add column (idempotent — safe to re-run)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS master_account_uuid UUID;

-- Index for fast webhook reverse-lookup
-- (only indexes non-NULL rows — avoids bloat from users who haven't opened the app yet)
CREATE INDEX IF NOT EXISTS profiles_master_account_uuid_idx
  ON public.profiles (master_account_uuid)
  WHERE master_account_uuid IS NOT NULL;
