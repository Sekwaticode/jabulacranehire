# Setting up Supabase and the first owner

Do this once. It takes about 15 minutes and needs no command line.

## 1. Create the Supabase project

1. Sign in at https://supabase.com and create a new project (any region close to South Africa, e.g. `eu-west`
   or `af-south` if offered). Keep the database password somewhere safe.
2. Wait until the project says it's ready.

## 2. Run the migrations

Open **SQL Editor → New query**, then paste and run each file below **in this order**. Each should finish with
"Success. No rows returned".

1. `supabase/migrations/20261019000100_cms_schema.sql` (tables, rules, publishing functions)
2. `supabase/migrations/20261019000200_cms_storage.sql` (image bucket and its rules)
3. `supabase/migrations/20261019000300_cms_seed.sql` (the site's current content)

If you use the Supabase CLI instead: `supabase init` (once, if there is no `supabase/config.toml`), `supabase link --project-ref <ref>`, then `supabase db push`.

After step 3 the database holds exactly what the website shows today, already published.

## 3. Turn off public sign-ups

**Authentication → Sign In / Providers**:

- Turn **off** "Allow new users to sign up".
- Keep **Email** enabled.
- Leave "Confirm email" on.

This stops anyone from creating an account. Even if someone did, new accounts get no access until an owner gives
them a role.

## 4. Set the site address for email links

**Authentication → URL Configuration**:

- **Site URL**: `https://jabulacranehire.netlify.app/admin`
- **Redirect URLs**: add `https://jabulacranehire.netlify.app/admin` (and later your own domain, e.g.
  `https://www.jabulacranehire.co.za/admin`, if you move to one).

Invite and password-reset emails then bring people back to the dashboard to choose a password.

## 5. Invite the owner

1. **Authentication → Users → Add user → Send invitation**, and enter the owner's email.
2. In **SQL Editor**, run (with that email):

   ```sql
   select public.cms_make_owner('owner@example.com');
   ```

   It answers `Owner access granted to owner@example.com`.
3. The owner opens the invitation email, clicks the link, chooses a password (at least 10 characters) and lands
   in the dashboard.

`cms_make_owner` can only run in the SQL editor. It can't be called from the website.

## 6. More people

The owner can add editors without SQL:

1. Invite them in **Authentication → Users**.
2. After they've set a password, they appear in the dashboard under **Users** with "No access".
3. The owner sets their role to **Editor** (edit and publish) or **Owner** (also manages users).

To remove someone, set their role to "No access", or delete the user in Supabase. The last owner can't be removed.

## Keys: which is which

In **Project Settings → API**:

| Key | Where it goes |
| --- | --- |
| Project URL | Netlify variable `VITE_SUPABASE_URL` |
| `anon` / publishable key | Netlify variable `VITE_SUPABASE_ANON_KEY`. It's public by design. |
| `service_role` / secret key | **Nowhere.** The website doesn't use it. Don't paste it into Netlify, code or chat. |

Next: [DEPLOYMENT.md](DEPLOYMENT.md).
