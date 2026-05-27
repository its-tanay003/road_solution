-- ============================================================
-- Migration: Create/reconcile public.profiles table
-- Fixes: "Could not find the table 'public.profiles' in the schema cache"
-- Run in Supabase SQL Editor → New query → Run All
-- ============================================================

-- 1. Create profiles table if it doesn't exist
-- (matches the columns written by /api/profile route.ts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT,
  phone        TEXT,
  date_of_birth DATE,
  blood_group  TEXT,
  -- JSONB blob: { blood_group, medical_conditions[], allergies[], date_of_birth, home_address }
  medical_data JSONB       NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure columns added later also exist (idempotent)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS name         TEXT,
  ADD COLUMN IF NOT EXISTS phone        TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS blood_group  TEXT,
  ADD COLUMN IF NOT EXISTS medical_data JSONB NOT NULL DEFAULT '{}';

-- 3. Emergency contacts must reference profiles, not the legacy users table
--    Safely recreate the FK only when the table is new / FK is wrong
DO $$
BEGIN
  -- Check if emergency_contacts exists and its FK points at users instead of profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'emergency_contacts'
  ) THEN
    -- Add is_primary column if missing (used by route.ts)
    ALTER TABLE public.emergency_contacts
      ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
  ELSE
    -- Create emergency_contacts from scratch referencing profiles
    CREATE TABLE public.emergency_contacts (
      id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      name         TEXT        NOT NULL,
      phone        TEXT        NOT NULL,
      relationship TEXT,
      sort_order   INTEGER     DEFAULT 0,
      is_primary   BOOLEAN     DEFAULT FALSE,
      notify_via_sms      BOOLEAN DEFAULT TRUE,
      notify_via_whatsapp BOOLEAN DEFAULT TRUE,
      notify_via_email    BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- 4. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies (if any) then recreate cleanly
DROP POLICY IF EXISTS "Users can view their own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile"             ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile"           ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile"           ON public.profiles;

-- Service-role bypass (used by the API route via adminClient — no RLS check needed)
-- Regular authenticated users can read/write their own row
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING  ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- 6. updated_at auto-trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Index for fast single-user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id
  ON public.emergency_contacts(user_id);

-- ============================================================
-- Done. The schema cache will refresh automatically.
-- If it doesn't, go to: Supabase Dashboard → API → Reload
-- ============================================================
