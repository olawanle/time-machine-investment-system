-- Add new columns to time_machines table for ROI tracking
ALTER TABLE time_machines 
ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_earnings DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_earnings DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS roi_percentage DECIMAL(5,2) DEFAULT 0;

-- Add total_earned column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0;

-- Update existing machines to have default values
UPDATE time_machines 
SET 
  investment_amount = COALESCE(investment_amount, 0),
  max_earnings = COALESCE(max_earnings, 0),
  current_earnings = COALESCE(current_earnings, 0),
  roi_percentage = COALESCE(roi_percentage, 0)
WHERE investment_amount IS NULL;

-- Update existing users to have default total_earned
UPDATE users 
SET total_earned = COALESCE(total_earned, 0)
WHERE total_earned IS NULL;
