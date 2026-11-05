import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Container, Section } from '@/components/site/primitives'
import { requireAdmin } from '@/lib/portal/session'
import { readAll } from '@/lib/portal/read-all'
import { fieldClass } from '@/lib/check-in'
import { categoryLabel, attendanceEventDate, eventCategories, parsePage } from '@/lib/portal/event-attendance'
import { EventPagination } from '@/components/portal/event-pagination'
import type { PortalEvent, Semester } from '@/lib/portal/types'

type PreviousEvent = PortalEvent & { semester_name: string; attendee_count: number; total_count: number }
export default async function PreviousEventsPage({ searchParams }: {
  searchParams: Promise<{ semester?: string; category?: string; page?: string; q?: string }>
}) {
  const { supabase } = await requireAdmin()
  const query=await searchParams
  const semesters=await readAll<Semester>((a,b)=>supabase.from('semesters').select('*').order('starts_on',{ascending:false}).range(a,b))
  const semester=semesters.find(s=>s.id===query.semester)?.id ?? ''
  const category=eventCategories.find(c=>c.value===query.category)?.value ?? ''
  const search=typeof query.q==='string'?query.q.trim().slice(0,120):''
  const page=parsePage(query.page)
  const filters={q:search,semester,category}
  const fetchPage=(n:number)=>supabase.rpc('admin_previous_events',{p_semester:semester||null,p_category:category||null,p_page:n,p_query:search})
  const { data,error }=await fetchPage(page)
  if (!error && !data?.length && page>1) {
    // A stale bookmark or an attendance removal can leave the requested page empty.
    const first=await fetchPage(1)
    if (first.error) throw new Error('Previous events could not be loaded.')
    const last=Math.max(1,Math.ceil(Number(first.data?.[0]?.total_count??0)/25))
    const target=Math.min(page,last)
    redirect(`/portal/admin/previous-events?${new URLSearchParams({...filters,page:String(target===page?1:target)})}`)
  }
  const events=(data??[]) as PreviousEvent[]
  const total=Number(events[0]?.total_count??0)
  return <Section className="pt-10"><Container className="max-w-4xl">
    <Link href="/portal" className="text-sm underline underline-offset-4">Back to dashboard</Link>
    <p className="eyebrow mt-8">Chapter administration</p><h1 className="mt-3 font-serif text-4xl">Manage previous events</h1>
    <p className="mt-4 text-muted-foreground">Review events with recorded attendance and manage their attendee lists. Events appear once they have started and have at least one attendee. All times are Gainesville time.</p>
    <form className="mt-6 flex flex-wrap items-end gap-4">
      <input type="hidden" name="page" value="1"/>
      <label className="w-full text-sm font-medium">Event name<input name="q" defaultValue={search} maxLength={120} placeholder="Search events by name" className={`${fieldClass} mt-2`}/></label>
      <label className="min-w-0 text-sm font-medium">Semester<select name="semester" defaultValue={semester} className={`${fieldClass} mt-2`}><option value="">All semesters</option>{semesters.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="min-w-0 text-sm font-medium">Event type<select name="category" defaultValue={category} className={`${fieldClass} mt-2`}><option value="">All event types</option>{eventCategories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></label>
      <button className="min-h-11 rounded-md border px-5 text-sm">Search & filter</button>
      {(search||semester||category)&&<Link href="/portal/admin/previous-events" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">Clear filters</Link>}
    </form>
    {error?<p role="alert" className="mt-6 rounded-xl border p-5">Previous events could not be loaded. Check that the previous-events migration has been applied, then try again.</p>:<>
      <p className="mt-5 text-sm text-muted-foreground">{events.length?`Showing ${(page-1)*25+1}–${(page-1)*25+events.length} of ${total} events`:'No events with attendance match this search and these filters.'}</p>
      <ul className="mt-5 space-y-4">{events.map(e=><li key={e.id}><Link href={`/portal/admin/previous-events/${e.id}`} className="block rounded-xl border p-5 hover:bg-secondary/50">
        <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="break-words font-medium">{e.title}</h2><span className="shrink-0 text-sm font-medium">{e.attendee_count} attendee{Number(e.attendee_count)===1?'':'s'}</span></div>
        <p className="mt-2 text-sm text-muted-foreground">{attendanceEventDate(e.starts_at)} · {e.semester_name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{categoryLabel(e.category)} · {e.category==='trailblazers'?'Attendance only':`${e.base_points} points`}{e.zone?` · ${e.zone}`:''}</p>
      </Link></li>)}</ul>
      <EventPagination page={page} total={total} filters={filters}/>
    </>}
  </Container></Section>
}
