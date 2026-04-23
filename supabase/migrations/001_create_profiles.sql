-- ============================================================
-- Migration 001: Create public.profiles table
-- Run this in: Supabase Dashboard -> SQL Editor
--
-- Schema matches the live Supabase table:
--   id           uuid primary key → auth.users(id)
--   email        text unique not null
--   display_name text
--
-- If the table already exists (created outside this migration),
-- skip the CREATE TABLE block and run 002_fix_profiles_trigger.sql
-- to repair the trigger function instead.
-- ============================================================

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email        TEXT        UNIQUE NOT NULL,
  display_name TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies — users can only see and edit their own row
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Trigger function: auto-insert a profile row when a new auth user is created.
--    Reads display_name from the user's raw_user_meta_data (set during signUp).
--    Writes email from auth.users.email (required: email column is NOT NULL).
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

-- 5. Fire the trigger after every new user insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Auto-update updated_at on any profile change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
