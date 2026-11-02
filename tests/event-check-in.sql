-- Run only after cloning portal_security_test into event_check_in_test and applying
-- the optional-zone and event-check-in migrations. Entire fixture rolls back.
begin;
do $$ begin
  if current_database()<>'event_check_in_test' then raise exception 'Use disposable event_check_in_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ begin
  begin
    perform public.configure_event_check_in('10000000-0000-0000-0000-000000000001','Unsafe','2026-11-01','gbm',null,'test-calendar','bad','secret12',4);
    raise exception 'Non-admin opened check-in';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select public.configure_event_check_in('10000000-0000-0000-0000-000000000001','Check-in test','2026-11-01T18:00:00-05:00','general',null,'test-calendar','check-in-test','secret12',4);
-- Reopening with an empty password parameter preserves the previous hash.
select public.configure_event_check_in('10000000-0000-0000-0000-000000000001','Check-in test','2026-11-01T18:00:00-05:00','general',null,'test-calendar','check-in-test',null,4);
set local role anon;
do $$ declare eid uuid; result text; begin
  select id into eid from public.open_check_in_events() where title='Check-in test';
  if eid is null then raise exception 'Open event missing'; end if;
  begin perform * from check_in_private.settings; raise exception 'Password storage exposed';
    exception when insufficient_privilege then null; end;
  begin perform * from public.members; raise exception 'Members exposed to anon';
    exception when insufficient_privilege then null; end;
  if public.submit_event_check_in(eid,'bad@gmail.com','Test','secret12')<>'invalid' then raise exception 'Non-UF accepted'; end if;
  if public.submit_event_check_in(eid,'alice@ufl.edu','Overwrite attempt','wrong')<>'password' then raise exception 'Wrong password accepted'; end if;
  if public.submit_event_check_in(eid,'alice@ufl.edu','Overwrite attempt','secret12')<>'success' then raise exception 'Existing member check-in failed'; end if;
  if public.submit_event_check_in(eid,' NewMember@UFL.edu ','New Member','secret12')<>'success' then raise exception 'New member failed'; end if;
  if public.submit_event_check_in(eid,'newmember@ufl.edu','Changed Name','secret12')<>'success' then raise exception 'Duplicate failed'; end if;
  for i in 1..8 loop perform public.submit_event_check_in(eid,'limited@ufl.edu','Test','wrong'); end loop;
  if public.submit_event_check_in(eid,'limited@ufl.edu','Test','secret12')<>'rate_limited' then raise exception 'No attempt limit'; end if;
end $$;
reset role;
do $$ declare eid uuid; begin
  select id into eid from public.events where calendar_event_id='check-in-test';
  if (select count(*) from public.attendance where event_id=eid)<>2 then raise exception 'Duplicate attendance or missing rows'; end if;
  if (select full_name from public.members where email='newmember@ufl.edu')<>'New Member' then raise exception 'Check-in overwrote name'; end if;
  if (select full_name from public.members where email='alice@ufl.edu')='Overwrite attempt' then raise exception 'Existing profile overwritten'; end if;
  if exists(select 1 from public.members where email='limited@ufl.edu') then raise exception 'Bad password created member'; end if;
  update check_in_private.settings set closes_at=now()-interval '1 second' where event_id=eid;
  if public.submit_event_check_in(eid,'late@ufl.edu','Late','secret12')<>'closed' then raise exception 'Expired check-in accepted'; end if;
  update check_in_private.settings set closes_at=now()+interval '1 hour' where event_id=eid;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
select public.close_event_check_in(id) from public.open_check_in_events() where title='Check-in test';
reset role;
do $$ begin
  if exists(select 1 from public.open_check_in_events() where title='Check-in test') then raise exception 'Closed event listed'; end if;
end $$;
-- First login claims the exact existing member; attendance remains attached.
insert into auth.users values('00000000-0000-0000-0000-000000000099','newmember@ufl.edu',now());
insert into auth.identities values('00000000-0000-0000-0000-000000000099','google','{"email":"newmember@ufl.edu","email_verified":true}');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000099',true);
select (public.claim_member()).email;
do $$ begin
  if (select count(*) from public.attendance)<>1 then raise exception 'Claim lost attendance or leaked other members'; end if;
end $$;
rollback;
select 'PASS: admin authorization, password, duplicates, profile preservation, attempt limits, expiry, close, claim and RLS' as result;
