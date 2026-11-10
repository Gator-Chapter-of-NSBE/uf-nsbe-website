-- Disposable eboard_participation_test cloned from previous_event_search_test.
-- Apply the participation migration first. Fixture changes roll back.
begin;
do $$ begin
  if current_database()<>'eboard_participation_test' then raise exception 'Use disposable eboard_participation_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
update public.members set nsbe_id='private-nsbe-id',ufid='12345678' where email='alice@ufl.edu';
insert into public.point_adjustments(member_id,semester_id,points,reason)
select id,'10000000-0000-0000-0000-000000000001',10,'Participation test bonus' from public.members where email='alice@ufl.edu';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select public.set_eboard_access((select id from public.members where email='bob@ufl.edu'),true);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ declare target uuid; profile jsonb; begin
  select id into target from public.search_chapter_members('alice@ufl.edu');
  if target is null then raise exception 'E-board member search failed'; end if;
  select to_jsonb(p) into profile from public.participation_member_profile(target) p;
  if profile->>'email'<>'alice@ufl.edu' then raise exception 'Safe member profile missing'; end if;
  if profile ?| array['ufid','nsbe_id','auth_user_id','joined_on'] then raise exception 'Private profile fields returned'; end if;
  if not exists(select 1 from public.participation_member_attendance(target)) then raise exception 'Member attendance unavailable'; end if;
  if not exists(select 1 from public.participation_member_adjustments(target) where points=10 and reason='Participation test bonus') then raise exception 'Member point adjustments unavailable'; end if;
  if not exists(select 1 from public.admin_previous_events() where id='20000000-0000-0000-0000-000000000001' and attendee_count=1) then raise exception 'Previous event directory unavailable'; end if;
  if not exists(select 1 from public.participation_event_attendees('20000000-0000-0000-0000-000000000001') where email='alice@ufl.edu') then raise exception 'Roster unavailable'; end if;
  if exists(select 1 from public.participation_event_attendees('20000000-0000-0000-0000-000000000001') r where to_jsonb(r) ?| array['ufid','nsbe_id','auth_user_id','source_reference']) then raise exception 'Roster leaked private fields'; end if;
  if exists(select 1 from public.members where id=target) or exists(select 1 from public.attendance where member_id=target) or exists(select 1 from public.point_adjustments where member_id=target) then raise exception 'Underlying table RLS widened'; end if;
  update public.members set full_name='Changed by E-board' where id=target;
  if found then raise exception 'E-board modified another profile'; end if;
  begin perform public.correct_member_attendance(target,'20000000-0000-0000-0000-000000000001',true,null,'Not allowed',gen_random_uuid()); raise exception 'E-board attendance correction allowed'; exception when insufficient_privilege then null; end;
  begin perform public.adjust_member_points(target,'10000000-0000-0000-0000-000000000001',10,'Not allowed',gen_random_uuid()); raise exception 'E-board point adjustment allowed'; exception when insufficient_privilege then null; end;
  begin perform * from public.active_semester_members('10000000-0000-0000-0000-000000000001'); raise exception 'E-board export allowed'; exception when insufficient_privilege then null; end;
  begin perform * from public.list_eboard_access(); raise exception 'E-board role directory allowed'; exception when insufficient_privilege then null; end;
  if exists(select 1 from public.attendance_corrections) or exists(select 1 from public.eboard_role_history) then raise exception 'E-board audit access widened'; end if;
end $$;
-- Revoking the role must immediately block all new reads, not just hide UI links.
reset role;
delete from public.eboard_roles where member_id=(select id from public.members where email='bob@ufl.edu');
set local role authenticated;
do $$ begin
  begin perform * from public.participation_member_profile(gen_random_uuid()); raise exception 'Revoked user read profile'; exception when insufficient_privilege then null; end;
  begin perform * from public.participation_member_attendance(gen_random_uuid()); raise exception 'Member read attendance'; exception when insufficient_privilege then null; end;
  begin perform * from public.participation_member_adjustments(gen_random_uuid()); raise exception 'Member read adjustments'; exception when insufficient_privilege then null; end;
  begin perform * from public.participation_event_attendees(gen_random_uuid()); raise exception 'Member read roster'; exception when insufficient_privilege then null; end;
  begin perform * from public.search_chapter_members(''); raise exception 'Member searched directory'; exception when insufficient_privilege then null; end;
  begin perform * from public.admin_previous_events(); raise exception 'Member read previous events'; exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin perform * from public.participation_member_profile(gen_random_uuid()); raise exception 'Anonymous profile access'; exception when insufficient_privilege then null; end;
  begin perform * from public.participation_event_attendees(gen_random_uuid()); raise exception 'Anonymous roster access'; exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: E-board participation reads, private-field protection, unchanged table RLS, admin-only mutations/exports/roles, revocation and anonymous denial' as result;
