-- Add new columns to users table for gamification
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_spin_date bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS spin_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spins integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS auto_reinvest boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reinvest_percentage integer DEFAULT 0;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  description text,
  earned_at timestamp with time zone DEFAULT now(),
  reward_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create leaderboard_entries table
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  category text NOT NULL, -- 'investors', 'earners', 'referrers'
  score numeric NOT NULL,
  rank integer,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create daily_spins table
CREATE TABLE IF NOT EXISTS public.daily_spins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  reward_amount numeric NOT NULL,
  reward_type text NOT NULL, -- 'cash', 'multiplier', 'bonus'
  spin_date timestamp with time zone DEFAULT now()
);

-- Create staking_positions table
CREATE TABLE IF NOT EXISTS public.staking_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  stake_duration integer NOT NULL, -- days
  apy_rate numeric NOT NULL,
  start_date bigint NOT NULL,
  end_date bigint NOT NULL,
  is_active boolean DEFAULT true,
  reward_claimed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create platform_statistics table
CREATE TABLE IF NOT EXISTS public.platform_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_users integer DEFAULT 0,
  total_investments numeric DEFAULT 0,
  total_rewards_paid numeric DEFAULT 0,
  total_referrals integer DEFAULT 0,
  active_users_24h integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert initial platform statistics
INSERT INTO public.platform_statistics (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements
CREATE POLICY "Users can view own achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (true);

-- RLS Policies for leaderboard
CREATE POLICY "Anyone can view leaderboard"
  ON public.leaderboard_entries FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update leaderboard"
  ON public.leaderboard_entries FOR ALL
  USING (true);

-- RLS Policies for daily spins
CREATE POLICY "Users can view own spins"
  ON public.daily_spins FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert spins"
  ON public.daily_spins FOR INSERT
  WITH CHECK (true);

-- RLS Policies for staking
CREATE POLICY "Users can view own stakes"
  ON public.staking_positions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage stakes"
  ON public.staking_positions FOR ALL
  USING (true);

-- RLS Policies for platform statistics
CREATE POLICY "Anyone can view statistics"
  ON public.platform_statistics FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update statistics"
  ON public.platform_statistics FOR UPDATE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON public.leaderboard_entries(category, rank);
CREATE INDEX IF NOT EXISTS idx_daily_spins_user_id ON public.daily_spins(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_user_id ON public.staking_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_staking_active ON public.staking_positions(is_active);

