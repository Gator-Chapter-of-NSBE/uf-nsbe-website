-- Disposable trailblazers_test cloned from eboard_security_test, with the new
-- Trailblazers migration applied. Never run fixture scripts on production.
begin;
do $$ begin
  if current_database()<>'trailblazers_test' then raise exception 'Use disposable trailblazers_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select public.set_eboard_access((select id from public.members where email='bob@ufl.edu'),true);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ declare eid uuid; begin
  eid:=public.configure_event_check_in('10000000-0000-0000-0000-000000000001','Trailblazers Meeting','2026-11-03T18:00:00-05:00','gbm',null,'vpresident.ufnsbe@gmail.com','tb-test','secret12',4);
  if not exists(select 1 from public.events where id=eid and category='trailblazers' and base_points=0) then raise exception 'Attendance-only category was not forced'; end if;
  begin perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','Sunday CEB Meeting','2026-11-03','general',null,'vpresident.ufnsbe@gmail.com','ceb-test','secret12',4); raise exception 'CEB event accepted'; exception when raise_exception then if sqlerrm='CEB event accepted' then raise; end if; end;
  begin perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','Trailblazers Meeting','2026-11-03','trailblazers',null,'other-calendar','fake-test','secret12',4); raise exception 'Wrong program source accepted'; exception when raise_exception then if sqlerrm='Wrong program source accepted' then raise; end if; end;
  perform public.close_event_check_in(eid);
  perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','Trailblazers Meeting','2026-11-03T18:00:00-05:00','trailblazers',null,'vpresident.ufnsbe@gmail.com','tb-test',null,4);
end $$;
reset role;
create temp table report_before as select * from reporting_private.semester_totals('10000000-0000-0000-0000-000000000001');
set local role anon;
do $$ declare eid uuid; begin
  select id into eid from public.open_check_in_events() where title='Trailblazers Meeting';
  if eid is null then raise exception 'Public program event missing'; end if;
  if public.submit_event_check_in(eid,'bob@ufl.edu','Bob','secret12')<>'success' then raise exception 'Program check-in failed'; end if;
  if public.submit_event_check_in(eid,'alice@ufl.edu','Alice','secret12')<>'success' then raise exception 'Mixed member check-in failed'; end if;
  perform public.submit_event_check_in(eid,'bob@ufl.edu','Bob','secret12');
end $$;
reset role;
do $$ begin
  if exists((select * from reporting_private.semester_totals('10000000-0000-0000-0000-000000000001') except select * from report_before)
    union all (select * from report_before except select * from reporting_private.semester_totals('10000000-0000-0000-0000-000000000001'))) then raise exception 'Program check-in changed chapter reporting totals'; end if;
  if (select count(*) from public.attendance a join public.events e on e.id=a.event_id where e.calendar_event_id='tb-test')<>2 then raise exception 'Missing or duplicate attendance'; end if;
end $$;
do $$ begin
  update public.events set category='gbm' where calendar_event_id='tb-test';
  if not exists(select 1 from public.events where calendar_event_id='tb-test' and category='trailblazers' and base_points=0) then
    raise exception 'Direct update bypassed attendance-only enforcement';
  end if;
end $$;
insert into public.members(email,full_name) values('program-only@ufl.edu','Program Only');
insert into public.attendance(member_id,event_id,source)
select m.id,e.id,'admin' from public.members m cross join public.events e where m.email='program-only@ufl.edu' and e.calendar_event_id='tb-test';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ begin
  if exists(select 1 from public.semester_leaderboard('10000000-0000-0000-0000-000000000001') where full_name='Program Only') then raise exception 'Program-only member on leaderboard'; end if;
  if exists(select 1 from public.active_semester_members('10000000-0000-0000-0000-000000000001') where email='program-only@ufl.edu') then raise exception 'Program-only member active'; end if;
end $$;
rollback;
select 'PASS: E-board setup, CEB rejection, forced zero points, source integrity, open/close/reopen, anonymous attendance, duplicates and unchanged chapter reports' as result;
