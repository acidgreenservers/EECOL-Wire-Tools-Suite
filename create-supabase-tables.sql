-- EECOL Wire Tools Suite - Supabase Table Creation Script
-- MINIMAL VERSION: Just basic tables without RLS, policies, indexes, or triggers
-- Run this in Supabase SQL Editor to isolate the issue

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- BASIC TABLES ONLY (minimal schema)
-- ===========================================

CREATE TABLE IF NOT EXISTS cuttingRecords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wire_type TEXT NOT NULL DEFAULT '',
    operator TEXT NOT NULL DEFAULT '',
    quantity INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS inventoryRecords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wire_type TEXT NOT NULL DEFAULT '',
    current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
    location TEXT,
    supplier TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT DEFAULT 'user',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT,
    message TEXT NOT NULL DEFAULT '',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS maintenanceLogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id TEXT NOT NULL DEFAULT '',
    technician TEXT NOT NULL DEFAULT '',
    date DATE NOT NULL,
    maintenance_type TEXT,
    description TEXT,
    parts_used TEXT,
    hours_spent NUMERIC(4,2),
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS markConverter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool TEXT DEFAULT 'markConverter',
    timestamp BIGINT,
    input_data JSONB,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS stopmarkConverter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool TEXT DEFAULT 'stopmarkConverter',
    timestamp BIGINT,
    input_data JSONB,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS reelcapacityEstimator (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool TEXT DEFAULT 'reelcapacityEstimator',
    timestamp BIGINT,
    input_data JSONB,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS reelsizeEstimator (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool TEXT DEFAULT 'reelsizeEstimator',
    timestamp BIGINT,
    input_data JSONB,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS muticutPlanner (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payload_cable_type TEXT,
    is_complete BOOLEAN DEFAULT FALSE,
    total_payload_length NUMERIC(10,2),
    input_data JSONB,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS appSettings (
    name TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ===========================================

ALTER TABLE cuttingRecords ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventoryRecords ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenanceLogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE markConverter ENABLE ROW LEVEL SECURITY;
ALTER TABLE stopmarkConverter ENABLE ROW LEVEL SECURITY;
ALTER TABLE reelcapacityEstimator ENABLE ROW LEVEL SECURITY;
ALTER TABLE reelsizeEstimator ENABLE ROW LEVEL SECURITY;
ALTER TABLE muticutPlanner ENABLE ROW LEVEL SECURITY;
ALTER TABLE appSettings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CREATE POLICIES (allow all for now)
-- ===========================================

CREATE POLICY "Allow all operations on cuttingRecords" ON cuttingRecords FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventoryRecords" ON inventoryRecords FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations on maintenanceLogs" ON maintenanceLogs FOR ALL USING (true);
CREATE POLICY "Allow all operations on markConverter" ON markConverter FOR ALL USING (true);
CREATE POLICY "Allow all operations on stopmarkConverter" ON stopmarkConverter FOR ALL USING (true);
CREATE POLICY "Allow all operations on reelcapacityEstimator" ON reelcapacityEstimator FOR ALL USING (true);
CREATE POLICY "Allow all operations on reelsizeEstimator" ON reelsizeEstimator FOR ALL USING (true);
CREATE POLICY "Allow all operations on muticutPlanner" ON muticutPlanner FOR ALL USING (true);
CREATE POLICY "Allow all operations on appSettings" ON appSettings FOR ALL USING (true);
CREATE POLICY "Allow all operations on sessions" ON sessions FOR ALL USING (true);

-- ===========================================
-- CREATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_cuttingRecords_timestamp ON cuttingRecords(timestamp);
CREATE INDEX IF NOT EXISTS idx_cuttingRecords_deleted_at ON cuttingRecords(deleted_at);

CREATE INDEX IF NOT EXISTS idx_inventoryRecords_wire_type ON inventoryRecords(wire_type);
CREATE INDEX IF NOT EXISTS idx_inventoryRecords_deleted_at ON inventoryRecords(deleted_at);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_deleted_at ON notifications(deleted_at);

CREATE INDEX IF NOT EXISTS idx_maintenanceLogs_equipment_id ON maintenanceLogs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenanceLogs_date ON maintenanceLogs(date);
CREATE INDEX IF NOT EXISTS idx_maintenanceLogs_deleted_at ON maintenanceLogs(deleted_at);

CREATE INDEX IF NOT EXISTS idx_markConverter_tool ON markConverter(tool);
CREATE INDEX IF NOT EXISTS idx_markConverter_timestamp ON markConverter(timestamp);
CREATE INDEX IF NOT EXISTS idx_markConverter_deleted_at ON markConverter(deleted_at);

CREATE INDEX IF NOT EXISTS idx_stopmarkConverter_tool ON stopmarkConverter(tool);
CREATE INDEX IF NOT EXISTS idx_stopmarkConverter_timestamp ON stopmarkConverter(timestamp);
CREATE INDEX IF NOT EXISTS idx_stopmarkConverter_deleted_at ON stopmarkConverter(deleted_at);

CREATE INDEX IF NOT EXISTS idx_reelcapacityEstimator_tool ON reelcapacityEstimator(tool);
CREATE INDEX IF NOT EXISTS idx_reelcapacityEstimator_timestamp ON reelcapacityEstimator(timestamp);
CREATE INDEX IF NOT EXISTS idx_reelcapacityEstimator_deleted_at ON reelcapacityEstimator(deleted_at);

CREATE INDEX IF NOT EXISTS idx_reelsizeEstimator_tool ON reelsizeEstimator(tool);
CREATE INDEX IF NOT EXISTS idx_reelsizeEstimator_timestamp ON reelsizeEstimator(timestamp);
CREATE INDEX IF NOT EXISTS idx_reelsizeEstimator_deleted_at ON reelsizeEstimator(deleted_at);

CREATE INDEX IF NOT EXISTS idx_muticutPlanner_payload_cable_type ON muticutPlanner(payload_cable_type);
CREATE INDEX IF NOT EXISTS idx_muticutPlanner_is_complete ON muticutPlanner(is_complete);
CREATE INDEX IF NOT EXISTS idx_muticutPlanner_deleted_at ON muticutPlanner(deleted_at);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(active);

-- ===========================================
-- TRIGGERS FOR AUTO-UPDATING updated_at
-- ===========================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create all remaining triggers
CREATE TRIGGER update_cuttingRecords_updated_at BEFORE UPDATE ON cuttingRecords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventoryRecords_updated_at BEFORE UPDATE ON inventoryRecords FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenanceLogs_updated_at BEFORE UPDATE ON maintenanceLogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_markConverter_updated_at BEFORE UPDATE ON markConverter FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stopmarkConverter_updated_at BEFORE UPDATE ON stopmarkConverter FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reelcapacityEstimator_updated_at BEFORE UPDATE ON reelcapacityEstimator FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reelsizeEstimator_updated_at BEFORE UPDATE ON reelsizeEstimator FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_muticutPlanner_updated_at BEFORE UPDATE ON muticutPlanner FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- INITIAL DATA (Optional)
-- ===========================================

-- Insert default app settings
INSERT INTO appSettings (name, value, description) VALUES
    ('storage_mode', 'indexeddb', 'Current storage mode: indexeddb, supabase, or hybrid'),
    ('sync_frequency', '60', 'Sync frequency in seconds for hybrid mode'),
    ('offline_fallback', 'true', 'Whether to fallback to offline mode when connection fails'),
    ('auto_sync', 'true', 'Whether to automatically sync in hybrid mode')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Verify all tables were created
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'cuttingRecords',
        'inventoryRecords',
        'users',
        'notifications',
        'maintenanceLogs',
        'markConverter',
        'stopmarkConverter',
        'reelcapacityEstimator',
        'reelsizeEstimator',
        'muticutPlanner',
        'appSettings',
        'sessions'
    )
ORDER BY tablename;

-- Show table structure summary
SELECT
    t.table_name,
    array_agg(c.column_name || ' ' || c.data_type) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_name IN (
        'cuttingRecords',
        'inventoryRecords',
        'users',
        'notifications',
        'maintenanceLogs',
        'markConverter',
        'stopmarkConverter',
        'reelcapacityEstimator',
        'reelsizeEstimator',
        'muticutPlanner',
        'appSettings',
        'sessions'
    )
GROUP BY t.table_name
ORDER BY t.table_name;
