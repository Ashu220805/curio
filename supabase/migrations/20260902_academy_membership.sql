-- CURIO Academy membership foundation
-- Apply through Supabase SQL editor or Supabase CLI before enabling live payments.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_payment_id text unique,
  provider_customer_id text,
  product text not null default 'curio_ai_ml_academy',
  amount_minor integer,
  currency text,
  status text not null check (status in ('pending','paid','failed','refunded','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null default 'curio_ai_ml_academy',
  access_status text not null default 'inactive' check (access_status in ('active','inactive','revoked','expired')),
  payment_id uuid references public.payments(id) on delete set null,
  purchased_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists academy_entitlements_user_id_idx on public.academy_entitlements(user_id);

alter table public.payments enable row level security;
alter table public.academy_entitlements enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "users can read own payments" on public.payments;
create policy "users can read own payments" on public.payments
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users can read own academy entitlements" on public.academy_entitlements;
create policy "users can read own academy entitlements" on public.academy_entitlements
  for select to authenticated using (auth.uid() = user_id);

-- No client insert/update/delete policies are intentionally created.
-- A trusted payment webhook or server-side function using privileged credentials
-- is responsible for changing payment and entitlement state.
