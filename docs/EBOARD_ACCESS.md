# E-board event access

## Deploy

1. Run `supabase/migrations/202611020001_eboard_access.sql` once in Supabase's SQL
   Editor as **postgres**. Keep table RLS enabled. Apply this after the existing
   portal, event-check-in, member-management and reporting migrations.
2. Redeploy on Vercel. No new environment variables or services are needed.
3. Open the portal as an administrator and use the **E-board access** section on
   the dashboard. Search an existing member by name or UF email and grant access.
   The member can be an unclaimed historical record; they must later sign in with
   that exact verified UF Google identity to use the role.
4. Check the current access list and recent role changes. Revocation requires a
   confirmation and leaves an audit entry. An old page cannot revoke a replacement
   grant without refreshing.

Administrators automatically retain all event permissions. Assigning an E-board
role does not create an administrator, and the dashboard cannot grant or revoke
administrator roles. Existing admin roles remain managed through SQL.
The admin dashboard also shows a read-only **Admin accounts** directory with names,
UF emails, and access-granted dates. This directory is admin-only and does not
provide controls to change administrator roles.

## Permissions

| Capability | Member | E-board | Administrator |
| --- | --- | --- | --- |
| Own profile, attendance, points and leaderboard | Yes | Yes | Yes |
| View configured event check-ins | No | Yes | Yes |
| Create, open, close, reopen check-ins or rotate passwords | No | Yes | Yes |
| Change an existing event's category, semester, zone or start time through check-in setup | No | No | No |
| Search members, view participation and previous-event rosters | No | Yes (read-only) | Yes |
| Correct attendance or points | No | No | Yes |
| View/export active-member lists | No | No | Yes |
| Assign/revoke E-board access and view its audit history | No | No | Yes |

The existing event-setup restrictions remain: new events can be categorized and
assigned to a semester/zone at creation, while existing event metadata is preserved
to avoid changing points or eligibility. Reopening changes only check-in availability,
expiry and, optionally, the password. Both admins and E-board members use
`/portal/admin/events`; the route's name does not confer administrator privileges.

E-board users see **Manage event check-in** and an E-board label on their dashboard.
They also see read-only member and previous-event directories, without correction, export or role-assignment controls. Profile
onboarding is still required to view the normal member dashboard.

## Enforcement and audit

`can_manage_event_check_ins()` verifies the UF Google identity and checks the
current E-board/admin database role. It is used by the server page, each event
server action, and the event configuration, closure and settings database functions.
Access is checked on each action rather than stored in a long-lived JWT role claim.
A revocation blocks the next action; it does not undo an already completed operation
or automatically close events the officer previously opened.

No member, attendance, points, or reporting policy is expanded. E-board members have
no direct event-write permission. Anonymous password check-in remains available to
everyone through its existing restricted submission function; an E-board role does
not grant administrative attendance correction permissions.

`eboard_roles` records current access and who granted it. `eboard_role_history`
retains grant/revoke actions, target and actor emails, and timestamps. Only admins
can list all role assignments or read the history. Users can read their own current
assignment. Neither role table can be edited directly through authenticated API
access; assignments go through the admin-only function. Repeated requests for the
same existing role state make no change and add no duplicate history.

## Verify

After deployment, grant access to a test UF member and confirm their event controls
work. Confirm member participation is read-only and active-member export remains inaccessible.
Revoke the role while their session remains signed in, then try another event
action: it should be denied. Admin access should continue to work throughout.

Local SQL verification runs in a disposable `eboard_security_test` database cloned
from the reporting fixture, after applying this migration:

```text
psql -X -v ON_ERROR_STOP=1 -d eboard_security_test -f tests/eboard-access.sql
```

Never run fixture scripts in production. Tests cover role grants/revocations,
idempotency, audit authors, stale revocations, event operations, metadata protection,
non-admin data restrictions, self-promotion prevention and anonymous access.

The participation-read migration adds narrow, staff-only database functions for
member search, safe profiles, attendance, adjustments and rosters. UFIDs and NSBE
IDs are excluded; underlying table RLS is unchanged. See
[read-only participation setup](EBOARD_PARTICIPATION.md).
