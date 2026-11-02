# Fall 2026 attendance review

Scope: only `AttendanceForm10-31-2026.csv`, not earlier-semester exports. This
workflow produces local review documents and JSON decision files. It does not
connect to Supabase, generate executable import SQL, or approve any identities,
attendance, events, point awards, or membership status.

## Prepare

From the repository root:

```text
node scripts/fetch-migration-calendar.mjs
python scripts/prepare-attendance-review.py
```

The calendar fetch reads `GOOGLE_CALENDAR_API_KEY` and the optional
`GOOGLE_CALENDAR_ID` from the existing environment configuration. It reads public
August–October 2026 occurrences, without modifying Google Calendar. API keys are
not written into the snapshot or console output. Check `calendar-status.json`;
an unavailable calendar must not be treated as a successful empty calendar.

The Python command uses the standard library and makes no network requests. It
checks the source headers, scope, and record counts; hashes the untouched source;
preserves every source record; groups identity and duplicate exceptions; and
suggests calendar matches. It refuses to overwrite an existing review package.
Use `--output migration-review/fall-2026/another-review` when deliberately
generating a new one, and preserve any previously entered decisions.

## Review files

The default package is `migration-review/fall-2026/ready-for-review/`:

- `README.md`: totals, scope, reconciliation, and review instructions.
- `event-mapping.md`: event labels, proposed calendar matches, and submission dates.
- `exceptions.md`: identity holds, potential duplicates, submission-day differences,
  and outstanding policy decisions.
- `event-decisions.json`: approve actual dates, categories, zones, and calendar links.
- `identity-decisions.json`: supply verified email corrections or documented exclusions.
- `duplicate-decisions.json`: select the retained record after confirming one occurrence.
- `timing-decisions.json`: review different-day submissions without automatically
  denying legitimate late attendance.
- `profile-notes.json`: profile variations and unsupported classification values.
- `source-records.json`: original fields and stable references for every source record.
- `manifest.json`: source hash, counts, and unapproved import status.

Calendar suggestions are evidence, not final mappings. `proposed_*` values are
separate from approved fields, which remain blank. No zone is guessed. Historical
Design Team attendance remains in scope despite removal of that page from the
public website. Corporate info sessions are not automatically external events.

Record numbers start at 1 for the first data record, excluding the header. They
are not physical file-line numbers, because CSV fields can contain line breaks.

## Next steps

Confirm the existing Fall 2026 semester ID/dates and the spreadsheet's timestamp
time zone. Review event assignments, identity holds, duplicate decisions, and
different-day submissions. Current schema classification values do not include
`5th Year`; decide whether to add it or explicitly map it before importing profiles.
Profile issues should not prevent verified attendance from being migrated.

The later importer must preserve existing portal profiles, administrator roles,
and Auth links; create unclaimed members only where needed; reconcile every source
record; and be tested locally with repeat-run and rollback checks. Only approved
records should enter a production transaction after a backup. No automatic bonuses
or tiebreakers should be introduced. Closing the Google Form and deploying its
replacement remain part of the eventual cutover.

All generated outputs contain member information. `migration-review/` is ignored
by Git and must never be copied into `public/` or committed.
