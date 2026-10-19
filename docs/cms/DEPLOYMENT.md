# Deploying on Netlify

The site stays on Netlify with the same build. No new hosting, functions or services.

## Build settings (unchanged)

- Build command: `npm run build`
- Publish directory: `dist`

## Environment variables

In Netlify: **Site configuration → Environment variables → Add a variable**. Add both, for all deploy contexts:

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL, e.g. `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The `anon` / publishable key from Supabase **Project Settings → API** |

Then **Deploys → Trigger deploy → Deploy site**. Vite reads these at build time, so a deploy is needed once after
adding or changing them. Content changes after that never need a deploy.

Do **not** add the `service_role` key. Nothing in the site needs it.

Without the variables, the public site still works and shows its built-in content, and `/admin` explains that
the dashboard isn't connected.

## Page refreshes

`public/_redirects` sends every path to `index.html`, so refreshing or opening a link like `/about`,
`/contact` or `/admin/equipment` directly loads the right page instead of Netlify's 404.

## Check after deploying

1. Open the site: it should look exactly as before.
2. Open `/admin`, sign in as the owner.
3. Change a small piece of text, **Save draft**, and check the live site is unchanged.
4. **Preview drafts** shows the change with a "Draft preview · not live" badge.
5. **Publish**, reload the live site: the change is there.
6. Put the text back and publish again.

## Local development

```bash
cp .env.example .env.local   # fill in the two values
npm install
npm run dev
```

`.env.local` is git-ignored.

## Rolling back

- Content: each item's **History** restores any earlier published version.
- Code: redeploy an earlier deploy from Netlify's Deploys list. The database keeps working with the earlier
  build because the public site only reads published content and falls back to its defaults.
