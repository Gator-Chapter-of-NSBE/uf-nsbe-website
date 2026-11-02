begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists check_in_private;
revoke all on schema check_in_private from public, anon, authenticated;

create table check_in_private.settings (
  event_id uuid primary key references public.events(id) on delete cascade,
  password_hash text not null,
  closes_at timestamptz not null,
  is_open boolean not null default false
);
create table check_in_private.attempts (
  event_id uuid references public.events(id) on delete cascade,
  email text not null,
  window_start timestamptz not null,
  attempts integer not null,
  primary key(event_id,email)
);
alter table check_in_private.settings enable row level security;
alter table check_in_private.attempts enable row level security;
revoke all on all tables in schema check_in_private from public, anon, authenticated;

create function public.open_check_in_events()
returns table(id uuid,title text,starts_at timestamptz,category text)
language sql stable security definer set search_path = '' as $$
  select e.id,e.title,e.starts_at,e.category from public.events e
  join check_in_private.settings s on s.event_id=e.id
  where s.is_open and s.closes_at>now() order by e.starts_at,e.id;
$$;

-- Called with the administrator's existing session, never a service-role key.
create function public.configure_event_check_in(
  p_semester uuid, p_title text, p_starts_at timestamptz, p_category text,
  p_zone text, p_calendar_id text, p_calendar_event_id text,
  p_password text, p_hours integer
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_event_id uuid;
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
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

create function public.close_event_check_in(p_event uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  update check_in_private.settings set is_open=false where event_id=p_event;
end $$;

create function public.admin_check_in_settings()
returns table(event_id uuid,is_open boolean,closes_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  return query select s.event_id,s.is_open,s.closes_at from check_in_private.settings s;
end $$;

create function public.submit_event_check_in(p_event uuid,p_email text,p_name text,p_password text)
returns text language plpgsql security definer set search_path = '' as $$
declare s check_in_private.settings; v_member_id uuid; n integer;
begin
  p_email:=lower(btrim(p_email)); p_name:=btrim(p_name);
  if p_email is null or length(p_email)>254 or p_email !~ '^[^[:space:]@]+@ufl[.]edu$'
    or p_name is null or length(p_name) not between 1 and 120
    or p_password is null or octet_length(p_password)>72 then return 'invalid'; end if;
  -- Shared row lock lets attendees check in concurrently while a close waits.
  select * into s from check_in_private.settings where event_id=p_event for share;
  if not found or not s.is_open or s.closes_at<=now() then return 'closed'; end if;
  insert into check_in_private.attempts(event_id,email,window_start,attempts)
  values(p_event,p_email,now(),1)
  on conflict(event_id,email) do update set
    attempts=case when attempts.window_start<now()-interval '15 minutes' then 1 else attempts.attempts+1 end,
    window_start=case when attempts.window_start<now()-interval '15 minutes' then now() else attempts.window_start end
  returning attempts into n;
  if n>8 then return 'rate_limited'; end if;
  if extensions.crypt(p_password,s.password_hash)<>s.password_hash then return 'password'; end if;
  insert into public.members(email,full_name) values(p_email,p_name)
  on conflict(email) do nothing;
  select id into v_member_id from public.members where email=p_email;
  insert into public.attendance(member_id,event_id,source)
  values(v_member_id,p_event,'check_in') on conflict(member_id,event_id) do nothing;
  -- Same response for duplicate attendance: no public attendance lookup.
  return 'success';
end $$;

revoke all on function public.open_check_in_events(), public.configure_event_check_in(uuid,text,timestamptz,text,text,text,text,text,integer),
 public.close_event_check_in(uuid), public.admin_check_in_settings(), public.submit_event_check_in(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.open_check_in_events(), public.submit_event_check_in(uuid,text,text,text) to anon,authenticated;
grant execute on function public.configure_event_check_in(uuid,text,timestamptz,text,text,text,text,text,integer),
 public.close_event_check_in(uuid),public.admin_check_in_settings() to authenticated;
commit;
