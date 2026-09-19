-- ============================================================================
-- APEXFIT SYSTEM: FIX FOR "Database error saving new user"
-- ============================================================================
-- Run this script directly in your Supabase Project:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ============================================================================

-- 1. Ensure Enum for Roles exists safely
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_app_role') THEN
    CREATE TYPE public.user_app_role AS ENUM (
      'Admin',
      'Manager',
      'Receptionist',
      'Trainer',
      'Member',
      'Maintenance',
      'Cleaner'
    );
  ELSE
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Admin';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Manager';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Receptionist';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Trainer';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Member';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Maintenance';
    ALTER TYPE public.user_app_role ADD VALUE IF NOT EXISTS 'Cleaner';
  END IF;
END $$;

-- 2. Ensure public.user_profiles table exists with required columns
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role public.user_app_role NOT NULL DEFAULT 'Member'::public.user_app_role,
  phone text,
  status text NOT NULL DEFAULT 'Active',
  profile_photo text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure optional columns exist if user created an earlier schema
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS profile_photo text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure auth_user_id is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_profiles_auth_user_id_key'
  ) THEN
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_auth_user_id_key UNIQUE (auth_user_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. Grant schema and table permissions to Supabase internal roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.user_profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_profiles TO authenticated;
GRANT SELECT ON TABLE public.user_profiles TO anon;

-- Grant to supabase_auth_admin if present in this instance
DO $$
BEGIN
  GRANT ALL ON TABLE public.user_profiles TO supabase_auth_admin;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 4. Create bulletproof trigger function with EXCEPTION handling
-- (Will NEVER abort auth.users signup transaction even if table has issues)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
SET row_security = off
AS $$
DECLARE
  v_name text;
  v_phone text;
BEGIN
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1),
    'Member'
  );
  v_phone := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''), '');

  BEGIN
    INSERT INTO public.user_profiles (
      id,
      auth_user_id,
      email,
      full_name,
      phone,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      v_name,
      v_phone,
      'Member'::public.user_app_role,
      'Active',
      now(),
      now()
    )
    ON CONFLICT (auth_user_id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.user_profiles.full_name),
      phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.user_profiles.phone),
      updated_at = now();
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: Do not abort auth signup if profile insert fails
    RAISE WARNING 'handle_new_user exception caught: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 5. Rebind trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Enable RLS and add fundamental policies for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Service role full access user_profiles" ON public.user_profiles;
CREATE POLICY "Service role full access user_profiles"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
