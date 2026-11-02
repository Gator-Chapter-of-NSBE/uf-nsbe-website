-- Historical attendance was approved without zone assignments.
-- The existing CHECK still restricts non-NULL zones to the six chapter zones.
alter table public.events alter column zone drop not null;
