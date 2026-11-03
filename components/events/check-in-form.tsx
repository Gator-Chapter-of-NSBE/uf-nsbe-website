'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { checkIn } from '@/app/sign-in/actions'
import { fieldClass, buttonClass, type OpenEvent } from '@/lib/check-in'

export function CheckInForm({ events, attendee }: { events: OpenEvent[]; attendee?: { name: string; email: string } }) {
  const [state, action, pending] = useActionState(checkIn, {})
  if (state.success) return <div role="status" className="space-y-4 rounded-xl border border-nsbe-green/30 bg-nsbe-green/5 p-6">
    <h2 className="font-serif text-2xl">You’re checked in.</h2>
    <p>Your attendance is recorded. Checking in again won’t create duplicate attendance.</p>
    <Link href="/portal" className="font-medium underline underline-offset-4">View your points in the member portal</Link>
  </div>
  return <form action={action} className="space-y-5">
    <div><label htmlFor="name" className="mb-2 block text-sm font-medium">Full name</label><input className={fieldClass} id="name" name="name" required maxLength={120} autoComplete="name" defaultValue={attendee?.name ?? ''} /></div>
    <div><label htmlFor="email" className="mb-2 block text-sm font-medium">UF email</label><input className={fieldClass} id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="name@ufl.edu" defaultValue={attendee?.email ?? ''} /></div>
    <div><label htmlFor="event" className="mb-2 block text-sm font-medium">Event</label><select className={fieldClass} id="event" name="event" required defaultValue={events.length === 1 ? events[0].id : ''}>
      <option value="" disabled>Select your event</option>{events.map(event => <option key={event.id} value={event.id}>{event.title} — {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }).format(new Date(event.starts_at))}</option>)}
    </select></div>
    {events.some(event => event.category==='trailblazers') && <p className="text-sm text-muted-foreground">Trailblazers meetings record attendance only. They do not award points or count toward active membership.</p>}
    <div><label htmlFor="password" className="mb-2 block text-sm font-medium">Event password</label><input className={fieldClass} id="password" name="password" type="password" required maxLength={72} autoComplete="off" /><p className="mt-2 text-xs text-muted-foreground">Use the password shared by an officer at this event.</p></div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <button className={buttonClass} disabled={pending}>{pending ? 'Recording attendance…' : 'Check in'}</button>
  </form>
}
