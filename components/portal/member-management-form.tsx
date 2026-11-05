'use client'

import { useActionState, useState } from 'react'
import { manageMember } from '@/app/portal/admin/members/actions'
import { buttonClass, fieldClass } from '@/lib/check-in'

type Choice = { id: string; label: string }
type FormProps = {
  member: string; operation: 'add' | 'remove' | 'points'; choices?: Choice[];
  event?: string; attendance?: string; request: string; semester?: string
  attendanceOnly?: boolean
}
export function MemberManagementForm(props: FormProps) {
  const [request, setRequest] = useState(props.request)
  return <ManagementFields key={request} {...props} request={request} onReset={() => setRequest(crypto.randomUUID())} />
}

function ManagementFields({ member, operation, choices = [], event, attendance, request, semester, attendanceOnly, onReset }: FormProps & { onReset: () => void }) {
  const [state, action, pending] = useActionState(manageMember, {})
  // A successful form stays disabled until explicitly reset. The UUID also makes
  // retries safe across double submissions and lost network responses.
  return <form action={action} className="mt-4 space-y-4">
    <input type="hidden" name="member" value={member} /><input type="hidden" name="operation" value={operation} /><input type="hidden" name="request" value={request} />
    {event && <input type="hidden" name="event" value={event} />}{attendance && <input type="hidden" name="attendance" value={attendance} />}
    {operation !== 'remove' && !(operation === 'add' && event) && <label className="block text-sm font-medium">{operation === 'points' ? 'Semester' : 'Event'}<select name={operation === 'points' ? 'semester' : 'event'} required className={`${fieldClass} mt-2`} defaultValue={semester ?? ''} disabled={!!state.success}><option value="" disabled>Select {operation === 'points' ? 'semester' : 'event'}</option>{choices.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>}
    {operation === 'points' && <label className="block text-sm font-medium">Points<input name="points" type="number" required min={-10000} max={10000} step={1} placeholder="10 or -10" className={`${fieldClass} mt-2`} disabled={!!state.success} /><span className="mt-2 block text-xs font-normal text-muted-foreground">Positive adds points; negative deducts points. This does not change attendance or active membership.</span></label>}
    <label className="block text-sm font-medium">Reason<textarea name="reason" required maxLength={500} rows={2} className={`${fieldClass} mt-2`} placeholder={operation === 'points' ? 'e.g. 50% general event attendance bonus' : 'Explain this attendance correction'} disabled={!!state.success} /></label>
    {operation === 'remove' && <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" value="yes" required disabled={!!state.success} className="mt-1" />{attendanceOnly ? 'Remove this Trailblazers attendance. Chapter points and active membership are unaffected.' : 'Remove this attendance and its event points. Active membership will be recalculated.'}</label>}
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}{state.success && <p role="status" className="text-sm">{state.success}</p>}
    <button disabled={pending || !!state.success} className={buttonClass}>{pending ? 'Saving…' : operation === 'points' ? 'Record adjustment' : operation === 'add' ? 'Add attendance' : 'Remove attendance'}</button>
    {state.success && operation !== 'remove' && <button type="button" className="ml-4 text-sm underline" onClick={onReset}>{operation === 'points' ? 'Record another adjustment' : 'Add another attendance'}</button>}
  </form>
}
