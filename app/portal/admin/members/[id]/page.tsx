import { PortalViewShell } from '@/components/portal/portal-view'
import { previewHref } from '@/lib/portal/view'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { randomUUID } from 'node:crypto'
import { Container, Section } from '@/components/site/primitives'
import { requireParticipationViewer } from '@/lib/portal/session'
import { readAll } from '@/lib/portal/read-all'
import { summarizeSemester } from '@/lib/portal/rules'
import type { Member, Semester, PortalEvent, Attendance, Adjustment } from '@/lib/portal/types'
import { MemberManagementForm } from '@/components/portal/member-management-form'
import { fieldClass } from '@/lib/check-in'
import { MembershipHistory } from '@/components/portal/membership-history'
import { TrailblazersAttendance } from '@/components/portal/trailblazers-attendance'

type AdminAdjustment = Adjustment & { created_by?: string | null }
type ParticipationProfile = Pick<Member,'id'|'email'|'full_name'|'major'|'classification'|'profile_completed_at'> & { nsbe_id?: string | null }
type Correction = { id: string; event_id: string; action: string; reason: string; actor_email: string; created_at: string }
const date = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(value))

export default async function MemberDetailPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ semester?: string; preview?: string }>
}) {
  const query = await searchParams
  const { supabase, view, isAdmin } = await requireParticipationViewer(query.preview)
  const canEdit=isAdmin&&view.showAdmin&&!view.readOnly
  const { id } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound()
  const { data: member, error } = await (canEdit ? supabase.from('members').select('*').eq('id',id) : supabase.rpc('participation_member_profile',{p_member:id})).maybeSingle()
  if (error) throw new Error('Member could not be loaded.')
  if (!member) notFound()
  const profile = member as ParticipationProfile
  const [semesters, events, attendance, adjustments, corrections] = await Promise.all([
    readAll<Semester>((a,b) => supabase.from('semesters').select('*').order('starts_on', { ascending: false }).range(a,b)),
    readAll<PortalEvent>((a,b) => supabase.from('events').select('id,semester_id,title,starts_at,category,zone,base_points').order('starts_at', { ascending: false }).order('id').range(a,b)),
    readAll<Attendance>((a,b) => canEdit ? supabase.from('attendance').select('id,event_id,checked_in_at').eq('member_id',id).order('id').range(a,b) : supabase.rpc('participation_member_attendance',{p_member:id}).range(a,b)),
    readAll<AdminAdjustment>((a,b) => canEdit ? supabase.from('point_adjustments').select('id,semester_id,points,reason,created_at,created_by').eq('member_id',id).order('created_at', { ascending: false }).order('id').range(a,b) : supabase.rpc('participation_member_adjustments',{p_member:id}).range(a,b)),
    canEdit ? supabase.from('attendance_corrections').select('id,event_id,action,reason,actor_email,created_at').eq('member_id',id).order('created_at', { ascending: false }).order('id').limit(100) : Promise.resolve({data:[],error:null}),
  ])
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const selected = semesters.find(s => s.id === query.semester) ?? semesters.find(s => s.starts_on <= today && s.ends_on >= today) ?? semesters[0]
  const summary = selected ? summarizeSemester(selected,events,attendance,adjustments) : null
  const lifetime = semesters.reduce((sum,s) => sum + summarizeSemester(s,events,attendance,adjustments).points,0)
  const missed = events.filter(e => e.semester_id === selected?.id && Date.parse(e.starts_at) <= Date.now() && !attendance.some(a => a.event_id === e.id))
  const audit = (corrections.data ?? []) as Correction[]
  const actors = canEdit ? [...new Set(adjustments.map(a => a.created_by).filter((actor): actor is string => !!actor))] : []
  const { data: actorRows, error: actorError } = actors.length ? await supabase.from('members').select('auth_user_id,email').in('auth_user_id',actors) : { data: [], error: null }
  if (actorError) throw new Error('Adjustment authors could not be loaded.')
  const authors = new Map((actorRows ?? []).map(a => [a.auth_user_id,a.email]))
  return <Section className="pt-10"><Container className="max-w-4xl"><PortalViewShell view={view}>
    <Link href={previewHref('/portal/admin/members',view.preview)} className="text-sm underline underline-offset-4">Back to member search</Link>
    <p className="eyebrow mt-8">{view.showAdmin?'Chapter administration':'E-board participation review'}</p><h1 className="mt-3 break-words font-serif text-4xl">{profile.full_name || 'Member profile'}</h1><p className="mt-3 break-all text-muted-foreground">{profile.email}</p>
    <dl className="mt-6 grid gap-4 rounded-xl border p-5 sm:grid-cols-3">{[['Major',profile.major],['School year',profile.classification],...(canEdit ? [['NSBE ID',profile.nsbe_id]] : [])].map(([label,value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 break-words">{value || 'Not provided'}</dd></div>)}</dl>
    {!profile.profile_completed_at && <p className="mt-3 text-sm text-muted-foreground">This member has not completed portal onboarding.</p>}
    <form className="mt-8 flex flex-wrap items-end gap-3">{view.preview&&<input type="hidden" name="preview" value={view.preview}/>}<label className="text-sm font-medium">Semester<select name="semester" defaultValue={selected?.id} className={`${fieldClass} mt-2`}>{semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button className="min-h-11 rounded-md border px-4 text-sm">View</button></form>
    {summary && <>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">{[['Semester points',String(summary.points)],['Membership',summary.active ? 'Active member' : 'In progress'],['Lifetime points',String(lifetime)]].map(([label,value]) => <div key={label} className="rounded-xl border p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 font-serif text-2xl">{value}</p></div>)}</div>
      <p className="mt-3 text-sm text-muted-foreground">{summary.gbms}/2 GBMs · {summary.qualifyingEvents}/3 qualifying events · {summary.basePoints} attendance points · {summary.bonusPoints} adjustments. {selected.external_counts_for_membership ? 'General and external events qualify.' : 'General events qualify for active membership.'}</p>
      {canEdit && (corrections.error ? <p role="alert" className="mt-6 rounded-xl border p-5">Attendance correction tools are unavailable. Apply the member-management migration first.</p> : <section className="mt-10"><h2 className="font-serif text-2xl">Add missed attendance</h2>{missed.length ? <MemberManagementForm key={selected.id} member={id} operation="add" request={randomUUID()} choices={missed.map(e => ({ id: e.id, label: `${date(e.starts_at)} — ${e.title} (${e.category==='trailblazers' ? 'Trailblazers attendance only' : `+${e.base_points} points`})` }))} /> : <p className="mt-4 text-sm text-muted-foreground">No unattended past events are available in this semester.</p>}</section>)}
      <section className="mt-10"><h2 className="font-serif text-2xl">Attendance</h2><ul className="mt-4 space-y-4">{summary.attended.map(e => {
        const row = attendance.find(a => a.event_id === e.id)!
        return <li key={row.id} className="rounded-xl border p-5"><div className="flex justify-between gap-3"><div><h3 className="font-medium">{e.title}</h3><p className="mt-1 text-sm text-muted-foreground">{date(e.starts_at)} · {e.category === 'gbm' ? 'GBM' : e.category}</p></div><span className="shrink-0 text-sm">+{e.base_points}</span></div>{canEdit && !corrections.error && <details className="mt-4"><summary className="cursor-pointer text-sm font-medium">Correct this attendance</summary><MemberManagementForm member={id} operation="remove" event={e.id} attendance={row.id} request={randomUUID()} /></details>}</li>
      })}</ul>{!summary.attended.length && <p className="mt-4 text-sm text-muted-foreground">No attendance this semester.</p>}</section>
    </>}
    <section className="mt-10"><h2 className="font-serif text-2xl">Bonuses and point adjustments</h2><p className="mt-3 text-sm text-muted-foreground">{canEdit?'Record bonuses manually. To correct an adjustment, add an opposite entry with a reason; previous entries remain in the record.':'Recorded bonuses and deductions are shown below. E-board access cannot change them.'}</p>
      {canEdit && !corrections.error && semesters.length > 0 && <MemberManagementForm key={selected?.id} member={id} operation="points" request={randomUUID()} semester={selected?.id} choices={semesters.map(s => ({ id: s.id, label: s.name }))} />}
      <ul className="mt-6 space-y-3">{adjustments.filter(a => a.semester_id === selected?.id).map(a => <li key={a.id} className="rounded-xl border p-5"><p className="break-words font-medium">{a.points>0 ? '+' : ''}{a.points} · {a.reason}</p><p className="mt-2 break-all text-xs text-muted-foreground">{date(a.created_at)} · {canEdit ? a.created_by ? authors.get(a.created_by) ?? 'Former chapter administrator' : 'Imported or former administrator' : 'Recorded adjustment'}</p></li>)}</ul>
    </section>
    {canEdit&&<section className="mt-10"><h2 className="font-serif text-2xl">Attendance correction history</h2><p className="mt-2 text-xs text-muted-foreground">Latest 100 corrections across all semesters.</p><ul className="mt-4 space-y-3">{audit.map(a => <li key={a.id} className="rounded-xl border p-5"><p className="font-medium">{a.action==='add' ? 'Added' : 'Removed'}: {events.find(e => e.id===a.event_id)?.title ?? 'Event'}</p><p className="mt-2 break-words text-sm">{a.reason}</p><p className="mt-2 break-all text-xs text-muted-foreground">{date(a.created_at)} · {a.actor_email}</p></li>)}</ul>{!audit.length && <p className="mt-4 text-sm text-muted-foreground">No attendance corrections recorded.</p>}</section>}
    <TrailblazersAttendance events={events} attendance={attendance} semester={selected?.id} correctionMember={canEdit&&!corrections.error ? id : undefined} />
    <MembershipHistory semesters={semesters} events={events} attendance={attendance} adjustments={adjustments} />
  </PortalViewShell></Container></Section>
}
