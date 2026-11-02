# Event check-in setup

This replaces the Google Form at `/sign-in`. Existing QR codes pointing to that
URL continue to work. No new environment variables, paid services, or service-role
keys are required. The existing Google Calendar API key and public Supabase key
are sufficient.

## Deploy

1. In the Supabase SQL Editor, run
   `supabase/migrations/202611010002_event_check_in.sql` as **postgres**, without
   applying RLS to the editor session. Keep table RLS enabled. Run this migration
   once. The earlier optional-zone migration was already included in the import;
   fresh installations must also apply `202611010001_optional_event_zone.sql`.
2. Deploy this code to Vercel with your existing environment variables.
3. Sign in with your chapter admin account, then choose **Manage event check-in**
   on the dashboard, or visit `/portal/admin/events`.
4. Select an upcoming Google Calendar event, its semester, category, optional
   zone, password, and duration. **Open check-in now** makes it available
   immediately, including if the calendar event is in the future; use this when
   you are ready to accept attendance. Calendar changes can take five minutes
   to appear. Semester dates must include the event date. All-day events use
   midnight Gainesville time.
5. Test `/sign-in` on a phone or signed-out browser: wrong password should fail;
   correct password should succeed. Repeat a submission and confirm one attendance
   row and one points award in the portal. An incomplete member profile must be
   completed before viewing the dashboard.
6. Close check-in from the admin page and confirm the event disappears from the
   public selector. Close the old Google Form to responses after confirming the
   new flow works. Reconcile any responses received since the October 31 export.

Admins can close an event early, reopen it, or rotate its password. Automatic
expiry options are 1, 4, 12, or 24 hours from opening. Late arrivals earn the same
points while check-in is open. No background job is needed for expiry. Reopening
keeps the existing password unless a replacement is supplied. Configured events
can be reopened even after they disappear from the upcoming calendar feed.

Calendar setup creates a database event linked to that occurrence; it never edits
Google Calendar. Reopening preserves the event's original category, semester,
zone, and start time to avoid retroactively changing points or membership. If a
calendar entry changes after setup, use the configured event's reopening controls
instead of recreating it. Attendance correction and bonus-management interfaces
remain separate work; the dashboard still displays existing admin adjustments.

## Data and access

Anonymous check-in is limited to narrow database functions: list open events and
submit a name, UF email, event, and password. It cannot read member profiles,
attendance histories, password hashes, or attempt counters. Admin functions check
the verified Google identity and existing `admin_roles` on every call.

Passwords are bcrypt hashes in `check_in_private`, outside the API-facing public
schema. Keep this schema out of Supabase's exposed schemas. Passwords are never
returned to browsers or stored in public event records. Each email/event pair gets
eight submissions per 15-minute window; the ninth is rejected, including direct
API requests. The rate limit is shared across app instances. Counters use one row
per email/event and reset on the next request after the window passes.

Public submissions create an unclaimed, incomplete member only if that normalized
UF email doesn't already exist. They never overwrite existing names or profiles.
The `(member_id,event_id)` database constraint prevents concurrent duplicate
attendance. A repeat returns the same success message to avoid exposing another
person's attendance. Successful entries appear in the portal on the next load.

An event password discourages remote check-in but can still be shared, and an
anonymous attendee can enter someone else's UF email. It does not verify identity
or physical presence. Portal login still requires verified UF Google credentials.
Only share passwords in the room, rotate them if leaked, and keep the window short.

## Local database verification

Never run fixture scripts against production. Use the existing disposable
`portal_security_test` fixture as a template for a new `event_check_in_test`
database; apply the optional-zone and event-check-in migrations there, then run:

```text
psql -X -v ON_ERROR_STOP=1 -d event_check_in_test -f tests/event-check-in.sql
```

The test transaction rolls back its data. It covers admin authorization, anonymous
privacy, password checks, normalization, duplicate prevention, profile preservation,
attempt limits, expiry, closing events, and first-login attendance claiming.
