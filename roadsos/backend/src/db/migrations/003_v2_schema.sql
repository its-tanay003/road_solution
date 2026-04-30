-- Step 1: Add new fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user'; -- 'user', 'volunteer', 'verified_responder'
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active_responder BOOLEAN DEFAULT false;

-- Step 2: Create Incident Memory Engine Logs
CREATE TABLE IF NOT EXISTS incident_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_event_id UUID REFERENCES sos_events(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL, -- e.g., 'TRIGGERED', 'AI_TRIAGED', 'DISPATCHED', 'RESPONDER_ACKNOWLEDGED'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_logs_sos_id ON incident_logs(sos_event_id);

-- Step 3: Create Multi-Channel SOS Dispatch Queue
CREATE TABLE IF NOT EXISTS sos_dispatch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_event_id UUID REFERENCES sos_events(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL, -- 'INTERNET', 'SMS', 'MESH'
  status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'DELIVERED', 'ACKNOWLEDGED', 'FAILED'
  payload JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sos_queue_status ON sos_dispatch_queue(status);

-- Step 4: Community Validation (Trust & Verification)
CREATE TABLE IF NOT EXISTS incident_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vote INTEGER NOT NULL CHECK (vote IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(incident_id, user_id)
);
