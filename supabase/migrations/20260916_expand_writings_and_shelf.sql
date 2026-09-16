-- Migration: Expand schema for Writings (Papers/Essays) and Shelf (Films/Music/Books)
-- Run in Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- 1. Writings (Papers, Essays, Architecture Notes)
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

create index if not exists idx_writings_slug on public.writings (slug);
create index if not exists idx_writings_status on public.writings (status);
create index if not exists idx_writings_category on public.writings (category);
create index if not exists idx_writing_tags_tag on public.writing_tags (tag);

-- ---------------------------------------------------------------------------
-- 2. Shelf / Cultural Archive (Film, Music, Literature)
-- ---------------------------------------------------------------------------
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

create index if not exists idx_shelf_media_type on public.shelf_items (media_type);
create index if not exists idx_shelf_favorite on public.shelf_items (is_favorite);
create index if not exists idx_shelf_sort on public.shelf_items (sort_order asc, logged_at desc);

-- ---------------------------------------------------------------------------
-- 3. Row Level Security (RLS)
-- ---------------------------------------------------------------------------
alter table public.writings enable row level security;
alter table public.writing_tags enable row level security;
alter table public.shelf_items enable row level security;

-- Public Read Policies
drop policy if exists "public read published writings" on public.writings;
create policy "public read published writings"
  on public.writings for select
  using (status = 'published');

drop policy if exists "public read writing tags" on public.writing_tags;
create policy "public read writing tags"
  on public.writing_tags for select
  using (
    exists (
      select 1 from public.writings w
      where w.id = writing_id and w.status = 'published'
    )
  );

drop policy if exists "public read shelf items" on public.shelf_items;
create policy "public read shelf items"
  on public.shelf_items for select
  using (true);

-- Admin Full Access Policies
drop policy if exists "admin all writings" on public.writings;
create policy "admin all writings"
  on public.writings for all using (public.is_admin());

drop policy if exists "admin all writing_tags" on public.writing_tags;
create policy "admin all writing_tags"
  on public.writing_tags for all using (public.is_admin());

drop policy if exists "admin all shelf_items" on public.shelf_items;
create policy "admin all shelf_items"
  on public.shelf_items for all using (public.is_admin());
