'use client'

import { useActionState } from 'react'
import { setEboardAccess } from '@/app/portal/eboard-actions'

export function EboardRoleForm({ member, grantedAt }: { member: string; grantedAt?: string }) {
  const [state, action, pending] = useActionState(setEboardAccess, {})
  return <form action={action} className="mt-3 space-y-3">
    <input type="hidden" name="member" value={member} /><input type="hidden" name="operation" value={grantedAt ? 'revoke' : 'grant'} />
    {grantedAt && <><input type="hidden" name="granted_at" value={grantedAt} /><label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" required disabled={pending || !!state.success} className="mt-1" />Revoke this member’s E-board event access.</label></>}
    <button className="min-h-11 rounded-md border px-4 text-sm font-medium hover:bg-secondary disabled:opacity-50" disabled={pending || !!state.success}>{pending ? 'Saving…' : grantedAt ? 'Revoke access' : 'Grant E-board access'}</button>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}{state.success && <p role="status" className="text-sm">{state.success}</p>}
  </form>
}
