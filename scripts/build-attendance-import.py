"""Build private, atomic SQL from the approved Fall 2026 review. No network writes."""
import argparse
import hashlib
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'migration-review/fall-2026/ready-for-review'


def read(name):
    return json.loads((REVIEW / name).read_text(encoding='utf-8'))


def quote(value):
    return "'" + str(value).replace("'", "''") + "'"


def build():
    manifest = read('manifest.json')
    digest = hashlib.sha256((ROOT / manifest['source_file']).read_bytes()).hexdigest()
    assert digest == manifest['source_sha256'], 'Source changed'
    assert manifest['identity_review_complete'] and manifest['duplicate_review_complete']
    events = read('event-decisions.json')['events']
    assert len(events) == 31 and all(e['approved'] for e in events)
    assert all(e['zone'] is None for e in events)
    assert len({(e['calendar_id'], e['calendar_event_id']) for e in events}) == 31
    records = read('record-decisions.json')['records']
    source = {r['record']: r for r in read('source-records.json')}
    rows = [r for r in records if r['decision'] == 'candidate']
    assert len(records) == 1052 and len(rows) == 961
    assert len({(r['effective_email'], r['event_label']) for r in rows}) == 961
    assert all(re.fullmatch(r'[^\s@]+@ufl\.edu', r['effective_email']) for r in rows)
    assert all(r['event_label'] in {e['source_label'] for e in events} for r in rows)
    event_values = ',\n'.join('(' + ','.join(quote(e[k]) for k in
        ['source_label', 'event_title', 'starts_at', 'category', 'calendar_id', 'calendar_event_id']) + ')' for e in events)
    attendance_values = []
    for r in rows:
        raw = source[r['record']]['raw']
        stamp = datetime.strptime(raw['Timestamp'].strip(), '%m/%d/%Y %H:%M:%S').isoformat(' ')
        assert r['source_reference'] == f"{digest}:{r['record']}"
        attendance_values.append('(' + ','.join(quote(v) for v in [
            r['effective_email'], r['event_label'], raw['Full Name'].strip()[:120], stamp, r['source_reference']]) + ')')
    sql = """-- PRIVATE: member data. Run as postgres in Supabase SQL Editor.
-- Approved timezone: America/New_York. Profiles are imported as name-only drafts.
-- Existing members, Auth links, admin roles and adjustments are never updated.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';
set local standard_conforming_strings = on;
select pg_advisory_xact_lock(2026, 1031);
lock table public.members, public.events, public.attendance, public.semesters,
  public.admin_roles, public.point_adjustments in share row exclusive mode;
create temp table import_events(label text primary key, title text, starts_at timestamptz,
  category text, calendar_id text, calendar_event_id text) on commit drop;
insert into import_events values
""" + event_values + ";\n" + """
create temp table import_attendance(email text, label text, full_name text,
  submitted_at timestamp, source_reference text unique, primary key(email,label)) on commit drop;
insert into import_attendance values
""" + ',\n'.join(attendance_values) + ";\n" + """
do $$
begin
  if (select count(*) from public.semesters where name = 'Fall 2026') <> 1 then
    raise exception 'Expected exactly one existing semester named Fall 2026';
  end if;
  if exists (select 1 from import_events e cross join public.semesters s
    where s.name = 'Fall 2026' and
    (e.starts_at at time zone 'America/New_York')::date not between s.starts_on and s.ends_on) then
    raise exception 'Existing Fall 2026 dates do not contain all reviewed events';
  end if;
  if exists (select 1 from import_events i join public.events e
    on e.calendar_id=i.calendar_id and e.calendar_event_id=i.calendar_event_id
    join public.semesters s on s.name='Fall 2026'
    where e.semester_id<>s.id or e.title<>i.title or e.starts_at<>i.starts_at or e.category<>i.category) then
    raise exception 'Existing calendar event conflicts with approved mapping';
  end if;
end $$;
-- Private snapshot, retained across repeat runs; excluded from API-facing public schema.
create schema if not exists attendance_backup_fall2026;
revoke all on schema attendance_backup_fall2026 from public, anon, authenticated;
do $$ declare t text; begin
  foreach t in array array['members','events','attendance','semesters','admin_roles','point_adjustments'] loop
    if to_regclass('attendance_backup_fall2026.' || t) is null then
      execute format('create table attendance_backup_fall2026.%I as table public.%I', t,t);
    end if;
  end loop;
end $$;
revoke all on all tables in schema attendance_backup_fall2026 from public, anon, authenticated;
alter table public.events alter column zone drop not null;
insert into public.members(email,full_name)
select distinct on (email) email,full_name from import_attendance
order by email,submitted_at desc,source_reference desc
on conflict(email) do nothing;
insert into public.events(semester_id,title,starts_at,category,zone,calendar_id,calendar_event_id)
select s.id,i.title,i.starts_at,i.category,null,i.calendar_id,i.calendar_event_id
from import_events i cross join public.semesters s where s.name='Fall 2026'
on conflict(calendar_id,calendar_event_id) do nothing;
-- Reject collisions instead of silently overwriting or skipping unrelated attendance.
do $$ begin
  if exists(select 1 from import_attendance i join import_events ie on ie.label=i.label
    join public.events e on e.calendar_id=ie.calendar_id and e.calendar_event_id=ie.calendar_event_id
    join public.members m on m.email=i.email
    join public.attendance a on a.source_reference=i.source_reference or (a.member_id=m.id and a.event_id=e.id)
    where a.member_id<>m.id or a.event_id<>e.id or a.source<>'import'
      or a.source_reference is distinct from i.source_reference
      or a.checked_in_at<>(i.submitted_at at time zone 'America/New_York')) then
    raise exception 'Existing attendance conflicts with reviewed import';
  end if;
end $$;
insert into public.attendance(member_id,event_id,checked_in_at,source,source_reference)
select m.id,e.id,i.submitted_at at time zone 'America/New_York','import',i.source_reference
from import_attendance i join public.members m on m.email=i.email
join import_events ie on ie.label=i.label
join public.events e on e.calendar_id=ie.calendar_id and e.calendar_event_id=ie.calendar_event_id
on conflict(member_id,event_id) do nothing;
do $$ begin
  if (select count(*) from import_attendance i join public.attendance a using(source_reference))<>961 then
    raise exception 'Reconciliation failed: expected 961 imported attendance rows';
  end if;
end $$;
select 'Fall 2026 import reconciled' as result, count(*) as attendance_records,
  count(distinct a.member_id) as members, count(distinct a.event_id) as events
from public.attendance a join import_attendance i using(source_reference);
commit;
"""
    output = REVIEW / 'import-fall-2026.sql'
    output.write_text(sql, encoding='utf-8')
    print(json.dumps({'output': str(output.relative_to(ROOT)), 'attendance': len(rows),
                      'members': len({r['effective_email'] for r in rows}), 'events': len(events)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--timezone', required=True, choices=['America/New_York'])
    parser.parse_args()
    build()
