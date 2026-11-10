# E-board read-only participation access

## Deploy

Run `supabase/migrations/202611090001_eboard_participation_reads.sql` once as
**postgres** in Supabase's SQL Editor, after existing migrations. Keep table RLS
enabled, then deploy the code to Vercel. No new keys or environment variables are
required.

E-board dashboards now have **View members** and **View previous events** links.
They use the same pages as admins, with role-specific controls. The existing
admin E-board preview includes the same read-only pages, filters and navigation.

## What E-board members can read

- Search chapter members by name or UF email.
- View names, UF emails, majors, school years, onboarding status, attendance,
  points, membership progress, semester history and Trailblazers attendance.
- Review recorded bonuses/deductions and their reasons and dates.
- Browse/search previous events with the existing pagination and filters.
- Read event attendee counts and rosters, including names, UF emails, attendance
  timestamps and sources, and follow links to member participation pages.

UFIDs and NSBE IDs are not returned by the E-board profile function, even if a caller
requests it directly. Authentication links, import source references, correction
audit history and role history are also excluded from the new read functions.
Ordinary members retain their existing own-profile access only.

## What remains admin-only

Adding/removing attendance, point adjustments, active-member report/export tools,
role management and administrator directories remain admin-only. Their server actions,
database functions and RLS have not been broadened. E-board member and roster pages
contain no correction forms. Event check-in setup remains available to E-board users
as before, including passwords, opening, closing and reopening check-ins.

The migration expands only the existing member-search and previous-event-directory
functions and adds four restricted participation-read functions. It does not broaden
SELECT access on the member, attendance or point-adjustment tables. Every function
checks the current verified UF identity and staff role. Revoking an E-board assignment
blocks subsequent read requests without waiting for the user to sign out.

## Verification

Sign in as an E-board member and search another member. Confirm participation data
and rosters load, while ID fields, correction forms, audit histories and export links
are absent. Repeat with the admin E-board preview. Sign in normally as an admin and
confirm editing tools still work. An ordinary member must not be able to open these
directories by entering their URLs.

`tests/eboard-participation.sql` runs only in a disposable local
`eboard_participation_test` database cloned from the event-search fixture after
applying the migration. It checks narrow reads, private-field exclusion, unchanged
underlying RLS, denied writes/exports/roles, immediate revocation and anonymous denial.
Never run fixture scripts in production.
