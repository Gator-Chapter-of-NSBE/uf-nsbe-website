begin;
create index attendance_corrections_event_idx on public.attendance_corrections(event_id,created_at desc,id);
create function public.admin_previous_events(p_semester uuid default null,p_category text default null,p_page integer default 1)
returns table(id uuid,title text,starts_at timestamptz,category text,zone text,base_points integer,
  semester_id uuid,semester_name text,attendee_count bigint,total_count bigint)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  if p_category is not null and p_category not in ('general','gbm','external','trailblazers') then raise exception 'Invalid event category'; end if;
  return query select e.id,e.title,e.starts_at,e.category,e.zone,e.base_points,e.semester_id,s.name,count(a.id),count(*) over()
    from public.events e join public.semesters s on s.id=e.semester_id join public.attendance a on a.event_id=e.id
    where e.starts_at<=now() and (p_semester is null or e.semester_id=p_semester) and (p_category is null or e.category=p_category)
    group by e.id,s.id order by e.starts_at desc,e.id
    limit 25 offset ((greatest(1,least(coalesce(p_page,1),10000))-1)*25);
end $$;
revoke all on function public.admin_previous_events(uuid,text,integer) from public,anon,authenticated;
grant execute on function public.admin_previous_events(uuid,text,integer) to authenticated;
commit;
