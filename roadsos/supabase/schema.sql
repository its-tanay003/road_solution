-- ============================================================
-- ROADSoS — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geo queries (optional)

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  blood_group TEXT CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown')),
  medical_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  home_address TEXT,
  home_lat DECIMAL(10, 8),
  home_lng DECIMAL(11, 8),
  profile_photo_url TEXT,
  language_preference TEXT DEFAULT 'en',
  theme_preference TEXT DEFAULT 'auto',
  sos_shake_threshold INTEGER DEFAULT 4,
  sos_hold_duration INTEGER DEFAULT 3000,
  share_location_in_sos BOOLEAN DEFAULT TRUE,
  share_medical_in_sos BOOLEAN DEFAULT TRUE,
  share_camera_in_sos BOOLEAN DEFAULT FALSE,
  is_guest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── EMERGENCY CONTACTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  notify_via_sms BOOLEAN DEFAULT TRUE,
  notify_via_whatsapp BOOLEAN DEFAULT TRUE,
  notify_via_email BOOLEAN DEFAULT FALSE,
  email TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INCIDENTS (SOS Events) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','acknowledged','resolved','cancelled','false_alarm')),
  emergency_type TEXT DEFAULT 'unknown',
  
  -- Location
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  address TEXT,
  location_accuracy DECIMAL,
  last_known_speed DECIMAL,
  
  -- Device info
  battery_level INTEGER,
  network_type TEXT,
  device_model TEXT,
  
  -- SOS metadata
  activation_method TEXT DEFAULT 'button',  -- button, voice, shake, crash, volume
  is_anonymous BOOLEAN DEFAULT FALSE,
  show_on_public_map BOOLEAN DEFAULT TRUE,
  
  -- Responder
  responder_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  responder_lat DECIMAL(10, 8),
  responder_lng DECIMAL(11, 8),
  responder_eta_minutes INTEGER,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Media
  photo_url TEXT,
  video_recording_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INCIDENT STREAMS (WebRTC sessions) ───────────────────────
CREATE TABLE IF NOT EXISTS public.incident_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  peer_id TEXT,
  status TEXT DEFAULT 'connecting' CHECK (status IN ('connecting','active','ended','failed')),
  stream_type TEXT DEFAULT 'video' CHECK (stream_type IN ('video','audio','none')),
  recording_url TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- ── BROADCAST LOG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.broadcast_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,  -- sms, whatsapp, email, push, bluetooth, webrtc
  status TEXT NOT NULL CHECK (status IN ('pending','sent','failed')),
  recipient TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGES (Control Room Chat) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  sender_role TEXT DEFAULT 'user' CHECK (sender_role IN ('user','responder','admin','ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACCIDENT REPORTS (Crowd-sourced) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.accident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  description TEXT,
  severity TEXT DEFAULT 'unknown' CHECK (severity IN ('minor','moderate','severe','fatal','unknown')),
  photo_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── AI CHAT SESSIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'claude',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PUSH SUBSCRIPTIONS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX idx_incidents_location ON public.incidents(lat, lng);
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX idx_accident_reports_location ON public.accident_reports(lat, lng);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id, created_at);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: own profile only
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Emergency contacts: own only
CREATE POLICY "Users manage own contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- Incidents: own + public map pins
CREATE POLICY "Users see own incidents" ON public.incidents FOR SELECT USING (auth.uid() = user_id OR show_on_public_map = TRUE);
CREATE POLICY "Users create own incidents" ON public.incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own incidents" ON public.incidents FOR UPDATE USING (auth.uid() = user_id);

-- Chat: own sessions
CREATE POLICY "Users manage own chat" ON public.chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON public.chat_messages FOR ALL USING (
  session_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid())
);

-- Accident reports: authenticated can read all, insert own
CREATE POLICY "Anyone can read accident reports" ON public.accident_reports FOR SELECT USING (TRUE);
CREATE POLICY "Auth users report accidents" ON public.accident_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Push subscriptions: own only
CREATE POLICY "Users manage own push subs" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- ── TRIGGER: updated_at ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── FUNCTION: new user profile ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, profile_photo_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
