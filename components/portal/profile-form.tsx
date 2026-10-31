'use client'

import { useActionState } from 'react'
import { Input } from '@/components/ui/input'
import { saveProfile, type ProfileState } from '@/app/portal/actions'
import { classifications } from '@/lib/portal/rules'
import type { Member } from '@/lib/portal/types'

export function ProfileForm({ member }: { member: Member }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {})
  return <form action={action} className="space-y-6">
    <div><p className="text-sm font-medium">UF email</p><p className="mt-1 break-all text-muted-foreground">{member.email}</p><p className="mt-2 text-xs text-muted-foreground">Connected to your verified Google account. Contact the chapter if your address changes.</p></div>
    <div className="grid gap-6 sm:grid-cols-2">
      <Field label="Full name" name="full_name" defaultValue={member.full_name} required maxLength={120} autoComplete="name" />
      <Field label="Major" name="major" defaultValue={member.major} required maxLength={120} />
      <div className="space-y-2"><label htmlFor="classification" className="text-sm font-medium">School year</label><select id="classification" name="classification" required defaultValue={member.classification} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"><option value="" disabled>Select your school year</option>{classifications.map((value) => <option key={value}>{value}</option>)}</select></div>
      <Field label="NSBE ID (optional)" name="nsbe_id" defaultValue={member.nsbe_id ?? ''} maxLength={40} />
      <Field label="UFID (optional)" name="ufid" defaultValue={member.ufid ?? ''} inputMode="numeric" pattern="[0-9]{8}" maxLength={8} />
    </div>
    {state.error && <p role="alert" className="text-sm text-destructive">{state.error}</p>}
    <button disabled={pending} className="min-h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50">{pending ? 'Saving…' : 'Save profile'}</button>
  </form>
}

function Field({ label, name, ...props }: React.ComponentProps<'input'> & { label: string; name: string }) {
  return <div className="space-y-2"><label htmlFor={name} className="text-sm font-medium">{label}</label><Input id={name} name={name} className="h-11" {...props} /></div>
}
