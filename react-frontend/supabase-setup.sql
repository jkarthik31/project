-- ============================================
-- Campus Nexus Placement Portal - Supabase Setup
-- Run this in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================

-- 1. PROFILES TABLE
-- Stores user profile info linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  name text not null default '',
  role text not null default 'student' check (role in ('student', 'teacher', 'hod', 'admin')),
  department text,
  phone text,
  avatar_url text,
  cgpa numeric,
  skills text,
  resume_url text,
  portfolio_url text,
  github_url text,
  linkedin_url text,
  profile_completion integer default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. JOBS TABLE
-- Stores job postings (created by admin/hod)
create table if not exists public.jobs (
  id bigint generated always as identity primary key,
  title text not null,
  company text not null,
  position text not null,
  description text,
  location text,
  salary_min numeric,
  salary_max numeric,
  deadline date,
  requirements text[],
  status text default 'active' check (status in ('active', 'closed', 'draft')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. APPLICATIONS TABLE
-- Tracks student job applications
create table if not exists public.applications (
  id bigint generated always as identity primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  job_id bigint references public.jobs(id) on delete cascade not null,
  status text default 'applied' check (status in ('applied', 'shortlisted', 'selected', 'rejected')),
  applied_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, job_id)
);

-- 4. Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

-- 5. RLS POLICIES

-- Profiles: users can read all profiles, but only update their own
create policy "Anyone can view profiles"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Jobs: everyone can read active jobs, admin/hod can create
create policy "Anyone can view active jobs"
  on public.jobs for select
  using (true);

create policy "Admin and HOD can create jobs"
  on public.jobs for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hod')
    )
  );

create policy "Admin and HOD can update jobs"
  on public.jobs for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hod')
    )
  );

-- Applications: students can manage their own, admin/hod/teacher can view all
create policy "Students can view their own applications"
  on public.applications for select
  using (
    auth.uid() = student_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hod', 'teacher')
    )
  );

create policy "Students can create applications"
  on public.applications for insert
  with check (auth.uid() = student_id);

create policy "Admin can update application status"
  on public.applications for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'hod')
    )
  );

-- 6. Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 7. Trigger to auto-create profile when a new user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
