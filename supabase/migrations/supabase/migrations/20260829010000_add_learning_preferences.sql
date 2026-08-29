-- =========================================================
-- CURIO: ADD ADAPTIVE LEARNING PREFERENCES
-- =========================================================

alter table public.profiles
add column if not exists learning_preferences jsonb
not null default '{}'::jsonb;