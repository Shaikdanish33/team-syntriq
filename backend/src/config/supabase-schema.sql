-- Supabase schema for ACADEX backend.
-- Run this in Supabase SQL editor before starting the app.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  college text not null,
  course text not null,
  branch text not null,
  semester text not null,
  profile_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  subject text not null,
  semester text not null,
  course text not null,
  branch text not null,
  type text not null,
  year text not null,
  tags text[] not null default '{}',
  description text not null default '',
  privacy text not null check (privacy in ('public', 'private')),
  file_url text,
  drive_link text,
  college text not null,
  average_rating numeric(3,1) not null default 0,
  total_ratings integer not null default 0,
  downloads integer not null default 0,
  is_exam_important boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (resource_id, user_id)
);

create table if not exists public.resource_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  semester text not null,
  description text not null default '',
  requester_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'fulfilled')),
  fulfilled_resource_id uuid references public.resources(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_resources_title_subject_search
  on public.resources using gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(subject, '') || ' ' || coalesce(description, '')));

create index if not exists idx_resources_course_branch_semester
  on public.resources (course, branch, semester);

create index if not exists idx_resources_privacy
  on public.resources (privacy);

create index if not exists idx_resources_created_at
  on public.resources (created_at desc);

create index if not exists idx_reviews_resource_id
  on public.reviews (resource_id);
