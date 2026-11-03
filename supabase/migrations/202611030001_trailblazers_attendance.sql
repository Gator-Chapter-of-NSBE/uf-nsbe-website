begin;
-- The extra category is attendance-only, never a chapter points event.
alter table public.events drop constraint events_category_check;
alter table public.events add constraint events_category_check
  check(category in ('general','gbm','external','trailblazers'));
do $$ begin
  if exists(select 1 from public.events where calendar_id='vpresident.ufnsbe@gmail.com'
    and title !~* 'trailblazers') then
    raise exception 'Non-Trailblazers events already exist from the program calendar; review them before applying this migration';
  end if;
end $$;
update public.events set category='trailblazers' where calendar_id='vpresident.ufnsbe@gmail.com';
-- Rebuild only the derived points column; no attendance/member records are removed.
alter table public.events drop column base_points;
alter table public.events add column base_points integer generated always as
  (case category when 'general' then 5 when 'gbm' then 10 when 'external' then 15 else 0 end) stored;
alter table public.events add constraint events_trailblazers_calendar_check
  check ((category='trailblazers')=coalesce(calendar_id='vpresident.ufnsbe@gmail.com',false));
create function public.enforce_trailblazers_event() returns trigger
language plpgsql set search_path='' as $$
begin
  if new.calendar_id='vpresident.ufnsbe@gmail.com' then
    if new.title !~* 'trailblazers' then raise exception 'Only Trailblazers meetings are supported from this calendar'; end if;
    new.category:='trailblazers';
  end if;
  return new;
end $$;
revoke all on function public.enforce_trailblazers_event() from public,anon,authenticated;
create trigger enforce_trailblazers_event before insert or update on public.events
for each row execute function public.enforce_trailblazers_event();

create or replace function public.configure_event_check_in(
  p_semester uuid, p_title text, p_starts_at timestamptz, p_category text,
  p_zone text, p_calendar_id text, p_calendar_event_id text,
  p_password text, p_hours integer
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_event_id uuid;
begin
  if not public.can_manage_event_check_ins() then raise exception 'Event manager required' using errcode='42501'; end if;
  if p_calendar_id='vpresident.ufnsbe@gmail.com' then
    if p_title is null or p_title !~* 'trailblazers' then raise exception 'Only Trailblazers meetings are supported from this calendar'; end if;
    p_category:='trailblazers';
  elsif p_category='trailblazers' then
    raise exception 'Trailblazers attendance requires its own calendar';
  end if;
  if p_hours not in (1,4,12,24) or p_hours is null then raise exception 'Invalid check-in duration'; end if;
  if p_password is not null and (length(p_password)<6 or octet_length(p_password)>72) then
    raise exception 'Password must be 6–72 bytes';
  end if;
  if p_calendar_id is null or btrim(p_calendar_id)='' or p_calendar_event_id is null or btrim(p_calendar_event_id)='' then
    raise exception 'Select a calendar event';
  end if;
  if not exists(select 1 from public.semesters where id=p_semester and
    (p_starts_at at time zone 'America/New_York')::date between starts_on and ends_on) then
    raise exception 'Event must fall within the selected semester';
  end if;
  insert into public.events(semester_id,title,starts_at,category,zone,calendar_id,calendar_event_id)
  values(p_semester,p_title,p_starts_at,p_category,p_zone,p_calendar_id,p_calendar_event_id)
  on conflict(calendar_id,calendar_event_id) do nothing;
  select id into v_event_id from public.events where calendar_id=p_calendar_id and calendar_event_id=p_calendar_event_id for update;
  if exists(select 1 from public.events e where e.id=v_event_id and
    (e.semester_id<>p_semester or e.category<>p_category or e.zone is distinct from p_zone or e.starts_at<>p_starts_at)) then
    raise exception 'Event already exists with different details; keep its original semester, category, zone and date';
  end if;
  if p_password is null and not exists(select 1 from check_in_private.settings s where s.event_id=v_event_id) then
    raise exception 'A password is required for a new check-in';
  end if;
  insert into check_in_private.settings(event_id,password_hash,closes_at,is_open)
  values(v_event_id,extensions.crypt(coalesce(p_password,''),extensions.gen_salt('bf',10)),now()+make_interval(hours=>p_hours),true)
  on conflict(event_id) do update set
    password_hash=case when p_password is null then settings.password_hash else excluded.password_hash end,
    closes_at=excluded.closes_at,is_open=true;
  return v_event_id;
end $$;

create or replace function reporting_private.semester_totals(p_semester uuid)
returns table(member_id uuid,gbms bigint,qualifying_events bigint,attendance_count bigint,
  adjustment_count bigint,base_points bigint,adjustment_points bigint,points bigint)
language sql stable security definer set search_path='' as $$
  with term as (select * from public.semesters where id=p_semester),
  attended as (
    select a.member_id,count(*) as attendance_count,
      count(*) filter(where e.category='gbm') as gbms,
      count(*) filter(where e.category='general' or (e.category='external' and t.external_counts_for_membership)) as qualifying_events,
      sum(e.base_points)::bigint as base_points
    from public.attendance a join public.events e on e.id=a.event_id
    join term t on t.id=e.semester_id where e.category<>'trailblazers' group by a.member_id
  ), adjusted as (
    select a.member_id,count(*) as adjustment_count,sum(a.points)::bigint as adjustment_points
    from public.point_adjustments a join term t on t.id=a.semester_id group by a.member_id
  )
  select m.id,coalesce(a.gbms,0),coalesce(a.qualifying_events,0),coalesce(a.attendance_count,0),
    coalesce(j.adjustment_count,0),coalesce(a.base_points,0),coalesce(j.adjustment_points,0),
    coalesce(a.base_points,0)+coalesce(j.adjustment_points,0)
  from public.members m cross join term t
  left join attended a on a.member_id=m.id left join adjusted j on j.member_id=m.id;
$$;

-- Existing function grants and RLS remain unchanged. Program-only participation
-- is excluded from reporting totals and therefore does not enter the leaderboard.
commit;
