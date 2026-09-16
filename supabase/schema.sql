-- Personal Portfolio — Supabase schema (MVP)
-- Run in Supabase SQL Editor. Requires pgcrypto for gen_random_uuid().

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admin allowlist (references auth.users, one row per admin)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Singleton-ish profile (one row used by the site; normalized for future use)
-- ---------------------------------------------------------------------------
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  professional_title text,
  short_intro text,
  long_bio text,
  location text,
  timezone text,
  available_for_work boolean not null default false,
  availability_text text,
  email text,
  resume_url text,
  portrait_path text,
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profile (id) on delete cascade,
  platform text not null,
  label text,
  url text not null,
  sort_order int not null default 0,
  is_visible boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.admin_users (user_id),
  title text not null,
  slug text not null unique,
  summary text,
  project_type text,
  role text,
  client text,
  year text,
  duration text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  cover_image_path text,
  live_url text,
  repository_url text,
  overview text,
  problem text,
  approach text,
  technical_decisions text,
  outcome text,
  reflection text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  type text,
  label text,
  url text not null,
  sort_order int not null default 0
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  image_path text not null,
  caption text,
  sort_order int not null default 0
);

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table if not exists public.project_technologies (
  project_id uuid not null references public.projects (id) on delete cascade,
  technology_id uuid not null references public.technologies (id) on delete cascade,
  primary key (project_id, technology_id)
);

-- ---------------------------------------------------------------------------
-- Contact messages (written via Server Action, read by admin only)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'unread'
    check (status in ('unread', 'read', 'archived', 'spam')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.profile enable row level security;
alter table public.social_links enable row level security;
alter table public.projects enable row level security;
alter table public.project_links enable row level security;
alter table public.project_media enable row level security;
alter table public.technologies enable row level security;
alter table public.project_technologies enable row level security;
alter table public.contact_messages enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- Public read: profile + visible social links
drop policy if exists "public read profile" on public.profile;
create policy "public read profile"
  on public.profile for select
  using (true);

drop policy if exists "public read visible social links" on public.social_links;
create policy "public read visible social links"
  on public.social_links for select
  using (is_visible = true);

-- Public read: published projects + their relations
drop policy if exists "public read published projects" on public.projects;
create policy "public read published projects"
  on public.projects for select
  using (status = 'published');

drop policy if exists "public read links of published projects" on public.project_links;
create policy "public read links of published projects"
  on public.project_links for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists "public read media of published projects" on public.project_media;
create policy "public read media of published projects"
  on public.project_media for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

drop policy if exists "public read technologies" on public.technologies;
create policy "public read technologies"
  on public.technologies for select
  using (true);

drop policy if exists "public read tech of published projects" on public.project_technologies;
create policy "public read tech of published projects"
  on public.project_technologies for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.status = 'published'
    )
  );

-- Admin full access (all operations)
drop policy if exists "admin all profile" on public.profile;
create policy "admin all profile" on public.profile for all using (public.is_admin());

drop policy if exists "admin all social_links" on public.social_links;
create policy "admin all social_links" on public.social_links for all using (public.is_admin());

drop policy if exists "admin all projects" on public.projects;
create policy "admin all projects" on public.projects for all using (public.is_admin());

drop policy if exists "admin all project_links" on public.project_links;
create policy "admin all project_links" on public.project_links for all using (public.is_admin());

drop policy if exists "admin all project_media" on public.project_media;
create policy "admin all project_media" on public.project_media for all using (public.is_admin());

drop policy if exists "admin all technologies" on public.technologies;
create policy "admin all technologies" on public.technologies for all using (public.is_admin());

drop policy if exists "admin all project_technologies" on public.project_technologies;
create policy "admin all project_technologies" on public.project_technologies for all using (public.is_admin());

drop policy if exists "admin read messages" on public.contact_messages;
create policy "admin read messages"
  on public.contact_messages for select using (public.is_admin());

drop policy if exists "admin update messages" on public.contact_messages;
create policy "admin update messages"
  on public.contact_messages for update using (public.is_admin());

-- NOTE: contact_messages INSERT is intentionally NOT granted to anon here.
-- Inserts go through a Server Action using the service_role key (server-only),
-- after Zod validation + honeypot + rate limit.

-- ---------------------------------------------------------------------------
-- Storage bucket (create via Dashboard > Storage, then apply policies):
--   bucket: portfolio-media (public read)
--   paths:  profile/*, projects/*, writings/*, shelf/*
-- Upload/update/delete: admin only. See docs/02-architecture.md.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Writings (Papers, Essays, Architecture Notes)
-- ---------------------------------------------------------------------------
create table if not exists public.writings (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.admin_users (user_id),
  title text not null,
  slug text not null unique,
  subtitle text,
  summary text,
  content text not null,
  category text not null default 'essay' 
    check (category in ('paper', 'essay', 'note', 'architecture')),
  reading_time_minutes int not null default 5,
  status text not null default 'draft' 
    check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  cover_image_path text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.writing_tags (
  id uuid primary key default gen_random_uuid(),
  writing_id uuid not null references public.writings (id) on delete cascade,
  tag text not null
);

create table if not exists public.shelf_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_type text not null 
    check (media_type in ('film', 'music', 'book', 'article')),
  creator text not null,
  year text,
  notes text,
  rating int check (rating >= 1 and rating <= 5),
  cover_image_path text,
  external_url text,
  is_favorite boolean not null default false,
  sort_order int not null default 0,
  logged_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.writings enable row level security;
alter table public.writing_tags enable row level security;
alter table public.shelf_items enable row level security;

drop policy if exists "public read published writings" on public.writings;
create policy "public read published writings" on public.writings for select using (status = 'published');

drop policy if exists "public read writing tags" on public.writing_tags;
create policy "public read writing tags" on public.writing_tags for select using (
  exists (select 1 from public.writings w where w.id = writing_id and w.status = 'published')
);

drop policy if exists "public read shelf items" on public.shelf_items;
create policy "public read shelf items" on public.shelf_items for select using (true);

drop policy if exists "admin all writings" on public.writings;
create policy "admin all writings" on public.writings for all using (public.is_admin());

drop policy if exists "admin all writing_tags" on public.writing_tags;
create policy "admin all writing_tags" on public.writing_tags for all using (public.is_admin());

drop policy if exists "admin all shelf_items" on public.shelf_items;
create policy "admin all shelf_items" on public.shelf_items for all using (public.is_admin());

