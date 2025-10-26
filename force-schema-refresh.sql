-- ============================================================================
-- FORCE SUPABASE TO RECOGNIZE ALL COLUMNS
-- ============================================================================
-- This script re-registers every column in the users table to fix the 
-- PostgREST schema cache issue. Run this FIRST before any other scripts.
-- ============================================================================

DO $$
BEGIN
  -- Re-register all columns by adding them with IF NOT EXISTS
  -- This forces PostgREST to immediately notice they exist
  
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS claimed_balance NUMERIC DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_invested NUMERIC DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_earned NUMERIC DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS roi NUMERIC DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_withdrawal_date BIGINT DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  
  -- Update metadata to refresh cache
  COMMENT ON COLUMN public.users.balance IS 'User balance';
  COMMENT ON COLUMN public.users.claimed_balance IS 'Claimed balance';
  COMMENT ON COLUMN public.users.total_invested IS 'Total invested';
  COMMENT ON COLUMN public.users.total_earned IS 'Total earned';
  COMMENT ON COLUMN public.users.roi IS 'Return on investment';
  COMMENT ON COLUMN public.users.tier IS 'User tier';
  COMMENT ON COLUMN public.users.is_admin IS 'Admin status';
  COMMENT ON COLUMN public.users.referral_code IS 'Referral code';
  COMMENT ON COLUMN public.users.referred_by IS 'Referred by code';
  COMMENT ON COLUMN public.users.last_withdrawal_date IS 'Last withdrawal date';
  COMMENT ON COLUMN public.users.is_suspended IS 'Suspension status';
  COMMENT ON COLUMN public.users.created_at IS 'Account creation timestamp';
  COMMENT ON COLUMN public.users.updated_at IS 'Last update timestamp';
  
  RAISE NOTICE 'Schema cache forcefully refreshed - all columns registered!';
END $$;

-- Verify all columns are now visible
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
