-- Add admin fields to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_earned numeric DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS roi numeric DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tier text DEFAULT 'bronze';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
  target_audience text DEFAULT 'all',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- Create transactions table for all financial transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'earning', 'referral_bonus', 'admin_adjustment')),
  amount numeric NOT NULL,
  description text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_id text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create machine_templates table for marketplace
CREATE TABLE IF NOT EXISTS public.machine_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  daily_return numeric NOT NULL,
  level_requirement integer DEFAULT 1,
  image_url text,
  is_active boolean DEFAULT true,
  max_purchases integer,
  duration_days integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

-- Enable RLS for new tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_templates ENABLE ROW LEVEL SECURITY;

-- Admin policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

CREATE POLICY "Admins can create audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- Admin policies for system_settings
CREATE POLICY "Admins can view system settings"
  ON public.system_settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

CREATE POLICY "Admins can update system settings"
  ON public.system_settings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

CREATE POLICY "Admins can insert system settings"
  ON public.system_settings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- Policies for announcements
CREATE POLICY "Anyone can view active announcements"
  ON public.announcements FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

CREATE POLICY "System can create transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

-- Policies for machine_templates
CREATE POLICY "Anyone can view active machine templates"
  ON public.machine_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage machine templates"
  ON public.machine_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('registration_open', 'true', 'Allow new user registrations'),
  ('min_withdrawal', '50', 'Minimum withdrawal amount in USD'),
  ('referral_bonus', '50', 'Referral bonus amount in USD'),
  ('daily_bonus', '10', 'Daily login bonus amount in USD'),
  ('max_withdrawal_per_day', '1000', 'Maximum withdrawal per day in USD'),
  ('withdrawal_fee_percentage', '2', 'Withdrawal fee percentage')
ON CONFLICT (key) DO NOTHING;

-- Create admin user if not exists (password should be changed after first login)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@chronostime.com',
  crypt('AdminPassword123!', gen_salt('bf')),
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding user record
INSERT INTO public.users (id, email, username, name, is_admin, referral_code, balance, created_at)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@chronostime.com',
  'admin',
  'System Administrator',
  true,
  'ADMIN',
  0,
  now()
) ON CONFLICT (id) DO UPDATE SET is_admin = true;