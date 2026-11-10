begin;
-- Narrow read functions avoid exposing members' UFIDs, NSBE IDs, Auth links or
-- broad table access. Existing member/attendance/adjustment RLS stays unchanged.
create or replace function public.search_chapter_members(p_query text default '',p_page integer default 1)
returns table(id uuid,full_name text,email text,classification text,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Chapter staff required' using errcode='42501'; end if;
  return query select m.id,m.full_name,m.email,m.classification,count(*) over()
    from public.members m where strpos(lower(m.full_name),lower(left(btrim(coalesce(p_query,'')),120)))>0
    or strpos(m.email,lower(left(btrim(coalesce(p_query,'')),120)))>0
    order by lower(m.full_name),m.email,m.id
    limit 25 offset ((greatest(1,least(coalesce(p_page,1),10000))-1)*25);
end $$;

create or replace function public.admin_previous_events(p_semester uuid default null,p_category text default null,p_page integer default 1,p_query text default '')
returns table(id uuid,title text,starts_at timestamptz,category text,zone text,base_points integer,
  semester_id uuid,semester_name text,attendee_count bigint,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Chapter staff required' using errcode='42501'; end if;
  if p_category is not null and p_category not in ('general','gbm','external','trailblazers') then raise exception 'Invalid event category'; end if;
  return query select e.id,e.title,e.starts_at,e.category,e.zone,e.base_points,e.semester_id,s.name,count(a.id),count(*) over()
    from public.events e join public.semesters s on s.id=e.semester_id join public.attendance a on a.event_id=e.id
    where e.starts_at<=now() and (p_semester is null or e.semester_id=p_semester) and (p_category is null or e.category=p_category)
      and strpos(lower(e.title),lower(left(btrim(coalesce(p_query,'')),120)))>0
    group by e.id,s.id order by e.starts_at desc,e.id
    limit 25 offset ((greatest(1,coalesce(p_page,1))::bigint-1)*25);
end $$;

create function public.participation_member_profile(p_member uuid)
returns table(id uuid,email text,full_name text,major text,classification text,profile_completed_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Chapter staff required' using errcode='42501'; end if;
  return query select m.id,m.email,m.full_name,m.major,m.classification,m.profile_completed_at from public.members m where m.id=p_member;
end $$;
create function public.participation_member_attendance(p_member uuid)
returns table(id uuid,event_id uuid,checked_in_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Chapter staff required' using errcode='42501'; end if;
  return query select a.id,a.event_id,a.checked_in_at from public.attendance a where a.member_id=p_member order by a.id;
end $$;
create function public.participation_member_adjustments(p_member uuid)
returns table(id uuid,semester_id uuid,points integer,reason text,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Chapter staff required' using errcode='42501'; end if;
  return query select a.id,a.semester_id,a.points,a.reason,a.created_at from public.point_adjustments a where a.member_id=p_member order by a.created_at desc,a.id;
end $$;
create function public.participation_event_attendees(p_event uuid)
returns table(id uuid,member_id uuid,checked_in_at timestamptz,source text,full_name text,email text)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.can_manage_event_check_ins() then raise exception 'Chapter staff required' using errcode='42501'; end if;
  return query select a.id,a.member_id,a.checked_in_at,a.source,m.full_name,m.email
    from public.attendance a join public.members m on m.id=a.member_id where a.event_id=p_event order by a.id;
end $$;
revoke all on function public.participation_member_profile(uuid),public.participation_member_attendance(uuid),
 public.participation_member_adjustments(uuid),public.participation_event_attendees(uuid) from public,anon,authenticated;
grant execute on function public.participation_member_profile(uuid),public.participation_member_attendance(uuid),
 public.participation_member_adjustments(uuid),public.participation_event_attendees(uuid) to authenticated;
-- Replaced search/directory functions retain their authenticated-only grants.
-- Mutation RPCs, active-member exports, role lists and audit history remain admin-only.
commit;
