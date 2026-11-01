export const chapterCalendarId =
  'f302577e7295658f178b08e8f89c746a0996ac9cd8b21b8194d5959b86cf040f@group.calendar.google.com'

export function calendarLinks(calendarId: string) {
  const id = encodeURIComponent(calendarId)
  return {
    view: `https://calendar.google.com/calendar/u/0/r?cid=${id}`,
    subscribe: `https://calendar.google.com/calendar/u/0/r?cid=${id}`,
  }
}
