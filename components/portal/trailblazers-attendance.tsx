import { randomUUID } from 'node:crypto'
import type { Attendance, PortalEvent } from '@/lib/portal/types'
import { MemberManagementForm } from './member-management-form'

export function TrailblazersAttendance({ events, attendance, semester, correctionMember }: {
  events: PortalEvent[]; attendance: Attendance[]; semester?: string; correctionMember?: string
}) {
  const rows = events.filter(e => e.category === 'trailblazers' && e.semester_id === semester && attendance.some(a => a.event_id===e.id))
  if (!rows.length) return null
  return <section className="mt-10" aria-labelledby="trailblazers-attendance-heading">
    <h2 id="trailblazers-attendance-heading" className="font-serif text-2xl">Trailblazers attendance</h2>
    <p className="mt-3 text-sm text-muted-foreground">{rows.length} meeting{rows.length===1 ? '' : 's'} recorded this semester. Attendance only — no points or active-membership credit.</p>
    <ul className="mt-5 space-y-3">{rows.map(e => <li key={e.id} className="rounded-xl border p-5">
      <h3 className="font-medium">{e.title}</h3><p className="mt-1 text-sm text-muted-foreground">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/New_York' }).format(new Date(e.starts_at))}</p>
      {correctionMember && <details className="mt-4"><summary className="cursor-pointer text-sm font-medium">Correct this Trailblazers attendance</summary><MemberManagementForm member={correctionMember} operation="remove" event={e.id} attendance={attendance.find(a => a.event_id===e.id)!.id} request={randomUUID()} attendanceOnly /></details>}
    </li>)}</ul>
  </section>
}
