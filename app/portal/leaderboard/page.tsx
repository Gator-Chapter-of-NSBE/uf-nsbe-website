import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'
import { SemesterPicker } from '@/components/portal/semester-picker'
import { requireMember } from '@/lib/portal/session'
import { readAll } from '@/lib/portal/read-all'
import { selectSemester, type LeaderboardRow } from '@/lib/portal/reporting'
import type { Semester } from '@/lib/portal/types'

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ semester?: string }> }) {
  const { supabase } = await requireMember()
  const semesters = await readAll<Semester>((a,b) => supabase.from('semesters').select('*').order('starts_on', { ascending: false }).range(a,b))
  const selected = selectSemester(semesters,(await searchParams).semester)
  let rows: LeaderboardRow[] = []
  let unavailable = false
  if (selected) {
    try { rows = await readAll<LeaderboardRow>((a,b) => supabase.rpc('semester_leaderboard', { p_semester: selected.id }).range(a,b)) }
    catch { unavailable = true }
  }
  const own = rows.find(r => r.is_you)
  return <Section className="pt-10"><Container className="max-w-3xl">
    <Link href="/portal" className="text-sm underline underline-offset-4">Back to dashboard</Link><p className="eyebrow mt-8">Member portal</p><h1 className="mt-3 font-serif text-4xl">Points leaderboard</h1>
    <p className="mt-4 text-muted-foreground">Chapter involvement, one semester at a time. Scores include attendance and recorded admin adjustments. Equal scores share a rank; no tiebreaker is applied.</p>
    <SemesterPicker semesters={semesters} selected={selected?.id} />
    {unavailable ? <p role="alert" className="mt-6 rounded-xl border p-5">The leaderboard is unavailable. Please try again later.</p> : !selected ? <p className="mt-6">No semesters have been created yet.</p> : <>
      <p className="mt-6 rounded-xl border bg-muted/30 p-5">{own ? `Your rank: #${own.rank} · ${own.points} points in ${selected.name}.` : `You have no recorded activity in ${selected.name} yet.`}</p>
      {rows.length ? <div className="mt-6 rounded-xl border"><table className="w-full table-fixed text-left text-sm"><caption className="sr-only">{selected.name} points leaderboard</caption><thead className="border-b"><tr><th scope="col" className="w-20 p-4">Rank</th><th scope="col" className="p-4">Member</th><th scope="col" className="w-24 p-4 text-right">Points</th></tr></thead><tbody className="divide-y">{rows.map((r,i) => <tr key={i} className={r.is_you ? 'bg-nsbe-green/10' : ''}><td className="p-4">#{r.rank}</td><th scope="row" className="break-words p-4 font-medium">{r.full_name}{r.is_you && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</th><td className="p-4 text-right">{r.points}</td></tr>)}</tbody></table></div> : <p className="mt-6 text-muted-foreground">No activity has been recorded for this semester.</p>}
      <p className="mt-4 text-xs text-muted-foreground">Only members with chapter attendance or adjustments in this semester appear. Trailblazers attendance is excluded. This leaderboard is available to signed-in UF members.</p>
    </>}
  </Container></Section>
}
