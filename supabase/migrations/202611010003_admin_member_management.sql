begin;
create table public.attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  member_id uuid not null references public.members(id),
  event_id uuid not null references public.events(id),
  action text not null check(action in ('add','remove')),
  reason text not null check(char_length(btrim(reason)) between 1 and 500),
  previous_attendance jsonb,
  created_by uuid references auth.users(id) on delete set null,
  actor_email text not null,
  created_at timestamptz not null default now()
);
create index attendance_corrections_member_idx on public.attendance_corrections(member_id,created_at);
alter table public.attendance_corrections enable row level security;
revoke all on public.attendance_corrections from public,anon,authenticated;
grant select on public.attendance_corrections to authenticated;
create policy corrections_admin_read on public.attendance_corrections for select to authenticated using(public.is_portal_admin());
-- Administrative attendance changes must pass through the audited RPC below.
-- Public password check-in still uses its separate, restricted definer function.
revoke insert,update,delete on public.attendance from authenticated;
alter table public.point_adjustments add column request_id uuid unique;

create function public.search_chapter_members(p_query text default '',p_page integer default 1)
returns table(id uuid,full_name text,email text,classification text,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  return query select m.id,m.full_name,m.email,m.classification,count(*) over()
    from public.members m where strpos(lower(m.full_name),lower(left(btrim(coalesce(p_query,'')),120)))>0
    or strpos(m.email,lower(left(btrim(coalesce(p_query,'')),120)))>0
    order by lower(m.full_name),m.email,m.id
    limit 25 offset ((greatest(1,least(coalesce(p_page,1),10000))-1)*25);
end $$;

create function public.correct_member_attendance(p_member uuid,p_event uuid,p_present boolean,
  p_expected_attendance uuid,p_reason text,p_request uuid)
returns text language plpgsql security definer set search_path='' as $$
declare old_row public.attendance; existing public.attendance_corrections; actor text;
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  if p_request is null or p_present is null or p_reason is null or char_length(btrim(p_reason)) not between 1 and 500 then
    raise exception 'A reason and request ID are required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request::text,0));
  select * into existing from public.attendance_corrections where request_id=p_request;
  if found then
    if existing.member_id<>p_member or existing.event_id<>p_event or existing.action<>(case when p_present then 'add' else 'remove' end)
      or existing.reason<>btrim(p_reason) or existing.created_by is distinct from auth.uid() then
      raise exception 'Request ID already used for another correction';
    end if;
    return 'saved';
  end if;
  -- Lock the member to serialize add/remove corrections, including missing rows.
  perform 1 from public.members where id=p_member for update;
  if not found then raise exception 'Member not found'; end if;
  perform 1 from public.events where id=p_event and starts_at<=now();
  if not found then raise exception 'Choose an event that has already started'; end if;
  select * into old_row from public.attendance where member_id=p_member and event_id=p_event for update;
  if p_present then
    if found then return 'unchanged'; end if;
    insert into public.attendance(member_id,event_id,source) values(p_member,p_event,'admin')
      on conflict(member_id,event_id) do nothing;
    if not found then return 'unchanged'; end if;
  else
    if not found then return 'unchanged'; end if;
    if p_expected_attendance is null or old_row.id<>p_expected_attendance then raise exception 'Attendance changed; refresh before removing'; end if;
    delete from public.attendance where id=old_row.id;
  end if;
  select email into actor from auth.users where id=auth.uid();
  insert into public.attendance_corrections(request_id,member_id,event_id,action,reason,previous_attendance,created_by,actor_email)
  values(p_request,p_member,p_event,case when p_present then 'add' else 'remove' end,btrim(p_reason),
    case when old_row.id is null then null else to_jsonb(old_row) end,auth.uid(),actor);
  return 'saved';
end $$;

create function public.adjust_member_points(p_member uuid,p_semester uuid,p_points integer,p_reason text,p_request uuid)
returns void language plpgsql security definer set search_path='' as $$
declare existing public.point_adjustments;
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  if p_request is null or p_points is null or p_points=0 or p_points not between -10000 and 10000
    or p_reason is null or char_length(btrim(p_reason)) not between 1 and 500 then
    raise exception 'Enter nonzero points between -10000 and 10000 and a reason'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_request::text,0));
  select * into existing from public.point_adjustments where request_id=p_request;
  if found then
    if existing.member_id<>p_member or existing.semester_id<>p_semester or existing.points<>p_points
      or existing.reason<>btrim(p_reason) or existing.created_by is distinct from auth.uid() then
      raise exception 'Request ID already used for another adjustment';
    end if;
    return;
  end if;
  insert into public.point_adjustments(member_id,semester_id,points,reason,request_id)
    values(p_member,p_semester,p_points,btrim(p_reason),p_request);
end $$;
revoke all on function public.search_chapter_members(text,integer),
 public.correct_member_attendance(uuid,uuid,boolean,uuid,text,uuid),
 public.adjust_member_points(uuid,uuid,integer,text,uuid) from public,anon,authenticated;
grant execute on function public.search_chapter_members(text,integer),
 public.correct_member_attendance(uuid,uuid,boolean,uuid,text,uuid),
 public.adjust_member_points(uuid,uuid,integer,text,uuid) to authenticated;
commit;
