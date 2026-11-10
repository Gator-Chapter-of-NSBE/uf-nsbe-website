import { PortalViewShell } from '@/components/portal/portal-view'
import { previewHref } from '@/lib/portal/view'
import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'
import { requireParticipationViewer } from '@/lib/portal/session'
import { fieldClass, buttonClass } from '@/lib/check-in'

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; preview?: string }> }) {
  const params = await searchParams
  const { supabase, view } = await requireParticipationViewer(params.preview)
  const query = typeof params.q === 'string' ? params.q.trim().slice(0,120) : ''
  const page = Math.max(1, Math.min(10000, Math.floor(Number(params.page) || 1)))
  const { data, error } = await supabase.rpc('search_chapter_members', { p_query: query, p_page: page })
  const members = (data ?? []) as { id: string; full_name: string; email: string; classification: string; total_count: number }[]
  const href = (p: number) => previewHref(`/portal/admin/members?${new URLSearchParams({ q: query, page: String(p) })}`,view.preview)
  return <Section className="pt-10"><Container className="max-w-4xl"><PortalViewShell view={view}>
    <Link href={previewHref('/portal',view.preview)} className="text-sm underline underline-offset-4">Back to dashboard</Link>
    {view.showAdmin&&<Link href="/portal/admin/active-members" className="ml-5 text-sm underline underline-offset-4">Active members & CSV export</Link>}
    <p className="eyebrow mt-8">{view.showAdmin?'Chapter administration':'E-board participation review'}</p><h1 className="mt-3 font-serif text-4xl">{view.showAdmin?'Member management':'Member directory'}</h1>
    <p className="mt-4 text-muted-foreground">{view.showAdmin?'Review member points, correct attendance, and record bonuses or deductions.':'View member attendance, points and membership status. Your access is read-only.'}</p>
    <form className="mt-8 flex flex-wrap gap-3">{view.preview&&<input type="hidden" name="preview" value={view.preview}/>}<label className="min-w-0 flex-1"><span className="sr-only">Search by name or UF email</span><input name="q" defaultValue={query} maxLength={120} placeholder="Search by name or UF email" className={fieldClass} /></label><button className={buttonClass}>Search</button></form>
    {error ? <p role="alert" className="mt-6 rounded-xl border p-5">Member search is unavailable. Check that the member-management migration has been applied.</p> : <>
      <p className="mt-5 text-sm text-muted-foreground">{members.length ? `${members[0].total_count} matching members · Page ${page}` : 'No members found.'}</p>
      <ul className="mt-4 divide-y rounded-xl border px-5">{members.map(m => <li key={m.id}><Link href={previewHref(`/portal/admin/members/${m.id}`,view.preview)} className="block py-5 hover:underline"><p className="font-medium">{m.full_name || 'Name not provided'}</p><p className="mt-1 break-all text-sm text-muted-foreground">{m.email}</p>{m.classification && <p className="mt-1 text-xs text-muted-foreground">{m.classification}</p>}</Link></li>)}</ul>
      <nav aria-label="Member search pages" className="mt-6 flex gap-6">{page > 1 && <Link href={href(page-1)} className="underline">Previous</Link>}{members.length > 0 && page*25 < Number(members[0].total_count) && <Link href={href(page+1)} className="underline">Next</Link>}</nav>
    </>}
  </PortalViewShell></Container></Section>
}
