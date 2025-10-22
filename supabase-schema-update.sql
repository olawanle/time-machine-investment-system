-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username text,
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
ADD COLUMN IF NOT EXISTS roi numeric DEFAULT 0;

-- Update the name column to be nullable since we're using username now
ALTER TABLE public.users ALTER COLUMN name DROP NOT NULL;

