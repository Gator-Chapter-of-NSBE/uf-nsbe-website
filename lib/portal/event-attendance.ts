export const eventCategories = [
  { value: 'general', label: 'General event' }, { value: 'gbm', label: 'GBM' },
  { value: 'external', label: 'External event' }, { value: 'trailblazers', label: 'Trailblazers' },
] as const
export const categoryLabel = (value: string) => eventCategories.find(c => c.value===value)?.label ?? value
export const attendanceEventDate = (value: string) => new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York',
}).format(new Date(value))
export type EventAttendee = {
  id: string; member_id: string; checked_in_at: string; source: string
  member: { full_name: string; email: string } | null
}
export function filterAttendees(rows: EventAttendee[], query: string) {
  const needle=query.trim().toLowerCase()
  return rows.filter(r => `${r.member?.full_name ?? ''}\n${r.member?.email ?? ''}`.toLowerCase().includes(needle))
    .sort((a,b) => (a.member?.full_name ?? '').localeCompare(b.member?.full_name ?? '') ||
      (a.member?.email ?? '').localeCompare(b.member?.email ?? '') || a.id.localeCompare(b.id))
}

export function parsePage(value?: string) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return 1
  return Math.max(1,Math.min(2147483647,Number(value)))
}

export function paginationPages(page: number, total: number): (number | 'ellipsis')[] {
  if (total < 1) return []
  if (total <= 7) return Array.from({length:total},(_,i)=>i+1)
  const current = Math.max(1,Math.min(total,page))
  const pages = new Set([1,total,current])
  const start = current <= 3 ? 2 : current >= total-2 ? total-3 : current-1
  const end = current <= 3 ? 4 : current >= total-2 ? total-1 : current+1
  for (let n=start;n<=end;n++) if (n>1 && n<total) pages.add(n)
  const sorted = [...pages].sort((a,b)=>a-b)
  const result: (number|'ellipsis')[] = []
  for (const n of sorted) {
    const previous = result[result.length-1]
    if (typeof previous==='number') {
      if (n-previous===2) result.push(previous+1)
      else if (n-previous>2) result.push('ellipsis')
    }
    result.push(n)
  }
  return result
}
