-- Users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  blood_group TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  sort_order INTEGER DEFAULT 0,
  notify_via_sms BOOLEAN DEFAULT true,
  notify_via_whatsapp BOOLEAN DEFAULT true,
  notify_via_email BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOS events table
CREATE TABLE IF NOT EXISTS public.sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  battery_level INTEGER,
  network_type TEXT,
  emergency_type TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Responders table
CREATE TABLE IF NOT EXISTS public.responders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_event_id UUID REFERENCES public.sos_events(id),
  name TEXT,
  phone TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  eta_minutes INTEGER,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users read own contacts" ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own contacts" ON public.emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own contacts" ON public.emergency_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own contacts" ON public.emergency_contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own sos" ON public.sos_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sos" ON public.sos_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-records', 'medical-records', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload their own medical records"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "Users can view their own medical records"
  ON storage.objects FOR SELECT
  USING (auth.uid() = owner);
