-- The Home page hero was redesigned: a full-bleed crane photo, the heading
-- and quote button bottom left, an equipment card bottom right and a row of
-- highlights. This updates the hero already in the database (the seed only
-- fills empty tables):
--   * drops the old eyebrow, intro line and second button
--   * adds the highlights and the equipment card where they're missing
--   * swaps the old built-in background photo for the crane photo
-- A background photo an editor uploaded is kept.

create function public.tmp_new_hero(doc jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select
    case
      when doc #>> '{image,src}' = '/images/hero-site.jpg' or coalesce(doc #>> '{image,src}', '') = ''
        then jsonb_set(d, '{image}', '{"src":"/images/hero-crane.jpg","alt":"Yellow mobile crane on an open road at dusk"}'::jsonb)
      else d
    end
  from (
    select
      jsonb_build_object(
        'highlights', '["Qualified Operators","Daily to Long-Term Hire","Safety-First Lifting"]'::jsonb,
        'equipmentCard', jsonb_build_object(
          'title', 'Cranes, forklifts and telehandlers for every lift.',
          'link', coalesce(doc -> 'secondary', '{"label":"Explore Our Equipment","href":"#equipment"}'::jsonb),
          'image', '{"src":"/Yale_Forklift_in_Industrial_Yard.png","alt":""}'::jsonb
        )
      ) || (doc - 'eyebrow' - 'lead' - 'secondary') as d
  ) as t;
$$;

update public.page_sections ps
   set draft = public.tmp_new_hero(ps.draft),
       published = case when ps.published is null then null else public.tmp_new_hero(ps.published) end
  from public.pages p
 where p.id = ps.page_id
   and p.slug = 'home'
   and ps.section_key = 'hero';

drop function public.tmp_new_hero(jsonb);
