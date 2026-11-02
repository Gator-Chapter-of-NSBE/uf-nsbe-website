# Import Fall 2026 attendance

The reviewed batch contains 961 attendance records for 218 members and 31 events.
The remaining 91 source submissions are excluded: 17 duplicates, 7 outside the
approved date window, and 67 missing-email joint-event submissions. The original
CSV and review decisions remain unchanged.

Submission timestamps use `America/New_York`, as confirmed by the chapter.
Existing profiles are preserved. New members receive their latest submitted name
and an incomplete profile; major, classification, and NSBE ID can be supplied
through onboarding. Conflicting legacy profile values remain in the private
review files rather than being guessed. No bonuses or adjustments are imported.

## Run in Supabase

1. Open the **correct project's SQL Editor** in Supabase.
2. Open the local, private file
   `migration-review/fall-2026/ready-for-review/import-fall-2026.sql`.
3. Copy the **entire file**, including `begin` and `commit`, into a new query and run.
4. Confirm the result reports **961 attendance_records, 218 members, 31 events**.
5. Sign into the member portal and check attendance and point totals.

The transaction requires an existing semester named exactly `Fall 2026` whose
dates contain all reviewed events. It uses that semester's existing ID and policy.
If validation fails, the transaction rolls back; do not bypass the validation.
If the editor retains an aborted transaction, run `rollback;` before retrying.

Before changes, the transaction snapshots the six portal tables into
`attendance_backup_fall2026`, a private schema with API-role access revoked.
It does not copy Auth tables because it never modifies Auth. Original snapshots
are retained on repeat runs. Keep that schema out of Supabase's exposed schemas.
The import permits NULL event zones, preserving the approved historical policy.
The matching schema migration is
`supabase/migrations/202611010001_optional_event_zone.sql`; its change is also
included in the import transaction so it need not be run separately first.

Repeat runs insert no duplicates. Existing calendar or attendance conflicts abort
instead of overwriting data. Existing member profiles, Auth links, administrator
roles and point adjustments are never updated. Points and membership eligibility
are computed by the portal from the imported event categories and attendance.

The CSV, generated SQL and review files contain personal information and are
ignored by Git. Do not upload them to the public website or commit them.

## Regenerate locally

```text
python scripts/build-attendance-import.py --timezone America/New_York
```

This validates the unchanged CSV hash, approved mappings and identity decisions,
source references, totals, and uniqueness before writing SQL. It makes no network
requests or production changes.

## Validation performed

The generated SQL was executed against a local PostgreSQL 17 copy of the portal
test database. Initial import reconciled all 961 records. A repeat imported zero
additional members, events or attendance. Existing profile rows and admin roles
were unchanged. An intentional calendar mapping conflict aborted the transaction
and retained the previous attendance count.

The production import must be run in the SQL Editor because this workspace has
only a public Supabase key. No service-role secret is needed in the website.
The public check-in page still embeds the old Google Form; replacing it remains
a separate cutover task. Avoid accepting new submissions into the old form after
this frozen export, or those submissions will need a separate reconciliation.
