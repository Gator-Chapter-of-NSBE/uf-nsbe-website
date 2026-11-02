import type { Adjustment, Attendance, PortalEvent, Semester } from './types'

export const classifications = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate student',
  'Other',
] as const

export function isUfEmail(email: string | undefined | null) {
  return typeof email === 'string' && /^[^\s@]+@ufl\.edu$/i.test(email.trim())
}

export function summarizeSemester(
  semester: Semester,
  events: PortalEvent[],
  attendance: Attendance[],
  adjustments: Adjustment[],
) {
  const attendedIds = new Set(attendance.map((row) => row.event_id))
  const attended = events.filter(
    (event) => event.semester_id === semester.id && attendedIds.has(event.id),
  )
  const gbms = attended.filter((event) => event.category === 'gbm').length
  const qualifyingEvents = attended.filter(
    (event) =>
      event.category === 'general' ||
      (event.category === 'external' &&
        semester.external_counts_for_membership),
  ).length
  const basePoints = attended.reduce(
    (total, event) => total + event.base_points,
    0,
  )
  const bonusPoints = adjustments
    .filter((row) => row.semester_id === semester.id)
    .reduce((total, row) => total + row.points, 0)
  return {
    attended,
    gbms,
    qualifyingEvents,
    basePoints,
    bonusPoints,
    points: basePoints + bonusPoints,
    active: gbms >= 2 && qualifyingEvents >= 3,
  }
}

export function membershipHistory(semesters: Semester[], events: PortalEvent[], attendance: Attendance[], adjustments: Adjustment[]) {
  const terms = [...semesters].sort((a,b) => b.starts_on.localeCompare(a.starts_on)).map(semester => ({
    semester, ...summarizeSemester(semester,events,attendance,adjustments),
    hasRecords: attendance.some(a => events.some(e => e.id===a.event_id && e.semester_id===semester.id)) || adjustments.some(a => a.semester_id===semester.id),
  }))
  const attendedIds = new Set(attendance.map(a => a.event_id))
  const firstAttendance = events.filter(e => attendedIds.has(e.id)).map(e => e.starts_at).sort((a,b) => Date.parse(a)-Date.parse(b))[0] ?? null
  return { terms, firstAttendance, activeSemesters: terms.filter(t => t.active).length, lifetimePoints: terms.reduce((sum,t) => sum+t.points,0) }
}
