-- =====================================================================
-- AI Mock Interview Coach: Database Schema
-- Compatible with Supabase PostgreSQL (Section 11 of Documentation)
-- =====================================================================

-- 1. Profiles Table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Roles Table
create table if not exists roles (
  id serial primary key,
  name text unique not null,
  active boolean not null default true
);

-- 3. Sessions Table
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  role text not null,
  level text not null check (level in ('fresher', 'junior', 'senior')),
  question_count int not null default 5,
  status text not null default 'in_progress' check (status in ('in_progress', 'finished')),
  quality_score numeric(3,1),
  confidence_score numeric(3,1),
  english_score numeric(3,1),
  overall_score int,
  report jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- 4. Questions Table
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  text text not null,
  position int not null,
  is_follow_up boolean not null default false
);

-- 5. Answers Table
create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  question_id uuid not null references questions on delete cascade,
  transcript text not null,
  duration_sec int not null,
  wpm int,
  filler_count int,
  evaluation jsonb not null,
  created_at timestamptz not null default now()
);

-- Indexes for lightning fast queries
create index if not exists idx_sessions_user_date on sessions (user_id, created_at desc);
create index if not exists idx_questions_session_pos on questions (session_id, position);
create index if not exists idx_answers_session on answers (session_id);

-- Row-Level Security
alter table profiles enable row level security;
alter table roles enable row level security;
alter table sessions enable row level security;
alter table questions enable row level security;
alter table answers enable row level security;

-- Policies
drop policy if exists own_profile on profiles;
create policy own_profile on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists read_roles on roles;
create policy read_roles on roles for select
  using (auth.role() = 'authenticated');

drop policy if exists own_sessions on sessions;
create policy own_sessions on sessions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists own_questions on questions;
create policy own_questions on questions for all
  using (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()));

drop policy if exists own_answers on answers;
create policy own_answers on answers for all
  using (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()));
