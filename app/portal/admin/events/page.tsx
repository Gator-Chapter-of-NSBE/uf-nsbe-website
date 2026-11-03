import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'
import { requireEventManager } from '@/lib/portal/session'
import { readAll } from '@/lib/portal/read-all'
import { getCheckInCalendarEvents } from '@/lib/calendar/google'
import { eventDay } from '@/lib/calendar/events'
import type { PortalEvent, Semester } from '@/lib/portal/types'
import { AdminEventForm, CloseCheckInForm, ReopenCheckInForm } from '@/components/events/admin-event-form'

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const { supabase, isAdmin } = await requireEventManager()
  const source = (await searchParams).source === 'trailblazers' ? 'trailblazers' : 'chapter'
  const [calendar, semesters, events, settings] = await Promise.all([
    getCheckInCalendarEvents(source),
    readAll<Semester>((from,to) => supabase.from('semesters').select('*').order('starts_on', { ascending: false }).range(from,to)),
    readAll<PortalEvent>((from,to) => supabase.from('events').select('*').order('starts_at', { ascending: false }).order('id').range(from,to)),
    supabase.rpc('admin_check_in_settings'),
  ])
  const configs = (settings.data ?? []) as { event_id: string; is_open: boolean; closes_at: string }[]
  const configured = events.filter(e => configs.some(c => c.event_id===e.id) && (source==='trailblazers' ? e.category==='trailblazers' : e.category!=='trailblazers'))
  const date = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(value))
  return <Section className="pt-10"><Container className="max-w-3xl">
    <Link href="/portal" className="text-sm underline underline-offset-4">Back to dashboard</Link>
    {isAdmin && <Link href="/portal/admin/members" className="ml-5 text-sm underline underline-offset-4">Manage members</Link>}
    <p className="eyebrow mt-8">{isAdmin ? 'Chapter administration' : 'E-board event management'}</p><h1 className="mt-3 font-serif text-4xl">Event check-in</h1>
    <p className="mt-4 text-muted-foreground">Select a calendar event and open check-in when you’re ready. Members use the existing QR code to visit <Link href="/sign-in" className="underline">/sign-in</Link>. Late arrivals can check in while the event remains open. All times are Gainesville time.</p>
    <nav aria-label="Check-in calendar source" className="mt-6 flex flex-wrap gap-3">
      <Link href="/portal/admin/events" aria-current={source==='chapter' ? 'page' : undefined} className={`rounded-md border px-4 py-3 text-sm ${source==='chapter' ? 'bg-secondary font-medium' : ''}`}>Chapter events</Link>
      <Link href="/portal/admin/events?source=trailblazers" aria-current={source==='trailblazers' ? 'page' : undefined} className={`rounded-md border px-4 py-3 text-sm ${source==='trailblazers' ? 'bg-secondary font-medium' : ''}`}>Trailblazers meetings</Link>
    </nav>
    {source==='trailblazers' && <p className="mt-4 text-sm text-muted-foreground">Only calendar titles containing “Trailblazers” are listed. These meetings track attendance only; CEB meetings are excluded.</p>}
    {settings.error ? <p role="alert" className="mt-6 rounded-xl border p-5">Event check-in is not available yet. Run the event check-in database migration before using this page.</p> : <>
      {calendar.status !== 'ready' ? <p role="alert" className="mt-6 rounded-xl border p-5">This calendar is unavailable. Existing open events still accept check-ins. Confirm the calendar is public and try again shortly.</p> : !semesters.length ? <p className="mt-6">Create the semester in Supabase before opening events.</p> : !calendar.events.length ? <p className="mt-6">No upcoming {source==='trailblazers' ? 'Trailblazers meetings' : 'calendar events'} were found.</p> : <AdminEventForm key={source} source={source} events={calendar.events.map(e => ({ id: e.id, title: e.title, day: eventDay(e) }))} semesters={semesters} />}
      <h2 className="mt-10 font-serif text-2xl">Configured events</h2>
      {!configured.length && <p className="mt-4 text-muted-foreground">No events from this source have been opened for check-in yet.</p>}
      <ul className="mt-5 space-y-4">{configured.map(e => {
        const config = configs.find(c => c.event_id === e.id)!
        const open = config.is_open && Date.parse(config.closes_at) > Date.now()
        return <li key={e.id} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border p-5"><div><h3 className="font-medium">{e.title}</h3><p className="mt-1 text-sm text-muted-foreground">{date(e.starts_at)} · {e.category === 'trailblazers' ? 'Trailblazers attendance only' : e.category === 'gbm' ? 'GBM' : e.category} · {e.base_points} points</p><p className="mt-1 text-sm text-muted-foreground">{e.zone ?? 'Unassigned zone'}</p><p className="mt-2 text-sm">{open ? `Open until ${date(config.closes_at)}` : 'Closed'}</p></div>{open && <CloseCheckInForm id={e.id} />}<ReopenCheckInForm id={e.id} /></li>
      })}</ul>
    </>}
  </Container></Section>
}
