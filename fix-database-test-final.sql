-- Final fix for database test - handles foreign key constraints properly
-- Run this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION test_payment_table()
RETURNS TABLE(
  table_exists BOOLEAN,
  can_insert BOOLEAN,
  message TEXT
) AS $$
DECLARE
  test_id UUID;
  has_payment_id BOOLEAN;
  real_user_id UUID;
BEGIN
  -- Check if payment_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_transactions' 
    AND column_name = 'payment_id'
    AND table_schema = 'public'
  ) INTO has_payment_id;
  
  -- Get a real user ID from the users table
  SELECT id INTO real_user_id FROM users LIMIT 1;
  
  -- If no users exist, we can't test the foreign key constraint
  IF real_user_id IS NULL THEN
    RETURN QUERY SELECT true, false, 'Table exists but no users found for foreign key test. Create a user account first.'::TEXT;
    RETURN;
  END IF;
  
  -- Test if table exists and we can insert
  BEGIN
    IF has_payment_id THEN
      -- Insert with payment_id column (using a dummy value)
      INSERT INTO payment_transactions (
        payment_id,
        user_id,
        stripe_session_id,
        amount,
        currency,
        status,
        payment_method,
        metadata
      ) VALUES (
        'test_payment_' || extract(epoch from now()),
        real_user_id,
        'test_session_' || extract(epoch from now()),
        10.00,
        'usd',
        'pending',
        'stripe',
        '{"test": true}'::jsonb
      ) RETURNING id INTO test_id;
    ELSE
      -- Insert without payment_id column (new structure)
      INSERT INTO payment_transactions (
        user_id,
        stripe_session_id,
        amount,
        currency,
        status,
        payment_method,
        metadata
      ) VALUES (
        real_user_id,
        'test_session_' || extract(epoch from now()),
        10.00,
        'usd',
        'pending',
        'stripe',
        '{"test": true}'::jsonb
      ) RETURNING id INTO test_id;
    END IF;
    
    -- Clean up test record
    DELETE FROM payment_transactions WHERE id = test_id;
    
    -- Return success
    RETURN QUERY SELECT true, true, 'Payment transactions table is working correctly with foreign key constraints'::TEXT;
    
  EXCEPTION 
    WHEN undefined_table THEN
      RETURN QUERY SELECT false, false, 'Payment transactions table does not exist'::TEXT;
    WHEN foreign_key_violation THEN
      RETURN QUERY SELECT true, false, 'Table exists but foreign key constraint failed. User ID not found in users table.'::TEXT;
    WHEN OTHERS THEN
      RETURN QUERY SELECT true, false, 'Table exists but insert failed: ' || SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function immediately
SELECT * FROM test_payment_table();