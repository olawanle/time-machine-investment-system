-- Enhanced Security Tables for ChronosTime Investment System

-- Security logs table for tracking authentication events
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'login', 'failed_login', 'signup', 'rate_limit_exceeded', etc.
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email TEXT,
  ip_address TEXT,
  device_fingerprint TEXT,
  details JSONB, -- Additional event-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trusted devices table for device management
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_token TEXT NOT NULL UNIQUE,
  device_name TEXT, -- Optional user-friendly name
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- Add password_hash column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add security-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_fingerprint ON trusted_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_token ON trusted_devices(device_token);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_active ON trusted_devices(is_active);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Row Level Security (RLS) policies
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- Security logs: Only admins can read, system can insert
CREATE POLICY "Admin can view security logs" ON security_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "System can insert security logs" ON security_logs
  FOR INSERT WITH CHECK (true);

-- Trusted devices: Users can only see their own devices
CREATE POLICY "Users can view own trusted devices" ON trusted_devices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own trusted devices" ON trusted_devices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own trusted devices" ON trusted_devices
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own trusted devices" ON trusted_devices
  FOR DELETE USING (user_id = auth.uid());

-- Function to clean up expired devices
CREATE OR REPLACE FUNCTION cleanup_expired_devices()
RETURNS void AS $$
BEGIN
  UPDATE trusted_devices 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old security logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE security_logs IS 'Logs all security-related events for audit and monitoring';
COMMENT ON TABLE trusted_devices IS 'Manages trusted devices for enhanced security';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for secure authentication';
COMMENT ON COLUMN users.last_login IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.failed_login_attempts IS 'Counter for failed login attempts';
COMMENT ON COLUMN users.locked_until IS 'Account lock expiration timestamp';
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN users.two_factor_secret IS 'TOTP secret for 2FA (encrypted)';

-- Sample data for testing (remove in production)
-- INSERT INTO security_logs (event_type, user_email, ip_address, details) 
-- VALUES ('test_event', 'test@example.com', '127.0.0.1', '{"test": true}');

COMMIT;