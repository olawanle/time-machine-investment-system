-- Quick fix for database testing
-- Run this in your Supabase SQL editor

-- Create a simple function to test if our payment table is working
CREATE OR REPLACE FUNCTION test_payment_table()
RETURNS TABLE(
  table_exists BOOLEAN,
  can_insert BOOLEAN,
  message TEXT
) AS $$
DECLARE
  test_id UUID;
BEGIN
  -- Test if table exists and we can insert
  BEGIN
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
      'test_' || extract(epoch from now()),
      10.00,
      'usd',
      'pending',
      'stripe',
      '{"test": true}'::jsonb
    ) RETURNING id INTO test_id;
    
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