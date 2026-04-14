-- ═══════════════════════════════════════════════════════════
-- MeetingFlash — Database Schema
-- Run this in: Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  plan        text not null default 'free', -- 'free' | 'pro' | 'team'
  uses_this_month integer not null default 0,
  uses_reset_at   timestamptz not null default date_trunc('month', now()),
  created_at  timestamptz not null default now()
);

-- Projects
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  name        text not null,
  description text,
  members     text[], -- array of names/emails mentioned in meetings
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Meetings (each Flash = one meeting)
create table public.meetings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  project_id  uuid references public.projects(id) on delete set null,
  title       text not null default 'Untitled Meeting',
  raw_notes   text not null,
  pack        jsonb not null, -- the full execution pack
  lang        text not null default 'EN',
  style       text not null default 'Concise',
  created_at  timestamptz not null default now()
);

-- ── Row Level Security ──────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.projects  enable row level security;
alter table public.meetings  enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Projects: users can only CRUD their own
create policy "Users can manage own projects"
  on public.projects for all using (auth.uid() = user_id);

-- Meetings: users can only CRUD their own
create policy "Users can manage own meetings"
  on public.meetings for all using (auth.uid() = user_id);

-- ── Auto-create profile on signup ──────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Reset monthly uses ─────────────────────────────────────
-- (run manually or via a cron job in Supabase)

create or replace function public.reset_monthly_uses()
returns void as $$
begin
  update public.profiles
  set uses_this_month = 0,
      uses_reset_at = date_trunc('month', now())
  where uses_reset_at < date_trunc('month', now());
end;
$$ language plpgsql security definer;
