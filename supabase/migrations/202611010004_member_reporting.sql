begin;
create schema if not exists reporting_private;
revoke all on schema reporting_private from public,anon,authenticated;

-- Aggregate attendance and adjustments independently to avoid multiplying either.
create function reporting_private.semester_totals(p_semester uuid)
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
    join term t on t.id=e.semester_id group by a.member_id
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
revoke all on function reporting_private.semester_totals(uuid) from public,anon,authenticated;

-- Deliberately return only display names, scores, rank and an own-row indicator.
-- No broader SELECT policy is added to members or attendance.
create function public.semester_leaderboard(p_semester uuid)
returns table(rank bigint,full_name text,points bigint,is_you boolean)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_portal_user() then raise exception 'Verified UF account required' using errcode='42501'; end if;
  return query select rank() over(order by t.points desc),
    coalesce(nullif(btrim(m.full_name),''),'Member'),t.points,coalesce(m.auth_user_id=auth.uid(),false)
    from reporting_private.semester_totals(p_semester) t join public.members m on m.id=t.member_id
    where t.attendance_count>0 or t.adjustment_count>0
    order by t.points desc,lower(m.full_name),m.id;
end $$;

create function public.active_semester_members(p_semester uuid)
returns table(member_id uuid,full_name text,email text,gbms bigint,qualifying_events bigint,points bigint)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_portal_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
  return query select m.id,m.full_name,m.email,t.gbms,t.qualifying_events,t.points
    from reporting_private.semester_totals(p_semester) t join public.members m on m.id=t.member_id
    where t.gbms>=2 and t.qualifying_events>=3 order by lower(m.full_name),m.email,m.id;
end $$;
revoke all on function public.semester_leaderboard(uuid),public.active_semester_members(uuid) from public,anon,authenticated;
grant execute on function public.semester_leaderboard(uuid),public.active_semester_members(uuid) to authenticated;
commit;
