-- Time Machines Database Schema for ChronosTime Investment System

-- Time machines table to store user-owned machines
CREATE TABLE IF NOT EXISTS time_machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  machine_type TEXT NOT NULL, -- 'basic', 'advanced', 'premium', 'elite', etc.
  level INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  description TEXT,
  investment_amount DECIMAL(10,2) NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  claim_interval_hours INTEGER NOT NULL DEFAULT 24, -- Hours between claims
  max_earnings DECIMAL(10,2), -- Maximum total earnings (null = unlimited)
  current_earnings DECIMAL(10,2) DEFAULT 0,
  roi_percentage DECIMAL(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_claimed_at TIMESTAMP WITH TIME ZONE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machine claims table to track claim history
CREATE TABLE IF NOT EXISTS machine_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES time_machines(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claim_type TEXT DEFAULT 'regular', -- 'regular', 'bonus', 'referral_boost'
  details JSONB -- Additional claim information
);

-- Machine types/templates table for available machines
CREATE TABLE IF NOT EXISTS machine_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_type TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  base_reward DECIMAL(10,2) NOT NULL,
  claim_interval_hours INTEGER NOT NULL DEFAULT 24,
  roi_percentage DECIMAL(5,2) NOT NULL,
  max_level INTEGER DEFAULT 10,
  icon_url TEXT,
  is_available BOOLEAN DEFAULT true,
  tier TEXT DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_machines_user_id ON time_machines(user_id);
CREATE INDEX IF NOT EXISTS idx_time_machines_active ON time_machines(is_active);
CREATE INDEX IF NOT EXISTS idx_time_machines_last_claimed ON time_machines(last_claimed_at);
CREATE INDEX IF NOT EXISTS idx_machine_claims_user_id ON machine_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_machine_claims_machine_id ON machine_claims(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_claims_claimed_at ON machine_claims(claimed_at);
CREATE INDEX IF NOT EXISTS idx_machine_templates_type ON machine_templates(machine_type);
CREATE INDEX IF NOT EXISTS idx_machine_templates_available ON machine_templates(is_available);

-- Row Level Security (RLS)
ALTER TABLE time_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_machines
CREATE POLICY "Users can view own machines" ON time_machines
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own machines" ON time_machines
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own machines" ON time_machines
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for machine_claims
CREATE POLICY "Users can view own claims" ON machine_claims
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own claims" ON machine_claims
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for machine_templates (read-only for users)
CREATE POLICY "Anyone can view available machine templates" ON machine_templates
  FOR SELECT USING (is_available = true);

-- Admin policies
CREATE POLICY "Admins can manage machine templates" ON machine_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Functions for machine management
CREATE OR REPLACE FUNCTION get_claimable_reward(machine_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  machine_record time_machines%ROWTYPE;
  hours_since_claim INTEGER;
  claimable_amount DECIMAL;
BEGIN
  SELECT * INTO machine_record FROM time_machines WHERE id = machine_id;
  
  IF NOT FOUND OR NOT machine_record.is_active THEN
    RETURN 0;
  END IF;
  
  -- Calculate hours since last claim
  IF machine_record.last_claimed_at IS NULL THEN
    hours_since_claim := machine_record.claim_interval_hours;
  ELSE
    hours_since_claim := EXTRACT(EPOCH FROM (NOW() - machine_record.last_claimed_at)) / 3600;
  END IF;
  
  -- Check if enough time has passed
  IF hours_since_claim >= machine_record.claim_interval_hours THEN
    claimable_amount := machine_record.reward_amount;
    
    -- Check max earnings limit
    IF machine_record.max_earnings IS NOT NULL THEN
      IF machine_record.current_earnings + claimable_amount > machine_record.max_earnings THEN
        claimable_amount := machine_record.max_earnings - machine_record.current_earnings;
      END IF;
    END IF;
    
    RETURN GREATEST(claimable_amount, 0);
  END IF;
  
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Function to claim machine reward
CREATE OR REPLACE FUNCTION claim_machine_reward(machine_id UUID, claiming_user_id UUID)
RETURNS TABLE(success BOOLEAN, reward_amount DECIMAL, message TEXT) AS $$
DECLARE
  machine_record time_machines%ROWTYPE;
  claimable DECIMAL;
  user_record users%ROWTYPE;
BEGIN
  -- Get machine record
  SELECT * INTO machine_record FROM time_machines 
  WHERE id = machine_id AND user_id = claiming_user_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Machine not found or not owned by user';
    RETURN;
  END IF;
  
  -- Check if machine is active
  IF NOT machine_record.is_active THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'Machine is not active';
    RETURN;
  END IF;
  
  -- Get claimable amount
  SELECT get_claimable_reward(machine_id) INTO claimable;
  
  IF claimable <= 0 THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'No reward available to claim yet';
    RETURN;
  END IF;
  
  -- Get user record
  SELECT * INTO user_record FROM users WHERE id = claiming_user_id;
  
  -- Update machine
  UPDATE time_machines 
  SET 
    last_claimed_at = NOW(),
    current_earnings = current_earnings + claimable,
    updated_at = NOW()
  WHERE id = machine_id;
  
  -- Update user balance
  UPDATE users 
  SET 
    balance = balance + claimable,
    total_earned = total_earned + claimable,
    updated_at = NOW()
  WHERE id = claiming_user_id;
  
  -- Record the claim
  INSERT INTO machine_claims (machine_id, user_id, reward_amount, claim_type)
  VALUES (machine_id, claiming_user_id, claimable, 'regular');
  
  RETURN QUERY SELECT true, claimable, 'Reward claimed successfully';
END;
$$ LANGUAGE plpgsql;

-- Insert default machine templates
INSERT INTO machine_templates (machine_type, name, description, base_price, base_reward, claim_interval_hours, roi_percentage, tier, icon_url) VALUES
('basic_miner', 'Basic Time Miner', 'Entry-level time machine for beginners', 50.00, 2.50, 24, 5.00, 'bronze', '/icons/basic-miner.svg'),
('advanced_miner', 'Advanced Time Miner', 'Improved efficiency and higher rewards', 150.00, 8.75, 24, 5.83, 'silver', '/icons/advanced-miner.svg'),
('premium_miner', 'Premium Time Miner', 'High-performance machine with excellent ROI', 500.00, 31.25, 24, 6.25, 'gold', '/icons/premium-miner.svg'),
('elite_miner', 'Elite Time Miner', 'Top-tier machine for serious investors', 1500.00, 105.00, 24, 7.00, 'platinum', '/icons/elite-miner.svg'),
('quantum_miner', 'Quantum Time Miner', 'Cutting-edge technology with maximum returns', 5000.00, 375.00, 24, 7.50, 'platinum', '/icons/quantum-miner.svg')
ON CONFLICT (machine_type) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE time_machines IS 'User-owned time machines for earning rewards';
COMMENT ON TABLE machine_claims IS 'History of all machine reward claims';
COMMENT ON TABLE machine_templates IS 'Available machine types and their specifications';
COMMENT ON FUNCTION get_claimable_reward(UUID) IS 'Calculate claimable reward amount for a machine';
COMMENT ON FUNCTION claim_machine_reward(UUID, UUID) IS 'Process machine reward claim and update balances';

COMMIT;