begin;
create table public.eboard_roles (
  member_id uuid primary key references public.members(id),
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  granted_by_email text not null
);
create table public.eboard_role_history (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  member_email text not null,
  action text not null check(action in ('grant','revoke')),
  created_by uuid references auth.users(id) on delete set null,
  actor_email text not null,
  created_at timestamptz not null default now()
);
create index eboard_role_history_created_idx on public.eboard_role_history(created_at desc,id);
alter table public.eboard_roles enable row level security;
alter table public.eboard_role_history enable row level security;
revoke all on public.eboard_roles,public.eboard_role_history from public,anon,authenticated;
grant select on public.eboard_roles,public.eboard_role_history to authenticated;
create policy eboard_roles_read on public.eboard_roles for select to authenticated
  using(public.is_portal_user() and (public.is_portal_admin() or member_id in
    (select id from public.members where auth_user_id=auth.uid())));
create policy eboard_history_admin_read on public.eboard_role_history for select to authenticated
  using(public.is_portal_admin());

create function public.can_manage_event_check_ins() returns boolean
language sql stable security definer set search_path='' as $$
  select public.is_portal_user() and (public.is_portal_admin() or exists(
    select 1 from public.eboard_roles r join public.members m on m.id=r.member_id
    where m.auth_user_id=auth.uid()));
$$;

create function public.list_eboard_access()
returns table(member_id uuid,full_name text,email text,granted_at timestamptz,granted_by_email text)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  return query select m.id,m.full_name,m.email,r.granted_at,r.granted_by_email
    from public.eboard_roles r join public.members m on m.id=r.member_id
    order by lower(m.full_name),m.email,m.id;
end $$;

create function public.set_eboard_access(p_member uuid,p_grant boolean,p_expected_granted_at timestamptz default null)
returns text language plpgsql security definer set search_path='' as $$
declare target_email text; actor text; previous public.eboard_roles;
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  if p_grant is null then raise exception 'Choose grant or revoke'; end if;
  select email into target_email from public.members where id=p_member for update;
  if not found then raise exception 'Member not found'; end if;
  select email into actor from auth.users where id=auth.uid();
  select * into previous from public.eboard_roles where member_id=p_member;
  if p_grant then
    if found then return 'unchanged'; end if;
    if exists(select 1 from public.admin_roles where member_id=p_member) then
      raise exception 'Administrators already have event access';
    end if;
    insert into public.eboard_roles(member_id,granted_by,granted_by_email) values(p_member,auth.uid(),actor);
  else
    if not found then return 'unchanged'; end if;
    if p_expected_granted_at is null or previous.granted_at<>p_expected_granted_at then
      raise exception 'Access changed; refresh before revoking';
    end if;
    delete from public.eboard_roles where member_id=p_member;
  end if;
  insert into public.eboard_role_history(member_id,member_email,action,created_by,actor_email)
    values(p_member,target_email,case when p_grant then 'grant' else 'revoke' end,auth.uid(),actor);
  return 'saved';
end $$;

-- Preserve existing event metadata checks; broaden only check-in management.
create or replace function public.configure_event_check_in(
  p_semester uuid, p_title text, p_starts_at timestamptz, p_category text,
  p_zone text, p_calendar_id text, p_calendar_event_id text,
  p_password text, p_hours integer
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_event_id uuid;
begin
  if not public.can_manage_event_check_ins() then raise exception 'Event manager required' using errcode='42501'; end if;
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

create or replace function public.close_event_check_in(p_event uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Event manager required' using errcode='42501'; end if;
  update check_in_private.settings set is_open=false where event_id=p_event;
end $$;

create or replace function public.admin_check_in_settings()
returns table(event_id uuid,is_open boolean,closes_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Event manager required' using errcode='42501'; end if;
  return query select s.event_id,s.is_open,s.closes_at from check_in_private.settings s;
end $$;


revoke all on function public.can_manage_event_check_ins(),public.list_eboard_access(),
 public.set_eboard_access(uuid,boolean,timestamptz) from public,anon,authenticated;
grant execute on function public.can_manage_event_check_ins(),public.list_eboard_access(),
 public.set_eboard_access(uuid,boolean,timestamptz) to authenticated;
-- Existing event function grants remain authenticated-only after CREATE OR REPLACE.
-- No E-board privileges are added to member, attendance, adjustment or reporting policies.
commit;
