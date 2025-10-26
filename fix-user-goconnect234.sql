-- ============================================================================
-- Simple Fix for goconnect234@gmail.com using RPC Function
-- ============================================================================
-- This calls the secure RPC function we created to bypass schema cache
-- Run this in Supabase SQL Editor AFTER running supabase-functions.sql
-- ============================================================================

-- First, make sure the RPC function exists
-- If you get an error, run supabase-functions.sql first!

-- Get the user ID and create profile
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'goconnect234@gmail.com';
  v_username TEXT := 'goconnect234';
  v_referral_code TEXT := UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 8));
BEGIN
  -- Get the auth user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;
  
  -- If user doesn't exist in auth, show error
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user % not found', v_email;
  END IF;
  
  -- Create profile using our RPC function (bypasses schema cache)
  PERFORM create_user_profile(
    v_user_id,
    v_email,
    v_username,
    v_username,
    v_referral_code,
    NULL
  );
  
  RAISE NOTICE 'Profile created successfully for % with referral code %', v_email, v_referral_code;
END $$;

-- Verify it worked
SELECT 
  email, 
  username, 
  referral_code, 
  balance,
  created_at
FROM public.users 
WHERE email = 'goconnect234@gmail.com';
