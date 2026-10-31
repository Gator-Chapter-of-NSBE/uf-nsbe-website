-- DESTRUCTIVE FIXTURE: only an empty, disposable DB named portal_security_test.
-- Run with psql -X -v ON_ERROR_STOP=1 -d portal_security_test -f this-file.sql.
do $$ begin
  if current_database() <> 'portal_security_test' then raise exception 'Use an isolated portal_security_test database'; end if;
end $$;

create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
create table auth.identities (user_id uuid references auth.users(id), provider text, identity_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated, anon;
grant execute on function auth.uid() to authenticated, anon;

\ir ../supabase/migrations/202610180001_portal_foundation.sql

insert into auth.users values
 ('00000000-0000-0000-0000-000000000001', 'alice@ufl.edu', now()),
 ('00000000-0000-0000-0000-000000000002', 'bob@ufl.edu', now()),
 ('00000000-0000-0000-0000-000000000003', 'outsider@gmail.com', now()),
 ('00000000-0000-0000-0000-000000000004', 'unverified@ufl.edu', null),
 ('00000000-0000-0000-0000-000000000005', 'password@ufl.edu', now()),
 ('00000000-0000-0000-0000-000000000006', 'mismatch@ufl.edu', now());
insert into auth.identities
select id, 'google', jsonb_build_object('email', email, 'email_verified', true)
from auth.users where email not in ('password@ufl.edu', 'mismatch@ufl.edu');
insert into auth.identities values
 ('00000000-0000-0000-0000-000000000005', 'email', '{"email":"password@ufl.edu","email_verified":true}'),
 ('00000000-0000-0000-0000-000000000006', 'google', '{"email":"someoneelse@ufl.edu","email_verified":true}');

insert into public.members(email, full_name, major) values ('alice@ufl.edu', 'Imported Alice', 'Engineering');
insert into public.semesters(id, name, starts_on, ends_on) values ('10000000-0000-0000-0000-000000000001', 'Test term', '2026-08-01', '2026-12-31');
insert into public.events(id, semester_id, title, starts_at, category, zone) values
 ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Test GBM', '2026-10-01T18:00:00-04:00', 'gbm', 'Membership Zone');
insert into public.attendance(member_id, event_id, source)
select id, '20000000-0000-0000-0000-000000000001', 'import' from public.members where email = 'alice@ufl.edu';

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$ declare m public.members; begin
  m := public.claim_member();
  if m.full_name <> 'Imported Alice' or m.major <> 'Engineering' then raise exception 'Claim overwrote imported profile'; end if;
  if (select count(*) from public.attendance) <> 1 then raise exception 'Imported attendance missing'; end if;
  perform public.claim_member();
  if (select count(*) from public.members) <> 1 then raise exception 'Claim not idempotent'; end if;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
select (public.claim_member()).email;
do $$ begin
  if (select count(*) from public.members) <> 1 then raise exception 'Member data leaked'; end if;
  if exists (select 1 from public.attendance) then raise exception 'Attendance leaked'; end if;
  update public.members set full_name = 'Bob' where auth_user_id = auth.uid();
  update public.members set full_name = 'Hacked' where email = 'alice@ufl.edu';
  if found then raise exception 'Cross-member edit allowed'; end if;
  begin
    update public.members set email = 'alice@ufl.edu';
    raise exception 'Identity edit allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.admin_roles(member_id) select id from public.members;
    raise exception 'Self-promotion allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.attendance(member_id,event_id,source) select id,'20000000-0000-0000-0000-000000000001','admin' from public.members;
    raise exception 'Self-awarded attendance allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.point_adjustments(member_id,semester_id,points,reason) select id,'10000000-0000-0000-0000-000000000001',50,'Fake bonus' from public.members;
    raise exception 'Self-awarded points allowed';
  exception when insufficient_privilege then null; end;
end $$;

-- Every unauthorized identity must see no data and fail the claim RPC.
do $$ declare uid text; begin
  foreach uid in array array['00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006'] loop
    perform set_config('request.jwt.claim.sub', uid, false);
    if public.is_portal_user() then raise exception 'Unauthorized identity passed'; end if;
    if exists (select 1 from public.members) or exists (select 1 from public.events) or exists (select 1 from public.attendance) then raise exception 'Unauthorized read'; end if;
    begin
      perform public.claim_member();
      raise exception 'Unauthorized claim';
    exception when insufficient_privilege then null; end;
  end loop;
end $$;

reset role;
insert into public.admin_roles(member_id) select id from public.members where email = 'alice@ufl.edu';
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$ begin
  if not public.is_portal_admin() then raise exception 'Admin not recognized'; end if;
  if (select count(*) from public.members) <> 2 then raise exception 'Admin read failed'; end if;
  insert into public.point_adjustments(member_id,semester_id,points,reason,created_by)
  select id,'10000000-0000-0000-0000-000000000001',10,'Approved bonus','00000000-0000-0000-0000-000000000002' from public.members where email = 'bob@ufl.edu';
  if (select created_by from public.point_adjustments limit 1) <> auth.uid() then raise exception 'Audit actor spoofed'; end if;
  begin
    update public.point_adjustments set points = 999;
    raise exception 'Adjustment history editable';
  exception when insufficient_privilege then null; end;
  begin
    update public.members set auth_user_id = auth.uid() where email = 'bob@ufl.edu';
    raise exception 'Admin identity takeover allowed';
  exception when insufficient_privilege then null; end;
end $$;

reset role;
delete from public.admin_roles;
set role authenticated;
do $$ begin if public.is_portal_admin() then raise exception 'Admin revocation did not take effect'; end if; end $$;
reset role;
set role anon;
do $$ begin
  begin perform public.claim_member(); raise exception 'Anonymous claim allowed'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.members; raise exception 'Anonymous read allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'Portal database permission tests passed' as result;
