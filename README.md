# UF NSBE website

Public website and member portal for the University of Florida Gator Chapter of the National Society of Black Engineers, at **https://ufnsbe.org**.

The public site presents chapter leadership, programs, events, resources, membership information, and contact options. The member portal adds UF Google authentication, editable profiles, attendance history, semester membership status, and points.

## Architecture

This is a single **Next.js App Router** application written in TypeScript. Public content is primarily maintained in source-controlled data files; member records live in Supabase. Next.js Server Actions handle contact email, authentication initiation, sign-out, and profile updates. There is no separate backend application or custom REST API under `app/api`.

| Layer | Implementation |
| --- | --- |
| Application | Next.js 16.3.0, React 19, TypeScript with strict checking |
| Presentation | Tailwind CSS 4, local shadcn-style components using Base UI, Lucide icons |
| Public content | TypeScript modules in `data/`, page content in `app/`, media in `public/` |
| Member backend | Supabase Auth and PostgreSQL, accessed with user sessions and row-level security (RLS) |
| Email | Resend, called by the contact Server Action |
| Hosting and analytics | Vercel deployment configuration and production-only Vercel Analytics |

Pages use Server Components by default. Interactive forms, navigation, carousels, resource filtering, and subscription widgets use Client Components where needed. `app/layout.tsx` supplies the shared header, footer, metadata, Google fonts, and analytics; `app/globals.css` defines the visual theme. Imports beginning with `@/` resolve from the repository root.

### Data and request flows

- **Public pages:** route components compose shared UI and import chapter content from `data/`. Events are fetched server-side from Google Calendar and cached for five minutes; other integrations may use browser embeds.
- **Contact:** `ApplicationForm` calls `submitContactForm` on the server, which validates input, checks a hidden honeypot, escapes HTML, and calls Resend for a chapter notification and sender confirmation. Messages are not stored in the portal database.
- **Portal login:** a Server Action starts Google OAuth through Supabase. Google returns through Supabase to `/auth/callback`, which exchanges the code for a cookie-based session and calls `claim_member()`. Incomplete profiles go to `/portal/profile`; completed profiles go to `/portal`.
- **Portal data:** protected pages call `requireMember()` to validate the session and claim/load the member. Server-side Supabase queries run with that user's permissions. `readAll()` fetches dashboard records in batches of 500 to avoid truncating historical totals at API response limits.
- **Session refresh:** `proxy.ts` runs on `/portal/:path*` and `/auth/:path*`, refreshes Supabase cookies, and sets `Cache-Control: private, no-store`. Protected pages also perform authentication checks.

## Repository organization

```text
app/                         App Router pages, layouts, Server Actions, OAuth callback
  about/                     Chapter overview, history, executive board
  programs/                  Programs, Trailblazers/cohort/alumni, design team
  get-involved/              Membership and sponsorship information
  events/                    Chapter calendar and event content
  resources/                 Resource links and presentation library
  contact/                   Contact page, email action, honeypot constant
  newsletter/                Embedded Beehiiv publication
  sign-in/                   Existing Google Form for event check-in
  auth/callback/             OAuth callback route handler
  portal/                    Dashboard, login, profile, actions, loading/error UI
components/
  layout/                    Shared header and footer
  site/                      Brand elements, page heroes, primitives, Beehiiv form
  home/                      Homepage sections
  ui/                        Reusable UI controls
  forms/                     Configurable application/contact form
  portal/                    Member profile form
  events/                    Custom monthly event list
  resources/                 Interactive presentation library
data/                       Chapter content, people, navigation, programs, resources
lib/
  supabase/                  Environment helpers and cookie-aware server client
  portal/                    Session guard, types, membership rules, paginated reads
  calendar/                  Google Calendar fetching, date formatting, event grouping
  utils.ts                   Shared styling utilities
public/                      Photos, logos, icons, placeholders, hero video
supabase/migrations/          Schema, constraints, functions, grants, RLS policies
scripts/test-portal.mjs       Compiles portal rules and runs Node tests
tests/                      Rule tests and isolated SQL permission fixture
docs/MEMBER_PORTAL_SETUP.md  Supabase, Google OAuth, deployment, launch instructions
POINT_SYSTEM.md              Proposed scholarship/attendance policy notes
proxy.ts                     Portal/auth session refresh
next.config.mjs              Build and image configuration
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Chapter homepage |
| `/about`, `/about/history`, `/about/executive-board` | Chapter background and leadership |
| `/programs`, `/programs/design-team` | Programs and design team |
| `/programs/trailblazers`, `/programs/trailblazers/cohort`, `/programs/trailblazers/alumni` | Trailblazers program and people |
| `/events` | Upcoming Google Calendar events in a custom month-grouped list |
| `/get-involved`, `/get-involved/join`, `/get-involved/sponsor` | Participation, membership, sponsorship |
| `/resources`, `/resources/presentations` | External resources and presentation library |
| `/newsletter` | Beehiiv newsletter archive |
| `/contact` | Contact information and email form |
| `/sign-in` | Public event check-in Google Form; separate from portal authentication |
| `/portal/login` | Google login, or preparation message when configuration is missing |
| `/portal` | Protected dashboard; `?semester=<id>` selects a semester |
| `/portal/profile` | Protected profile completion/editing |
| `/auth/callback` | GET handler for the Supabase OAuth authorization code |

## APIs and server actions

These are application-internal Next.js Server Actions, rather than stable public HTTP endpoints.

| Entry point | Contract and behavior |
| --- | --- |
| `app/contact/actions.ts`: `submitContactForm(values)` | String record with required `name`, `email`, `topic`, `message`, optional `organization`, and honeypot `company_website`. Requires email configuration; validates required fields and email. A filled honeypot returns silently. Attempts chapter notification and sender confirmation; throws user-facing errors for invalid input, missing configuration, or caught send failures. |
| `app/portal/actions.ts`: `signInWithGoogle()` | Starts Google OAuth with UF domain hint and account selection, using the configured site origin for the callback. |
| `app/portal/actions.ts`: `signOut()` | Ends the local Supabase session and redirects to portal login. |
| `app/portal/actions.ts`: `saveProfile(previousState, formData)` | Authenticates the member; validates name, major, classification, optional NSBE ID and eight-digit UFID; updates permitted profile columns. Returns an error state on validation/update failure; revalidates the dashboard and redirects on success. |
| `app/auth/callback/route.ts`: `GET` | Accepts OAuth `code`, exchanges it for a session, checks UF Google eligibility, claims the member, and redirects. Failures return to login with an error query parameter. |

`components/forms/application-form.tsx` accepts an optional action callback. Without one, it only logs values and displays a simulated success state; supply an action when adding a form that must submit data.

### Portal database and permissions

The schema lives in [`supabase/migrations/202610180001_portal_foundation.sql`](supabase/migrations/202610180001_portal_foundation.sql).

| Table | Role |
| --- | --- |
| `members` | Normalized unique UF email, optional unique Auth link, profile fields, original join date, profile completion timestamp |
| `semesters` | Named inclusive date ranges that cannot overlap; per-term external-event membership policy |
| `events` | Semester occurrences, category, organizational zone, generated base points, optional calendar identifiers |
| `attendance` | Member-to-event records; unique member/event pairs and optional unique source references |
| `admin_roles` | Explicit administrator assignments by member ID |
| `point_adjustments` | Signed nonzero point changes with reason, semester, creator, timestamp |

`claim_member()` creates a profile or links an unclaimed record to the matching verified UF email, preserving history. `is_portal_user()` checks trusted Auth records for a confirmed `@ufl.edu` address and a matching verified Google identity. `is_portal_admin()` additionally checks the role table. The OAuth `hd=ufl.edu` parameter is an account-selection hint; database permissions enforce access.

RLS is enabled on all six tables. Eligible members can read their own profile, attendance, adjustments, and role, plus semester/event definitions. They can update only permitted profile columns. Administrators can read chapter records, update permitted profile fields, manage semesters/events/attendance, and insert point adjustments. Adjustments are append-only; corrections use another entry. API callers cannot change identity email, Auth links, original join dates, or administrator assignments. Bootstrap roles through SQL Editor as described in the setup guide.

The application uses a publishable key and user sessions; it does **not** require a Supabase service-role key.

### Membership and points

Calculations live in `lib/portal/rules.ts`, with category point values also enforced by the database:

- General event: **5 points**; GBM: **10 points**; external event: **15 points**.
- Active membership: at least **2 GBMs and 3 qualifying events in the same semester**.
- General events qualify; external events qualify only when that semester enables them.
- Semester totals include attendance points and explicit administrator adjustments. Lifetime totals sum recorded semesters.

The dashboard uses `America/New_York` for event dates and current-semester selection. The percentage bonuses and tiebreaker proposed in [`POINT_SYSTEM.md`](POINT_SYSTEM.md) are not calculated automatically.

## External services

| Service | Integration and configuration location |
| --- | --- |
| Supabase | Portal Auth, PostgreSQL, data API; environment variables and committed migration |
| Google OAuth | Provider configured in Google Cloud and Supabase; basic identity scopes only |
| Resend | Contact notification and confirmation emails; server-only environment variables |
| Google Calendar | Server-side Calendar API list in `app/events/page.tsx`; see [calendar setup](docs/GOOGLE_CALENDAR_SETUP.md). Separate from portal attendance records. |
| Google Forms | Event check-in at `/sign-in` and external program applications; submissions are not automatically imported into Supabase |
| Beehiiv | Archive iframe in `app/newsletter/page.tsx`; subscription loader/form ID in `components/site/beehiiv-form.tsx` |
| Google Maps | Location iframe in `app/contact/page.tsx` |
| Vercel Analytics | Production-only component in `app/layout.tsx` |

The public event list reads Google Calendar, but calendar-to-database synchronization and administrator event selection are not implemented yet. The presentation library uses placeholder records in `data/presentations.ts`; Google Drive listing is also a future integration.

## Local development

Use Node.js compatible with the pinned Next.js version and npm. Both npm and pnpm lockfiles are present; these instructions use npm and `package-lock.json`.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open **http://localhost:3000**. If `.env.local` exists, merge the needed variables instead of overwriting it. Public pages can run without portal credentials; contact submissions require Resend configuration.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key; database RLS restricts access |
| `NEXT_PUBLIC_SITE_URL` | OAuth return origin: `http://localhost:3000` locally, `https://ufnsbe.org` in production. HTTPS is required except for localhost. |
| `RESEND_API_KEY` | Server-only Resend API key |
| `CONTACT_EMAIL` | Server-only chapter inbox receiving submissions |
| `FROM_EMAIL` | Server-only sending address authorized in Resend |

`.env.example` includes portal variables only; add the three contact variables to `.env.local` when testing email. Keep secrets out of source control. Google OAuth credentials belong in provider configuration, not application code.

For a working portal, follow [`docs/MEMBER_PORTAL_SETUP.md`](docs/MEMBER_PORTAL_SETUP.md): create Supabase, apply the migration once to a fresh project, configure Google OAuth and exact callback URLs, then explicitly create semesters and bootstrap administrators. The migration does not seed semester dates or historical attendance.

## Checks and production builds

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run typecheck` | Check TypeScript independently of the Next.js build |
| `npm run test:portal` | Compile portal rules into `.portal-test/` and run Node rule tests |
| `npm run test:reporting` | Check membership history, CSV handling, export authorization and complete pagination |
| `npm run build` | Create a production Next.js build |
| `npm start` | Serve the production build |
| `npm run lint` | Calls `eslint .`; ESLint and its configuration are not currently supplied in this repository |

Run type checking and portal rule tests before building. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so a successful build alone does not establish type correctness. It also sets `images.unoptimized: true`.

`tests/portal-permissions.sql` tests permissions with a minimal Auth fixture in an **isolated local PostgreSQL database**. Never run that fixture against Supabase or production records. Provider login, real email delivery, and production hostname behavior need separate integration checks; see the setup guide's launch checklist.

## Deployment and maintenance

The project is intended for Vercel. Configure variables for the appropriate deployment environment and redeploy after changes. Register the application's `/auth/callback` in Supabase, and the distinct Supabase provider callback in Google Cloud. Use separate preview data/credentials where possible; leaving portal credentials unset keeps the public site usable with a portal preparation message.

The production metadata origin is hardcoded in `app/layout.tsx`; changing `NEXT_PUBLIC_SITE_URL` alone does not change SEO metadata.

For common changes:

- Update people, programs, stats, photo references, navigation, and resources in `data/`.
- Add photos/logos/video under `public/` and reference them with root-relative paths.
- Change shared branding/layout in `components/site/`, `components/layout/`, and `app/globals.css`.
- Update calendar/form/embed URLs in the owning page or component; they are not all centralized in `data/site.ts`.
- Add schema/permission changes as new migrations, keeping SQL constraints, TypeScript types, rules, and checks aligned.

The portal includes authentication, profiles, the attendance/points dashboard, calendar-based admin event setup, and public password check-in. Follow [event check-in setup](docs/EVENT_CHECK_IN_SETUP.md) to apply the database migration before deploying the replacement `/sign-in` form. Admins manage events at `/portal/admin/events` and search members, correct attendance, and record point adjustments at `/portal/admin/members`; see [member management setup](docs/ADMIN_MEMBER_MANAGEMENT.md) for its migration. Public submissions populate attendance immediately without requiring login. The Fall 2026 migration is documented in [attendance import](docs/ATTENDANCE_IMPORT.md). Attendance exports contain personal information: keep them out of `public/` and source control; `AttendanceForm*.csv` and `migration-review/` are ignored. Back up records before imports or policy changes.

Membership history appears on the member dashboard and admin member detail pages. The semester leaderboard is at `/portal/leaderboard`, and admins can view and export active members at `/portal/admin/active-members`. Apply the reporting migration before using these reports; see [member reporting setup](docs/MEMBER_REPORTING.md).

Administrators can grant/revoke E-board roles directly on the dashboard. E-board members manage event check-ins but cannot administer member records, points, exports, or roles. Apply the E-board migration before using these controls; see [E-board access setup](docs/EBOARD_ACCESS.md).

Event managers can also select the separate Trailblazers calendar. Only titles containing Trailblazers are offered; those meetings record attendance without points, chapter membership credit, or leaderboard participation. See [Trailblazers check-in setup](docs/TRAILBLAZERS_CHECK_IN.md) for the required migration.

The site was originally bootstrapped with [v0](https://v0.app). The linked [v0 project](https://v0.app/chat/projects/prj_H6269MqjsMRn0VUz9nUwvIE1EVQq) remains an optional development entry point; deployment behavior depends on the configured repository/hosting integration.

