import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Award, CalendarDays, CheckCircle2 } from 'lucide-react'
import { Container, Section, CtaLink } from '@/components/site/primitives'
import { requireMember } from '@/lib/portal/session'
import { summarizeSemester } from '@/lib/portal/rules'
import { readAll } from '@/lib/portal/read-all'
import type {
  Adjustment,
  Attendance,
  PortalEvent,
  Semester,
} from '@/lib/portal/types'
import { signOut } from './actions'
import { resolvePortalView, previewHref } from '@/lib/portal/view'
import { DashboardPreviewSelector, PortalViewShell } from '@/components/portal/portal-view'
import { MembershipHistory } from '@/components/portal/membership-history'
import { EboardAccessPanel } from '@/components/portal/eboard-access-panel'
import { AdminAccountsPanel } from '@/components/portal/admin-accounts-panel'
import { TrailblazersAttendance } from '@/components/portal/trailblazers-attendance'

function eventDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'America/New_York',
  }).format(new Date(value))
}

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ semester?: string; profile?: string; role_search?: string; role_page?: string; preview?: string }>
}) {
  const { supabase, member } = await requireMember()
  if (!member.profile_completed_at) redirect('/portal/profile')
  const query = await searchParams
  const [semesters, events, attendance, adjustments, role, eventAccess] = await Promise.all([
    readAll<Semester>((from, to) =>
      supabase
        .from('semesters')
        .select('*')
        .order('starts_on', { ascending: false })
        .range(from, to),
    ),
    readAll<PortalEvent>((from, to) =>
      supabase
        .from('events')
        .select('id,semester_id,title,starts_at,category,zone,base_points')
        .order('starts_at', { ascending: false })
        .order('id')
        .range(from, to),
    ),
    readAll<Attendance>((from, to) =>
      supabase
        .from('attendance')
        .select('id,event_id,checked_in_at')
        .eq('member_id', member.id)
        .order('id')
        .range(from, to),
    ),
    readAll<Adjustment>((from, to) =>
      supabase
        .from('point_adjustments')
        .select('id,semester_id,points,reason,created_at')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false })
        .order('id')
        .range(from, to),
    ),
    supabase
      .from('admin_roles')
      .select('member_id')
      .eq('member_id', member.id)
      .maybeSingle(),
    supabase.rpc('can_manage_event_check_ins'),
  ])
  if (role.error) throw new Error('Member role could not be loaded.')
  const view=resolvePortalView(Boolean(role.data),eventAccess.data===true,query.preview)
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const current = semesters.find(
    (term) => term.starts_on <= today && term.ends_on >= today,
  )
  const selected =
    semesters.find((term) => term.id === query.semester) ??
    current ??
    semesters[0]
  const summary = selected
    ? summarizeSemester(selected, events, attendance, adjustments)
    : null
  const lifetime = semesters.reduce(
    (total, term) =>
      total + summarizeSemester(term, events, attendance, adjustments).points,
    0,
  )
  const selectedAdjustments = adjustments.filter(
    (row) => row.semester_id === selected?.id,
  )

  return (
    <Section className="pt-10 sm:pt-14">
      <Container>
        {role.data&&<DashboardPreviewSelector key={view.preview??'admin'} preview={view.preview} semester={selected?.id}/>}
        <PortalViewShell view={view}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">
              Member portal{view.showAdmin ? ' / Chapter administrator' : view.showEventManagement ? ' / E-board' : ''}
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              Welcome, {member.full_name.split(' ')[0]}.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your involvement in the Gator Chapter, one event at a time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            {view.showAdmin && <Link href="/portal/admin/active-members" className="text-sm font-medium underline underline-offset-4">Active members</Link>}
            {view.showAdmin && <Link href="/portal/admin/members" className="text-sm font-medium underline underline-offset-4">Manage members</Link>}
            {view.showAdmin && <Link href="/portal/admin/previous-events" className="text-sm font-medium underline underline-offset-4">Manage previous events</Link>}
            {view.showEventManagement && <Link href={previewHref('/portal/admin/events',view.preview)} className="text-sm font-medium underline underline-offset-4">Manage event check-in</Link>}
            {view.showAdmin && <a href="#eboard-access" className="text-sm font-medium underline underline-offset-4">E-board access</a>}
            {view.showAdmin && <a href="#admin-accounts" className="text-sm font-medium underline underline-offset-4">Admin accounts</a>}
            <Link
              href={previewHref('/portal/profile',view.preview)}
              className="text-sm font-medium underline underline-offset-4"
            >
              Edit profile
            </Link>
            <form action={signOut}>
              <button disabled={view.readOnly} className="rounded-md border border-input px-4 py-2 text-sm hover:bg-secondary disabled:opacity-50">
                Sign out
              </button>
            </form>
          </div>
        </div>
        {query.profile === 'saved' && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-nsbe-green/30 bg-nsbe-green/5 p-4 text-sm"
          >
            Your profile has been saved.
          </p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
          <h2 className="font-serif text-2xl">
            {selected?.name ?? 'Your attendance'}
          </h2>
          {semesters.length > 0 && (
            <form className="flex items-center gap-2">
              {view.preview&&<input type="hidden" name="preview" value={view.preview}/>}
              <label htmlFor="semester" className="sr-only">
                Semester
              </label>
              <select
                id="semester"
                name="semester"
                defaultValue={selected?.id}
                className="h-10 max-w-52 rounded-md border border-input bg-background px-3 text-sm"
              >
                {semesters.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
              <button className="h-10 rounded-md border border-input px-3 text-sm hover:bg-secondary">
                View
              </button>
            </form>
          )}
        </div>
        {summary && selected ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Metric
                icon={<Award className="size-5" aria-hidden />}
                title="Semester points"
                value={String(summary.points)}
                detail={`${summary.basePoints} attendance points · ${summary.bonusPoints} admin adjustments`}
              />
              <Metric
                icon={<CheckCircle2 className="size-5" aria-hidden />}
                title="Membership status"
                value={summary.active ? 'Active member' : 'In progress'}
                detail={`${summary.gbms}/2 GBMs · ${summary.qualifyingEvents}/3 qualifying events`}
              />
              <Metric
                icon={<CalendarDays className="size-5" aria-hidden />}
                title="Lifetime points"
                value={String(lifetime)}
                detail="Across all recorded semesters"
              />
            </div>
            <div className="mt-6 rounded-xl border border-border p-5 text-sm text-muted-foreground">
              <p>
                Active membership requires 2 GBMs and 3 qualifying events in the
                same semester.{' '}
                {selected.external_counts_for_membership
                  ? 'General and external events qualify.'
                  : 'General events qualify; external events do not count toward this requirement.'}
              </p>
              <p className="mt-2">
                General events earn 5 points, GBMs 10, and external events 15.
                Attendance bonuses are added by a chapter administrator.
              </p>
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <section aria-labelledby="attendance-heading">
                <h2 id="attendance-heading" className="font-serif text-2xl">
                  Attendance history
                </h2>
                {summary.attended.length ? (
                  <ul className="mt-5 divide-y divide-border rounded-xl border border-border bg-card px-5">
                    {summary.attended.map((event) => (
                      <li
                        key={event.id}
                        className="flex items-start justify-between gap-4 py-5"
                      >
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {eventDate(event.starts_at)} ·{' '}
                            {event.category === 'gbm'
                              ? 'GBM'
                              : event.category === 'external'
                                ? 'External event'
                                : 'General event'}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {event.zone}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-nsbe-green/10 px-3 py-1 text-sm font-medium">
                          +{event.base_points}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState text="No attendance is recorded for this semester yet. If something is missing, contact the chapter." />
                )}
              </section>
              <section aria-labelledby="adjustments-heading">
                <h2 id="adjustments-heading" className="font-serif text-2xl">
                  Bonuses & adjustments
                </h2>
                {selectedAdjustments.length ? (
                  <ul className="mt-5 divide-y divide-border rounded-xl border border-border px-5">
                    {selectedAdjustments.map((row) => (
                      <li
                        key={row.id}
                        className="flex justify-between gap-4 py-5 text-sm"
                      >
                        <div>
                          <p>{row.reason}</p>
                          <p className="mt-1 text-muted-foreground">
                            {eventDate(row.created_at)}
                          </p>
                        </div>
                        <span className="font-medium">
                          {row.points > 0 ? '+' : ''}
                          {row.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState text="No bonuses or adjustments have been added for this semester." />
                )}
              </section>
            </div>
          </>
        ) : (
          <EmptyState text="Your member profile is ready. Attendance and points will appear here once chapter records are available." />
        )}
        <TrailblazersAttendance events={events} attendance={attendance} semester={selected?.id} />
        <MembershipHistory semesters={semesters} events={events} attendance={attendance} adjustments={adjustments} />
        {view.showAdmin && <EboardAccessPanel supabase={supabase} search={query.role_search} page={query.role_page} semester={selected?.id} />}
        {view.showAdmin && <AdminAccountsPanel supabase={supabase} />}
        <div className="mt-12 flex flex-wrap gap-3">
          <CtaLink href={previewHref(selected ? `/portal/leaderboard?semester=${selected.id}` : '/portal/leaderboard',view.preview)} variant="outline">
            Points leaderboard
          </CtaLink>
          <CtaLink href="/events" variant="outline">
            View chapter calendar
          </CtaLink>
          <CtaLink href="/sign-in" variant="primary">
            Event check-in
          </CtaLink>
        </div>
        </PortalViewShell>
      </Container>
    </Section>
  )
}

function Metric({
  icon,
  title,
  value,
  detail,
}: {
  icon: React.ReactNode
  title: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {icon}
        <h3>{title}</h3>
      </div>
      <p className="mt-5 font-serif text-3xl tracking-tight">{value}</p>
      <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="mt-5 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-sm leading-relaxed text-muted-foreground">
      {text}
    </p>
  )
}
