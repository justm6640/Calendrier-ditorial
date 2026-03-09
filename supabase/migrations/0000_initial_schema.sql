-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Agencies (Tenants)
create table public.agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Users (Profiles linked to Auth)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  agency_id uuid references public.agencies(id) on delete cascade not null,
  full_name text,
  role text check (role in ('admin', 'manager', 'client')) default 'manager',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Brands (Clients of Agencies)
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid references public.agencies(id) on delete cascade not null,
  name text not null,
  logo_url text,
  instagram_handle text,
  tiktok_handle text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Media Assets (Files linked to Brands)
create table public.media_assets (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  file_url text not null,
  file_type text check (file_type in ('image', 'video')) not null,
  thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Posts (The scheduled content)
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  media_id uuid references public.media_assets(id) on delete set null,
  caption text,
  scheduled_at timestamp with time zone,
  platform text check (platform in ('instagram', 'tiktok')) not null,
  status text check (status in ('draft', 'review', 'revision_requested', 'approved', 'ready', 'notified')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Comments (Client feedback)
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete set null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.agencies enable row level security;
alter table public.users enable row level security;
alter table public.brands enable row level security;
alter table public.media_assets enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;

-- Setup RLS Policies (Basic Multi-Tenant Isolation)

-- Users can read their own agency
create policy "Users can view their own agency" on public.agencies
  for select using (id = (select agency_id from public.users where id = auth.uid()));

-- Users can view other users in their agency
create policy "Users can view users in same agency" on public.users
  for select using (agency_id = (select agency_id from public.users where id = auth.uid()));

-- Users can view brands in their agency
create policy "Users can view brands in same agency" on public.brands
  for select using (agency_id = (select agency_id from public.users where id = auth.uid()));
create policy "Users can insert brands in same agency" on public.brands
  for insert with check (agency_id = (select agency_id from public.users where id = auth.uid()));

-- Users can interact with media assets belonging to their agency's brands
create policy "Users can view media for their brands" on public.media_assets
  for select using (brand_id in (select id from public.brands where agency_id = (select agency_id from public.users where id = auth.uid())));
create policy "Users can insert media for their brands" on public.media_assets
  for insert with check (brand_id in (select id from public.brands where agency_id = (select agency_id from public.users where id = auth.uid())));

-- Users can interact with posts belonging to their agency's brands
create policy "Users can view posts for their brands" on public.posts
  for select using (brand_id in (select id from public.brands where agency_id = (select agency_id from public.users where id = auth.uid())));
create policy "Users can insert posts for their brands" on public.posts
  for insert with check (brand_id in (select id from public.brands where agency_id = (select agency_id from public.users where id = auth.uid())));
create policy "Users can update posts for their brands" on public.posts
  for update using (brand_id in (select id from public.brands where agency_id = (select agency_id from public.users where id = auth.uid())));

-- Users can interact with comments on posts belonging to their agency's brands
create policy "Users can view comments on their posts" on public.comments
  for select using (post_id in (select id from public.posts where brand_id in (select id from public.brands where agency_id = (select agency_id from public.users where id = auth.uid()))));
create policy "Users can insert comments on their posts" on public.comments
  for insert with check (post_id in (select id from public.posts where brand_id in (select id from public.brands where agency_id = (select agency_id from public.users where id = auth.uid()))));
