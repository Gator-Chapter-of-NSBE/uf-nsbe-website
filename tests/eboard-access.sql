-- Disposable DB only: clone member_reporting_test into eboard_security_test,
-- apply 202611020001_eboard_access.sql, then run this file. Data rolls back.
begin;
do $$ begin
  if current_database()<>'eboard_security_test' then raise exception 'Use disposable eboard_security_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
insert into public.members(email,full_name) values('charlie@ufl.edu','Charlie');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  if public.can_manage_event_check_ins() then raise exception 'Ordinary member has event access'; end if;
  begin perform public.set_eboard_access((public.claim_member()).id,true); raise exception 'Member self-promotion allowed'; exception when insufficient_privilege then null; end;
  begin perform * from public.admin_check_in_settings(); raise exception 'Member read settings'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ declare mid uuid; begin
  if not public.can_manage_event_check_ins() then raise exception 'Admin lost event access'; end if;
  select id into mid from public.members where email='bob@ufl.edu';
  perform public.set_eboard_access(mid,true);
  if public.set_eboard_access(mid,true)<>'unchanged' then raise exception 'Repeated grant not idempotent'; end if;
  if (select count(*) from public.eboard_role_history where member_id=mid)<>1 then raise exception 'Duplicate grant audit'; end if;
  if not exists(select 1 from public.eboard_role_history where member_id=mid and actor_email='alice@ufl.edu' and created_by=auth.uid() and action='grant') then raise exception 'Grant author missing'; end if;
  perform public.set_eboard_access((select id from public.members where email='charlie@ufl.edu'),true);
  if (select count(*) from public.list_eboard_access())<>2 then raise exception 'Admin list incorrect'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ declare eid uuid; mid uuid; begin
  if not public.can_manage_event_check_ins() or public.is_portal_admin() then raise exception 'Wrong E-board privilege level'; end if;
  select id into mid from public.members where email='bob@ufl.edu';
  if (select count(*) from public.members)<>1 or (select count(*) from public.eboard_roles)<>1 then raise exception 'E-board can read other members or roles'; end if;
  if exists(select 1 from public.eboard_role_history) then raise exception 'Role audit exposed to E-board'; end if;
  begin perform * from public.list_eboard_access(); raise exception 'E-board can list roles'; exception when insufficient_privilege then null; end;
  begin perform public.set_eboard_access(mid,false,now()); raise exception 'E-board changed roles'; exception when insufficient_privilege then null; end;
  begin insert into public.admin_roles(member_id) values(mid); raise exception 'E-board promoted self to admin'; exception when insufficient_privilege then null; end;
  begin delete from public.eboard_roles where member_id=mid; raise exception 'Direct role mutation allowed'; exception when insufficient_privilege then null; end;
  eid:=public.configure_event_check_in('10000000-0000-0000-0000-000000000001','E-board test','2026-11-02T18:00:00-05:00','general',null,'eboard-calendar','event','secret12',4);
  if not exists(select 1 from public.admin_check_in_settings() where event_id=eid and is_open) then raise exception 'E-board could not open/view check-in'; end if;
  perform public.close_event_check_in(eid);
  if exists(select 1 from public.open_check_in_events() where id=eid) then raise exception 'E-board could not close'; end if;
  perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','E-board test','2026-11-02T18:00:00-05:00','general',null,'eboard-calendar','event','changed12',1);
  if public.submit_event_check_in(eid,'password-test@ufl.edu','Test','secret12')<>'password' then raise exception 'Password rotation failed'; end if;
  begin perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','E-board test','2026-11-02T18:00:00-05:00','gbm',null,'eboard-calendar','event','secret12',4); raise exception 'Category mutation accepted'; exception when raise_exception then if sqlerrm='Category mutation accepted' then raise; end if; end;
  begin perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','E-board test','2026-11-02T18:00:00-05:00','general','Admin Zone','eboard-calendar','event','secret12',4); raise exception 'Zone mutation accepted'; exception when raise_exception then if sqlerrm='Zone mutation accepted' then raise; end if; end;
  update public.events set category='gbm' where id=eid;
  if found then raise exception 'Direct event mutation allowed'; end if;
  begin perform public.correct_member_attendance(mid,eid,true,null,'No',gen_random_uuid()); raise exception 'E-board corrected attendance'; exception when insufficient_privilege then null; end;
  begin perform public.adjust_member_points(mid,'10000000-0000-0000-0000-000000000001',10,'No',gen_random_uuid()); raise exception 'E-board adjusted points'; exception when insufficient_privilege then null; end;
  begin insert into public.point_adjustments(member_id,semester_id,points,reason) values(mid,'10000000-0000-0000-0000-000000000001',10,'No'); raise exception 'Direct adjustment allowed'; exception when insufficient_privilege then null; end;
  begin delete from public.attendance where member_id=mid; raise exception 'Direct attendance deletion allowed'; exception when insufficient_privilege then null; end;
  begin perform * from public.search_chapter_members(''); raise exception 'E-board searched members'; exception when insufficient_privilege then null; end;
  begin perform * from public.active_semester_members('10000000-0000-0000-0000-000000000001'); raise exception 'E-board accessed export data'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ declare mid uuid; stamp timestamptz; begin
  select member_id,granted_at into mid,stamp from public.eboard_roles where member_id=(select id from public.members where email='bob@ufl.edu');
  begin perform public.set_eboard_access(mid,false,stamp-interval '1 second'); raise exception 'Stale revocation accepted'; exception when raise_exception then if sqlerrm='Stale revocation accepted' then raise; end if; end;
  perform public.set_eboard_access(mid,false,stamp);
  if public.set_eboard_access(mid,false,stamp)<>'unchanged' then raise exception 'Repeated revoke not idempotent'; end if;
  if (select count(*) from public.eboard_role_history where member_id=mid)<>2 then raise exception 'Revoke audit missing/duplicated'; end if;
  begin delete from public.eboard_role_history; raise exception 'Role audit deletion allowed'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  if public.can_manage_event_check_ins() then raise exception 'Revocation did not apply'; end if;
  begin perform * from public.admin_check_in_settings(); raise exception 'Revoked user read settings'; exception when insufficient_privilege then null; end;
  begin perform public.close_event_check_in(gen_random_uuid()); raise exception 'Revoked user closed event'; exception when insufficient_privilege then null; end;
  begin perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','No','2026-11-02','general',null,'eboard-calendar','no','secret12',1); raise exception 'Revoked user opened event'; exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin perform public.can_manage_event_check_ins(); raise exception 'Anonymous role probe allowed'; exception when insufficient_privilege then null; end;
  begin perform public.set_eboard_access(null,true); raise exception 'Anonymous grant allowed'; exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: E-board grant/revoke, audit, event controls, metadata protection, no member/points/export access, and revocation' as result;
