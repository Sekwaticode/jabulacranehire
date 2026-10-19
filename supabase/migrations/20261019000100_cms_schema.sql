-- Jabula Crane Hire CMS: tables, validation, publishing and Row Level Security.
--
-- Every content row keeps two copies: `draft` (what the dashboard edits) and
-- `published` (what visitors see). Saving only writes `draft`. Publishing goes
-- through cms_publish / cms_publish_all, which copy draft to published and
-- keep the previous version in content_revisions.
--
-- Visitors have no access to any table. They read published content through
-- get_published_content(). Admins (role owner or editor in profiles) read
-- and write drafts directly, limited by RLS and column grants.

-- ---------------------------------------------------------------------------
-- Profiles and roles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Copied from auth.users so owners can see who is who in the dashboard.
  email text not null default '',
  full_name text not null default '' check (char_length(full_name) <= 120),
  -- 'none' = signed in but no dashboard access. New accounts start here.
  role text not null default 'none' check (role in ('owner', 'editor', 'none')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dashboard users. Only owner and editor roles can manage content; only owners can change roles.';

create or replace function public.cms_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role in ('owner', 'editor') from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.is_cms_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select role = 'owner' from public.profiles where id = auth.uid()), false)
$$;

-- Every new auth user gets a profile with no access. Access is granted by an
-- owner in the dashboard, or for the first owner with cms_make_owner() in
-- the SQL editor.
create or replace function public.cms_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger cms_on_auth_user_created
  after insert on auth.users
  for each row execute function public.cms_handle_new_user();

-- Role changes: owners only, and the last owner cannot be removed. Database
-- maintenance roles (the SQL editor) are exempt so the first owner can be set.
create or replace function public.cms_guard_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.id is distinct from old.id or new.email is distinct from old.email then
    raise exception 'Profile ids and emails cannot change here.';
  end if;
  if new.role is distinct from old.role then
    if auth.uid() is not null and not public.is_cms_owner() then
      raise exception 'Only an owner can change roles.' using errcode = '42501';
    end if;
    if old.role = 'owner' and new.role <> 'owner'
       and (select count(*) from public.profiles where role = 'owner') <= 1 then
      raise exception 'The site needs at least one owner.';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger cms_guard_profile
  before update on public.profiles
  for each row execute function public.cms_guard_profile();

-- First owner: run in the Supabase SQL editor after inviting the user.
--   select public.cms_make_owner('owner@example.com');
create or replace function public.cms_make_owner(p_email text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then
    raise exception 'No user with email %. Invite them from Authentication > Users first.', p_email;
  end if;
  insert into public.profiles (id, email, role) values (v_id, lower(trim(p_email)), 'owner')
  on conflict (id) do update set role = 'owner';
  return 'Owner access granted to ' || p_email;
end;
$$;

revoke all on function public.cms_make_owner(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Content validation
-- ---------------------------------------------------------------------------

-- The same link rules as src/content/links.ts.
create or replace function public.cms_link_ok(p_href text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_href = ''
    or (p_href ~ '^/[A-Za-z0-9._~/?#=&%+-]*$' and p_href !~ '^//')
    or p_href ~ '^#[A-Za-z0-9_-]+$'
    or p_href ~ '^mailto:[^[:space:]@<>"'']+@[^[:space:]@<>"'']+\.[^[:space:]@<>"'']+$'
    or p_href ~ '^tel:\+?[0-9]{6,15}$'
    or p_href ~ '^https://[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(:[0-9]{1,5})?([/?#][^[:space:]<>"''`]*)?$'
$$;

create or replace function public.cms_image_src_ok(p_src text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_src = ''
    or (p_src ~ '^/[A-Za-z0-9._~/%+-]*$' and p_src !~ '^//')
    or p_src ~ '^https://[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+(:[0-9]{1,5})?/[^[:space:]<>"''`?#]*$'
    -- Local development: `supabase start` serves storage over http on localhost.
    or p_src ~ '^http://(localhost|127\.0\.0\.1):[0-9]{1,5}/storage/v1/object/public/[^[:space:]<>"''`?#]*$'
$$;

-- Walks a content document and rejects anything the site would not render
-- safely: unexpected key names, oversized text or lists, bad links and image
-- sources. Content is always rendered as plain text, never as HTML.
create or replace function public.cms_check_json(p_doc jsonb, p_path text default '')
returns void
language plpgsql
immutable
set search_path = ''
as $$
declare
  r record;
  v_index int := 0;
begin
  case jsonb_typeof(p_doc)
    when 'object' then
      for r in select key, value from jsonb_each(p_doc) loop
        if r.key !~ '^[A-Za-z][A-Za-z0-9_]{0,40}$' then
          raise exception 'Field name "%" is not allowed (at %).', r.key, p_path using errcode = '22023';
        end if;
        if r.key ~* 'href$' or r.key = 'companyProfilePdf' then
          if jsonb_typeof(r.value) <> 'string' or not public.cms_link_ok(r.value #>> '{}') then
            raise exception 'The link at %.% is not allowed. Use a site path, https://, mailto: or tel:.', p_path, r.key
              using errcode = '22023';
          end if;
        elsif r.key = 'src' then
          if jsonb_typeof(r.value) <> 'string' or not public.cms_image_src_ok(r.value #>> '{}') then
            raise exception 'The image at %.% must come from the media library.', p_path, r.key using errcode = '22023';
          end if;
        end if;
        perform public.cms_check_json(r.value, p_path || '.' || r.key);
      end loop;
    when 'array' then
      if jsonb_array_length(p_doc) > 200 then
        raise exception 'The list at % has more than 200 items.', p_path using errcode = '22023';
      end if;
      for r in select value from jsonb_array_elements(p_doc) loop
        perform public.cms_check_json(r.value, p_path || '[' || v_index || ']');
        v_index := v_index + 1;
      end loop;
    when 'string' then
      if char_length(p_doc #>> '{}') > 5000 then
        raise exception 'The text at % is longer than 5000 characters.', p_path using errcode = '22023';
      end if;
    else
      null;
  end case;
end;
$$;

-- Shared trigger for every content table: validates the draft and stamps who
-- changed it and when.
create or replace function public.cms_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed boolean;
begin
  if jsonb_typeof(new.draft) <> 'object' then
    raise exception 'Content must be an object.' using errcode = '22023';
  end if;
  if pg_column_size(new.draft) > 262144 then
    raise exception 'This content is too large to save.' using errcode = '22023';
  end if;
  perform public.cms_check_json(new.draft);

  if tg_op = 'INSERT' then
    v_changed := true;
  else
    -- to_jsonb keeps this trigger usable on tables without draft_sort_order.
    v_changed := new.draft is distinct from old.draft
      or to_jsonb(new) -> 'draft_sort_order' is distinct from to_jsonb(old) -> 'draft_sort_order';
  end if;
  if v_changed then
    new.draft_updated_at := now();
    new.updated_by := coalesce(auth.uid(), new.updated_by);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------------

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  title text not null check (char_length(title) between 1 and 80),
  path text not null unique check (path ~ '^/[a-z0-9-]*$'),
  sort_order int not null default 0,
  is_published boolean not null default true,
  -- SEO for the page: {"title": "...", "description": "..."}
  draft jsonb not null default '{}'::jsonb,
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  meta_title text generated always as (published ->> 'title') stored,
  meta_description text generated always as (published ->> 'description') stored,
  draft_updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.pages is 'The five existing public pages. Rows are fixed by migrations; the dashboard edits their SEO.';

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  section_key text not null check (section_key ~ '^[A-Za-z][A-Za-z0-9]{0,40}$'),
  -- The existing component that renders this section (see src/content/schema.ts).
  section_type text not null check (section_type ~ '^[A-Za-z][A-Za-z0-9]{0,40}$'),
  label text not null default '',
  draft jsonb not null default '{}'::jsonb,
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  sort_order int not null default 0,
  is_enabled boolean not null default true,
  draft_updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create index page_sections_page_order on public.page_sections (page_id, sort_order);

comment on table public.page_sections is 'Sections of each page, in their fixed design order. Content only: no layout, styles or markup.';

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  -- Listing order: sort_order is live, draft_sort_order is the next publish.
  sort_order int not null default 0,
  draft_sort_order int not null default 0,
  is_published boolean not null default false,
  -- {title, intro, image, specs, uses, applications, quote, note}
  draft jsonb not null default '{}'::jsonb,
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  name text generated always as (draft ->> 'title') stored,
  draft_updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index equipment_live_order on public.equipment (sort_order) where is_published;

comment on table public.equipment is 'Equipment cards and dialogs (Home and Equipment pages) and the quote form options.';

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique check (setting_key ~ '^[A-Za-z][A-Za-z0-9]{0,40}$'),
  label text not null default '',
  draft jsonb not null default '{}'::jsonb,
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  draft_updated_at timestamptz not null default now(),
  published_at timestamptz,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_settings is 'Business details, credentials, menu, footer and shared labels.';

create table public.media (
  id uuid primary key default gen_random_uuid(),
  -- Object path inside the site-media bucket.
  file_path text not null unique check (file_path ~ '^[a-z0-9][a-z0-9/_.-]{0,200}$'),
  original_filename text not null default '' check (char_length(original_filename) <= 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  file_size int not null check (file_size > 0 and file_size <= 5242880),
  width int check (width is null or width > 0),
  height int check (height is null or height > 0),
  alt_text text not null default '' check (char_length(alt_text) <= 300),
  uploaded_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_created on public.media (created_at desc);

create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null check (entity_table in ('pages', 'page_sections', 'equipment', 'site_settings')),
  entity_id uuid not null,
  content jsonb not null,
  sort_order int,
  published_at timestamptz not null default now(),
  published_by uuid references public.profiles (id) on delete set null
);

create index content_revisions_entity on public.content_revisions (entity_table, entity_id, published_at desc);

comment on table public.content_revisions is 'Every published version, newest first, for restoring.';

create trigger cms_before_write before insert or update on public.pages
  for each row execute function public.cms_before_write();
create trigger cms_before_write before insert or update on public.page_sections
  for each row execute function public.cms_before_write();
create trigger cms_before_write before insert or update on public.equipment
  for each row execute function public.cms_before_write();
create trigger cms_before_write before insert or update on public.site_settings
  for each row execute function public.cms_before_write();

-- ---------------------------------------------------------------------------
-- Public read
-- ---------------------------------------------------------------------------

-- Everything the public site renders, published copies only, in the shape of
-- SiteContent (src/content/types.ts).
create or replace function public.get_published_content()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'settings', coalesce(
      (select jsonb_object_agg(setting_key, published) from public.site_settings where published is not null),
      '{}'::jsonb),
    'pages', coalesce(
      (select jsonb_object_agg(p.slug, jsonb_build_object(
          'seo', coalesce(p.published, '{}'::jsonb),
          'sections', coalesce(
            (select jsonb_object_agg(s.section_key, s.published)
               from public.page_sections s
              where s.page_id = p.id and s.published is not null and s.is_enabled),
            '{}'::jsonb)))
         from public.pages p
        where p.is_published),
      '{}'::jsonb),
    'equipment', coalesce(
      (select jsonb_agg(e.published || jsonb_build_object('id', e.slug) order by e.sort_order, e.created_at)
         from public.equipment e
        where e.is_published and e.published is not null),
      '[]'::jsonb),
    'publishedAt', greatest(
      (select max(published_at) from public.site_settings),
      (select max(published_at) from public.pages),
      (select max(published_at) from public.page_sections),
      (select max(published_at) from public.equipment))
  )
$$;

-- ---------------------------------------------------------------------------
-- Publishing (admins only; checked inside each function)
-- ---------------------------------------------------------------------------

create or replace function public.cms_require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_cms_admin() then
    raise exception 'You do not have permission to change website content.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.cms_publish(p_table text, p_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_draft jsonb;
  v_sort int;
begin
  perform public.cms_require_admin();

  if p_table = 'equipment' then
    select draft, draft_sort_order into v_draft, v_sort from public.equipment where id = p_id for update;
    if not found then raise exception 'That equipment item no longer exists.'; end if;
    if coalesce(trim(v_draft ->> 'title'), '') = '' then
      raise exception 'Add a name before publishing.' using errcode = '22023';
    end if;
    update public.equipment
       set published = v_draft, sort_order = v_sort, is_published = true, published_at = v_now
     where id = p_id;
  elsif p_table = 'page_sections' then
    select draft into v_draft from public.page_sections where id = p_id for update;
    if not found then raise exception 'That section no longer exists.'; end if;
    update public.page_sections set published = v_draft, published_at = v_now where id = p_id;
  elsif p_table = 'site_settings' then
    select draft into v_draft from public.site_settings where id = p_id for update;
    if not found then raise exception 'That setting no longer exists.'; end if;
    update public.site_settings set published = v_draft, published_at = v_now where id = p_id;
  elsif p_table = 'pages' then
    select draft into v_draft from public.pages where id = p_id for update;
    if not found then raise exception 'That page no longer exists.'; end if;
    if coalesce(trim(v_draft ->> 'title'), '') = '' then
      raise exception 'Add a page title before publishing.' using errcode = '22023';
    end if;
    update public.pages set published = v_draft, published_at = v_now where id = p_id;
  else
    raise exception 'Unknown content type %.', p_table using errcode = '22023';
  end if;

  insert into public.content_revisions (entity_table, entity_id, content, sort_order, published_at, published_by)
  values (p_table, p_id, v_draft, v_sort, v_now, auth.uid());

  return v_now;
end;
$$;

-- Publishes every row whose draft differs from what is live. Equipment that
-- was deliberately unpublished stays unpublished.
create or replace function public.cms_publish_all()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  v_count int := 0;
begin
  perform public.cms_require_admin();
  for r in
    select 'site_settings' as t, id from public.site_settings where draft is distinct from published
    union all
    select 'pages', id from public.pages where draft is distinct from published
    union all
    select 'page_sections', id from public.page_sections where draft is distinct from published
    union all
    select 'equipment', id from public.equipment
     where (draft is distinct from published or draft_sort_order is distinct from sort_order)
       and (is_published or published is null)
  loop
    perform public.cms_publish(r.t, r.id);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

create or replace function public.cms_unpublish_equipment(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.cms_require_admin();
  update public.equipment set is_published = false where id = p_id;
  if not found then raise exception 'That equipment item no longer exists.'; end if;
end;
$$;

-- Throws away unpublished edits: the draft goes back to the live version.
create or replace function public.cms_discard_draft(p_table text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.cms_require_admin();
  if p_table = 'equipment' then
    update public.equipment set draft = published, draft_sort_order = sort_order
     where id = p_id and published is not null;
  elsif p_table = 'page_sections' then
    update public.page_sections set draft = published where id = p_id and published is not null;
  elsif p_table = 'site_settings' then
    update public.site_settings set draft = published where id = p_id and published is not null;
  elsif p_table = 'pages' then
    update public.pages set draft = published where id = p_id and published is not null;
  else
    raise exception 'Unknown content type %.', p_table using errcode = '22023';
  end if;
  if not found then raise exception 'There is no published version to go back to.'; end if;
end;
$$;

-- Loads an earlier published version into the draft. Publish it to go live.
create or replace function public.cms_restore_revision(p_revision uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.content_revisions%rowtype;
begin
  perform public.cms_require_admin();
  select * into v from public.content_revisions where id = p_revision;
  if not found then raise exception 'That version no longer exists.'; end if;
  if v.entity_table = 'equipment' then
    update public.equipment set draft = v.content, draft_sort_order = coalesce(v.sort_order, draft_sort_order)
     where id = v.entity_id;
  elsif v.entity_table = 'page_sections' then
    update public.page_sections set draft = v.content where id = v.entity_id;
  elsif v.entity_table = 'site_settings' then
    update public.site_settings set draft = v.content where id = v.entity_id;
  elsif v.entity_table = 'pages' then
    update public.pages set draft = v.content where id = v.entity_id;
  end if;
  if not found then raise exception 'The item for that version no longer exists.'; end if;
end;
$$;

-- Sets the draft listing order from an ordered list of equipment ids.
create or replace function public.cms_reorder_equipment(p_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.cms_require_admin();
  update public.equipment e
     set draft_sort_order = o.position
    from unnest(p_ids) with ordinality as o (id, position)
   where e.id = o.id;
end;
$$;

-- Where a media file is used, as "table:key" entries. Used to block deleting
-- images that are still on the site or in a draft.
create or replace function public.cms_media_usage(p_path text)
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select 'site_settings:' || setting_key from public.site_settings
   where position(p_path in coalesce(draft::text, '') || coalesce(published::text, '')) > 0
  union all
  select 'page_sections:' || p.slug || '.' || s.section_key
    from public.page_sections s join public.pages p on p.id = s.page_id
   where position(p_path in coalesce(s.draft::text, '') || coalesce(s.published::text, '')) > 0
  union all
  select 'equipment:' || slug from public.equipment
   where position(p_path in coalesce(draft::text, '') || coalesce(published::text, '')) > 0
  union all
  select 'revision:' || entity_table from public.content_revisions r
   where position(p_path in r.content::text) > 0
     and r.published_at = (select max(r2.published_at) from public.content_revisions r2
                            where r2.entity_table = r.entity_table and r2.entity_id = r.entity_id)
$$;

create or replace function public.cms_media_in_use(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_path <> '' and exists (select 1 from public.cms_media_usage(p_path))
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security and grants
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.page_sections enable row level security;
alter table public.equipment enable row level security;
alter table public.site_settings enable row level security;
alter table public.media enable row level security;
alter table public.content_revisions enable row level security;

-- Supabase grants every role full access to new tables by default. Start
-- from nothing and grant only what the dashboard needs.
revoke all on public.profiles, public.pages, public.page_sections, public.equipment,
  public.site_settings, public.media, public.content_revisions from anon, authenticated;

grant select on public.profiles, public.pages, public.page_sections, public.equipment,
  public.site_settings, public.media, public.content_revisions to authenticated;

grant update (full_name, role) on public.profiles to authenticated;
grant update (draft) on public.pages to authenticated;
grant update (draft) on public.page_sections to authenticated;
grant update (draft) on public.site_settings to authenticated;
grant insert (slug, draft, draft_sort_order) on public.equipment to authenticated;
grant update (draft, draft_sort_order) on public.equipment to authenticated;
grant delete on public.equipment to authenticated;
grant insert (file_path, original_filename, mime_type, file_size, width, height, alt_text) on public.media to authenticated;
grant update (alt_text) on public.media to authenticated;
grant delete on public.media to authenticated;

-- Profiles: you see yourself; admins see everyone; owners change roles.
create policy "profiles: read own or as admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_cms_admin());
create policy "profiles: update own name or as owner" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_cms_owner())
  with check (id = auth.uid() or public.is_cms_owner());

-- Content: admins only. No policy for anon, so visitors are denied outright.
create policy "pages: admins read" on public.pages for select to authenticated using (public.is_cms_admin());
create policy "pages: admins edit" on public.pages for update to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());

create policy "sections: admins read" on public.page_sections for select to authenticated using (public.is_cms_admin());
create policy "sections: admins edit" on public.page_sections for update to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());

create policy "settings: admins read" on public.site_settings for select to authenticated using (public.is_cms_admin());
create policy "settings: admins edit" on public.site_settings for update to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());

create policy "equipment: admins read" on public.equipment for select to authenticated using (public.is_cms_admin());
create policy "equipment: admins add" on public.equipment for insert to authenticated with check (public.is_cms_admin());
create policy "equipment: admins edit" on public.equipment for update to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "equipment: admins delete" on public.equipment for delete to authenticated using (public.is_cms_admin());

create policy "media: admins read" on public.media for select to authenticated using (public.is_cms_admin());
create policy "media: admins add" on public.media for insert to authenticated with check (public.is_cms_admin());
create policy "media: admins edit alt text" on public.media for update to authenticated
  using (public.is_cms_admin()) with check (public.is_cms_admin());
create policy "media: admins delete unused" on public.media for delete to authenticated
  using (public.is_cms_admin() and not public.cms_media_in_use(file_path));

create policy "revisions: admins read" on public.content_revisions for select to authenticated using (public.is_cms_admin());

-- Functions: visitors may only read published content.
revoke all on function
  public.cms_role(),
  public.is_cms_admin(),
  public.is_cms_owner(),
  public.cms_handle_new_user(),
  public.cms_guard_profile(),
  public.cms_link_ok(text),
  public.cms_image_src_ok(text),
  public.cms_check_json(jsonb, text),
  public.cms_before_write(),
  public.get_published_content(),
  public.cms_require_admin(),
  public.cms_publish(text, uuid),
  public.cms_publish_all(),
  public.cms_unpublish_equipment(uuid),
  public.cms_discard_draft(text, uuid),
  public.cms_restore_revision(uuid),
  public.cms_reorder_equipment(uuid[]),
  public.cms_media_usage(text),
  public.cms_media_in_use(text)
from public, anon, authenticated;
grant execute on function public.get_published_content() to anon, authenticated;
grant execute on function
  public.cms_role(),
  public.is_cms_admin(),
  public.is_cms_owner(),
  public.cms_publish(text, uuid),
  public.cms_publish_all(),
  public.cms_unpublish_equipment(uuid),
  public.cms_discard_draft(text, uuid),
  public.cms_restore_revision(uuid),
  public.cms_reorder_equipment(uuid[]),
  public.cms_media_usage(text),
  public.cms_media_in_use(text)
to authenticated;
-- Used by RLS policies and triggers, which run as the querying role.
grant execute on function
  public.cms_link_ok(text),
  public.cms_image_src_ok(text),
  public.cms_check_json(jsonb, text)
to authenticated;
