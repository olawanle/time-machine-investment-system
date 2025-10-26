-- ============================================================================
-- ChronosTime - Fix Missing User Profiles Script
-- ============================================================================
-- This script audits and fixes users who have Supabase auth accounts
-- but are missing profiles in the users table.
-- 
-- Run this in your Supabase SQL Editor Dashboard
-- ============================================================================

-- STEP 1: AUDIT - Find auth users without profiles
-- ============================================================================
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created_at,
  CASE WHEN u.id IS NULL THEN '❌ MISSING PROFILE' ELSE '✅ HAS PROFILE' END as status
FROM 
  auth.users au
LEFT JOIN 
  public.users u ON au.id = u.id
ORDER BY 
  (CASE WHEN u.id IS NULL THEN 0 ELSE 1 END), 
  au.created_at DESC;

-- STEP 2: FIX - Create missing profiles
-- ============================================================================
-- This will create profiles for all auth users who don't have one
-- Uses the email prefix as username with unique suffix to avoid conflicts
-- Generates a unique referral code for each user

WITH missing_users AS (
  SELECT 
    au.id,
    au.email,
    au.created_at,
    SPLIT_PART(au.email, '@', 1) as base_username,
    ROW_NUMBER() OVER (
      PARTITION BY SPLIT_PART(au.email, '@', 1) 
      ORDER BY au.created_at
    ) as username_sequence
  FROM 
    auth.users au
  LEFT JOIN 
    public.users u ON au.id = u.id
  WHERE 
    u.id IS NULL
),
existing_usernames AS (
  SELECT username FROM public.users
)
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
  referral_code, 
  last_withdrawal_date, 
  is_admin, 
  is_suspended,
  created_at,
  updated_at
)
SELECT 
  mu.id,
  mu.email,
  mu.base_username as name,
  -- Make username unique: use plain username for first occurrence if not exists, otherwise append hash
  CASE 
    WHEN mu.username_sequence = 1 AND NOT EXISTS (
      SELECT 1 FROM existing_usernames WHERE username = mu.base_username
    )
    THEN mu.base_username
    -- Use 8-char MD5 hash of user ID for guaranteed uniqueness
    ELSE mu.base_username || '_' || UPPER(SUBSTRING(MD5(mu.id::text) FROM 1 FOR 8))
  END as username,
  0 as balance,
  0 as claimed_balance,
  0 as total_invested,
  0 as total_earned,
  0 as roi,
  'bronze' as tier,
  UPPER(SUBSTRING(MD5(mu.id::text || mu.email) FROM 1 FOR 8)) as referral_code,
  0 as last_withdrawal_date,
  false as is_admin,
  false as is_suspended,
  mu.created_at,
  mu.created_at as updated_at
FROM 
  missing_users mu;

-- STEP 3: VERIFY - Check if all users now have profiles
-- ============================================================================
SELECT 
  COUNT(*) as total_auth_users,
  COUNT(u.id) as users_with_profiles,
  COUNT(*) - COUNT(u.id) as missing_profiles
FROM 
  auth.users au
LEFT JOIN 
  public.users u ON au.id = u.id;

-- Expected result: missing_profiles should be 0

-- ============================================================================
-- OPTIONAL: View all users with their profile status
-- ============================================================================
SELECT 
  au.id,
  au.email,
  u.username,
  u.referral_code,
  u.balance,
  au.created_at as auth_created,
  u.created_at as profile_created
FROM 
  auth.users au
LEFT JOIN 
  public.users u ON au.id = u.id
ORDER BY au.created_at DESC;
