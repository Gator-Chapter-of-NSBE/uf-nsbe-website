# Manage previous events

## Deploy

1. Run `supabase/migrations/202611040001_previous_events.sql` once in the Supabase
   SQL Editor as **postgres**, after the existing migrations. Keep table RLS enabled.
   Then run `supabase/migrations/202611040002_previous_event_search.sql` for title
   search and the full pagination controls. If the first migration is already
   installed, run only the second migration.
2. Deploy to Vercel. No new environment variables, API keys or services are needed.
3. Sign in as an administrator and choose **Manage previous events** on the dashboard.

## Event directory

The directory at `/portal/admin/previous-events` reads the database, not Google
Calendar. It shows events that have already started and have at least one attendance
record, ordered newest first, with 25 events per page. Filter by semester or event
type, including Trailblazers. Counts include all recorded attendance sources.

Search event titles by a case-insensitive, literal substring. Search combines with
semester and category filters. The search/filter form resets to page 1. Numbered
links, First/Last, Previous/Next and Go to page preserve all filters. The current
page is highlighted, skipped ranges use ellipses, and the result range and total
page count are displayed. Boundary controls are disabled. Stale/out-of-range page
links redirect to a valid page after the directory changes.

The count and pagination total are computed together in one database query so the
list is not truncated by the API's normal row cap. An event with zero attendees or
a future start date is excluded.

## Attendees and corrections

Open an event to see the full roster, attendee count, UF emails, check-in record
times and sources. Search the roster by name or email, or open a member's profile
for that event's semester. Rosters are read in batches to include more than 1,000
records if needed.

To add a person, use **Add an attendee** to search existing chapter members. Members
who already attend are labelled accordingly. Every addition requires a reason.
To remove a person, expand **Remove this attendee**, give a reason, and confirm.
Both operations use the existing audited correction function, stale-row protection
and unique request IDs. Existing profiles and point adjustments are not overwritten.

Removing a chapter attendance removes its generated event points and recalculates
membership eligibility. A separate bonus or deduction is not automatically reversed.
Trailblazers additions/removals change only program attendance, without changing
chapter points or active membership. The latest 100 event corrections show the
affected member, administrator, time and reason; all corrections remain stored.

If the last attendee is removed, the event disappears from the directory. Its detail
URL remains accessible to admins, including at zero attendance, so the admin can
search and re-add a member. The event and correction history are never deleted by
these tools. Directory entries return when attendance is restored.

With the E-board participation migration, admins and E-board members can read the
directory and rosters. Only admins see or use correction and audit tools. E-board
roster reads use a restricted database function; existing table RLS is unchanged.
See [E-board participation setup](EBOARD_PARTICIPATION.md).

## Verify

Check one imported event and one Trailblazers meeting. Compare roster counts with
the event directory. Add and remove a test member with reasons, then compare the
member dashboard and event correction history. Test last-attendee removal/restoration
on a test event and confirm an E-board account can read both pages but cannot edit attendance.

Local SQL tests use a disposable `previous_events_test` database cloned from the
Trailblazers fixture after applying this migration:

```text
psql -X -v ON_ERROR_STOP=1 -d previous_events_test -f tests/previous-events.sql
npm run test:reporting
```

Never run fixture scripts in production. Tests cover counts, filters, pagination,
future/empty exclusion, final-attendee restoration, retained provenance, the original admin-only
access and roster searching. The later E-board participation fixture verifies the
expanded read-only access separately.

`tests/previous-event-search.sql` verifies the updated search function in disposable
`previous_event_search_test`, cloned from the previous-events fixture with the
second migration applied. It covers title matching, literal wildcard text, combined
filters, page totals, large offsets, older-call compatibility and role restrictions.
Node reporting tests also cover pagination windows and stale-page redirects.
