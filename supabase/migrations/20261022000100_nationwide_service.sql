-- The client asked for no mention of the areas Jabula serves. This updates
-- content already in the database (the seed only fills empty tables):
--   * deletes the Contact page's "Service area" section
--   * drops the "Provinces served" list from the business details
--   * removes the "Service Area(s)" links from the menu and footer
--   * removes the "Which areas do you cover?" FAQ and the service-area fact
--     from the scrolling strip
--   * rewrites the seeded sentences that named an area
-- The old sentences are quoted below only so they can be found. Both the
-- original province wording and an interim "South Africa" wording are
-- matched. Anything an editor has since changed is left alone and listed in a
-- notice at the end.

create function public.tmp_no_service_area(doc jsonb)
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
        result := result || jsonb_build_object(k, public.tmp_no_service_area(v));
      end loop;
      return result;
    when 'array' then
      select coalesce(jsonb_agg(public.tmp_no_service_area(e) order by i), '[]'::jsonb)
        into result
        from jsonb_array_elements(doc) with ordinality as t(e, i)
       where not (jsonb_typeof(e) = 'object' and e ->> 'href' = '/contact#service-area')
         and not (jsonb_typeof(e) = 'object' and e ->> 'q' = 'Which areas do you cover?')
         and not (jsonb_typeof(e) = 'string' and e #>> '{}' in ('Mpumalanga, Gauteng & Limpopo', 'Anywhere in South Africa'));
      return result;
    when 'string' then
      return to_jsonb(case doc #>> '{}'
        when 'Crane Hire, Forklifts & Telehandlers in Mpumalanga | Jabula Crane Hire'
          then 'Crane Hire, Forklifts & Telehandlers | Jabula Crane Hire'
        when 'Crane Hire, Forklifts & Telehandlers in South Africa | Jabula Crane Hire'
          then 'Crane Hire, Forklifts & Telehandlers | Jabula Crane Hire'
        when 'Crane Hire, Forklifts & Telehandlers in Mpumalanga'
          then 'Crane Hire, Forklifts & Telehandlers'
        when 'Crane Hire, Forklifts & Telehandlers in South Africa'
          then 'Crane Hire, Forklifts & Telehandlers'
        when 'Jabula Crane Hire: 40-ton to 60-ton mobile cranes, forklifts and telehandlers for hire in Mpumalanga, Gauteng and Limpopo. Call 013 241 1017 or request a quote.'
          then 'Jabula Crane Hire: 40-ton to 60-ton mobile cranes, forklifts and telehandlers for hire. Call 013 241 1017 or request a quote.'
        when 'Jabula Crane Hire: 40-ton to 60-ton mobile cranes, forklifts and telehandlers for hire anywhere in South Africa. Call 013 241 1017 or request a quote.'
          then 'Jabula Crane Hire: 40-ton to 60-ton mobile cranes, forklifts and telehandlers for hire. Call 013 241 1017 or request a quote.'
        when 'Witbank-based · Mpumalanga, Gauteng, Limpopo'
          then 'Witbank-based'
        when 'Witbank-based · Nationwide'
          then 'Witbank-based'
        when 'Reliable mobile crane hire and professional lifting solutions for construction, industrial, and infrastructure projects across Mpumalanga, Gauteng, and Limpopo.'
          then 'Reliable mobile crane hire and professional lifting solutions for construction, industrial, and infrastructure projects.'
        when 'Reliable mobile crane hire and professional lifting solutions for construction, industrial, and infrastructure projects across South Africa.'
          then 'Reliable mobile crane hire and professional lifting solutions for construction, industrial, and infrastructure projects.'
        when 'Mobilisation is quoted together with the hire and depends on where your site is. Sites outside Mpumalanga, Gauteng and Limpopo can be arranged, subject to project requirements and transport costs.'
          then 'Mobilisation is quoted together with the hire and depends on where your site is.'
        when 'Reliable equipment. Professional service. Safe lifting. Cranes, forklifts and telehandlers for Mpumalanga, Gauteng and Limpopo.'
          then 'Reliable equipment. Professional service. Safe lifting. Cranes, forklifts and telehandlers.'
        when 'Reliable equipment. Professional service. Safe lifting. Cranes, forklifts and telehandlers for sites across South Africa.'
          then 'Reliable equipment. Professional service. Safe lifting. Cranes, forklifts and telehandlers.'
        else doc #>> '{}'
      end);
    else
      return doc;
  end case;
end;
$$;

delete from public.page_sections where section_key = 'serviceArea';

update public.pages
   set draft = public.tmp_no_service_area(draft),
       published = public.tmp_no_service_area(published)
 where draft is distinct from public.tmp_no_service_area(draft)
    or published is distinct from public.tmp_no_service_area(published);

update public.page_sections
   set draft = public.tmp_no_service_area(draft),
       published = public.tmp_no_service_area(published)
 where draft is distinct from public.tmp_no_service_area(draft)
    or published is distinct from public.tmp_no_service_area(published);

update public.site_settings
   set draft = public.tmp_no_service_area(draft),
       published = public.tmp_no_service_area(published)
 where draft is distinct from public.tmp_no_service_area(draft)
    or published is distinct from public.tmp_no_service_area(published);

drop function public.tmp_no_service_area(jsonb);

-- Point out anything edited since the seed that still names a service area
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
    if r.body ~* '(gauteng|limpopo|mpumalanga|province|nationwide|service area|(anywhere|across) (in )?south africa)' then
      raise notice 'Still mentions a service area, edit it in the dashboard: %', r.place;
    end if;
  end loop;
end;
$$;
