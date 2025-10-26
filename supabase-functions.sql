-- ============================================================================
-- ChronosTime - Database Functions to Bypass Schema Cache Issues
-- ============================================================================
-- Run this in your Supabase SQL Editor to create functions that bypass
-- the PostgREST schema cache (PGRST204 errors)
-- ============================================================================

-- Function to create a new user profile
CREATE OR REPLACE FUNCTION create_user_profile(
  p_id UUID,
  p_email TEXT,
  p_name TEXT,
  p_username TEXT,
  p_referral_code TEXT,
  p_referred_by TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    username,
    balance,
    claimed_balance,
    total_invested,
    total_earned,
    roi,
    tier,
    is_admin,
    referral_code,
    referred_by,
    last_withdrawal_date,
    is_suspended,
    created_at,
    updated_at
  ) VALUES (
    p_id,
    p_email,
    p_name,
    p_username,
    0,
    0,
    0,
    0,
    0,
    'bronze',
    false,
    p_referral_code,
    p_referred_by,
    0,
    false,
    NOW(),
    NOW()
  )
  RETURNING json_build_object(
    'id', id,
    'email', email,
    'username', username,
    'referral_code', referral_code
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user profile with machines and referrals
CREATE OR REPLACE FUNCTION get_user_profile(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', u.id,
    'email', u.email,
    'name', u.name,
    'username', u.username,
    'balance', u.balance,
    'claimed_balance', u.claimed_balance,
    'total_invested', u.total_invested,
    'total_earned', u.total_earned,
    'roi', u.roi,
    'tier', u.tier,
    'is_admin', u.is_admin,
    'referral_code', u.referral_code,
    'referred_by', u.referred_by,
    'last_withdrawal_date', u.last_withdrawal_date,
    'is_suspended', u.is_suspended,
    'created_at', EXTRACT(EPOCH FROM u.created_at) * 1000,
    'time_machines', COALESCE((
      SELECT json_agg(json_build_object(
        'id', tm.id,
        'level', tm.level,
        'name', tm.name,
        'description', tm.description,
        'unlocked_at', tm.unlocked_at,
        'last_claimed_at', tm.last_claimed_at,
        'is_active', tm.is_active,
        'reward_amount', tm.reward_amount,
        'claim_interval_ms', tm.claim_interval_ms,
        'icon', tm.icon,
        'investment_amount', tm.investment_amount,
        'max_earnings', tm.max_earnings,
        'current_earnings', tm.current_earnings,
        'roi_percentage', tm.roi_percentage
      ))
      FROM time_machines tm
      WHERE tm.user_id = u.id
    ), '[]'::json),
    'referrals', COALESCE((
      SELECT json_agg(r.referred_user_id)
      FROM referrals r
      WHERE r.referrer_id = u.id
    ), '[]'::json)
  ) INTO result
  FROM users u
  WHERE u.id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke ALL permissions from PUBLIC first (PostgreSQL default)
REVOKE ALL ON FUNCTION create_user_profile FROM PUBLIC;
REVOKE ALL ON FUNCTION get_user_profile FROM PUBLIC;

-- Revoke any existing permissions from anon/authenticated explicitly
REVOKE ALL ON FUNCTION create_user_profile FROM anon, authenticated;
REVOKE ALL ON FUNCTION get_user_profile FROM anon, authenticated;

-- Grant execute permissions ONLY to service_role (server-side use only)
-- These functions bypass RLS and must ONLY be called from trusted server code using service role key
GRANT EXECUTE ON FUNCTION create_user_profile TO service_role;
GRANT EXECUTE ON FUNCTION get_user_profile TO service_role;
