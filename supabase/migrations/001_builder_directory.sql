-- Signal Layer Builders MVP schema
-- Apply in the Supabase SQL editor or through the Supabase CLI.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  full_name text not null,
  headline text,
  bio text,
  location text,
  timezone text,
  languages text[] not null default '{}',
  skills text[] not null default '{}',
  interests text[] not null default '{}',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  open_to_collaboration boolean not null default true,
  open_to_opportunities boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  url text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_skills_idx on public.profiles using gin(skills);
create index if not exists profiles_interests_idx on public.profiles using gin(interests);
create index if not exists projects_profile_id_idx on public.projects(profile_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Approved profiles are public" on public.profiles;
create policy "Approved profiles are public"
on public.profiles for select
using (status = 'approved');

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users can update their own pending profile fields" on public.profiles;
create policy "Users can update their own pending profile fields"
on public.profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Projects for approved profiles are public" on public.projects;
create policy "Projects for approved profiles are public"
on public.projects for select
using (
  exists (
    select 1 from public.profiles
    where profiles.id = projects.profile_id
    and profiles.status = 'approved'
  )
);

drop policy if exists "Users can read their own projects" on public.projects;
create policy "Users can read their own projects"
on public.projects for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = projects.profile_id
    and profiles.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert projects for their profile" on public.projects;
create policy "Users can insert projects for their profile"
on public.projects for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = projects.profile_id
    and profiles.user_id = auth.uid()
  )
);

drop policy if exists "Users can update projects for their profile" on public.projects;
create policy "Users can update projects for their profile"
on public.projects for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = projects.profile_id
    and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = projects.profile_id
    and profiles.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete projects for their profile" on public.projects;
create policy "Users can delete projects for their profile"
on public.projects for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = projects.profile_id
    and profiles.user_id = auth.uid()
  )
);

-- Optional demo data:
-- The app includes local clearly marked demo data when env vars are absent.
-- Do not insert demo profiles here unless you create matching auth users first.
