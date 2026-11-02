import { mkdir, writeFile } from 'node:fs/promises'
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd())
const output = 'migration-review/fall-2026'
await mkdir(output, { recursive: true })
const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim() || 'f302577e7295658f178b08e8f89c746a0996ac9cd8b21b8194d5959b86cf040f@group.calendar.google.com'
const status = { calendarId, timeMin: '2026-08-01T00:00:00-04:00', timeMax: '2026-11-01T00:00:00-04:00', fetchedAt: new Date().toISOString(), status: 'unconfigured', count: 0 }
const events = new Map()
if (process.env.GOOGLE_CALENDAR_API_KEY) {
  try {
    let pageToken = ''
    const tokens = new Set()
    do {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`)
      url.search = new URLSearchParams({ key: process.env.GOOGLE_CALENDAR_API_KEY, timeMin: status.timeMin, timeMax: status.timeMax, singleEvents: 'true', showDeleted: 'false', orderBy: 'startTime', maxResults: '250', timeZone: 'America/New_York', fields: 'items(id,status,summary,description,location,start,end),nextPageToken', ...(pageToken ? { pageToken } : {}) }).toString()
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error(`Google Calendar returned HTTP ${response.status}`)
      const data = await response.json()
      if (data.items !== undefined && !Array.isArray(data.items)) throw new Error('Invalid calendar response')
      for (const event of data.items ?? []) if (event.id && event.status !== 'cancelled') events.set(event.id, event)
      pageToken = data.nextPageToken ?? ''
      if (pageToken && (tokens.has(pageToken) || tokens.size >= 20)) throw new Error('Invalid calendar pagination')
      if (pageToken) tokens.add(pageToken)
    } while (pageToken)
    status.status = 'ready'
    status.count = events.size
  } catch {
    status.status = 'unavailable'
    events.clear()
  }
}
if (status.status === 'ready') await writeFile(`${output}/calendar-reference.json`, JSON.stringify({ ...status, events: [...events.values()] }, null, 2) + '\n')
await writeFile(`${output}/calendar-status.json`, JSON.stringify(status, null, 2) + '\n')
console.log(`Historical calendar: ${status.status}; ${status.count} events. No database writes.`)
