-- Disposable previous_event_search_test cloned from previous_events_test.
-- Apply the search migration first. Fixture data rolls back.
begin;
do $$ begin
  if current_database()<>'previous_event_search_test' then raise exception 'Use disposable previous_event_search_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
insert into public.events(semester_id,title,starts_at,category,calendar_id,calendar_event_id)
select '10000000-0000-0000-0000-000000000001','Search Workshop '||n,now()-interval '1 day','general','event-search-test',n::text
from generate_series(1,31) n;
insert into public.events(semester_id,title,starts_at,category,calendar_id,calendar_event_id)
values('10000000-0000-0000-0000-000000000001','Budget %_ 2026',now()-interval '1 day','gbm','event-search-test','literal');
insert into public.attendance(member_id,event_id,source)
select m.id,e.id,'admin' from public.members m cross join public.events e
where m.email='alice@ufl.edu' and e.calendar_id='event-search-test';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ declare count_page integer; total bigint; begin
  select count(*),max(total_count) into count_page,total from public.admin_previous_events(null,null,1,'search WORKSHOP');
  if count_page<>25 or total<>31 then raise exception 'Case-insensitive search count or first page wrong'; end if;
  select count(*),max(total_count) into count_page,total from public.admin_previous_events(null,null,2,'search WORKSHOP');
  if count_page<>6 or total<>31 then raise exception 'Search pagination totals wrong'; end if;
  if (select count(*) from public.admin_previous_events(null,null,1,' %_ '))<>1 then raise exception 'Search treated literal wildcard text as a pattern'; end if;
  if exists(select 1 from public.admin_previous_events(null,'gbm',1,'Workshop')) then raise exception 'Search/category intersection failed'; end if;
  if exists(select 1 from public.admin_previous_events(gen_random_uuid(),null,1,'Workshop')) then raise exception 'Search/semester intersection failed'; end if;
  if exists(select 1 from public.admin_previous_events(null,null,2147483647,'Workshop')) then raise exception 'Out-of-range page should return empty'; end if;
  if exists(select 1 from public.admin_previous_events(null,null,1,'unknown event title')) then raise exception 'No-match search returned events'; end if;
  perform * from public.admin_previous_events(null,null,1); -- original three-argument callers remain supported
end $$;
select public.set_eboard_access((select id from public.members where email='bob@ufl.edu'),true);
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  begin perform * from public.admin_previous_events(null,null,1,'Workshop'); raise exception 'E-board can search private event directory'; exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin perform * from public.admin_previous_events(null,null,1,'Workshop'); raise exception 'Anonymous event search'; exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: literal title search, combined filters, pagination totals, large offsets, compatibility and permissions' as result;
