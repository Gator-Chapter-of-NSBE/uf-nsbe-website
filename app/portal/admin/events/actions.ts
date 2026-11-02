'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/portal/session'
import { getCalendarEvents } from '@/lib/calendar/google'
import { zones } from '@/lib/check-in'

export type AdminState = { error?: string; success?: string }

export async function openCheckIn(_state: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireAdmin()
  const value = (key: string) => String(form.get(key) ?? '').trim()
  const calendar = await getCalendarEvents()
  const event = calendar.events.find(e => e.id === value('calendar_event'))
  if (calendar.status !== 'ready' || !event) return { error: 'This calendar event is unavailable. Refresh the page and select it again.' }
  const category = value('category')
  const zone = value('zone')
  const password = String(form.get('password') ?? '')
  const hours = Number(value('hours'))
  if (!['general','gbm','external'].includes(category) || (zone && !zones.some(z => z === zone)) || ![1,4,12,24].includes(hours))
    return { error: 'Select a category, zone, and check-in duration.' }
  if (password && (password.length < 6 || Buffer.byteLength(password) > 72)) return { error: 'Use a password of at least 6 characters and at most 72 bytes.' }
  const semester = value('semester')
  if (!/^[0-9a-f-]{36}$/i.test(semester)) return { error: 'Select a semester.' }
  // Google is the source for event title/time; never trust hidden form details.
  const { error } = await supabase.rpc('configure_event_check_in', {
    p_semester: semester, p_title: event.title,
    p_starts_at: event.allDay ? `${event.start}T00:00:00 America/New_York` : event.start,
    p_category: category, p_zone: zone || null,
    p_calendar_id: calendar.calendarId, p_calendar_event_id: event.id,
    p_password: password || null, p_hours: hours,
  })
  if (error) {
    if (error.message.includes('within the selected semester')) return { error: 'The event date must fall within the selected semester. Check your semester dates.' }
    if (error.message.includes('different details')) return { error: 'This event already exists. Select its original semester, category, and zone to reopen check-in.' }
    if (error.message.includes('password is required')) return { error: 'Set a password when opening check-in for the first time.' }
    return { error: 'Check-in could not be opened. Please try again or check that the database migration has been run.' }
  }
  revalidatePath('/sign-in')
  revalidatePath('/portal/admin/events')
  return { success: `Check-in for ${event.title} is open for ${hours} hour${hours === 1 ? '' : 's'}.` }
}

export async function closeCheckIn(_state: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireAdmin()
  const id = String(form.get('event') ?? '')
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Select a valid event.' }
  const { error } = await supabase.rpc('close_event_check_in', { p_event: id })
  if (error) return { error: 'Check-in could not be closed. Please try again.' }
  revalidatePath('/sign-in')
  revalidatePath('/portal/admin/events')
  return { success: 'Check-in closed.' }
}

export async function reopenCheckIn(_state: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireAdmin()
  const id = String(form.get('event') ?? '')
  const password = String(form.get('password') ?? '')
  const hours = Number(form.get('hours'))
  if (!/^[0-9a-f-]{36}$/i.test(id) || ![1,4,12,24].includes(hours)) return { error: 'Select an event and duration.' }
  if (password && (password.length < 6 || Buffer.byteLength(password) > 72)) return { error: 'Use a password of at least 6 characters and at most 72 bytes.' }
  const { data: event, error: eventError } = await supabase.from('events').select('*').eq('id', id).single()
  if (eventError || !event) return { error: 'Event could not be loaded.' }
  const { error } = await supabase.rpc('configure_event_check_in', {
    p_semester: event.semester_id, p_title: event.title, p_starts_at: event.starts_at,
    p_category: event.category, p_zone: event.zone, p_calendar_id: event.calendar_id,
    p_calendar_event_id: event.calendar_event_id, p_password: password || null, p_hours: hours,
  })
  if (error) return { error: 'Check-in could not be reopened. Please try again.' }
  revalidatePath('/sign-in')
  revalidatePath('/portal/admin/events')
  return { success: 'Check-in reopened.' }
}
