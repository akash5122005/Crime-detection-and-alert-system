-- Drop old tables if exist
DROP TABLE IF EXISTS audit_logs, user_preferences, citizen_reports, alerts, incidents, zones, users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'field_officer' CHECK (role IN ('admin','analyst','field_officer')),
  badge_number VARCHAR(50),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Zones table
CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  boundary_geojson JSONB,
  population INTEGER,
  area_sqkm FLOAT,
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
  assigned_officer_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  zone_id INTEGER REFERENCES zones(id),
  status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open','under_investigation','closed','false_report')),
  description TEXT,
  reported_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  evidence_urls JSONB DEFAULT '[]',
  witness_count INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id INTEGER REFERENCES zones(id),
  score FLOAT NOT NULL,
  crime_type VARCHAR(50),
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  triggered_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  is_false_positive BOOLEAN DEFAULT false,
  notes TEXT
);

-- Citizen reports table
CREATE TABLE citizen_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name VARCHAR(100),
  reporter_phone VARCHAR(20),
  location_text TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  crime_type VARCHAR(50),
  description TEXT,
  photo_urls JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  tracking_id VARCHAR(20) UNIQUE DEFAULT ('CR-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM()*99999)::TEXT, 5, '0')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(50),
  target_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  watched_zones INTEGER[] DEFAULT '{}',
  alert_crime_types TEXT[] DEFAULT '{}',
  min_anomaly_score FLOAT DEFAULT 0.5,
  email_notifications BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_incidents_timestamp ON incidents(timestamp DESC);
CREATE INDEX idx_incidents_zone ON incidents(zone_id);
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_alerts_triggered ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_zone ON alerts(zone_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
