-- Fixed database test function that handles existing table structure
-- Run this in your Supabase SQL editor

-- First, let's check what columns exist in the payment_transactions table
DO $$
DECLARE
    col_exists BOOLEAN;
BEGIN
    -- Check if payment_id column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'payment_id'
        AND table_schema = 'public'
    ) INTO col_exists;
    
    IF col_exists THEN
        RAISE NOTICE 'Found payment_id column - using existing table structure';
    ELSE
        RAISE NOTICE 'No payment_id column found - using new table structure';
    END IF;
END $$;

-- Create a flexible test function that adapts to the existing table structure
CREATE OR REPLACE FUNCTION test_payment_table()
RETURNS TABLE(
  table_exists BOOLEAN,
  can_insert BOOLEAN,
  message TEXT
) AS $$
DECLARE
  test_id UUID;
  has_payment_id BOOLEAN;
BEGIN
  -- Check if payment_id column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_transactions' 
    AND column_name = 'payment_id'
    AND table_schema = 'public'
  ) INTO has_payment_id;
  
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
        '00000000-0000-0000-0000-000000000000',
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
        '00000000-0000-0000-0000-000000000000',
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
    RETURN QUERY SELECT true, true, 'Payment transactions table is working correctly'::TEXT;
    
  EXCEPTION 
    WHEN undefined_table THEN
      RETURN QUERY SELECT false, false, 'Payment transactions table does not exist'::TEXT;
    WHEN OTHERS THEN
      RETURN QUERY SELECT true, false, 'Table exists but insert failed: ' || SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function immediately
SELECT * FROM test_payment_table();