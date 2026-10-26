-- Jabula works anywhere in South Africa, so the site no longer lists the
-- provinces it serves. This updates content already in the database (the
-- seed only fills empty tables):
--   * deletes the Contact page's "Service area" section
--   * drops the "Provinces served" list from the business details
--   * removes the "Service Area(s)" links from the menu and footer
--   * rewrites the seeded sentences that named provinces
-- Only text that still matches the original wording is rewritten. Anything an
-- editor has since changed is left alone and listed in a notice at the end.

create function public.tmp_nationwide(doc jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  k text;
  v jsonb;
  result jsonb;
begin
  case jsonb_typeof(doc)
    when 'object' then
      result := '{}'::jsonb;
      for k, v in select * from jsonb_each(doc) loop
        continue when k = 'provinces';
        result := result || jsonb_build_object(k, public.tmp_nationwide(v));
      end loop;
      return result;
    when 'array' then
      select coalesce(jsonb_agg(public.tmp_nationwide(e) order by i), '[]'::jsonb)
        into result
        from jsonb_array_elements(doc) with ordinality as t(e, i)
       where not (jsonb_typeof(e) = 'object' and e ->> 'href' = '/contact#service-area');
      return result;
    when 'string' then
      return to_jsonb(case doc #>> '{}'
        when 'Crane Hire, Forklifts & Telehandlers in Mpumalanga | Jabula Crane Hire'
          then 'Crane Hire, Forklifts & Telehandlers in South Africa | Jabula Crane Hire'
        when 'Crane Hire, Forklifts & Telehandlers in Mpumalanga'
          then 'Crane Hire, Forklifts & Telehandlers in South Africa'
        when 'Jabula Crane Hire: 40-ton to 60-ton mobile cranes, forklifts and telehandlers for hire in Mpumalanga, Gauteng and Limpopo. Call 013 241 1017 or request a quote.'
          then 'Jabula Crane Hire: 40-ton to 60-ton mobile cranes, forklifts and telehandlers for hire anywhere in South Africa. Call 013 241 1017 or request a quote.'
        when 'Witbank-based · Mpumalanga, Gauteng, Limpopo'
          then 'Witbank-based · Nationwide'
        when 'Reliable mobile crane hire and professional lifting solutions for construction, industrial, and infrastructure projects across Mpumalanga, Gauteng, and Limpopo.'
          then 'Reliable mobile crane hire and professional lifting solutions for construction, industrial, and infrastructure projects across South Africa.'
        when 'Mpumalanga, Gauteng & Limpopo'
          then 'Anywhere in South Africa'
        when 'Mobilisation is quoted together with the hire and depends on where your site is. Sites outside Mpumalanga, Gauteng and Limpopo can be arranged, subject to project requirements and transport costs.'
          then 'Mobilisation is quoted together with the hire and depends on where your site is.'
        when 'Mpumalanga is our primary service area, and we also work in Gauteng and Limpopo. Ask us about sites further afield.'
          then 'We work anywhere in South Africa. We are based in Witbank, and transport to your site is quoted with the hire.'
        when 'Reliable equipment. Professional service. Safe lifting. Cranes, forklifts and telehandlers for Mpumalanga, Gauteng and Limpopo.'
          then 'Reliable equipment. Professional service. Safe lifting. Cranes, forklifts and telehandlers for sites across South Africa.'
        else doc #>> '{}'
      end);
    else
      return doc;
  end case;
end;
$$;

delete from public.page_sections where section_key = 'serviceArea';

update public.pages
   set draft = public.tmp_nationwide(draft),
       published = public.tmp_nationwide(published)
 where draft is distinct from public.tmp_nationwide(draft)
    or published is distinct from public.tmp_nationwide(published);

update public.page_sections
   set draft = public.tmp_nationwide(draft),
       published = public.tmp_nationwide(published)
 where draft is distinct from public.tmp_nationwide(draft)
    or published is distinct from public.tmp_nationwide(published);

update public.site_settings
   set draft = public.tmp_nationwide(draft),
       published = public.tmp_nationwide(published)
 where draft is distinct from public.tmp_nationwide(draft)
    or published is distinct from public.tmp_nationwide(published);

drop function public.tmp_nationwide(jsonb);

-- Point out anything edited since the seed that still names a province
do $$
declare
  r record;
begin
  for r in
    select 'page ' || slug as place, coalesce(draft::text, '') || coalesce(published::text, '') as body
      from public.pages
    union all
    select 'section ' || section_key, coalesce(draft::text, '') || coalesce(published::text, '')
      from public.page_sections
    union all
    select 'setting ' || setting_key, coalesce(draft::text, '') || coalesce(published::text, '')
      from public.site_settings
    union all
    select 'equipment ' || slug, coalesce(draft::text, '') || coalesce(published::text, '')
      from public.equipment
  loop
    if r.body ~* '(gauteng|limpopo|mpumalanga|province)' then
      raise notice 'Still mentions a province, edit it in the dashboard: %', r.place;
    end if;
  end loop;
end;
$$;
