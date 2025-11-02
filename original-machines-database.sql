-- Original Time Machines Database Schema
-- Maintains the original business logic with database storage

-- User machines table (simplified for original system)
CREATE TABLE IF NOT EXISTS user_machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  machine_level INTEGER NOT NULL, -- 1, 2, 3, 4, 5
  machine_name TEXT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  weekly_return DECIMAL(10,2) NOT NULL,
  last_claimed_at TIMESTAMP WITH TIME ZONE,
  total_claimed DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machine claims table (for tracking claim history)
CREATE TABLE IF NOT EXISTS machine_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES user_machines(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  claim_amount DECIMAL(10,2) NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_machines_user_id ON user_machines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_machines_active ON user_machines(is_active);
CREATE INDEX IF NOT EXISTS idx_machine_claims_user_id ON machine_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_machine_claims_machine_id ON machine_claims(machine_id);

-- Row Level Security
ALTER TABLE user_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own machines" ON user_machines
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own machines" ON user_machines
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own machines" ON user_machines
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view own claims" ON machine_claims
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own claims" ON machine_claims
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to get claimable amount (24 hour intervals)
CREATE OR REPLACE FUNCTION get_machine_claimable_amount(machine_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  machine_record user_machines%ROWTYPE;
  hours_since_claim INTEGER;
BEGIN
  SELECT * INTO machine_record FROM user_machines WHERE id = machine_id;
  
  IF NOT FOUND OR NOT machine_record.is_active THEN
    RETURN 0;
  END IF;
  
  -- Calculate hours since last claim
  IF machine_record.last_claimed_at IS NULL THEN
    hours_since_claim := 24; -- Can claim immediately for new machines
  ELSE
    hours_since_claim := EXTRACT(EPOCH FROM (NOW() - machine_record.last_claimed_at)) / 3600;
  END IF;
  
  -- Check if 24 hours have passed
  IF hours_since_claim >= 24 THEN
    RETURN machine_record.weekly_return / 7; -- Daily portion of weekly return
  END IF;
  
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Function to claim machine rewards
CREATE OR REPLACE FUNCTION claim_machine_rewards(machine_id UUID, claiming_user_id UUID)
RETURNS TABLE(success BOOLEAN, amount DECIMAL, message TEXT) AS $$
DECLARE
  machine_record user_machines%ROWTYPE;
  claimable_amount DECIMAL;
  daily_amount DECIMAL;
BEGIN
  -- Get machine record
  SELECT * INTO machine_record FROM user_machines 
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
  SELECT get_machine_claimable_amount(machine_id) INTO claimable_amount;
  
  IF claimable_amount <= 0 THEN
    RETURN QUERY SELECT false, 0::DECIMAL, 'No rewards available to claim yet (24 hour cooldown)';
    RETURN;
  END IF;
  
  -- Update machine
  UPDATE user_machines 
  SET 
    last_claimed_at = NOW(),
    total_claimed = total_claimed + claimable_amount
  WHERE id = machine_id;
  
  -- Update user balance
  UPDATE users 
  SET 
    balance = balance + claimable_amount,
    total_earned = total_earned + claimable_amount
  WHERE id = claiming_user_id;
  
  -- Record the claim
  INSERT INTO machine_claims (machine_id, user_id, claim_amount)
  VALUES (machine_id, claiming_user_id, claimable_amount);
  
  RETURN QUERY SELECT true, claimable_amount, 'Rewards claimed successfully';
END;
$$ LANGUAGE plpgsql;

COMMIT;