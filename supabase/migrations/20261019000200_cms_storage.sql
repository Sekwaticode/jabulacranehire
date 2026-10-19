-- Website images live in one public bucket. Anyone can view them (they are
-- on the public site); only dashboard admins can upload, replace or delete,
-- and an image still used by the site or a draft cannot be deleted.
-- Nothing private is stored in Supabase Storage by the CMS.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "site-media: admins list" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-media' and public.is_cms_admin());

create policy "site-media: admins upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_cms_admin());

create policy "site-media: admins replace" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and public.is_cms_admin())
  with check (bucket_id = 'site-media' and public.is_cms_admin());

create policy "site-media: admins delete unused" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and public.is_cms_admin() and not public.cms_media_in_use(name));
