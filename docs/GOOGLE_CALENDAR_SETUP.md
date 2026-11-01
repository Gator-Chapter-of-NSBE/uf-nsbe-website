# Chapter event list

`/events` reads the public chapter Google Calendar and displays upcoming events
over a rolling 183-day window, grouped by month. Officers continue editing events
in Google Calendar. This does not create Supabase attendance events or synchronize
database records yet. The Events dropdown contains Calendar and Newsletter.

## Configuration

1. Enable **Google Calendar API** in the Google Cloud project that owns your API key.
2. In Google Calendar settings for the chapter calendar, enable public access with
   **See all event details**. An API key cannot read a private calendar. Keep any
   private officer-only information on a separate calendar.
3. Add `GOOGLE_CALENDAR_API_KEY` to `.env.local` and Vercel's Production environment.
   Do **not** use a `NEXT_PUBLIC_` prefix. The key is used only by server code.
4. Optionally add `GOOGLE_CALENDAR_ID` to select a different public calendar. If
   omitted, the website's existing chapter calendar ID in `data/calendar.ts` is used.
5. Restart local development or redeploy Vercel after changing environment settings.

```dotenv
GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
GOOGLE_CALENDAR_ID=f302577e7295658f178b08e8f89c746a0996ac9cd8b21b8194d5959b86cf040f@group.calendar.google.com
```

Restrict this key to **Google Calendar API** in Google Cloud. Browser HTTP-referrer
restrictions are incompatible with this server-side fetch. Vercel Hobby has no
fixed outbound IP to allowlist; do not put your visitor-facing domain into a
server key's HTTP-referrer restriction. Use a dedicated key with API restrictions,
keep it in environment settings, and monitor quotas. Member Google login does not
need additional scopes or access to anyone's personal calendar.

## Behavior and maintenance

- The page and API responses revalidate every 300 seconds. Updates normally appear
  on a request after that interval; revalidation can serve the previous cached
  page while refreshing. No cron job or paid add-on is needed.
- Recurring meetings expand into individual occurrences. Cancelled occurrences
  and ended events are excluded. Pagination follows Google's page tokens, including
  empty intermediate pages. A failed page shows the fallback rather than an
  incomplete schedule.
- Timed events display in `America/New_York`, including daylight-saving changes.
  All-day event dates are not shifted by time zones; Google's exclusive all-day
  end date is converted to the last included day for multi-day events.
- Calendar descriptions appear as escaped plain text in expandable details. No
  calendar HTML is injected into the page, and attendee lists are not requested.
- Missing configuration, API errors, and timeouts show an Open Google Calendar
  fallback. A successfully loaded empty calendar has a distinct empty state.
- The subscription link opens Google's calendar-add flow. Individual event links
  open Google Calendar in a new tab.
- With live credentials configured, verify a known upcoming event, an all-day
  event, a recurring occurrence, and a cancellation on the deployed site.

Run `npm run test:calendar` for API, date, grouping, and description tests, and
`npm run typecheck` for TypeScript validation.

Reference: https://developers.google.com/workspace/calendar/api/v3/reference/events/list
