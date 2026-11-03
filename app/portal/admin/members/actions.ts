'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/portal/session'

export type ManagementState = { error?: string; success?: string }
const uuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export async function manageMember(_previous: ManagementState, form: FormData): Promise<ManagementState> {
  const { supabase } = await requireAdmin()
  const value = (key: string) => String(form.get(key) ?? '').trim()
  const member = value('member')
  const request = value('request')
  const reason = value('reason')
  if (!uuid(member) || !uuid(request) || !reason || reason.length > 500)
    return { error: 'Enter a reason of up to 500 characters.' }
  const operation = value('operation')
  let error: { message: string } | null
  let unchanged = false
  if (operation === 'points') {
    const points = Number(value('points'))
    const semester = value('semester')
    if (!uuid(semester) || !Number.isInteger(points) || points === 0 || Math.abs(points) > 10000)
      return { error: 'Select a semester and enter nonzero whole-number points between -10000 and 10000.' }
    ;({ error } = await supabase.rpc('adjust_member_points', {
      p_member: member, p_semester: semester, p_points: points, p_reason: reason, p_request: request,
    }))
  } else if (operation === 'add' || operation === 'remove') {
    const event = value('event')
    const attendance = value('attendance')
    if (!uuid(event) || (operation === 'remove' && (!uuid(attendance) || value('confirm') !== 'yes')))
      return { error: 'Select an event and confirm the attendance removal if applicable.' }
    const result = await supabase.rpc('correct_member_attendance', {
      p_member: member, p_event: event, p_present: operation === 'add',
      p_expected_attendance: operation === 'remove' ? attendance : null,
      p_reason: reason, p_request: request,
    })
    error = result.error
    unchanged = result.data === 'unchanged'
  } else return { error: 'Choose an attendance correction or point adjustment.' }
  if (error) {
    if (error.message.includes('Attendance changed')) return { error: 'Attendance changed since this page loaded. Refresh before removing it.' }
    return { error: 'The change could not be saved. Refresh and try again. Check that the member-management migration has been applied.' }
  }
  revalidatePath('/portal')
  revalidatePath('/portal/admin/members')
  revalidatePath(`/portal/admin/members/${member}`)
  return { success: unchanged ? 'Attendance already matches this request. No change was made.' : 'Saved. Member records and totals have been refreshed.' }
}
