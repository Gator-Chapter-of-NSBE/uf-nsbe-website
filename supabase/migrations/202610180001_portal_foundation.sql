-- Run once in the Supabase SQL editor (or via supabase db push).
begin;

create table public.members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@ufl[.]edu$'),
  full_name text not null default '' check (char_length(full_name) <= 120),
  major text not null default '' check (char_length(major) <= 120),
  classification text not null default '' check (classification in ('', 'Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate student', 'Other')),
  nsbe_id text check (char_length(nsbe_id) <= 40),
  ufid text check (ufid ~ '^[0-9]{8}$'),
  joined_on date,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  starts_on date not null,
  ends_on date not null check (ends_on >= starts_on),
  -- Explicit policy decision per term; no assumption about external eligibility.
  external_counts_for_membership boolean not null default false,
  constraint semesters_no_overlap exclude using gist (daterange(starts_on, ends_on, '[]') with &&)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  semester_id uuid not null references public.semesters(id),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  starts_at timestamptz not null,
  category text not null check (category in ('general', 'gbm', 'external')),
  zone text not null check (zone in ('Admin Zone', 'Programs Zone', 'Finance Zone', 'Membership Zone', 'Communication Zone', 'Senate Zone')),
  base_points integer generated always as (case category when 'general' then 5 when 'gbm' then 10 when 'external' then 15 end) stored,
  calendar_id text,
  calendar_event_id text,
  created_at timestamptz not null default now(),
  unique (calendar_id, calendar_event_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  event_id uuid not null references public.events(id),
  checked_in_at timestamptz not null default now(),
  source text not null check (source in ('import', 'admin', 'check_in')),
  source_reference text unique,
  unique (member_id, event_id)
);

create table public.admin_roles (
  member_id uuid primary key references public.members(id),
  granted_at timestamptz not null default now()
);

create table public.point_adjustments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id),
  semester_id uuid not null references public.semesters(id),
  points integer not null check (points <> 0),
  reason text not null check (char_length(btrim(reason)) between 1 and 500),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index events_semester_idx on public.events(semester_id);
create index attendance_event_idx on public.attendance(event_id);
create index adjustments_member_semester_idx on public.point_adjustments(member_id, semester_id);

-- Read trusted auth tables, never user-editable profile metadata or a submitted email.
create function public.is_portal_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u join auth.identities i on i.user_id = u.id
    where u.id = auth.uid() and u.email_confirmed_at is not null
      and lower(u.email) ~ '^[^[:space:]@]+@ufl[.]edu$'
      and i.provider = 'google'
      and lower(i.identity_data->>'email') = lower(u.email)
      and i.identity_data->>'email_verified' = 'true'
  );
$$;

create function public.is_portal_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_portal_user() and exists (
    select 1 from public.admin_roles r join public.members m on m.id = r.member_id
    where m.auth_user_id = auth.uid()
  );
$$;

-- Historical members may have no auth account. Only their verified owner can claim them.
create function public.claim_member() returns public.members
language plpgsql security definer set search_path = '' as $$
declare
  verified_email text;
  result public.members;
begin
  if not public.is_portal_user() then
    raise exception 'Verified UF Google account required' using errcode = '42501';
  end if;
  select lower(btrim(email)) into verified_email from auth.users where id = auth.uid();
  insert into public.members(email, auth_user_id)
  values (verified_email, auth.uid())
  on conflict (email) do update set auth_user_id = excluded.auth_user_id
    where members.auth_user_id is null or members.auth_user_id = excluded.auth_user_id
  returning * into result;
  if result.id is null then
    raise exception 'Member record already linked' using errcode = '42501';
  end if;
  return result;
end;
$$;

-- Adjustments are append-only. Corrections use an opposite entry with a reason.
create function public.stamp_adjustment() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.created_by := auth.uid();
  new.created_at := now();
  return new;
end;
$$;
create trigger stamp_adjustment before insert on public.point_adjustments
for each row execute function public.stamp_adjustment();

alter table public.members enable row level security;
alter table public.semesters enable row level security;
alter table public.events enable row level security;
alter table public.attendance enable row level security;
alter table public.admin_roles enable row level security;
alter table public.point_adjustments enable row level security;

revoke all on public.members, public.semesters, public.events, public.attendance, public.admin_roles, public.point_adjustments from anon, authenticated;
grant select on public.members, public.semesters, public.events, public.attendance, public.admin_roles, public.point_adjustments to authenticated;
-- No API caller can modify email, account links, joined date, or administrative roles.
grant update (full_name, major, classification, nsbe_id, ufid, profile_completed_at) on public.members to authenticated;
grant insert, update, delete on public.semesters, public.events, public.attendance to authenticated;
grant insert on public.point_adjustments to authenticated;

create policy members_read on public.members for select to authenticated
using (public.is_portal_user() and (auth_user_id = auth.uid() or public.is_portal_admin()));
create policy members_edit on public.members for update to authenticated
using (public.is_portal_user() and (auth_user_id = auth.uid() or public.is_portal_admin()))
with check (public.is_portal_user() and (auth_user_id = auth.uid() or public.is_portal_admin()));

create policy semesters_read on public.semesters for select to authenticated using (public.is_portal_user());
create policy semesters_admin on public.semesters for all to authenticated using (public.is_portal_admin()) with check (public.is_portal_admin());
create policy events_read on public.events for select to authenticated using (public.is_portal_user());
create policy events_admin on public.events for all to authenticated using (public.is_portal_admin()) with check (public.is_portal_admin());

create policy attendance_read on public.attendance for select to authenticated
using (public.is_portal_user() and (public.is_portal_admin() or exists (select 1 from public.members m where m.id = member_id and m.auth_user_id = auth.uid())));
create policy attendance_admin on public.attendance for all to authenticated using (public.is_portal_admin()) with check (public.is_portal_admin());
create policy roles_read on public.admin_roles for select to authenticated
using (public.is_portal_admin() or exists (select 1 from public.members m where m.id = member_id and m.auth_user_id = auth.uid() and public.is_portal_user()));
create policy adjustments_read on public.point_adjustments for select to authenticated
using (public.is_portal_user() and (public.is_portal_admin() or exists (select 1 from public.members m where m.id = member_id and m.auth_user_id = auth.uid())));
create policy adjustments_admin_insert on public.point_adjustments for insert to authenticated with check (public.is_portal_admin());

revoke all on function public.is_portal_user(), public.is_portal_admin(), public.claim_member(), public.stamp_adjustment() from public, anon, authenticated;
grant execute on function public.is_portal_user(), public.is_portal_admin(), public.claim_member() to authenticated;

commit;
