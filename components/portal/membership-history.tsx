import { membershipHistory } from '@/lib/portal/rules'
import type { Semester, PortalEvent, Attendance, Adjustment } from '@/lib/portal/types'

export function MembershipHistory({ semesters, events, attendance, adjustments }: {
  semesters: Semester[]; events: PortalEvent[]; attendance: Attendance[]; adjustments: Adjustment[]
}) {
  const history = membershipHistory(semesters,events,attendance,adjustments)
  const first = history.firstAttendance ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/New_York' }).format(new Date(history.firstAttendance)) : null
  return <section className="mt-10" aria-labelledby="membership-history-heading">
    <h2 id="membership-history-heading" className="font-serif text-2xl">Membership history</h2>
    <p className="mt-3 text-sm text-muted-foreground">{first ? `First recorded chapter attendance: ${first}.` : 'No chapter attendance has been recorded yet.'} {history.activeSemesters} active semester{history.activeSemesters===1 ? '' : 's'} · {history.lifetimePoints} lifetime points.</p>
    <p className="mt-2 text-xs text-muted-foreground">History reflects available chapter records, beginning Fall 2026. First recorded attendance is not an official joining date. Semester status is recalculated when records are corrected.</p>
    <ul className="mt-5 grid gap-4 sm:grid-cols-2">{history.terms.map(term => <li key={term.semester.id} className="rounded-xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-medium">{term.semester.name}</h3><span className="text-sm">{term.hasRecords ? term.active ? 'Active member' : 'Not active' : 'No chapter activity recorded'}</span></div>
      <p className="mt-3 font-serif text-2xl">{term.points} points</p><p className="mt-2 text-sm text-muted-foreground">{term.gbms}/2 GBMs · {term.qualifyingEvents}/3 qualifying events</p><p className="mt-1 text-xs text-muted-foreground">{term.basePoints} attendance points · {term.bonusPoints} adjustments</p>
    </li>)}</ul>
  </section>
}
