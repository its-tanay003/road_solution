CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS emergency_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('hospital','ambulance','police','towing','petrol','puncture')),
  location GEOMETRY(Point, 4326) NOT NULL,
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20),
  address TEXT NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  capabilities JSONB DEFAULT '[]',
  operating_hours JSONB DEFAULT '{}',
  is_24x7 BOOLEAN DEFAULT FALSE,
  last_verified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_location ON emergency_services USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_services_type ON emergency_services(type);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) UNIQUE NOT NULL,
  language_preference VARCHAR(10) DEFAULT 'en',
  blood_group VARCHAR(10),
  medical_conditions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relation VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sos_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255),
  location GEOMETRY(Point, 4326),
  triggered_at TIMESTAMP DEFAULT NOW(),
  contacts_notified INTEGER DEFAULT 0,
  ambulance_called BOOLEAN DEFAULT FALSE,
  tracking_token VARCHAR(64) UNIQUE,
  tracking_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location GEOMETRY(Point, 4326) NOT NULL,
  accident_type VARCHAR(100),
  reported_at TIMESTAMP DEFAULT NOW(),
  vehicle_count INTEGER,
  injury_count INTEGER,
  description TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS data_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES emergency_services(id),
  flag_type VARCHAR(50),
  description TEXT,
  reported_by VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT NOW()
);
