# Website content management (Supabase)

The public site at https://jabulacranehire.netlify.app looks and behaves exactly as before. Its words, links,
images, equipment and business details now come from Supabase, and the owner edits them at `/admin`.

- [SETUP.md](SETUP.md): create the Supabase project, run the migrations, add the first owner.
- [DEPLOYMENT.md](DEPLOYMENT.md): Netlify environment variables and going live.
- [TESTING.md](TESTING.md): how the system was tested and how to re-run the tests.

## How it fits together

```
Visitor ──► Netlify (same static Vite build as before)
              │  one POST to get_published_content() with the public anon key
              ▼
           Supabase Postgres ── published content only (security definer function)

Owner ───► /admin (separate lazy-loaded bundle, Supabase Auth)
              │  reads/writes drafts directly, limited by Row Level Security
              │  publishes through database functions (cms_publish, cms_publish_all, ...)
              ▼
           Supabase Postgres + Storage bucket `site-media`
```

- **No redeploys.** Publishing writes to the database. Visitors get the new content on their next page load.
- **Always renders.** The site waits at most 1.5 seconds for content (0.75 s when it has a cached copy). If
  Supabase is down or not configured, it uses the last copy that browser saw, and failing that the built-in
  defaults in `src/content/defaults.ts`, which are the site's original text.
- **Public bundle stays light.** Visitors never download the Supabase client or the dashboard code.
- **Only the anon key is in the browser.** The service-role key is not used anywhere in the website.

## Drafts, preview and publishing

Every editable row has two copies: `draft` (what the dashboard edits) and `published` (what visitors see).

| Action | What happens |
| --- | --- |
| Save draft | Updates `draft` only. The live site doesn't change. |
| Preview drafts | Opens the real site in a new tab with all drafts, marked "Draft preview · not live". Nothing is saved or published. |
| Publish / Publish all | Copies draft to published and records the version in `content_revisions`. |
| Go back to live version | Replaces the draft with what is live (`cms_discard_draft`). |
| Discard unsaved edits | Drops edits that haven't been saved yet. |
| History → Restore as draft | Loads an earlier published version as the draft, ready to check and publish. |
| Hide from website (equipment) | Takes an item off the site without deleting it (`cms_unpublish_equipment`). |

The `published` column can't be written directly by anyone. It changes only through the publishing functions.

## Content-to-component mapping

Each record maps to one fixed React component in the codebase. The database stores plain text, links and image
URLs only: it cannot choose a component, add HTML, run code or change styles. The mapping lives in
`src/content/schema.ts` (dashboard forms) and `src/content/types.ts` (the shapes components read).

| Page | Section key (`page_sections.section_key`) | Dashboard label | Component |
| --- | --- | --- | --- |
| Home (`/`) | `hero` | Hero | `HomeHero` |
| Home (`/`) | `trust` | Scrolling facts strip | `LogoLoop` |
| Home (`/`) | `equipment` | Our equipment | `EquipmentGrid` |
| Home (`/`) | `industries` | Industries we serve | `Industries` |
| Home (`/`) | `safety` | Safety & operators | `Safety` |
| Home (`/`) | `hireOptions` | Hire options | `HireOptions` |
| Home (`/`) | `process` | How a hire works | `Timeline` |
| Home (`/`) | `quote` | Quote request | `QuoteSection` |
| About (`/about`) | `header` | Page header | `PageHeader` |
| About (`/about`) | `intro` | Who we are | `AboutIntro` |
| About (`/about`) | `visionMission` | Vision and mission | `VisionMission` |
| About (`/about`) | `commitment` | Our service commitment | `Commitment` |
| About (`/about`) | `quality` | Quality & reliability | `Quality` |
| About (`/about`) | `whyChoose` | Why choose Jabula | `WhyChoose` |
| About (`/about`) | `clients` | Who we work with | `Clients` |
| About (`/about`) | `credentials` | Company credentials | `Credentials` |
| About (`/about`) | `cta` | Orange closing banner | `CtaBanner` |
| Equipment (`/equipment`) | `header` | Page header | `PageHeader` |
| Equipment (`/equipment`) | `fleet` | Our equipment | `EquipmentGrid` |
| Equipment (`/equipment`) | `applications` | Applications | `Applications` |
| Equipment (`/equipment`) | `cta` | Orange closing banner | `CtaBanner` |
| Careers (`/careers`) | `header` | Page header | `PageHeader` |
| Careers (`/careers`) | `intro` | Working here | `CareersIntro` |
| Careers (`/careers`) | `teams` | Teams slider | `Teams` |
| Careers (`/careers`) | `expectations` | What we expect | `Expectations` |
| Careers (`/careers`) | `cta` | Orange closing banner | `CtaBanner` |
| Contact (`/contact`) | `header` | Page header | `PageHeader` |
| Contact (`/contact`) | `quote` | Quote request panel | `QuoteForm` |
| Contact (`/contact`) | `reachUs` | Reach us directly | `ContactDetails` |
| Contact (`/contact`) | `faqs` | FAQs | `Faqs` |

Equipment rows (`equipment`) fill `EquipmentGrid` cards and their pop-up on Home and Equipment, the `Applications`
cards and the quote form's equipment choices. Page titles and search descriptions come from `pages.draft/published`
(`seo`), used by `App.tsx`.

Site-wide settings (`site_settings.setting_key`), used by `Navbar`, `Menu`, `Footer`, `ActionBar`,
`ContactDetails`, `QuoteForm`, `CtaBanner` and others:

| Key | Dashboard label |
| --- | --- |
| `business` | Business details |
| `credentials` | Company credentials |
| `brand` | Logo |
| `navigation` | Menu |
| `footer` | Footer |
| `actionBar` | Phone action bar |
| `contactLabels` | Contact detail labels |
| `quoteForm` | Quote form options |
| `labels` | Fallback labels |

Phone numbers are stored once as display text (e.g. `013 241 1017`). Call links (`tel:+27132411017`) and
WhatsApp links are built from them in `src/content/links.ts`, so every button updates together.

### Adding a new section later

1. Build the component in code as usual.
2. Add its fields to `pageSchema` in `src/content/schema.ts`, its type to `src/content/types.ts` and its current
   text to `src/content/defaults.ts`.
3. Insert the row with a new migration (see `scripts/generate-seed.ts`).

The database can't add sections by itself, by design.

## Database

Tables (migration `supabase/migrations/20261019000100_cms_schema.sql`):

| Table | Purpose |
| --- | --- |
| `profiles` | One per sign-in account: email, name, role (`owner`, `editor`, `none`). |
| `pages` | The five pages and their browser title and search description. |
| `page_sections` | One row per section in the table above. |
| `equipment` | Equipment items, their order and whether they're on the site. |
| `site_settings` | Business details, menu, footer and other site-wide content. |
| `media` | Uploaded images: file path, type, size, dimensions, description. |
| `content_revisions` | Every published version, for History and restore. |

Validation runs in the database as well as the dashboard (`cms_check_json`): only known field names, text up to
5,000 characters, lists up to 200 items, links limited to `https://`, `mailto:`, `tel:`, site paths (`/contact`)
and anchors (`#quote`), and image addresses limited to the site's own files or `https://` URLs. The dashboard
only offers images from the media library. Everything is rendered as plain text, never as HTML.

## Security summary

- Sign-up is turned off. Accounts are invited from the Supabase dashboard. New accounts get the role `none`
  (no access) until an owner gives them a role.
- The first owner is granted with `select public.cms_make_owner('email')` in the SQL editor. That function
  can't be called from the browser.
- Only owners can change roles, and the last owner can't be removed (database trigger).
- Row Level Security on every table. Visitors can't read any table directly; they only get published content
  through `get_published_content()`.
- Storage bucket `site-media`: public read, JPEG/PNG/WebP only, 5 MB limit, uploads and deletes for owners and
  editors only, and an image can't be deleted while published or draft content uses it.
- `/admin` is marked `noindex`.

Role permissions:

| | Visitor | Signed in, role `none` | Editor | Owner |
| --- | --- | --- | --- | --- |
| See published site | yes | yes | yes | yes |
| Read/edit drafts, preview | no | no | yes | yes |
| Publish, restore, hide equipment | no | no | yes | yes |
| Upload/delete images | no | no | yes | yes |
| Manage users and roles | no | no | no | yes |
