-- 20260310000003_simplify_posts.sql
-- Simplified the posts table to link directly to agency_id instead of brand_id for MVP speed
-- Also replacing media_id with media_urls text[] to avoid tight coupling right now

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS agency_id uuid references public.agencies(id) on delete cascade;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls text[];
ALTER TABLE public.posts ALTER COLUMN brand_id DROP NOT NULL;

-- Update RLS for posts to use agency_id
DROP POLICY IF EXISTS "Users can view posts for their brands" ON public.posts;
DROP POLICY IF EXISTS "Users can insert posts for their brands" ON public.posts;
DROP POLICY IF EXISTS "Users can update posts for their brands" ON public.posts;

CREATE POLICY "Users can view posts for their agency" on public.posts
  for select using (agency_id = (select agency_id from public.users where id = auth.uid()));
CREATE POLICY "Users can insert posts for their agency" on public.posts
  for insert with check (agency_id = (select agency_id from public.users where id = auth.uid()));
CREATE POLICY "Users can update posts for their agency" on public.posts
  for update using (agency_id = (select agency_id from public.users where id = auth.uid()));
CREATE POLICY "Users can delete posts for their agency" on public.posts
  for delete using (agency_id = (select agency_id from public.users where id = auth.uid()));
