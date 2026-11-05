import Link from 'next/link'
import { paginationPages } from '@/lib/portal/event-attendance'

export function EventPagination({ page, total, filters }: {
  page: number; total: number; filters: { q: string; semester: string; category: string }
}) {
  const pages = Math.max(1,Math.ceil(total/25))
  const href = (n: number) => `/portal/admin/previous-events?${new URLSearchParams({...filters,page:String(n)})}`
  const style = 'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm'
  const control = (label: string, target: number, disabled: boolean, aria: string) => disabled
    ? <span aria-disabled="true" aria-label={aria} className={`${style} text-muted-foreground opacity-50`}>{label}</span>
    : <Link href={href(target)} prefetch={false} aria-label={aria} className={`${style} hover:bg-secondary`}>{label}</Link>
  return <nav aria-label="Previous events pagination" className="mt-8 space-y-4 border-t pt-6">
    <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
    <div className="flex flex-wrap items-center gap-2">
      {control('First',1,page===1||total===0,'First page')}
      {control('Previous',page-1,page===1||total===0,'Previous page')}
      {total>0 && paginationPages(page,pages).map((n,i)=>n==='ellipsis'
        ? <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground" aria-label="Skipped pages">…</span>
        : n===page ? <span key={n} aria-current="page" aria-label={`Page ${n}, current page`} className={`${style} border-primary bg-primary font-medium text-primary-foreground`}>{n}</span>
          : <Link key={n} href={href(n)} prefetch={false} aria-label={`Page ${n}`} className={`${style} hover:bg-secondary`}>{n}</Link>)}
      {control('Next',page+1,page===pages||total===0,'Next page')}
      {control('Last',pages,page===pages||total===0,'Last page')}
    </div>
    <form className="flex flex-wrap items-end gap-3">
      {Object.entries(filters).map(([key,value])=><input key={key} type="hidden" name={key} value={value}/>)}
      <label htmlFor="event-page-jump" className="text-sm font-medium">Go to page<input id="event-page-jump" name="page" type="number" inputMode="numeric" min={1} max={pages} step={1} required defaultValue={page} disabled={total===0} className="ml-3 min-h-11 w-24 rounded-md border bg-background px-3 text-sm disabled:opacity-50"/></label>
      <button disabled={total===0} className="min-h-11 rounded-md border px-4 text-sm hover:bg-secondary disabled:opacity-50">Go</button>
    </form>
  </nav>
}
