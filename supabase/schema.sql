-- CURIO Academy membership table. Run in Supabase SQL editor.
create table if not exists public.academy_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  access_status text not null check (access_status in ('active','inactive','revoked')),
  provider text,
  provider_payment_id text,
  purchased_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product)
);

alter table public.academy_entitlements enable row level security;

drop policy if exists "Users can read their own Academy entitlement" on public.academy_entitlements;
create policy "Users can read their own Academy entitlement"
on public.academy_entitlements for select
to authenticated
using (auth.uid() = user_id);

-- Do NOT add browser-side insert/update policies for paid access.
-- Only trusted server code using the service role should activate entitlement.

-- Immutable payment-event ledger for webhook idempotency and auditability.
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

alter table public.payment_events enable row level security;
-- No browser policies: payment events are written only by trusted server code.
