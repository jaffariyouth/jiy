-- 1. site_content: draft + published split
alter table public.site_content
  add column if not exists draft_content jsonb not null default '{}'::jsonb,
  add column if not exists published_content jsonb not null default '{}'::jsonb,
  add column if not exists draft_updated_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid;

update public.site_content
  set draft_content = coalesce(content, '{}'::jsonb),
      published_content = coalesce(content, '{}'::jsonb),
      draft_updated_at = coalesce(draft_updated_at, updated_at),
      published_at = coalesce(published_at, updated_at)
  where content is not null;

alter table public.site_content drop column if exists content;

-- 2. Storage policies for editorial-media bucket
drop policy if exists "editorial-media public read" on storage.objects;
create policy "editorial-media public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'editorial-media');

drop policy if exists "editorial-media admin insert" on storage.objects;
create policy "editorial-media admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'editorial-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "editorial-media admin update" on storage.objects;
create policy "editorial-media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'editorial-media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'editorial-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "editorial-media admin delete" on storage.objects;
create policy "editorial-media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'editorial-media' and public.has_role(auth.uid(), 'admin'));