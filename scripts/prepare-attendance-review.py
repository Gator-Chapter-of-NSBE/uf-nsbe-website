"""Prepare a private Fall 2026 review package. Never connects to a database.

Outputs contain member data and belong in the Git-ignored migration-review folder.
Existing packages are not overwritten: move them aside before regenerating.
"""
import argparse
import collections
import csv
import datetime as dt
import difflib
import hashlib
import json
import re
import unicodedata
from pathlib import Path


EMAIL = re.compile(r"[^\s@]+@ufl\.edu", re.I)
ZONES = ["Admin Zone", "Programs Zone", "Finance Zone", "Membership Zone", "Communication Zone", "Senate Zone"]
YEARS = {"Freshman", "Sophomore", "Junior", "Senior", "Graduate student", "Other"}
PLACEHOLDERS = {"", "n/a", "na", "none", "no", "not yet", "don't have one", "dont have one", "0"}


def normalized(value):
    value = unicodedata.normalize("NFKD", value.casefold())
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = value.replace("exxon mobil", "exxonmobil").replace("general body meeting", "gbm")
    value = re.sub(r"\bresumes\b", "resume", value)
    return " ".join(re.sub(r"[^a-z0-9]+", " ", value).split())


def person_name(value):
    return " ".join(value.strip().casefold().split())


def md(value):
    return str(value if value is not None else "").replace("|", "\\|").replace("\r", " ").replace("\n", " ")


def table(headers, rows):
    return "\n".join(["| " + " | ".join(map(md, headers)) + " |", "| " + " | ".join("---" for _ in headers) + " |"] + ["| " + " | ".join(map(md, row)) + " |" for row in rows])


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def candidates_for(label, rows, calendar):
    label_key = normalized(label)
    tokens = set(label_key.split())
    day_counts = collections.Counter(row["parsed_timestamp"].date().isoformat() for row in rows if row["parsed_timestamp"])
    primary = sorted(day_counts, key=lambda day: (-day_counts[day], day))[0] if day_counts else None
    result = []
    for event in calendar:
        starts = event.get("start", {})
        stamp = starts.get("dateTime") or starts.get("date")
        if not stamp:
            continue
        day = stamp[:10]
        title = event.get("summary", "")
        key = normalized(title)
        day_gap = abs((dt.date.fromisoformat(day) - dt.date.fromisoformat(primary)).days) if primary else 999
        if day_gap > 21:
            continue
        shared = tokens & set(key.split())
        if key == label_key:
            reason, rank = "Exact normalized title", 0
        elif tokens and tokens <= set(key.split()):
            reason, rank = "Calendar title contains all label words", 1
        elif label == "Pie an Engineer" and "pie" in key.split() and day_gap == 0:
            reason, rank = "Possible alias: different title, same main submission date", 2
        elif shared and difflib.SequenceMatcher(None, label_key, key).ratio() >= .60:
            reason, rank = "Similar title; verify manually", 3
        else:
            continue
        result.append({"calendar_event_id": event["id"], "title": title, "starts_at": stamp if "dateTime" in starts else None,
                       "all_day_date": starts.get("date"), "location": event.get("location", ""), "match_reason": reason,
                       "days_from_main_submission_date": day_gap, "rank": rank})
    result.sort(key=lambda event: (event["rank"], event["days_from_main_submission_date"], event["starts_at"] or event["all_day_date"]))
    # Prefer actual title evidence over unrelated events with generic shared words.
    if result and result[0]["rank"] <= 1:
        result = [event for event in result if event["rank"] == result[0]["rank"]]
    return result[:5], day_counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default="AttendanceForm10-31-2026.csv")
    parser.add_argument("--output", default="migration-review/fall-2026/ready-for-review")
    args = parser.parse_args()
    source = Path(args.source)
    root = Path.cwd().resolve()
    output = Path(args.output).resolve()
    private_root = root / "migration-review"
    if not output.is_relative_to(private_root):
        raise SystemExit("Output must be inside the workspace's migration-review directory.")
    if output.exists():
        raise SystemExit("Review package already exists; preserve its decisions and select a new --output directory.")
    source_bytes = source.read_bytes()
    source_hash = hashlib.sha256(source_bytes).hexdigest()
    with source.open(encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        headers = reader.fieldnames or []
        required = {"Timestamp", "Full Name", "UFL Email", "Year", "Event Name", "Major", "NSBE ID (Optional)"}
        if not required <= set(headers):
            raise SystemExit("The CSV headers differ from the reviewed attendance export.")
        raw_rows = list(reader)
    if any(None in row or any(value is None for value in row.values()) for row in raw_rows):
        raise SystemExit("Malformed CSV record width; inspect before reviewing.")
    rows = []
    for index, raw in enumerate(raw_rows, 1):
        email = raw["UFL Email"].strip().lower()
        try:
            timestamp = dt.datetime.strptime(raw["Timestamp"].strip(), "%m/%d/%Y %H:%M:%S")
        except ValueError:
            timestamp = None
        if timestamp and not dt.date(2026, 8, 1) <= timestamp.date() < dt.date(2026, 11, 1):
            raise SystemExit(f"Record {index} is outside the approved August-October 2026 source scope.")
        rows.append({"record": index, "reference": f"{source_hash}:{index}", "raw": raw, "email": email,
                     "valid_email": bool(EMAIL.fullmatch(email)), "parsed_timestamp": timestamp})
    groups = collections.defaultdict(list)
    for row in rows:
        groups[row["raw"]["Event Name"].strip()].append(row)
    if "" in groups:
        raise SystemExit("An event label is missing; review the CSV first.")
    calendar_dir = private_root / "fall-2026"
    status_path = calendar_dir / "calendar-status.json"
    calendar_status = json.loads(status_path.read_text(encoding="utf-8")) if status_path.exists() else {"status": "unconfigured"}
    calendar_path = calendar_dir / "calendar-reference.json"
    snapshot = json.loads(calendar_path.read_text(encoding="utf-8")) if calendar_status["status"] == "ready" and calendar_path.exists() else {"events": []}
    calendar = snapshot["events"]
    valid = [row for row in rows if row["valid_email"]]
    by_identity = collections.defaultdict(list)
    by_name = collections.defaultdict(set)
    by_localpart = collections.defaultdict(set)
    for row in valid:
        by_identity[row["email"]].append(row)
        by_name[person_name(row["raw"]["Full Name"])].add(row["email"])
        by_localpart[row["email"].split("@")[0]].add(row["email"])
    duplicate_keys = collections.defaultdict(list)
    for row in valid:
        duplicate_keys[(row["email"], row["raw"]["Event Name"].strip())].append(row)
    duplicates = [group for group in duplicate_keys.values() if len(group) > 1]
    duplicate_records = {row["record"] for group in duplicates for row in group}
    identity_holds = []
    for row in rows:
        if row["valid_email"]:
            continue
        candidates = collections.defaultdict(list)
        for email in by_name[person_name(row["raw"]["Full Name"])]:
            candidates[email].append("Exact full-name match elsewhere in this CSV")
        if "@" in row["email"]:
            for email in by_localpart[row["email"].split("@")[0]]:
                candidates[email].append("Same email local part elsewhere in this CSV; not proof of identity")
        identity_holds.append({"record": row["record"], "source_reference": row["reference"], "name": row["raw"]["Full Name"],
                               "submitted_email": row["raw"]["UFL Email"], "event": row["raw"]["Event Name"],
                               "timestamp": row["raw"]["Timestamp"], "reason": "Missing email" if not row["email"] else "Not a valid @ufl.edu email",
                               "possible_matches": [{"email": email, "reasons": reasons} for email, reasons in sorted(candidates.items())],
                               "decision": "pending", "verified_email": None, "evidence_or_reason": ""})
    event_decisions = []
    for ordinal, (label, members) in enumerate(groups.items(), 1):
        suggestions, days = candidates_for(label, members, calendar)
        proposed = suggestions[0] if suggestions else None
        dates = sorted(row["parsed_timestamp"] for row in members if row["parsed_timestamp"])
        event_decisions.append({"review_id": f"E{ordinal:02}", "source_label": label, "submission_count": len(members),
            "valid_email_rows": sum(row["valid_email"] for row in members), "identity_hold_rows": sum(not row["valid_email"] for row in members),
            "first_submission": dates[0].isoformat(" ") if dates else None, "last_submission": dates[-1].isoformat(" ") if dates else None,
            "submission_dates": dict(sorted(days.items())), "calendar_candidates": suggestions,
            "proposed_calendar_event_id": proposed["calendar_event_id"] if proposed else None,
            "proposed_starts_at": proposed["starts_at"] if proposed else None,
            "proposed_category": "gbm" if re.search(r"\bgbm\b", label, re.I) else "general",
            "category_note": "GBM in label; confirm category" if re.search(r"\bgbm\b", label, re.I) else "Proposed general event; confirm eligibility and category, not inferred from corporate involvement",
            "approved": False, "event_title": label, "semester_name": "Fall 2026", "starts_at": None, "category": None, "zone": None,
            "calendar_id": None, "calendar_event_id": None, "review_notes": ""})
    duplicate_decisions = [{"review_id": f"D{index:02}", "email": group[0]["email"], "event": group[0]["raw"]["Event Name"],
        "records": [{"record": row["record"], "timestamp": row["raw"]["Timestamp"], "name": row["raw"]["Full Name"]} for row in group],
        "approved": False, "keep_record": None, "review_notes": ""} for index, group in enumerate(duplicates, 1)]
    event_lookup = {event["source_label"]: event for event in event_decisions}
    timing_notes = []
    for row in rows:
        event = event_lookup[row["raw"]["Event Name"].strip()]
        stamp = event["proposed_starts_at"]
        if stamp and row["parsed_timestamp"]:
            gap = (row["parsed_timestamp"].date() - dt.date.fromisoformat(stamp[:10])).days
            if gap:
                timing_notes.append({"record": row["record"], "event_review_id": event["review_id"], "event": event["source_label"],
                    "name": row["raw"]["Full Name"], "email": row["email"], "submitted_at": row["raw"]["Timestamp"],
                    "suggested_event_start": stamp, "calendar_day_difference": gap,
                    "decision": "pending", "review_notes": "Different calendar day is a review flag, not automatic disqualification. Confirm source time zone first."})
    profile_notes = []
    for email, records in sorted(by_identity.items()):
        issues = []
        values = {}
        for field in ["Full Name", "Major", "Year", "NSBE ID (Optional)"]:
            distinct = sorted({row["raw"][field].strip() for row in records if row["raw"][field].strip()})
            values[field] = distinct
            if len({value.casefold() for value in distinct}) > 1:
                issues.append(f"Multiple {field} values")
        unsupported = [value for value in values["Year"] if value not in YEARS and value != "Grad Student"]
        if unsupported:
            issues.append("School year needs an explicit mapping: " + ", ".join(unsupported))
        if "Grad Student" in values["Year"]:
            issues.append("Suggested classification normalization: Grad Student -> Graduate student")
        if any(value.casefold() in PLACEHOLDERS for value in values["NSBE ID (Optional)"]):
            issues.append("NSBE ID contains a placeholder; leave optional ID blank unless verified")
        if any(len(value) > 40 for value in values["NSBE ID (Optional)"]):
            issues.append("NSBE ID exceeds the database length limit")
        if any(len(value) > 120 for value in values["Full Name"] + values["Major"]):
            issues.append("Name or major exceeds the database length limit")
        if issues:
            profile_notes.append({"email": email, "issues": issues, "values": values, "records": [row["record"] for row in records]})
    missing = sum(not row["email"] for row in rows)
    extra = sum(len(group) - 1 for group in duplicates)
    summary = {"source_file": source.name, "source_sha256": source_hash, "source_records": len(rows), "event_labels": len(groups),
        "valid_email_rows": len(valid), "unique_valid_uf_emails": len(by_identity), "missing_email_rows": missing,
        "invalid_nonempty_email_rows": len(identity_holds) - missing, "identity_hold_rows": len(identity_holds),
        "potential_duplicate_groups": len(duplicates), "potential_duplicate_rows": len(duplicate_records), "potential_duplicate_extras": extra,
        "candidate_rows_without_identity_or_duplicate_flags": len(valid) - len(duplicate_records),
        "candidate_distinct_email_event_pairs": len(duplicate_keys), "calendar_events_available": len(calendar),
        "event_labels_with_calendar_suggestions": sum(bool(event["calendar_candidates"]) for event in event_decisions),
        "invalid_timestamp_rows": sum(row["parsed_timestamp"] is None for row in rows), "profile_review_members": len(profile_notes),
        "different_submission_day_records": len(timing_notes), "identity_holds_by_event": dict(collections.Counter(item["event"] for item in identity_holds)),
        "source_timezone_confirmed": None, "semester_dates_confirmed": None,
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(), "database_writes": False, "approved_for_import": False}
    if summary["candidate_rows_without_identity_or_duplicate_flags"] + len(duplicate_records) + len(identity_holds) != len(rows):
        raise AssertionError("Source reconciliation failed")
    output.mkdir(parents=True)
    write_json(output / "manifest.json", summary)
    write_json(output / "event-decisions.json", {"allowed_categories": ["general", "gbm", "external"], "allowed_zones": ZONES, "events": event_decisions})
    write_json(output / "identity-decisions.json", identity_holds)
    write_json(output / "duplicate-decisions.json", duplicate_decisions)
    write_json(output / "profile-notes.json", profile_notes)
    write_json(output / "timing-decisions.json", timing_notes)
    write_json(output / "source-records.json", [{"record": row["record"], "source_reference": row["reference"], "raw": row["raw"], "normalized_email": row["email"],
        "review_bucket": "identity_hold" if not row["valid_email"] else "duplicate_review" if row["record"] in duplicate_records else "candidate",
        "timestamp_parse_ok": row["parsed_timestamp"] is not None} for row in rows])
    event_table = []
    for event in event_decisions:
        candidate = event["calendar_candidates"][0] if event["calendar_candidates"] else None
        event_table.append([event["review_id"], event["source_label"], event["submission_count"], event["identity_hold_rows"],
                            (candidate["starts_at"] or candidate["all_day_date"]) if candidate else "Unresolved",
                            candidate["title"] if candidate else "No title match", candidate["match_reason"] if candidate else "Manual review",
                            event["proposed_category"], "Pending", "No"])
    (output / "event-mapping.md").write_text("# Fall 2026 event mapping\n\nAll mappings require review. Calendar times are published starts, with UTC offsets, not submission times. The proposed category is not approved. Zones have deliberately not been guessed. Corporate info sessions are not automatically external events.\n\n" + table(["ID", "CSV event", "Rows", "Identity holds", "Suggested calendar start", "Calendar title", "Match basis", "Proposed category", "Zone", "Approved"], event_table) +
        "\n\n## Decisions\n\nEdit `event-decisions.json`: fill `starts_at`, `category`, and `zone`, confirm the title and semester, and set `approved` to true only after review. To accept a calendar suggestion, also copy its calendar ID/event ID into the final fields. Keep ambiguous mappings unapproved. The `proposed_*` fields are evidence, not import instructions.\n\n## Submission dates\n\n" +
        table(["ID", "CSV event", "Dates and submission counts"], [[event["review_id"], event["source_label"], "; ".join(f"{day}: {count}" for day, count in event["submission_dates"].items())] for event in event_decisions]) + "\n", encoding="utf-8")
    identity_table = [[item["record"], item["name"], item["submitted_email"] or "(missing)", item["event"], item["reason"], "; ".join(match["email"] for match in item["possible_matches"]) or "None"] for item in identity_holds]
    duplicate_table = [[item["review_id"], item["email"], item["event"], "; ".join(f"{record['record']}: {record['timestamp']}" for record in item["records"]), "Pending"] for item in duplicate_decisions]
    timing_table = [[item["record"], item["event_review_id"], item["event"], item["submitted_at"], item["suggested_event_start"], item["calendar_day_difference"]] for item in timing_notes]
    (output / "exceptions.md").write_text("# Fall 2026 attendance exceptions — private\n\nRecord numbers count CSV data records starting at 1, excluding the header; they are not physical text-line numbers. `source-records.json` preserves every original field.\n\n## Identity holds\n\n" +
        f"{len(identity_holds)} rows require a verified UF email or an explicit documented exclusion. Suggestions are clues only and must never be applied automatically. Do not invent UF addresses from names.\n\n" + table(["Record", "Name", "Submitted email", "Event", "Issue", "Possible existing email(s) — verify"], identity_table) +
        "\n\n## Potential duplicate attendance\n\nThese groups repeat a valid normalized email and exact event label. Confirm the mapping is one event occurrence, select the retained record, and account for the others as consolidated duplicates. Do not delete source rows. Preserve all original timestamps; late check-in alone is not grounds to deny points.\n\n" + table(["ID", "UF email", "Event", "Record and timestamp", "Decision"], duplicate_table) +
        "\n\n## Submission-day differences\n\nThese records were submitted on a different day from the proposed calendar event. Timing flags overlap the identity/duplicate buckets and must not be added to reconciliation totals. This comparison uses the displayed CSV date before its original time zone has been confirmed. Check possible wrong event selections, early submissions, or retrospective check-ins. Approved late attendance can keep its original submission time and earn normal points. Record decisions in `timing-decisions.json`.\n\n" + table(["Record", "Event ID", "Event", "Submission timestamp", "Suggested event start", "Day difference"], timing_table) +
        "\n\n## Other decisions before import\n\n- Confirm the spreadsheet's original time zone before interpreting naive submission timestamps. Calendar times already include offsets.\n- Confirm the existing Fall 2026 semester ID and dates. Do not create a duplicate semester.\n- Confirm attendance eligibility for all 31 events, including the historical Design Team Informational. Removing its website page does not remove historical attendance.\n- `5th Year` is not currently an allowed profile classification. Decide whether to add that option or map it explicitly. `Grad Student` can be normalized to `Graduate student` after approval.\n- Profile variations are documented in `profile-notes.json`. Do not overwrite existing portal profiles or roles. Profile issues need not invalidate attendance after identity is established.\n- The last `Column 9` field is preserved in raw evidence but excluded from planned import fields. NSBE ID stays optional; first-event answers do not establish the member's original join date.\n", encoding="utf-8")
    (output / "README.md").write_text("# Fall 2026 migration review\n\nThis is a private, local preparation package. **No database records have been written and no events or identities are approved for import.** Only the supplied Fall 2026 export is in scope.\n\n" +
        table(["Measure", "Count"], [["Source submissions", len(rows)], ["Event labels", len(groups)], ["Valid UF-email rows", len(valid)], ["Distinct valid UF emails", len(by_identity)], ["Missing-email holds", missing], ["Nonempty invalid/non-UF-email holds", len(identity_holds) - missing], ["Potential duplicate groups", len(duplicates)], ["Rows in duplicate groups", len(duplicate_records)], ["Additional rows if duplicate groups are confirmed", extra], ["Candidate rows outside identity/duplicate holds", summary["candidate_rows_without_identity_or_duplicate_flags"]], ["Distinct valid-email/event pairs before review", len(duplicate_keys)], ["Historical calendar entries available", len(calendar)], ["Event labels with calendar suggestions", summary["event_labels_with_calendar_suggestions"]]]) +
        "\n\nThe candidate count is not a final import total: event mapping, identity corrections, duplicate decisions, semester dates, and timestamp time zone still need review. No bonuses or tiebreakers have been calculated.\n\n## Start here\n\n1. Review [event-mapping.md](event-mapping.md), then record approved values in `event-decisions.json`.\n2. Review [exceptions.md](exceptions.md). Enter identity decisions in `identity-decisions.json`, duplicate decisions in `duplicate-decisions.json`, and submission-day decisions in `timing-decisions.json`. For exclusions, retain the record and document a reason.\n3. Review `profile-notes.json`; preserve member-edited profiles and optional IDs.\n4. Confirm the semester and source time zone. The future importer must validate all decisions and reconcile every source record before any production execution.\n\n## Source and reconciliation\n\n" +
        f"Source: `{source.name}`. SHA-256: `{source_hash}`. Every record has a frozen-file identifier `<source SHA-256>:<data-record number>` in `source-records.json`. The mutually exclusive review buckets reconcile to {len(rows)}: {summary['candidate_rows_without_identity_or_duplicate_flags']} candidates + {len(duplicate_records)} duplicate-review records + {len(identity_holds)} identity holds.\n\n" +
        "Keep this directory out of source control and `public/`. The raw CSV is untouched. Regenerating the package requires a different output directory so edits and decisions cannot be silently overwritten. Calendar suggestions come from the local historical calendar snapshot; events with no submissions are not assigned attendance.\n", encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
