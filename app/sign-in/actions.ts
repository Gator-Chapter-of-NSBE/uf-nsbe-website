'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { checkInMessage, type CheckInState } from '@/lib/check-in'

export async function checkIn(_previous: CheckInState, form: FormData): Promise<CheckInState> {
  const value = (key: string) => String(form.get(key) ?? '').trim()
  const email = value('email').toLowerCase()
  const name = value('name')
  const event = value('event')
  const password = String(form.get('password') ?? '')
  if (!/^[^\s@]+@ufl\.edu$/.test(email) || email.length > 254 || !name || name.length > 120 ||
    !/^[0-9a-f-]{36}$/i.test(event) || !password || Buffer.byteLength(password) > 72)
    return { error: checkInMessage('invalid') }
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('submit_event_check_in', {
      p_event: event, p_email: email, p_name: name, p_password: password,
    })
    if (error) return { error: checkInMessage('unavailable') }
    if (data !== 'success') return { error: checkInMessage(String(data)) }
    revalidatePath('/portal')
    return { success: true }
  } catch {
    return { error: checkInMessage('unavailable') }
  }
}
