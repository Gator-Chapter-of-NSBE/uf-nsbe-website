# Membership history, leaderboard and active-member reports

## Deploy

Run `supabase/migrations/202611010004_member_reporting.sql` once as **postgres** in
the Supabase SQL Editor, then redeploy on Vercel. Keep table RLS enabled. No new
environment variables, paid services, or service-role secrets are needed. The
existing portal and management migrations should already be installed.

## Membership history

The dashboard and admin member detail page now show one card per recorded
semester, including points, GBM and qualifying-event counts, and active status.
The summary includes the number of active semesters and lifetime points.

The earliest attended **event date** is labelled **First recorded attendance**.
It is not an official join date, a portal registration date, or a claim about
membership before the available Fall 2026 records. Existing `joined_on` values
are not changed. A semester without attendance or adjustments says **No activity
recorded**. Historical eligibility is recalculated from current records, including
any administrative corrections; it is not a frozen certification of past status.

## Leaderboard

Members can open `/portal/leaderboard` from the dashboard and select a semester.
The report includes members with attendance or point adjustments in that semester,
including unclaimed imported members. It displays only names, points and ranks,
with the signed-in member's own row highlighted. Emails, member IDs, UFIDs, NSBE
IDs and attendance histories are not returned by the leaderboard function.

Points include all attendance and manual adjustments. Equal scores share a rank:
two members tied first are both #1, followed by #3. Alphabetical ordering within
a tie is only for display. No scholarship tiebreaker or automatic bonus is applied.
Members with no records in that semester do not appear; recorded zero or negative
scores do appear.

## Active members and CSV

Admins can open `/portal/admin/active-members` from the dashboard or member
directory, choose a semester, and download its current active-member list.
Eligibility remains **2 GBMs + 3 qualifying events**. General events qualify;
external events qualify only when that semester's existing policy says so.
Point adjustments do not change eligibility. Members need not have completed
onboarding or logged into the portal to qualify.

CSV columns are semester, name, UF email, GBMs, qualifying events and semester
points. Empty reports contain headers only. Export text is quoted and escaped,
formula-like text is neutralized, and a UTF-8 BOM supports Excel. Export files
contain member contact information and should remain private. The endpoint
rechecks the administrator role on every request and sends no-store headers.
It returns 401 for a signed-out caller and 403 for a non-admin caller.

Reports use independent attendance and adjustment aggregates, avoiding inflated
points when a member has multiple adjustments. Data is fetched in batches rather
than truncated at Supabase's response limit. Reports are generated on demand;
large multi-page reports are live reads rather than a frozen database snapshot.
If officers are editing records during a download, regenerate it after edits finish.

`reporting_private` is an internal helper schema. Keep it out of Supabase's exposed
schemas. No existing member/attendance read policy is broadened. Anonymous access
to reporting functions is denied; leaderboard access requires a verified UF
Google account, and the active-member report requires an administrator.

## Checks

```text
npm run typecheck
npm run test:reporting
npm run test:portal
npm run build
```

`tests/member-reporting.sql` runs in a disposable local `member_reporting_test`
database cloned from the member-management fixture after applying the reporting
migration. Never run fixture scripts in production. It checks shared ranks, own-row
identification, independent aggregates, semester isolation, external-event policy,
unclaimed members, corrected attendance, empty reports and access restrictions.
Node tests cover history calculations, CSV safety, endpoint authorization and
exports larger than the API response limit.

After deployment, compare one leaderboard score and active-member result with the
same member's dashboard. Download the CSV and check the count against the admin
screen. The former Google Form may remain an emergency fallback with a warning;
its submissions are not automatically added to the portal and must be reconciled
manually if the fallback is used.
