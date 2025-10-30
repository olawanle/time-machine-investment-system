-- Create payment_transactions table for webhook idempotency and payment tracking
create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_id text unique not null, -- CPay payment/transaction ID for idempotency
  user_id uuid references public.users(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  status text not null,
  raw_webhook_data jsonb, -- Store the full webhook payload for debugging
  processed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.payment_transactions enable row level security;

-- RLS Policies for payment_transactions table
create policy "Users can view own payment transactions"
  on public.payment_transactions for select
  using (auth.uid() = user_id);

create policy "System can insert payment transactions"
  on public.payment_transactions for insert
  with check (true);

-- Create indexes for better performance
create index if not exists idx_payment_transactions_payment_id on public.payment_transactions(payment_id);
create index if not exists idx_payment_transactions_user_id on public.payment_transactions(user_id);
create index if not exists idx_payment_transactions_processed_at on public.payment_transactions(processed_at);