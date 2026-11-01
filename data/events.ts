/**
 * Event data. The chapter's Google Calendar (listed on /events) is the
 * source of truth for what's happening and when — no event list is
 * hardcoded here.
 */

/**
 * Event options for the meeting sign-in form. This list will eventually be
 * populated dynamically (e.g. from Google Calendar). Keep values URL-safe so
 * an event can be preselected via /sign-in?event=EVENT_ID.
 */
export const signInEventOptions: { id: string; label: string }[] = [
  { id: 'general-body-meeting', label: 'General Body Meeting' },
  { id: 'professional-development', label: 'Professional Development Workshop' },
  { id: 'trailblazers-session', label: 'Trailblazers Cohort Session' },
  { id: 'social', label: 'Social / Community Event' },
  { id: 'other', label: 'Other' },
]
