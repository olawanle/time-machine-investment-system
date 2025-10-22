-- Add password field to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash text;

-- Temporarily disable RLS for testing (we'll implement proper auth later)
-- Or make policies more permissive for now
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Anyone can insert users" ON public.users;

-- Create more permissive policies for now
CREATE POLICY "Anyone can read users"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own data by id"
  ON public.users FOR UPDATE
  USING (true);

-- Same for other tables
DROP POLICY IF EXISTS "Users can view own machines" ON public.time_machines;
DROP POLICY IF EXISTS "Users can insert own machines" ON public.time_machines;
DROP POLICY IF EXISTS "Users can update own machines" ON public.time_machines;
DROP POLICY IF EXISTS "Users can delete own machines" ON public.time_machines;

CREATE POLICY "Anyone can manage machines"
  ON public.time_machines FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Users can view referrals they made" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can insert referrals" ON public.referrals;

CREATE POLICY "Anyone can manage referrals"
  ON public.referrals FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can insert own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can update own withdrawal requests" ON public.withdrawal_requests;

CREATE POLICY "Anyone can manage withdrawals"
  ON public.withdrawal_requests FOR ALL
  USING (true);

DROP POLICY IF EXISTS "Users can view own purchased machines" ON public.purchased_machines;
DROP POLICY IF EXISTS "Users can insert own purchased machines" ON public.purchased_machines;

CREATE POLICY "Anyone can manage purchased machines"
  ON public.purchased_machines FOR ALL
  USING (true);

