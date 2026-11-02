import type { Metadata } from 'next'
import { Container, Section } from '@/components/site/primitives'
import { CheckInForm } from '@/components/events/check-in-form'
import { createClient } from '@/lib/supabase/server'
import type { OpenEvent } from '@/lib/check-in'
import { isUfEmail } from '@/lib/portal/rules'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Event Check-In', description: 'Record your attendance at a UF NSBE event.' }

export default async function SignInPage() {
  let events: OpenEvent[] = []
  let unavailable = false
  let attendee: { name: string; email: string } | undefined
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('open_check_in_events')
    if (error) unavailable = true
    else events = data ?? []
    // Optional profile lookup must never prevent a guest from checking in.
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!authError && user?.email_confirmed_at && isUfEmail(user.email) &&
        user.identities?.some(identity => identity.provider === 'google')) {
        const { data: member } = await supabase.from('members')
          .select('full_name').eq('auth_user_id', user.id).maybeSingle()
        attendee = { name: member?.full_name ?? '', email: user.email! }
      }
    } catch { /* Leave the form blank when account details are unavailable. */ }
  } catch { unavailable = true }
  return <Section className="pt-12 md:pt-20"><Container className="max-w-xl">
    <p className="eyebrow">UF NSBE</p><h1 className="mt-3 font-serif text-4xl">Event check-in</h1>
    <p className="mb-8 mt-4 text-muted-foreground">Here for an event? Record your attendance below. No account sign-in is required. Use the same UF email when you visit the member portal to see your points.</p>
    {unavailable ? <p role="alert" className="rounded-xl border p-6">Check-in is temporarily unavailable. Please let an officer know and try again shortly.</p> : events.length ? <CheckInForm events={events} attendee={attendee} /> : <p className="rounded-xl border p-6">No events are open for check-in right now. Ask an officer to open check-in for your event.</p>}
  </Container></Section>
}
