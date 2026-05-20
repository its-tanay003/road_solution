-- Supabase Row Level Security (RLS) Policies for ROADSoS

-- 1. Enable RLS on core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Assuming a simple role-based access control where users have a boolean `is_admin` in their profile
-- Or we use Supabase Auth claims (e.g. auth.jwt() ->> 'role'). Let's stick to the `is_admin` column for simplicity.

-- 2. Profiles Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING ( auth.uid() = id );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING ( 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  )
);

-- 3. Incidents Policies
-- Users can insert their own incidents
CREATE POLICY "Users can create incidents"
ON incidents FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

-- Users can read their own incidents
CREATE POLICY "Users can view own incidents"
ON incidents FOR SELECT 
USING ( auth.uid() = user_id );

-- Users can update their own incidents (e.g., resolving or adding data)
CREATE POLICY "Users can update own incidents"
ON incidents FOR UPDATE 
USING ( auth.uid() = user_id );

-- Admins can read ALL incidents
CREATE POLICY "Admins can view all incidents"
ON incidents FOR SELECT 
USING ( 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins can update ALL incidents (acknowledging, resolving, setting responder)
CREATE POLICY "Admins can update all incidents"
ON incidents FOR UPDATE 
USING ( 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  )
);

-- Note on WebRTC Signaling: 
-- We are using Supabase Realtime Broadcast for WebRTC signaling.
-- Since Broadcast doesn't write to tables, RLS does not apply.
-- However, you should secure the Realtime Channel in your backend or by passing an auth token
-- if strict isolation is required at the socket level.

-- Note on Storage:
-- If you are uploading WebRTC recordings to a `distress_recordings` bucket, you would apply RLS there too:
-- CREATE POLICY "Admins can read recordings" ON storage.objects FOR SELECT USING ( bucket_id = 'distress_recordings' AND (auth.uid() = owner OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)) );
