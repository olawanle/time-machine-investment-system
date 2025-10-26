-- ============================================================================
-- Fix ALL Users with Missing Profiles using RPC Function
-- ============================================================================
-- This finds all auth users without profiles and creates them
-- Run this in Supabase SQL Editor AFTER running supabase-functions.sql
-- ============================================================================

-- Create profiles for all auth users missing them
DO $$
DECLARE
  auth_user RECORD;
  v_referral_code TEXT;
  v_username TEXT;
  v_count INTEGER := 0;
BEGIN
  -- Loop through all auth users without profiles
  FOR auth_user IN 
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN public.users u ON au.id = u.id
    WHERE u.id IS NULL
  LOOP
    -- Generate unique referral code
    v_referral_code := UPPER(SUBSTRING(MD5(auth_user.id::text || auth_user.email) FROM 1 FOR 8));
    
    -- Generate username from email
    v_username := SPLIT_PART(auth_user.email, '@', 1);
    
    -- Check if username exists, if so append unique suffix
    IF EXISTS (SELECT 1 FROM public.users WHERE username = v_username) THEN
      v_username := v_username || '_' || UPPER(SUBSTRING(MD5(auth_user.id::text) FROM 1 FOR 4));
    END IF;
    
    -- Create profile using RPC function
    PERFORM create_user_profile(
      auth_user.id,
      auth_user.email,
      v_username,
      v_username,
      v_referral_code,
      NULL
    );
    
    v_count := v_count + 1;
    RAISE NOTICE 'Created profile % for %', v_count, auth_user.email;
  END LOOP;
  
  RAISE NOTICE 'Total profiles created: %', v_count;
END $$;

-- Verify results
SELECT 
  COUNT(*) as total_auth_users,
  COUNT(u.id) as users_with_profiles,
  COUNT(*) - COUNT(u.id) as missing_profiles
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id;

-- Expected: missing_profiles should be 0
