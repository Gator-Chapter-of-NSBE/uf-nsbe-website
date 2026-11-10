import { PortalViewShell } from '@/components/portal/portal-view'
import { previewHref } from '@/lib/portal/view'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { randomUUID } from 'node:crypto'
import { Container, Section } from '@/components/site/primitives'
import { MemberManagementForm } from '@/components/portal/member-management-form'
import { requireParticipationViewer } from '@/lib/portal/session'
import { readAll } from '@/lib/portal/read-all'
import { fieldClass } from '@/lib/check-in'
import { attendanceEventDate, categoryLabel, filterAttendees, type EventAttendee } from '@/lib/portal/event-attendance'
import type { PortalEvent } from '@/lib/portal/types'

type Match = { id: string; full_name: string; email: string; total_count: number }
type Correction = { id: string; action: string; reason: string; actor_email: string; created_at: string; member: { full_name: string; email: string } | null }

export default async function PreviousEventDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ attendee?: string; member_search?: string; member_page?: string; preview?: string }>
}) {
  const query = await searchParams
  const { supabase, view, isAdmin } = await requireParticipationViewer(query.preview)
  const canEdit=isAdmin&&view.showAdmin&&!view.readOnly
  const { id } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound()
  const attendeeSearch = typeof query.attendee==='string' ? query.attendee.trim().slice(0,120) : ''
  const memberSearch = typeof query.member_search==='string' ? query.member_search.trim().slice(0,120) : ''
  const memberPage = Math.max(1,Math.min(10000,Math.floor(Number(query.member_page)||1)))
  const { data, error } = await supabase.from('events')
    .select('id,title,starts_at,category,zone,base_points,semester_id,semester:semesters(name)')
    .eq('id',id).maybeSingle()
  if (error) throw new Error('Event could not be loaded.')
  if (!data) notFound()
  const event = data as unknown as PortalEvent & { semester: { name: string } | null }
  if (Date.parse(event.starts_at)>Date.now()) notFound()
  const [attendees, matchesResult, history] = await Promise.all([
    canEdit ? readAll<EventAttendee>((a,b)=>supabase.from('attendance')
      .select('id,member_id,checked_in_at,source,member:members(full_name,email)')
      .eq('event_id',id).order('id').range(a,b)) : readAll<{id:string;member_id:string;checked_in_at:string;source:string;full_name:string;email:string}>((a,b)=>supabase.rpc('participation_event_attendees',{p_event:id}).range(a,b)).then(rows=>rows.map(({full_name,email,...row})=>({...row,member:{full_name,email}}))),
    canEdit && memberSearch ? supabase.rpc('search_chapter_members',{p_query:memberSearch,p_page:memberPage}) : Promise.resolve({data:[],error:null}),
    canEdit ? supabase.from('attendance_corrections').select('id,action,reason,actor_email,created_at,member:members(full_name,email)')
      .eq('event_id',id).order('created_at',{ascending:false}).order('id').limit(100) : Promise.resolve({data:[],error:null}),
  ])
  const matches = (matchesResult.data??[]) as Match[]
  const corrections = (history.data??[]) as unknown as Correction[]
  const visible = filterAttendees(attendees,attendeeSearch)
  const memberHref = (page: number) => `/portal/admin/previous-events/${id}?${new URLSearchParams({attendee:attendeeSearch,member_search:memberSearch,member_page:String(page)})}#add-attendee`
  return <Section className="pt-10"><Container className="max-w-4xl"><PortalViewShell view={view}>
    <Link href={previewHref('/portal/admin/previous-events',view.preview)} className="text-sm underline underline-offset-4">Back to previous events</Link>
    <p className="eyebrow mt-8">{view.showAdmin?'Chapter administration':'E-board participation review'}</p><h1 className="mt-3 break-words font-serif text-4xl">{event.title}</h1>
    <p className="mt-3 text-muted-foreground">{attendanceEventDate(event.starts_at)} · {event.semester?.name} · Gainesville time</p>
    <p className="mt-2 text-sm text-muted-foreground">{categoryLabel(event.category)} · {event.category==='trailblazers'?'Attendance only — no points or active-membership credit':`${event.base_points} points per attendee`}{event.zone?` · ${event.zone}`:''}</p>
    <p className="mt-6 font-serif text-2xl">{attendees.length} attendee{attendees.length===1?'':'s'}</p>
    {!attendees.length&&<p role="status" className="mt-4 rounded-xl border p-5 text-sm">This event has no attendees and is hidden from the previous-events directory. {canEdit?'This page remains available so you can restore attendance if needed.':'The event record remains available for review.'}</p>}
    {!canEdit&&<p className="mt-4 text-sm text-muted-foreground">E-board participation access is read-only. Only administrators can change attendance or points.</p>}
    <section className="mt-8" aria-labelledby="attendees-heading">
      <h2 id="attendees-heading" className="font-serif text-2xl">Attendees</h2>
      <form className="mt-5 flex flex-wrap gap-3">{view.preview&&<input type="hidden" name="preview" value={view.preview}/>}
        {memberSearch&&<input type="hidden" name="member_search" value={memberSearch}/>}
        <label className="min-w-0 flex-1"><span className="sr-only">Search attendees by name or UF email</span><input name="attendee" defaultValue={attendeeSearch} maxLength={120} placeholder="Search attendees by name or UF email" className={fieldClass}/></label><button className="min-h-11 rounded-md border px-4 text-sm">Search attendees</button>
      </form>
      {attendeeSearch&&<p className="mt-3 text-sm text-muted-foreground">{visible.length} matching attendee{visible.length===1?'':'s'} of {attendees.length}</p>}
      <ul className="mt-5 space-y-4">{visible.map(a=><li key={a.id} className="rounded-xl border p-5">
        <Link href={previewHref(`/portal/admin/members/${a.member_id}?semester=${event.semester_id}`,view.preview)} className="break-words font-medium underline underline-offset-4">{a.member?.full_name||'Name not provided'}</Link>
        <p className="mt-1 break-all text-sm text-muted-foreground">{a.member?.email??'Member details unavailable'}</p>
        <p className="mt-2 text-xs text-muted-foreground">Recorded {attendanceEventDate(a.checked_in_at)} · {a.source==='check_in'?'Event check-in':a.source==='import'?'Imported attendance':'Admin correction'}</p>
        {canEdit&&!history.error&&<details className="mt-4"><summary className="cursor-pointer text-sm font-medium">Remove this attendee</summary><MemberManagementForm member={a.member_id} operation="remove" event={id} attendance={a.id} request={randomUUID()} attendanceOnly={event.category==='trailblazers'}/></details>}
      </li>)}</ul>
      {!visible.length&&attendees.length>0&&<p className="mt-4 text-sm text-muted-foreground">No attendees match that search.</p>}
    </section>
    {canEdit&&<section id="add-attendee" className="mt-10 scroll-mt-24" aria-labelledby="add-attendee-heading">
      <h2 id="add-attendee-heading" className="font-serif text-2xl">Add an attendee</h2>
      <p className="mt-3 text-sm text-muted-foreground">Search existing members by name or UF email. A reason is required for each addition.</p>
      <form className="mt-5 flex flex-wrap gap-3" action={`/portal/admin/previous-events/${id}#add-attendee`}>
        {attendeeSearch&&<input type="hidden" name="attendee" value={attendeeSearch}/>}
        <label className="min-w-0 flex-1"><span className="sr-only">Find a member to add</span><input name="member_search" defaultValue={memberSearch} maxLength={120} placeholder="Find a member to add" className={fieldClass}/></label><button className="min-h-11 rounded-md border px-4 text-sm">Find member</button>
      </form>
      {matchesResult.error?<p role="alert" className="mt-4 text-sm text-destructive">Member search is unavailable. Please try again.</p>:memberSearch&&<>
        {!matches.length&&<p className="mt-4 text-sm text-muted-foreground">No matching members. Only existing chapter members can be added here.</p>}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">{matches.map(m=><li key={m.id} className="rounded-xl border p-5"><p className="break-words font-medium">{m.full_name||'Name not provided'}</p><p className="mt-1 break-all text-sm text-muted-foreground">{m.email}</p>{attendees.some(a=>a.member_id===m.id)?<p className="mt-3 text-sm">Already attending</p>:!history.error&&<MemberManagementForm member={m.id} operation="add" event={id} request={randomUUID()}/>}</li>)}</ul>
        <nav aria-label="Member search pages" className="mt-4 flex gap-5">{memberPage>1&&<Link href={memberHref(memberPage-1)} className="text-sm underline">Previous</Link>}{matches.length>0&&memberPage*25<Number(matches[0].total_count)&&<Link href={memberHref(memberPage+1)} className="text-sm underline">Next</Link>}</nav>
      </>}
    </section>
    }
    {canEdit&&<section className="mt-10"><h2 className="font-serif text-2xl">Attendance correction history</h2>
      {history.error?<p role="alert" className="mt-4 rounded-xl border p-5">Correction history is unavailable. Attendance editing is disabled until it can be loaded.</p>:<>
        <p className="mt-3 text-xs text-muted-foreground">Latest 100 corrections for this event. The full audit remains in the database.</p>
        <ul className="mt-4 space-y-3">{corrections.map(c=><li key={c.id} className="rounded-xl border p-5"><p className="break-words font-medium">{c.action==='add'?'Added':'Removed'}: {c.member?.full_name||c.member?.email||'Member'}</p>{c.member?.email&&<p className="mt-1 break-all text-sm text-muted-foreground">{c.member.email}</p>}<p className="mt-2 break-words text-sm">{c.reason}</p><p className="mt-2 break-words text-xs text-muted-foreground">{attendanceEventDate(c.created_at)} · {c.actor_email}</p></li>)}</ul>
        {!corrections.length&&<p className="mt-4 text-sm text-muted-foreground">No corrections have been recorded for this event.</p>}
      </>}
    </section>
    }
  </PortalViewShell></Container></Section>
}
