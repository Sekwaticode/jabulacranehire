# Testing

Everything below was run against a local Supabase stack (Postgres, GoTrue auth, PostgREST and Storage in
Docker), never against production.

## Automated tests in this repo

### Database and storage security: `supabase/tests/security.test.mjs`

22 tests of the rules in the database itself, bypassing the dashboard: visitors can't read tables or drafts;
role `none` can't read or write anything; editors can't change roles; owners can't remove the last owner; nobody
can write `published` directly; unsafe links, scripts in image addresses and unknown fields are refused; storage
uploads need an admin, non-images and oversized files are refused, and images in use can't be deleted.

```bash
SUPABASE_URL=http://localhost:54321 SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
  node --test supabase/tests/security.test.mjs
```

It refuses to run against anything but localhost. The service-role key here is the local stack's, used only to
create test users.

### Dashboard end to end: `supabase/tests/dashboard.e2e.mjs`

A Playwright run through the real dashboard and public site. It needs `npm i -D playwright pngjs`, and a build
pointed at the local stack (`.env.local`) served with `npm run build && npx vite preview --port 4173`:

```bash
SITE_URL=http://localhost:4173 SUPABASE_URL=http://localhost:54321 \
  SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node supabase/tests/dashboard.e2e.mjs
```

It checks:

1. Signed-out visitors get the sign-in form on any `/admin` path.
2. A wrong password is refused.
3. An account with role `none` sees "No dashboard access".
4. Editors can edit but don't get the Users screen.
5. The owner sees the overview stats.
6. Saving a draft doesn't change the live site.
7. Refreshing an `/admin/...` page keeps the screen and the saved draft.
8. Preview shows the draft with the "not live" badge, and the live site stays unchanged.
9. An unsafe link (`javascript:`) is refused in the dashboard...
10. ...and by the database when sent directly.
11. Publishing updates the live site without a rebuild.
12. History restores an earlier published version as a draft, which goes live only when published.
13. Non-image files are refused on upload.
14. An uploaded image, once published, appears on the live site from Supabase Storage.
15. An image in use can't be deleted.
16. After it's replaced, it can be deleted, and its URL stops working.
17. Changing the office phone number updates every call link.
18. New equipment appears as a card and as a quote-form option once published.
19. Reordering equipment changes the live order after publishing.
20. Hiding equipment removes it from the live site.
21. Deleting equipment.
22. The owner can change roles, and the last owner can't demote themselves.
23. The dashboard works at phone width without sideways scrolling.
24. The quote form still opens WhatsApp with the request filled in.
25. Public menu, equipment pop-up and FAQs still work.
26. With Supabase unreachable, the site renders its built-in content.
27. With Supabase unreachable after an earlier visit, the cached content is used.

### Visual regression

Every public page was screenshotted (1440 px desktop and 390 px mobile, full length) before any change and again
after, serving content from Supabase. All 10 screenshots are pixel-identical to the original site.

## Acceptance checklist

| Check | Covered by |
| --- | --- |
| Public site looks and works as before | Visual regression, e2e 24–25 |
| Only authorised users reach `/admin` | e2e 1–4, security tests |
| No self-registration | Sign-ups disabled (SETUP step 3), new accounts get role `none` (security tests) |
| Edit text, links, images, settings | e2e 6, 11, 14, 17 |
| Equipment add/edit/reorder/hide/delete | e2e 18–21 |
| Drafts don't affect the live site | e2e 6, 8, 12 |
| Publish goes live without a redeploy | e2e 11 |
| Revisions and restore | e2e 12 |
| Image validation and in-use protection | e2e 13–16, security tests |
| Unsafe content refused server-side | e2e 10, security tests |
| Service-role key not in the browser | Not referenced in `src/`; the public bundle contains no Supabase client |
| Refresh on any route | `public/_redirects`, e2e 7 |
| Mobile | e2e 23, visual regression |
| Survives Supabase outage | e2e 26–27 |
| Roles | e2e 4, 22, security tests |
