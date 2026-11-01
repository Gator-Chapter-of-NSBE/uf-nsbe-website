# Member portal: stage one

## Trailblazers application links

Applications are closed by default. To reopen them, set
`TRAILBLAZERS_APPLICATIONS_OPEN=true` in Vercel's Production environment and
redeploy. Set it to `false` and redeploy to close them again. This controls all
application links in the Trailblazers pages, homepage, Get Involved page, and
footer. The application URL is maintained in `data/trailblazers-applications.ts`.
This setting hides website links; close the Google Form itself separately if you
also want to reject submissions from people who already have its URL.

The portal lives at `/portal`. The existing `/sign-in` Google Form is unchanged.
This stage includes Google login, verified-email linking, editable profiles, the
database permission model, and a dashboard for semester attendance and points.
CSV import, calendar event creation, public password check-in, and admin screens
are the next stage. No historical attendance has been imported automatically.

## 1. Create a free Supabase project

Create a project at https://supabase.com/dashboard and retain the database password
privately. Choose a region close to your Vercel functions when practical.

In **SQL Editor**, run the complete contents of
`supabase/migrations/202610180001_portal_foundation.sql` once. Keep the migration
in source control. Do not run it against a project that already has these tables.

In project **Connect / API settings**, copy the project URL and publishable key.
The application uses user sessions and row-level security; it does not need a
service-role key. Never expose a service-role/secret key as a `NEXT_PUBLIC_` value.

## 2. Configure Google login

In Google Cloud Console (https://console.cloud.google.com/):

1. Create or choose a project owned by the chapter or a maintainable chapter account.
2. Configure Google Auth Platform branding/audience. Use **External** unless your
   organization administrator has explicitly enabled an appropriate internal app.
3. Request only basic sign-in scopes: `openid`, email, and profile. Do not request
   members' Calendar or Drive access for login.
4. Create an OAuth client of type **Web application**. Add website origins for
   `http://localhost:3000` and `https://ufnsbe.org` as applicable.
5. In Supabase **Authentication → Sign In / Providers → Google**, copy the callback
   URL shown there (normally `https://PROJECT_REF.supabase.co/auth/v1/callback`).
   Add that exact URL as an authorized redirect URI in Google. This Google redirect
   is different from your application's `/auth/callback` URL.
6. Put the Google client ID and secret into the Supabase Google provider settings
   and enable it. Do not put the Google secret in the repository.
7. During Google testing, add the UF test accounts. Before a chapter-wide launch,
   publish the OAuth app to production and complete any checks Google requests.

Disable unused authentication providers, particularly email/password and anonymous
sign-in. The UI offers Google only. Database access additionally requires a
confirmed `@ufl.edu` email and a Google identity with the same verified email.
The `hd=ufl.edu` login hint helps select the right account; it is not the security
boundary. Non-UF Google users may obtain an Auth account through direct provider
requests but cannot claim a member record or access portal tables.

## 3. Configure return URLs and environment variables

In Supabase **Authentication → URL Configuration**:

- Site URL: `https://ufnsbe.org`.
- Allowed redirect URLs: `https://ufnsbe.org/auth/callback` and
  `http://localhost:3000/auth/callback`.
- Add an exact callback for `www.ufnsbe.org` only if that hostname will serve the
  portal rather than redirect to the canonical domain.

Copy `.env.example` to `.env.local` without replacing your existing contact-form
variables. Fill in:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run `npm install`, then `npm run dev`. Open `/portal`.

In Vercel **Project → Settings → Environment Variables**, add the same variables to
**Production**, using `https://ufnsbe.org` for `NEXT_PUBLIC_SITE_URL`. Redeploy after
changing environment variables. No new hosting service or paid auth domain is needed.

For Preview deployments, use a separate free Supabase project if available and a
stable preview URL. Configure that project's keys, exact callback allowlist, and
`NEXT_PUBLIC_SITE_URL` in the Vercel Preview environment. Do not give arbitrary
preview branches access to real member data. Leaving preview credentials unset
shows the portal's preparation message and keeps the public site working.

## 4. Bootstrap a semester and administrators

Semester definitions are intentionally not guessed or automatically seeded. Add
the chapter's agreed dates in SQL Editor. Date ranges are inclusive and cannot
overlap. For example, after confirming these dates and the external-event rule:

```sql
insert into public.semesters
  (name, starts_on, ends_on, external_counts_for_membership)
values ('Fall 2026', '2026-08-01', '2026-12-31', false);
```

Active membership is 2 GBMs and 3 qualifying events in one semester. General
events qualify. Each semester explicitly controls whether external events also
qualify. Point values are 5/10/15 for general/GBM/external events. No attendance
percentage bonus or tiebreaker is calculated automatically.

Have the initial administrator log in once, then use SQL Editor:

```sql
-- Replace the example with the exact verified officer email.
insert into public.admin_roles (member_id)
select id from public.members where email = 'officer@ufl.edu';
```

Grant/revoke roles through SQL Editor in this stage. No user, including an admin,
can promote themselves through the public API. Admin roles permit event/attendance
management and append-only point adjustments at the database level; admin UI is
not included yet. To revoke:

```sql
delete from public.admin_roles
where member_id = (select id from public.members where email = 'officer@ufl.edu');
```

Profiles include optional NSBE ID and UFID. Identity email, joined date, and roles
cannot be edited by a member. `joined_on` is reserved for a verified/imported
membership date; first login is not treated as their original chapter join date.

## 5. Verify before launch

- With no configuration, `/portal/login` shows a preparation message and
  `/sign-in` still serves the existing form.
- A UF Google account can log in, complete a profile, edit it, and sign out.
- A personal Google account cannot enter the portal or read its database tables.
- A signed-out visitor to `/portal` or `/portal/profile` returns to login.
- Two UF users cannot read or edit each other's profiles/attendance, or modify
  their own points/roles via direct API requests.
- An imported member with `auth_user_id = null` is linked only to the matching
  verified UF account, without replacing their history or profile.
- The dashboard accurately shows known attendance, explicit adjustments, term
  boundaries, external-event eligibility, and lifetime totals.
- Repeat these checks on the production hostname, including mobile login.

`npm run test:portal` tests membership/point rules. `npm run typecheck` checks
TypeScript independently of the existing Next.js configuration, which skips type
errors during builds. `tests/portal-permissions.sql` tests the migration with a
minimal auth fixture in an isolated local PostgreSQL database; never run that
fixture on Supabase or a real database.

## Free-tier operation and records

Supabase Free can pause after low activity over seven days. Check and restore the
project before meetings following a break. Watch Supabase/Vercel usage dashboards;
there is no paid plan, background keep-alive job, photo storage, or paid add-on
required by this implementation. Export database records regularly, particularly
before imports or policy changes. Free-tier availability is not guaranteed.

Attendance CSVs contain personal information and are ignored by Git. If an export
was committed previously, ignoring it does not remove it from Git history. Do not
put raw attendance exports in `public/` or commit them with the application.

The migration is a foundation for the import: preserve source-row identifiers,
map old event labels to specific semester event occurrences, review duplicates,
and create unclaimed member records by normalized UF email. No account needs to
exist before importing attendance. Do not infer missing event dates, categories,
or organizational zones without chapter review.

References: [Supabase Next.js SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client),
[Google provider setup](https://supabase.com/docs/guides/auth/social-login/auth-google),
[redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
