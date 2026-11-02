import type { Semester } from './types'

export type LeaderboardRow = { rank: number; full_name: string; points: number; is_you: boolean }
export type ActiveMemberRow = { member_id: string; full_name: string; email: string; gbms: number; qualifying_events: number; points: number }

export function selectSemester(semesters: Semester[], id?: string) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  return semesters.find(s => s.id === id) ?? semesters.find(s => s.starts_on<=today && s.ends_on>=today) ?? semesters[0]
}

export function activeMembersCsv(semester: string, rows: ActiveMemberRow[]) {
  const cell = (value: string | number) => {
    let text = String(value)
    // Prevent names and other text from being interpreted as spreadsheet formulas.
    if (typeof value === 'string' && /^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text
    return '"' + text.replace(/"/g,'""') + '"'
  }
  const records: (string | number)[][] = [
    ['Semester','Name','UF email','GBMs','Qualifying events','Semester points'],
    ...rows.map(r => [semester,r.full_name,r.email,r.gbms,r.qualifying_events,r.points]),
  ]
  return '\uFEFF' + records.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n'
}
