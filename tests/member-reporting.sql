-- Disposable DB only: clone member_management_test into member_reporting_test,
-- apply the reporting migration, then run this file. All fixture changes roll back.
begin;
do $$ begin
  if current_database()<>'member_reporting_test' then raise exception 'Use disposable member_reporting_test'; end if;
end $$;
insert into public.admin_roles(member_id) select id from public.members where email='alice@ufl.edu' on conflict do nothing;
insert into public.members(email,full_name) values ('report-c@ufl.edu','Unclaimed C'),('report-d@ufl.edu','Adjustment Only'),('no-activity@ufl.edu','No Activity');
insert into public.semesters(id,name,starts_on,ends_on,external_counts_for_membership) values
 ('90000000-0000-0000-0000-000000000001','Reporting A','2027-01-01','2027-06-30',false),
 ('90000000-0000-0000-0000-000000000002','Reporting B','2027-07-01','2027-12-31',true),
 ('90000000-0000-0000-0000-000000000003','Empty','2028-01-01','2028-06-30',false);
insert into public.events(semester_id,title,starts_at,category,zone,calendar_id,calendar_event_id)
select s.id,'Report event '||n,case when s.name='Reporting A' then '2027-02-01'::timestamptz else '2027-08-01'::timestamptz end,
  case when n<=2 then 'gbm' when n<=5 then 'general' else 'external' end,null,'report-test',s.id::text||':'||n
from public.semesters s cross join generate_series(1,6) n where s.name in ('Reporting A','Reporting B');
insert into public.attendance(member_id,event_id,source)
select m.id,e.id,'admin' from public.members m cross join public.events e
where e.calendar_id='report-test' and (
 (m.email in ('alice@ufl.edu','bob@ufl.edu') and e.semester_id='90000000-0000-0000-0000-000000000001' and e.title<>'Report event 6')
 or (m.email='report-c@ufl.edu' and e.title<>'Report event 5'));
insert into public.point_adjustments(member_id,semester_id,points,reason)
select id,'90000000-0000-0000-0000-000000000001',10,'Report bonus' from public.members where email='alice@ufl.edu';
insert into public.point_adjustments(member_id,semester_id,points,reason)
select id,'90000000-0000-0000-0000-000000000001',-5,'Report reversal' from public.members where email='alice@ufl.edu';
insert into public.point_adjustments(member_id,semester_id,points,reason)
select id,'90000000-0000-0000-0000-000000000001',5,'Report bonus' from public.members where email='bob@ufl.edu';
insert into public.point_adjustments(member_id,semester_id,points,reason)
select id,'90000000-0000-0000-0000-000000000001',-10,'Report deduction' from public.members where email='report-d@ufl.edu';
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',true);
do $$ declare own record; begin
  if (select count(*) from public.semester_leaderboard('90000000-0000-0000-0000-000000000001'))<>4 then raise exception 'Wrong participation scope'; end if;
  select * into own from public.semester_leaderboard('90000000-0000-0000-0000-000000000001') where is_you;
  if own.rank<>2 or own.points<>40 then raise exception 'Own rank or total wrong'; end if;
  if (select count(*) from public.semester_leaderboard('90000000-0000-0000-0000-000000000001') where rank=2)<>2 then raise exception 'Tie rank wrong'; end if;
  if not exists(select 1 from public.semester_leaderboard('90000000-0000-0000-0000-000000000001') where rank=4 and points=-10) then raise exception 'Negative adjustment or competition rank wrong'; end if;
  if exists(select 1 from public.semester_leaderboard('90000000-0000-0000-0000-000000000001') r where to_jsonb(r) ?| array['email','member_id','ufid','nsbe_id']) then raise exception 'Leaderboard leaked private columns'; end if;
  if (select count(*) from public.members)<>1 then raise exception 'Member policy broadened'; end if;
  begin perform * from public.active_semester_members('90000000-0000-0000-0000-000000000001'); raise exception 'Member read admin report'; exception when insufficient_privilege then null; end;
  begin perform * from reporting_private.semester_totals('90000000-0000-0000-0000-000000000001'); raise exception 'Private helper exposed'; exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
do $$ begin
  if (select count(*) from public.active_semester_members('90000000-0000-0000-0000-000000000001'))<>2 then raise exception 'External false policy wrong'; end if;
  if exists(select 1 from public.active_semester_members('90000000-0000-0000-0000-000000000001') where gbms<>2 or qualifying_events<>3 or points<>40) then raise exception 'Aggregation multiplied records'; end if;
  if not exists(select 1 from public.active_semester_members('90000000-0000-0000-0000-000000000002') where email='report-c@ufl.edu' and gbms=2 and qualifying_events=3 and points=45) then raise exception 'External true policy or unclaimed member missing'; end if;
  if exists(select 1 from public.semester_leaderboard('90000000-0000-0000-0000-000000000003')) or exists(select 1 from public.active_semester_members('90000000-0000-0000-0000-000000000003')) then raise exception 'Empty term not empty'; end if;
end $$;
reset role;
delete from public.attendance where member_id=(select id from public.members where email='alice@ufl.edu') and event_id=(select id from public.events where semester_id='90000000-0000-0000-0000-000000000001' and title='Report event 1');
set local role authenticated;
do $$ begin
  if (select count(*) from public.active_semester_members('90000000-0000-0000-0000-000000000001'))<>1 then raise exception 'Correction not reflected'; end if;
end $$;
set local role anon;
do $$ begin
  begin perform * from public.semester_leaderboard('90000000-0000-0000-0000-000000000001'); raise exception 'Anonymous leaderboard access'; exception when insufficient_privilege then null; end;
  begin perform * from public.active_semester_members('90000000-0000-0000-0000-000000000001'); raise exception 'Anonymous export data access'; exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: reporting totals, ties, privacy, own rank, term scope, external policy, unclaimed members, corrections and empty reports' as result;
