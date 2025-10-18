-- Create users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  balance numeric default 0,
  claimed_balance numeric default 0,
  total_invested numeric default 0,
  referral_code text unique not null,
  referred_by text,
  last_withdrawal_date bigint default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create time_machines table
create table if not exists public.time_machines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  level integer not null,
  name text not null,
  description text,
  unlocked_at bigint not null,
  last_claimed_at bigint not null,
  is_active boolean default true,
  reward_amount numeric not null,
  claim_interval_ms bigint not null,
  icon text default '⏰',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create referrals table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.users(id) on delete cascade,
  referred_user_id uuid references public.users(id) on delete cascade,
  referral_code text not null,
  bonus_earned numeric default 50,
  created_at timestamp with time zone default now()
);

-- Create withdrawal_requests table
create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  amount numeric not null,
  wallet_address text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create purchased_machines table for marketplace purchases
create table if not exists public.purchased_machines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  machine_name text not null,
  machine_cost numeric not null,
  bonus_percentage text not null,
  duration_days integer not null,
  payment_status text not null check (payment_status in ('pending', 'completed', 'failed')),
  payment_widget_id text,
  purchased_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.time_machines enable row level security;
alter table public.referrals enable row level security;
alter table public.withdrawal_requests enable row level security;
alter table public.purchased_machines enable row level security;

-- RLS Policies for users table
create policy "Users can view own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Anyone can insert users"
  on public.users for insert
  with check (true);

-- RLS Policies for time_machines table
create policy "Users can view own machines"
  on public.time_machines for select
  using (auth.uid() = user_id);

create policy "Users can insert own machines"
  on public.time_machines for insert
  with check (auth.uid() = user_id);

create policy "Users can update own machines"
  on public.time_machines for update
  using (auth.uid() = user_id);

create policy "Users can delete own machines"
  on public.time_machines for delete
  using (auth.uid() = user_id);

-- RLS Policies for referrals table
create policy "Users can view referrals they made"
  on public.referrals for select
  using (auth.uid() = referrer_id);

create policy "Anyone can insert referrals"
  on public.referrals for insert
  with check (true);

-- RLS Policies for withdrawal_requests table
create policy "Users can view own withdrawal requests"
  on public.withdrawal_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert own withdrawal requests"
  on public.withdrawal_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update own withdrawal requests"
  on public.withdrawal_requests for update
  using (auth.uid() = user_id);

-- RLS Policies for purchased_machines table
create policy "Users can view own purchased machines"
  on public.purchased_machines for select
  using (auth.uid() = user_id);

create policy "Users can insert own purchased machines"
  on public.purchased_machines for insert
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_referral_code on public.users(referral_code);
create index if not exists idx_time_machines_user_id on public.time_machines(user_id);
create index if not exists idx_referrals_referrer_id on public.referrals(referrer_id);
create index if not exists idx_withdrawal_requests_user_id on public.withdrawal_requests(user_id);
create index if not exists idx_purchased_machines_user_id on public.purchased_machines(user_id);

-- Insert admin user (update with your preferred admin credentials)
insert into public.users (email, name, balance, referral_code)
values ('admin@chronostime.com', 'Admin', 0, 'ADMIN2024')
on conflict (email) do nothing;

