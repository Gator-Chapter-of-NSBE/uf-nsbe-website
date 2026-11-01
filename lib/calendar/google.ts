import 'server-only'
import { chapterCalendarId } from '../../data/calendar'
import { normalizeEvent, type CalendarEvent, type GoogleEvent } from './events'

export type CalendarResult = {
  status: 'ready' | 'unconfigured' | 'unavailable'
  events: CalendarEvent[]
  calendarId: string
}

type CalendarOptions = {
  apiKey?: string
  calendarId: string
  now?: Date
  fetcher?: typeof fetch
}

export async function fetchCalendarEvents({
  apiKey,
  calendarId,
  now = new Date(),
  fetcher = fetch,
}: CalendarOptions): Promise<CalendarResult> {
  if (!apiKey) return { status: 'unconfigured', events: [], calendarId }
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 183)
  const events = new Map<string, CalendarEvent>()
  let pageToken = ''
  const seenTokens = new Set<string>()
  try {
    do {
      const url = new URL(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      )
      url.search = new URLSearchParams({
        key: apiKey,
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        showDeleted: 'false',
        maxResults: '250',
        timeZone: 'America/New_York',
        fields:
          'items(id,status,summary,description,location,htmlLink,start,end),nextPageToken',
        ...(pageToken ? { pageToken } : {}),
      }).toString()
      const response = await fetcher(url, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error('Calendar request failed')
      const data = (await response.json()) as {
        items?: GoogleEvent[]
        nextPageToken?: string
      }
      if (data.items !== undefined && !Array.isArray(data.items))
        throw new Error('Invalid calendar response')
      for (const item of data.items ?? []) {
        const event = normalizeEvent(item, now)
        if (event) events.set(event.id, event)
      }
      pageToken = data.nextPageToken ?? ''
      if (pageToken && (seenTokens.has(pageToken) || seenTokens.size >= 20))
        throw new Error('Invalid calendar pagination')
      if (pageToken) seenTokens.add(pageToken)
    } while (pageToken)
    return { status: 'ready', events: [...events.values()], calendarId }
  } catch {
    // Never log a request URL or raw Google error: the URL contains the API key.
    return { status: 'unavailable', events: [], calendarId }
  }
}

export function getCalendarEvents() {
  return fetchCalendarEvents({
    apiKey: process.env.GOOGLE_CALENDAR_API_KEY,
    calendarId: process.env.GOOGLE_CALENDAR_ID?.trim() || chapterCalendarId,
  })
}
