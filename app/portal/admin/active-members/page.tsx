import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'
import { SemesterPicker } from '@/components/portal/semester-picker'
import { requireAdmin } from '@/lib/portal/session'
import { readAll } from '@/lib/portal/read-all'
import { selectSemester, type ActiveMemberRow } from '@/lib/portal/reporting'
import type { Semester } from '@/lib/portal/types'

export default async function ActiveMembersPage({ searchParams }: { searchParams: Promise<{ semester?: string }> }) {
  const { supabase } = await requireAdmin()
  const semesters = await readAll<Semester>((a,b) => supabase.from('semesters').select('*').order('starts_on', { ascending: false }).range(a,b))
  const selected = selectSemester(semesters,(await searchParams).semester)
  let rows: ActiveMemberRow[] = []
  let unavailable = false
  if (selected) {
    try { rows = await readAll<ActiveMemberRow>((a,b) => supabase.rpc('active_semester_members', { p_semester: selected.id }).range(a,b)) }
    catch { unavailable = true }
  }
  return <Section className="pt-10"><Container className="max-w-4xl">
    <Link href="/portal/admin/members" className="text-sm underline underline-offset-4">Back to member management</Link>
    <p className="eyebrow mt-8">Chapter administration</p><h1 className="mt-3 font-serif text-4xl">Active members</h1>
    <p className="mt-4 text-muted-foreground">Calculated from 2 GBMs and 3 qualifying events in the selected semester. Point adjustments do not change eligibility.</p>
    <SemesterPicker semesters={semesters} selected={selected?.id} />
    {unavailable ? <p role="alert" className="mt-6 rounded-xl border p-5">Active-member reporting is unavailable. Check that the member-reporting migration has been applied.</p> : !selected ? <p className="mt-6">No semesters have been created yet.</p> : <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="font-medium">{rows.length} active member{rows.length === 1 ? '' : 's'} · {selected.name}</p><a href={`/portal/admin/active-members/export?semester=${selected.id}`} className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">Download CSV</a></div>
      <p className="mt-3 text-sm text-muted-foreground">{selected.external_counts_for_membership ? 'General and external events qualify.' : 'General events qualify; external events do not count toward active status.'} Members do not need to have logged into the portal to qualify.</p>
      <ul className="mt-6 space-y-3">{rows.map(r => <li key={r.member_id} className="rounded-xl border p-5"><Link href={`/portal/admin/members/${r.member_id}?semester=${selected.id}`} className="break-words font-medium underline underline-offset-4">{r.full_name || 'Name not provided'}</Link><p className="mt-1 break-all text-sm text-muted-foreground">{r.email}</p><p className="mt-3 text-sm">{r.gbms} GBMs · {r.qualifying_events} qualifying events · {r.points} points</p></li>)}</ul>
      {!rows.length && <p className="mt-6 text-muted-foreground">No members meet the active membership requirements for this semester yet.</p>}
      <p className="mt-4 text-xs text-muted-foreground">Exports reflect the records at download time and contain member contact information. Share them only with the chapter officers who need them.</p>
    </>}
  </Container></Section>
}
