-- Check the current structure of payment_transactions table
-- Run this to see what columns exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payment_transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;