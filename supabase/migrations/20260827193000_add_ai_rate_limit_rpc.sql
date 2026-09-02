drop function if exists public.check_ai_request_limit(uuid, integer, integer);
/*
=========================================================
CURIO AI REQUEST RATE LIMIT RPC
=========================================================

Purpose:
Provide an atomic database-backed rate limiter.

The browser cannot call this function directly because
it is intended to be called from the Edge Function using
the Supabase service-role client.
*/

create or replace function public.check_ai_request_limit(
  p_user_id uuid,
  p_window_seconds integer default 60,
  p_max_requests integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_window_start timestamptz;
  v_now timestamptz := now();
  v_retry_after integer;
begin

  /*
  ================================================
  CREATE OR RESET USER window
  ================================================
  */

  insert into public.ai_request_limits (
    user_id,
    request_count,
    window_start,
    updated_at
  )
  values (
    p_user_id,
    1,
    v_now,
    v_now
  )
  on conflict (user_id)
  do update
  set
    request_count =
      case
        when public.ai_request_limits.window_start
          <= v_now - make_interval(
            secs => p_window_seconds
          )
        then 1

        else public.ai_request_limits.request_count + 1
      end,

    window_start =
      case
        when public.ai_request_limits.window_start
          <= v_now - make_interval(
            secs => p_window_seconds
          )
        then v_now

        else public.ai_request_limits.window_start
      end,

    updated_at = v_now

  returning
    request_count,
    window_start
  into
    v_count,
    v_window_start;


  /*
  ================================================
  CHECK LIMIT
  ================================================
  */

  if v_count > p_max_requests then

    v_retry_after :=
      greatest(
        1,
        ceil(
          extract(
            epoch from
            (
              v_window_start
              + make_interval(
                  secs => p_window_seconds
                )
              - v_now
            )
          )
        )
      )::integer;

    return jsonb_build_object(
      'allowed',
      false,

      'retry_after_seconds',
      v_retry_after,

      'request_count',
      v_count
    );

  end if;


  /*
  ================================================
  ALLOWED
  ================================================
  */

  return jsonb_build_object(
    'allowed',
    true,

    'retry_after_seconds',
    0,

    'request_count',
    v_count
  );

end;
$$;


/*
=========================================================
SECURITY
=========================================================

Do not allow normal browser users to call this RPC.
The Edge Function will use the service-role client.
*/

revoke all
on function public.check_ai_request_limit(
  uuid,
  integer,
  integer
)
from public;

revoke all
on function public.check_ai_request_limit(
  uuid,
  integer,
  integer
)
from anon;

revoke all
on function public.check_ai_request_limit(
  uuid,
  integer,
  integer
)
from authenticated;