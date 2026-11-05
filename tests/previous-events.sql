-- Disposable previous_events_test cloned from trailblazers_test. Apply the
-- previous-events migration first. All fixture data rolls back.
begin;
do $$ begin
  if current_database()<>'previous_events_test' then raise exception 'Use disposable previous_events_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
insert into public.events(id,semester_id,title,starts_at,category,calendar_id,calendar_event_id) values
 ('80000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','Previous general',now()-interval '2 days','general','previous-fixture','general'),
 ('80000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','Trailblazers Meeting',now()-interval '1 day','trailblazers','vpresident.ufnsbe@gmail.com','previous-trail'),
 ('80000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','Empty previous',now()-interval '3 days','gbm','previous-fixture','empty'),
 ('80000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','Future attended',now()+interval '7 days','general','previous-fixture','future');
insert into public.attendance(member_id,event_id,source)
select m.id,e.id,'import' from public.members m cross join public.events e where
 (e.id='80000000-0000-0000-0000-000000000001' and m.email in ('alice@ufl.edu','bob@ufl.edu'))
 or (e.id in ('80000000-0000-0000-0000-000000000002','80000000-0000-0000-0000-000000000004') and m.email='alice@ufl.edu');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select public.set_eboard_access((select id from public.members where email='bob@ufl.edu'),true);
do $$ declare mid uuid; aid uuid; begin
  if not exists(select 1 from public.admin_previous_events() where id='80000000-0000-0000-0000-000000000001' and attendee_count=2) then raise exception 'Wrong attendee count'; end if;
  if exists(select 1 from public.admin_previous_events() where id in ('80000000-0000-0000-0000-000000000003','80000000-0000-0000-0000-000000000004')) then raise exception 'Empty or future event shown'; end if;
  if (select count(*) from public.admin_previous_events(null,'trailblazers'))<>1 then raise exception 'Trailblazers filter failed'; end if;
  if exists(select 1 from public.admin_previous_events(gen_random_uuid())) then raise exception 'Semester filter failed'; end if;
  select id into mid from public.members where email='alice@ufl.edu';
  select id into aid from public.attendance where member_id=mid and event_id='80000000-0000-0000-0000-000000000002';
  perform public.correct_member_attendance(mid,'80000000-0000-0000-0000-000000000002',false,aid,'Remove final attendee',gen_random_uuid());
  if exists(select 1 from public.admin_previous_events() where id='80000000-0000-0000-0000-000000000002') then raise exception 'Empty event still listed'; end if;
  if not exists(select 1 from public.events where id='80000000-0000-0000-0000-000000000002') then raise exception 'Event detail no longer available'; end if;
  if not exists(select 1 from public.attendance_corrections where event_id='80000000-0000-0000-0000-000000000002' and previous_attendance->>'id'=aid::text) then raise exception 'Removal provenance lost'; end if;
  perform public.correct_member_attendance(mid,'80000000-0000-0000-0000-000000000002',true,null,'Restore final attendee',gen_random_uuid());
  if not exists(select 1 from public.admin_previous_events() where id='80000000-0000-0000-0000-000000000002' and attendee_count=1 and base_points=0) then raise exception 'Restored Trailblazers event missing or awards points'; end if;
end $$;
reset role;
insert into public.events(semester_id,title,starts_at,category,calendar_id,calendar_event_id)
select '10000000-0000-0000-0000-000000000001','Paged event '||n,now()-interval '10 days','general','previous-paged',n::text from generate_series(1,30) n;
insert into public.attendance(member_id,event_id,source)
select m.id,e.id,'admin' from public.members m cross join public.events e where m.email='alice@ufl.edu' and e.calendar_id='previous-paged';
set local role authenticated;
do $$ declare first_ids uuid[]; second_ids uuid[]; total bigint; begin
  select array_agg(id),max(total_count) into first_ids,total from public.admin_previous_events(null,null,1);
  select array_agg(id) into second_ids from public.admin_previous_events(null,null,2);
  if cardinality(first_ids)<>25 or cardinality(first_ids)+cardinality(second_ids)<>total then raise exception 'Pagination truncates or duplicates events'; end if;
  if exists(select 1 from unnest(first_ids) id where id=any(second_ids)) then raise exception 'Pages overlap'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  if not public.can_manage_event_check_ins() then raise exception 'E-board fixture missing'; end if;
  begin perform * from public.admin_previous_events(); raise exception 'E-board accessed previous event reports'; exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from public.eboard_roles where member_id=(select id from public.members where email='bob@ufl.edu');
set local role authenticated;
do $$ begin
  begin perform * from public.admin_previous_events(); raise exception 'Ordinary member accessed reports'; exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin perform * from public.admin_previous_events(); raise exception 'Anonymous report access'; exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: attendee counts, empty/future exclusion, filters, pagination, last-attendee restoration, audit preservation and admin-only access' as result;
