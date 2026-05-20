-- Run this script in the Supabase SQL editor to add the new onboarding and auth provider columns
-- to your existing 'users' table:

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
