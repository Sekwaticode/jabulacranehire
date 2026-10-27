-- The site now has a full privacy policy at /privacy. This points the footer's
-- "Privacy Notice" link (which went to the short note on the Contact page) at
-- the new page and renames it "Privacy Policy". A link an editor has already
-- changed is left alone.

create function public.tmp_privacy_link(doc jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when doc ? 'legal' and jsonb_typeof(doc -> 'legal') = 'array' then
      jsonb_set(doc, '{legal}', (
        select coalesce(jsonb_agg(
          case
            when e ->> 'href' = '/contact#privacy'
              then e || '{"label":"Privacy Policy","href":"/privacy"}'::jsonb
            else e
          end
          order by i), '[]'::jsonb)
        from jsonb_array_elements(doc -> 'legal') with ordinality as t(e, i)
      ))
    else doc
  end
$$;

update public.site_settings
   set draft = public.tmp_privacy_link(draft),
       published = public.tmp_privacy_link(published)
 where setting_key = 'footer'
   and (draft is distinct from public.tmp_privacy_link(draft)
        or published is distinct from public.tmp_privacy_link(published));

drop function public.tmp_privacy_link(jsonb);
