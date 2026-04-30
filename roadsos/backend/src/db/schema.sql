-- ROADSoS Production Schema Evolution

-- Responders Table (Professional & Volunteer)
CREATE TABLE IF NOT EXISTS responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'ambulance', 'police', 'hospital', 'volunteer'
    phone_primary VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    verification_level VARCHAR(20) DEFAULT 'BASIC', -- 'BASIC', 'TRAINED', 'VERIFIED'
    reputation INTEGER DEFAULT 50,
    specialties TEXT[], -- e.g., ARRAY['TRAUMA', 'CARDIAC']
    geom GEOGRAPHY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SOS Events (Incident Swarm)
CREATE TABLE IF NOT EXISTS sos_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) NOT NULL,
    unified_incident_id UUID REFERENCES sos_events(id), -- Null if it's the parent, otherwise groups into swarm
    location GEOGRAPHY(Point, 4326) NOT NULL,
    tracking_token VARCHAR(255) UNIQUE,
    tracking_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    severity VARCHAR(20) DEFAULT 'MODERATE',
    confidence_score FLOAT DEFAULT 1.0,
    contacts_notified INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Incident Logs (Audit & Reconstruction)
CREATE TABLE IF NOT EXISTS incident_logs (
    id BIGSERIAL PRIMARY KEY,
    sos_event_id UUID REFERENCES sos_events(id),
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Indexes
CREATE INDEX IF NOT EXISTS idx_responders_geom ON responders USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_sos_events_location ON sos_events USING GIST(location);
