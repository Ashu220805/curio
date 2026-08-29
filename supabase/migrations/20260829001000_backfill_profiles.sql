-- =========================================================
-- CURIO: BACKFILL PROFILES FOR EXISTING USERS
-- =========================================================

insert into public.profiles (
  id,
  full_name,
  age,
  learner_type,
  education_level,
  ai_experience,
  learning_goal
)
select
  u.id,
  u.raw_user_meta_data ->> 'full_name',

  case
    when u.raw_user_meta_data ->> 'age' is null
      then null
    else (u.raw_user_meta_data ->> 'age')::integer
  end,

  u.raw_user_meta_data ->> 'learner_type',
  u.raw_user_meta_data ->> 'education_level',
  u.raw_user_meta_data ->> 'ai_experience',
  u.raw_user_meta_data ->> 'learning_goal'

from auth.users u

where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);