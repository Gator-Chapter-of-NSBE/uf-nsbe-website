export const calendarTimeZone = 'America/New_York'

export type GoogleEvent = {
  id?: string
  status?: string
  summary?: string
  description?: string
  location?: string
  htmlLink?: string
  start?: { date?: string; dateTime?: string }
  end?: { date?: string; dateTime?: string }
}

export type CalendarEvent = {
  id: string
  title: string
  description: string
  location: string
  url: string | null
  start: string
  end: string
  allDay: boolean
}

export function localDate(value: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: calendarTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)
  const part = (type: string) =>
    parts.find((entry) => entry.type === type)!.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function descriptionText(value: string) {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  }
  return value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>|<\/p>|<\/div>|<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(
      /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
      (match, entity: string) => {
        if (!entity.startsWith('#'))
          return entities[entity.toLowerCase()] ?? match
        const code =
          entity[1].toLowerCase() === 'x'
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10)
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
      },
    )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
    .slice(0, 4000)
}

function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
    new Date(`${value}T12:00:00Z`).toISOString().startsWith(value)
  )
}

export function normalizeEvent(
  event: GoogleEvent,
  now: Date,
): CalendarEvent | null {
  if (!event.id || event.status === 'cancelled') return null
  const allDay = Boolean(event.start?.date)
  const start = allDay ? event.start?.date : event.start?.dateTime
  const end = allDay ? event.end?.date : event.end?.dateTime
  if (!start || !end) return null
  if (allDay) {
    if (
      !validDate(start) ||
      !validDate(end) ||
      end <= start ||
      end <= localDate(now)
    )
      return null
  } else if (
    !Number.isFinite(Date.parse(start)) ||
    !Number.isFinite(Date.parse(end)) ||
    Date.parse(end) <= Date.parse(start) ||
    Date.parse(end) <= now.getTime()
  )
    return null
  let url: string | null = null
  try {
    const link = new URL(event.htmlLink ?? '')
    if (
      link.protocol === 'https:' &&
      ['www.google.com', 'calendar.google.com'].includes(link.hostname)
    )
      url = link.href
  } catch {
    /* Events without a valid Google link can still be listed. */
  }
  return {
    id: event.id,
    title: event.summary?.trim() || 'Chapter event',
    description: descriptionText(event.description ?? ''),
    location: event.location?.trim() ?? '',
    url,
    start,
    end,
    allDay,
  }
}

export function eventDay(event: CalendarEvent) {
  return event.allDay ? event.start : localDate(new Date(event.start))
}

export function dateLabel(day: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'UTC',
  }).format(new Date(`${day}T12:00:00Z`))
}

export function eventSchedule(event: CalendarEvent) {
  if (event.allDay) {
    const last = new Date(`${event.end}T12:00:00Z`)
    last.setUTCDate(last.getUTCDate() - 1)
    const lastDay = last.toISOString().slice(0, 10)
    return lastDay === event.start
      ? 'All day'
      : `All day · through ${dateLabel(lastDay, { month: 'short', day: 'numeric', year: 'numeric' })}`
  }
  const time = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: calendarTimeZone,
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value))
  const endDay = localDate(new Date(event.end))
  return `${time(event.start)} – ${endDay === eventDay(event) ? '' : dateLabel(endDay, { month: 'short', day: 'numeric' }) + ', '}${time(event.end)}`
}

export function groupEvents(events: CalendarEvent[]) {
  const months = new Map<string, CalendarEvent[]>()
  for (const event of [...events].sort(
    (a, b) =>
      eventDay(a).localeCompare(eventDay(b)) ||
      Number(b.allDay) - Number(a.allDay) ||
      Date.parse(a.start) - Date.parse(b.start) ||
      a.id.localeCompare(b.id),
  )) {
    const key = eventDay(event).slice(0, 7)
    const group = months.get(key) ?? []
    group.push(event)
    months.set(key, group)
  }
  return [...months].map(([month, entries]) => ({
    month,
    label: dateLabel(`${month}-01`, { month: 'long', year: 'numeric' }),
    events: entries,
  }))
}
