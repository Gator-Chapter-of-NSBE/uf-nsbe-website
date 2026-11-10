import Link from 'next/link'
import type { SupabaseClient } from '@supabase/supabase-js'
import { readAll } from '@/lib/portal/read-all'
import { EboardRoleForm } from './eboard-role-form'
import { fieldClass } from '@/lib/check-in'

type Access = { member_id: string; full_name: string; email: string; granted_at: string; granted_by_email: string }
type Match = { id: string; full_name: string; email: string; total_count: number }
type Change = { id: string; member_email: string; action: string; actor_email: string; created_at: string }

export async function EboardAccessPanel({ supabase, search, page: rawPage, semester }: {
  supabase: SupabaseClient; search?: string; page?: string; semester?: string
}) {
  const query = typeof search === 'string' ? search.trim().slice(0,120) : ''
  const page = Math.max(1,Math.min(10000,Math.floor(Number(rawPage)||1)))
  let roles: Access[] = []
  let admins: { member_id: string }[] = []
  let matches: Match[] = []
  let history: Change[] = []
  let unavailable = false
  try {
    const results = await Promise.all([
      readAll<Access>((a,b) => supabase.rpc('list_eboard_access').range(a,b)),
      readAll<{ member_id: string }>((a,b) => supabase.from('admin_roles').select('member_id').order('member_id').range(a,b)),
      query ? supabase.rpc('search_chapter_members', { p_query: query, p_page: page }) : Promise.resolve({ data: [], error: null }),
      supabase.from('eboard_role_history').select('id,member_email,action,actor_email,created_at').order('created_at', { ascending: false }).order('id').limit(20),
    ])
    roles = results[0]; admins = results[1]
    if (results[2].error || results[3].error) throw new Error('Role records unavailable')
    matches = results[2].data ?? []; history = results[3].data ?? []
  } catch { unavailable = true }
  const date = (value: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(value))
  const href = (p: number) => `/portal?${new URLSearchParams({ role_search: query, role_page: String(p), ...(semester ? { semester } : {}) })}#eboard-access`
  return <section id="eboard-access" className="mt-12 scroll-mt-24 border-t pt-10" aria-labelledby="eboard-access-heading">
    <p className="eyebrow">Administrator controls</p><h2 id="eboard-access-heading" className="mt-3 font-serif text-2xl">E-board access</h2>
    <p className="mt-3 max-w-3xl text-sm text-muted-foreground">E-board members can create, open, close, and reopen event check-ins and change event passwords. They can review member participation and previous-event rosters. They cannot change other members’ records, adjust points, export active members, or assign roles. Administrators already have all event permissions.</p>
    {unavailable ? <p role="alert" className="mt-5 rounded-xl border p-5">E-board access tools are unavailable. Apply the E-board access migration before using this section.</p> : <>
      <form action="/portal#eboard-access" className="mt-6 flex flex-wrap gap-3">
        {semester && <input type="hidden" name="semester" value={semester} />}
        <label className="min-w-0 flex-1"><span className="sr-only">Search members to grant E-board access</span><input name="role_search" maxLength={120} defaultValue={query} placeholder="Search by name or UF email" className={fieldClass} /></label><button className="min-h-11 rounded-md border px-4 text-sm">Find member</button>
      </form>
      {query && <div className="mt-5"><h3 className="font-medium">Search results</h3>{!matches.length && <p className="mt-3 text-sm text-muted-foreground">No matching members. Members must have an existing chapter record before access can be granted.</p>}<ul className="mt-3 grid gap-3 sm:grid-cols-2">{matches.map(m => <li key={m.id} className="rounded-xl border p-5"><p className="break-words font-medium">{m.full_name || 'Name not provided'}</p><p className="mt-1 break-all text-sm text-muted-foreground">{m.email}</p>{admins.some(a=>a.member_id===m.id) ? <p className="mt-3 text-sm">Administrator — already has event access</p> : roles.some(r=>r.member_id===m.id) ? <p className="mt-3 text-sm">Already has E-board access</p> : <EboardRoleForm key={`${m.id}-grant`} member={m.id} />}</li>)}</ul><nav aria-label="E-board member search pages" className="mt-4 flex gap-5">{page>1 && <Link href={href(page-1)} className="text-sm underline">Previous</Link>}{matches.length>0 && page*25<Number(matches[0].total_count) && <Link href={href(page+1)} className="text-sm underline">Next</Link>}</nav></div>}
      <h3 className="mt-8 font-medium">Current E-board access ({roles.length})</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">{roles.map(r => <li key={r.member_id} className="rounded-xl border p-5"><p className="break-words font-medium">{r.full_name || 'Name not provided'}</p><p className="mt-1 break-all text-sm text-muted-foreground">{r.email}</p><p className="mt-2 break-words text-xs text-muted-foreground">Granted {date(r.granted_at)} by {r.granted_by_email}</p><EboardRoleForm key={`${r.member_id}-${r.granted_at}`} member={r.member_id} grantedAt={r.granted_at} /></li>)}</ul>
      {!roles.length && <p className="mt-3 text-sm text-muted-foreground">No E-board roles have been assigned.</p>}
      <details className="mt-6"><summary className="cursor-pointer text-sm font-medium">Recent role changes</summary><p className="mt-3 text-xs text-muted-foreground">Latest 20 changes. The full history remains in the database.</p><ul className="mt-3 space-y-3">{history.map(h => <li key={h.id} className="rounded-lg border p-4 text-sm"><p className="break-words">{h.action==='grant' ? 'Granted' : 'Revoked'} E-board access: {h.member_email}</p><p className="mt-1 break-words text-xs text-muted-foreground">{date(h.created_at)} · {h.actor_email}</p></li>)}</ul>{!history.length && <p className="mt-3 text-sm text-muted-foreground">No role changes recorded.</p>}</details>
    </>}
  </section>
}
