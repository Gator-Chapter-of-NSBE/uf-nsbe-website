-- Run against disposable member_management_test cloned from event_check_in_test.
-- Apply 202611010003_admin_member_management.sql first. Fixture rolls back.
begin;
do $$ begin
  if current_database()<>'member_management_test' then raise exception 'Use disposable member_management_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  begin perform * from public.search_chapter_members(); raise exception 'Non-admin search allowed'; exception when insufficient_privilege then null; end;
  begin perform public.adjust_member_points(null,null,5,'bad',gen_random_uuid()); raise exception 'Non-admin adjustment allowed'; exception when insufficient_privilege then null; end;
  begin perform public.correct_member_attendance(null,null,true,null,'bad',gen_random_uuid()); raise exception 'Non-admin correction allowed'; exception when insufficient_privilege then null; end;
  if exists(select 1 from public.attendance_corrections) then raise exception 'Audit leaked to member'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ declare mid uuid; aid uuid; result text; rid uuid:=gen_random_uuid(); adj uuid:=gen_random_uuid(); begin
  select id into mid from public.members where email='bob@ufl.edu';
  if not exists(select 1 from public.search_chapter_members('BOB@')) then raise exception 'Case-insensitive search failed'; end if;
  if exists(select 1 from public.search_chapter_members('%_')) then raise exception 'Search interpreted wildcard syntax'; end if;
  begin perform public.correct_member_attendance(mid,'20000000-0000-0000-0000-000000000001',true,null,' ',gen_random_uuid()); raise exception 'Blank reason accepted'; exception when raise_exception then if sqlerrm='Blank reason accepted' then raise; end if; end;
  result:=public.correct_member_attendance(mid,'20000000-0000-0000-0000-000000000001',true,null,'Missed sign-in',rid);
  if result<>'saved' then raise exception 'Add failed'; end if;
  perform public.correct_member_attendance(mid,'20000000-0000-0000-0000-000000000001',true,null,'Missed sign-in',rid);
  if (select count(*) from public.attendance_corrections where member_id=mid)<>1 then raise exception 'Retry duplicated audit'; end if;
  if public.correct_member_attendance(mid,'20000000-0000-0000-0000-000000000001',true,null,'Already here',gen_random_uuid())<>'unchanged' then raise exception 'Duplicate attendance not handled'; end if;
  select id into aid from public.attendance where member_id=mid and event_id='20000000-0000-0000-0000-000000000001';
  begin perform public.correct_member_attendance(mid,'20000000-0000-0000-0000-000000000001',false,gen_random_uuid(),'Wrong member',gen_random_uuid()); raise exception 'Stale removal accepted'; exception when raise_exception then if sqlerrm='Stale removal accepted' then raise; end if; end;
  perform public.correct_member_attendance(mid,'20000000-0000-0000-0000-000000000001',false,aid,'Wrong member',gen_random_uuid());
  if exists(select 1 from public.attendance where id=aid) then raise exception 'Remove failed'; end if;
  if not exists(select 1 from public.attendance_corrections where member_id=mid and action='remove' and previous_attendance->>'id'=aid::text and actor_email='alice@ufl.edu' and created_by=auth.uid()) then raise exception 'Removal provenance missing'; end if;
  perform public.adjust_member_points(mid,'10000000-0000-0000-0000-000000000001',10,'Attendance bonus',adj);
  perform public.adjust_member_points(mid,'10000000-0000-0000-0000-000000000001',10,'Attendance bonus',adj);
  if (select count(*) from public.point_adjustments where request_id=adj)<>1 then raise exception 'Adjustment retry duplicated'; end if;
  if not exists(select 1 from public.point_adjustments where request_id=adj and created_by=auth.uid()) then raise exception 'Adjustment author missing'; end if;
  begin perform public.adjust_member_points(mid,'10000000-0000-0000-0000-000000000001',20,'Attendance bonus',adj); raise exception 'Request reuse changed points'; exception when raise_exception then if sqlerrm='Request reuse changed points' then raise; end if; end;
  perform public.adjust_member_points(mid,'10000000-0000-0000-0000-000000000001',-10,'Reverse incorrect bonus',gen_random_uuid());
  if (select sum(points) from public.point_adjustments where member_id=mid and reason in ('Attendance bonus','Reverse incorrect bonus'))<>0 then raise exception 'Reversal failed'; end if;
  begin insert into public.attendance(member_id,event_id,source) values(mid,'20000000-0000-0000-0000-000000000001','admin'); raise exception 'Unaudited insert allowed'; exception when insufficient_privilege then null; end;
  begin delete from public.attendance_corrections where member_id=mid; raise exception 'Audit deletion allowed'; exception when insufficient_privilege then null; end;
  begin update public.point_adjustments set points=50 where member_id=mid; raise exception 'Adjustment mutation allowed'; exception when insufficient_privilege then null; end;
end $$;
-- Revoking direct attendance writes must not break the anonymous check-in RPC.
select public.configure_event_check_in('10000000-0000-0000-0000-000000000001','RPC regression','2026-11-01','general',null,'test','regression','secret12',1);
set local role anon;
do $$ declare eid uuid; begin
  begin perform * from public.search_chapter_members(); raise exception 'Anon search allowed'; exception when insufficient_privilege then null; end;
  begin perform * from public.attendance_corrections; raise exception 'Anon audit allowed'; exception when insufficient_privilege then null; end;
  select id into eid from public.open_check_in_events() where title='RPC regression';
  if public.submit_event_check_in(eid,'testregression@ufl.edu','Test','secret12')<>'success' then raise exception 'Public check-in broken'; end if;
end $$;
rollback;
select 'PASS: authorization, search, attendance add/remove, stale removal, audit authors, idempotency, adjustments, reversal and public check-in regression' as result;
