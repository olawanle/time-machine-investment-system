-- Topups table to log credited crypto payments (idempotency + admin visibility)
create table if not exists public.topups (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  user_id uuid references public.users(id) on delete cascade,
  amount numeric not null,
  status text not null default 'credited',
  created_at timestamp with time zone default now()
);

create index if not exists idx_topups_user_id on public.topups(user_id);
create index if not exists idx_topups_created_at on public.topups(created_at desc);


