-- Sets the company email shown on the website to info@jabulacranes-hire.co.za.
-- The seed left it empty, which hides the email on the site. Only a blank email
-- is filled in, so an address an editor has since entered is left alone.

update public.site_settings
   set draft = jsonb_set(draft, '{email}', '"info@jabulacranes-hire.co.za"'::jsonb),
       draft_updated_at = now()
 where setting_key = 'business'
   and coalesce(draft ->> 'email', '') = '';

update public.site_settings
   set published = jsonb_set(published, '{email}', '"info@jabulacranes-hire.co.za"'::jsonb),
       published_at = now()
 where setting_key = 'business'
   and published is not null
   and coalesce(published ->> 'email', '') = '';
