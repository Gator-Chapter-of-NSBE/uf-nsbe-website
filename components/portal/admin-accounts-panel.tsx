import type { SupabaseClient } from '@supabase/supabase-js'
import { readAll } from '@/lib/portal/read-all'

type AdminAccount = {
  member_id: string
  granted_at: string
  member: { full_name: string; email: string } | null
}

export async function AdminAccountsPanel({ supabase }: { supabase: SupabaseClient }) {
  let admins: AdminAccount[] = []
  let unavailable = false
  try {
    admins = await readAll<AdminAccount>((from, to) => supabase
      .from('admin_roles')
      .select('member_id,granted_at,member:members(full_name,email)')
      .order('granted_at')
      .order('member_id')
      .range(from, to))
  } catch { unavailable = true }
  const date = (value: string) => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York',
  }).format(new Date(value))

  return <section id="admin-accounts" className="mt-12 scroll-mt-24 border-t pt-10" aria-labelledby="admin-accounts-heading">
    <p className="eyebrow">Administrator directory</p>
    <h2 id="admin-accounts-heading" className="mt-3 font-serif text-2xl">Admin accounts</h2>
    <p className="mt-3 text-sm text-muted-foreground">Visible only to chapter administrators. This list is read-only; administrator access is managed through SQL.</p>
    {unavailable ? <p role="alert" className="mt-5 rounded-xl border p-5">Administrator accounts could not be loaded. Please refresh and try again.</p> : <>
      <p className="mt-4 text-sm text-muted-foreground">{admins.length} administrator{admins.length === 1 ? '' : 's'}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">{admins.map(admin => <li key={admin.member_id} className="rounded-xl border p-5">
        <p className="break-words font-medium">{admin.member?.full_name || 'Name not provided'}</p>
        <p className="mt-1 break-all text-sm text-muted-foreground">{admin.member?.email ?? 'Member information unavailable'}</p>
        <p className="mt-2 text-xs text-muted-foreground">Access granted {date(admin.granted_at)} · Gainesville time</p>
      </li>)}</ul>
    </>}
  </section>
}
