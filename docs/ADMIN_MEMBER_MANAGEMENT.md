# Admin member management

## Deploy

1. Run `supabase/migrations/202611010003_admin_member_management.sql` once in
   Supabase's SQL Editor as **postgres**. Keep table RLS enabled. Existing member,
   event, attendance and point records are preserved. No new environment variables
   or services are required.
2. Deploy the code to Vercel.
3. Sign in as a chapter administrator and select **Manage members** on the portal
   dashboard, or visit `/portal/admin/members`.

The earlier portal and event-check-in migrations must already be installed.
The new migration restricts direct authenticated attendance writes so corrections
must use the audited function. Public password check-in continues through its own
restricted function. Apply this migration before deploying the management UI.

## Use

- Search by name or email. Search is case-insensitive, treats punctuation literally,
  and returns 25 members per page, including members who haven't signed in yet.
- Open a member and choose a semester to review points, active membership progress,
  attendance, and adjustments. Lifetime points include all recorded semesters.
- **Add missed attendance** lists existing events in that semester that have already
  started and for which the member has no attendance. A reason is required.
- Under an attended event, expand **Correct this attendance**, enter a reason,
  and confirm removal. This removes the event's points and recalculates membership.
  Removal does not alter any separate bonus already awarded.
- Enter a positive or negative whole-number point adjustment and a reason. Bonuses
  are still manual. Adjustments do not change attendance or membership eligibility.
  Correct a mistaken bonus with an opposite entry, keeping both records visible.

The member page shows the latest 100 attendance corrections across all semesters,
including the admin's email, timestamp, event and reason. All corrections remain in
the database even when older entries are not shown. A removal also preserves the
original attendance row in its audit record, including import provenance.
Adjustment records use their existing trusted `created_by` and `created_at` fields;
the UI resolves each author to their member email when available.

The tools do not edit account identities, grant admin roles, merge members, or
change the points policy. Only existing members and existing events can be used.
Members continue editing their own profile through the portal.

## Safety and verification

All server actions and database functions verify the existing administrator role.
Anonymous users cannot search members or read audit logs. Ordinary members retain
access only to their own portal records. Attendance audits cannot be edited or
deleted through the public API, even by an admin.

Each form has a unique request ID. Retrying a successful adjustment or correction
does not apply it twice. The successful form remains disabled until the admin
explicitly starts another entry. Attendance removal checks the exact attendance
row ID so a stale screen cannot silently delete a replacement record.

Local validation uses a disposable `member_management_test` database cloned from
the existing `event_check_in_test` fixture. Apply the migration, then run:

```text
psql -X -v ON_ERROR_STOP=1 -d member_management_test -f tests/member-management.sql
```

Never run fixture scripts against Supabase or production. Tests roll back their
data and cover authorization, literal search, attendance add/remove, stale removal,
audit authors, idempotency, adjustment reversal, and anonymous check-in regression.

After deployment, use a test member to add and remove one attendance and create
a small positive adjustment followed by its opposite. Confirm both the admin view
and that member's dashboard show the expected points and membership progress.

E-board users now have a read-only version of member search and participation
pages, excluding NSBE IDs/UFIDs, audit history and correction forms. See
[E-board participation setup](EBOARD_PARTICIPATION.md) for the migration.
