-- ============================================================
-- Migration 002: Fix handle_new_user() trigger
-- Run this in: Supabase Dashboard -> SQL Editor
--
-- WHY THIS EXISTS:
--   The original trigger inserted only (id, display_name) into
--   public.profiles. The live table has `email TEXT UNIQUE NOT NULL`,
--   which caused a NOT NULL constraint violation on every signup,
--   silently blocking profile row creation (and potentially blocking
--   user creation entirely if the error propagated).
--
-- THIS PATCH:
--   Replaces the trigger function to also write email, then
--   recreates the trigger. Safe to run on the live database.
--   The table itself is NOT modified.
-- ============================================================

-- Replace the trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger (DROP IF EXISTS makes this idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
