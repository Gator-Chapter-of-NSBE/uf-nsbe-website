'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/portal/session'

export type EboardState = { error?: string; success?: string }

export async function setEboardAccess(_previous: EboardState, form: FormData): Promise<EboardState> {
  const { supabase } = await requireAdmin()
  const member = String(form.get('member') ?? '')
  const operation = String(form.get('operation') ?? '')
  const expected = String(form.get('granted_at') ?? '')
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(member) || !['grant','revoke'].includes(operation))
    return { error: 'Select a valid member and action.' }
  if (operation === 'revoke' && (!Number.isFinite(Date.parse(expected)) || form.get('confirm') !== 'yes'))
    return { error: 'Confirm that you want to revoke E-board access.' }
  const { data, error } = await supabase.rpc('set_eboard_access', {
    p_member: member, p_grant: operation === 'grant', p_expected_granted_at: operation === 'revoke' ? expected : null,
  })
  if (error) {
    if (error.message.includes('Access changed')) return { error: 'Access changed since this page loaded. Refresh before revoking it.' }
    if (error.message.includes('Administrators already')) return { error: 'This member is already an administrator and has full event access.' }
    return { error: 'Access could not be updated. Please refresh and try again.' }
  }
  revalidatePath('/portal')
  revalidatePath('/portal/admin/events')
  return { success: data === 'unchanged' ? 'Access already matches this request.' : operation === 'grant' ? 'E-board access granted.' : 'E-board access revoked.' }
}
