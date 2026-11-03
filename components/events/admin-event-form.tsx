'use client'

import { useActionState } from 'react'
import { openCheckIn, closeCheckIn, reopenCheckIn } from '@/app/portal/admin/events/actions'
import { fieldClass, buttonClass, zones } from '@/lib/check-in'
import type { Semester } from '@/lib/portal/types'
import type { CheckInCalendarSource } from '@/data/calendar'

export function AdminEventForm({ events, semesters, source = 'chapter' }: {
  events: { id: string; title: string; day: string }[]; semesters: Semester[]; source?: CheckInCalendarSource
}) {
  const [state, action, pending] = useActionState(openCheckIn, {})
  return <form action={action} className="mt-6 space-y-5 rounded-xl border p-6">
    <input type="hidden" name="source" value={source} />
    <div><label htmlFor="calendar_event" className="mb-2 block text-sm font-medium">Google Calendar event</label><select id="calendar_event" name="calendar_event" className={fieldClass} required defaultValue=""><option value="" disabled>Select an event</option>{events.map(e => <option key={e.id} value={e.id}>{e.day} — {e.title}</option>)}</select></div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label htmlFor="semester" className="mb-2 block text-sm font-medium">Semester</label><select id="semester" name="semester" className={fieldClass} required defaultValue=""><option value="" disabled>Select semester</option>{semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      {source === 'trailblazers' ? <div><p className="mb-2 text-sm font-medium">Attendance type</p><p className="text-sm">Trailblazers — attendance only</p><p className="mt-2 text-xs text-muted-foreground">Zero points. Does not count toward active membership or chapter attendance bonuses.</p></div> : <div><label htmlFor="category" className="mb-2 block text-sm font-medium">Category</label><select id="category" name="category" className={fieldClass}><option value="general">General event — 5 points</option><option value="gbm">GBM — 10 points</option><option value="external">External event — 15 points</option></select></div>}
      <div><label htmlFor="zone" className="mb-2 block text-sm font-medium">Zone (optional)</label><select id="zone" name="zone" className={fieldClass}><option value="">Unassigned</option>{zones.map(z => <option key={z}>{z}</option>)}</select></div>
      <div><label htmlFor="hours" className="mb-2 block text-sm font-medium">Close check-in after</label><select id="hours" name="hours" className={fieldClass} defaultValue="4">{[1,4,12,24].map(h => <option key={h} value={h}>{h} hour{h === 1 ? '' : 's'}</option>)}</select></div>
    </div>
    <div><label htmlFor="event_password" className="mb-2 block text-sm font-medium">Event password</label><input id="event_password" name="password" type="password" className={fieldClass} minLength={6} maxLength={72} autoComplete="new-password" /><p className="mt-2 text-xs text-muted-foreground">Required for a new event. Leave blank to keep the existing password when reopening. Share it at the event.</p></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    {state.success && <p role="status" className="text-sm text-nsbe-green">{state.success}</p>}
    <button className={buttonClass} disabled={pending}>{pending ? 'Opening…' : 'Open check-in now'}</button>
  </form>
}

export function CloseCheckInForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(closeCheckIn, {})
  return <form action={action}><input type="hidden" name="event" value={id} /><button className="min-h-11 rounded-md border px-4 text-sm disabled:opacity-50" disabled={pending}>{pending ? 'Closing…' : 'Close check-in'}</button>{state.error && <p role="alert" className="mt-2 text-sm text-destructive">{state.error}</p>}{state.success && <p role="status" className="mt-2 text-sm">{state.success}</p>}</form>
}

export function ReopenCheckInForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reopenCheckIn, {})
  return <details className="w-full border-t pt-3"><summary className="cursor-pointer text-sm font-medium">Reopen or change password</summary><form action={action} className="mt-4 space-y-3">
    <input type="hidden" name="event" value={id} />
    <label className="block text-sm">New password (optional)<input name="password" type="password" minLength={6} maxLength={72} autoComplete="new-password" className={`${fieldClass} mt-2`} /></label>
    <p className="text-xs text-muted-foreground">Leave blank to keep the current password. Opens immediately.</p>
    <label className="block text-sm">Close after<select name="hours" defaultValue="4" className={`${fieldClass} mt-2`}>{[1,4,12,24].map(h => <option key={h} value={h}>{h} hour{h === 1 ? '' : 's'}</option>)}</select></label>
    <button disabled={pending} className={buttonClass}>{pending ? 'Opening…' : 'Reopen check-in'}</button>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}{state.success && <p role="status" className="text-sm">{state.success}</p>}
  </form></details>
}
