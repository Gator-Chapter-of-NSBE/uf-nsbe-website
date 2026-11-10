import type { Semester } from '@/lib/portal/types'

export function SemesterPicker({ semesters, selected, preview }: { semesters: Semester[]; selected?: string; preview?: 'member' | 'eboard' | null }) {
  if (!semesters.length) return null
  return <form className="mt-6 flex flex-wrap items-end gap-3">{preview&&<input type="hidden" name="preview" value={preview}/>}<label className="text-sm font-medium">Semester<select name="semester" defaultValue={selected} className="mt-2 block min-h-11 max-w-full rounded-md border bg-background px-3 text-sm">{semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><button className="min-h-11 rounded-md border px-4 text-sm">View</button></form>
}
