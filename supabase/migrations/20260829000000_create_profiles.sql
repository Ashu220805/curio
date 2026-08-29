-- =========================================================
-- CURIO: CREATE MEMBER PROFILES
-- =========================================================

-- 1. Create the profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  full_name text,

  age integer,

  learner_type text,

  education_level text,

  ai_experience text,

  learning_goal text,

  onboarding_completed boolean not null default false,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- 2. Enable Row Level Security
-- =========================================================

alter table public.profiles enable row level security;


-- =========================================================
-- 3. RLS Policies
-- =========================================================

-- Users can view their own profile
create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);


-- Users can create their own profile
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);


-- Users can update their own profile
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


-- Users can delete their own profile
create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);


-- =========================================================
-- 4. Automatically update updated_at
-- =========================================================

create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


create trigger on_profile_updated
before update on public.profiles
for each row
execute function public.handle_profile_updated_at();


-- =========================================================
-- 5. Automatically create a profile after signup
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.profiles (
    id,
    full_name,
    age,
    learner_type,
    education_level,
    ai_experience,
    learning_goal
  )

  values (
    new.id,

    new.raw_user_meta_data ->> 'full_name',

    case
      when new.raw_user_meta_data ->> 'age' is null
        then null
      else (new.raw_user_meta_data ->> 'age')::integer
    end,

    new.raw_user_meta_data ->> 'learner_type',

    new.raw_user_meta_data ->> 'education_level',

    new.raw_user_meta_data ->> 'ai_experience',

    new.raw_user_meta_data ->> 'learning_goal'
  );

  return new;

end;
$$;


-- =========================================================
-- 6. Trigger profile creation after auth signup
-- =========================================================

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();