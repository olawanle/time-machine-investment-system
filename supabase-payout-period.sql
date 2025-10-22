-- Add payout period configuration table
CREATE TABLE IF NOT EXISTS public.payout_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_day integer NOT NULL, -- Day of month (1-31)
  end_day integer NOT NULL, -- Day of month (1-31)
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default payout period (11th to 15th)
INSERT INTO public.payout_periods (start_day, end_day)
VALUES (11, 15)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.payout_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view payout periods"
  ON public.payout_periods FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update payout periods"
  ON public.payout_periods FOR UPDATE
  USING (true);

-- Add payout period reference to withdrawal requests
ALTER TABLE public.withdrawal_requests
ADD COLUMN IF NOT EXISTS expected_payout_date text;

