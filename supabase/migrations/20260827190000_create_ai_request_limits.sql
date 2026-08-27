/*
=========================================================
CURIO AI REQUEST LIMITS
SERVER-SIDE RATE LIMITING
=========================================================

Purpose:
Prevent excessive AI Simulation requests.

The Gemini API key is NOT stored in this table.
*/

create table if not exists public.ai_request_limits (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  request_count integer not null default 0,

  window_start timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


/*
=========================================================
INDEX
=========================================================
*/

create index if not exists
ai_request_limits_window_start_idx
on public.ai_request_limits(window_start);


/*
=========================================================
ROW LEVEL SECURITY
=========================================================

Users must NOT be able to directly manipulate their
rate-limit records from the browser.

The Edge Function will handle rate limiting.
*/

alter table public.ai_request_limits
enable row level security;