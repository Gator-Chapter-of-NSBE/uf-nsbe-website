/**
 * Events. These are clearly-marked PLACEHOLDER events for layout only.
 * The long-term source of truth is Google Calendar — replace this array with a
 * Google Calendar API response mapped to the `NsbeEvent` shape.
 * Do not hardcode real-world dates or event details here.
 */

export type NsbeEvent = {
  id: string
  title: string
  date: string // human-readable placeholder, e.g. "[DATE]"
  time: string
  location: string
  description: string
  placeholder?: boolean
  category?: string
}

export const upcomingEvents: NsbeEvent[] = [
  {
    id: 'gbm',
    title: 'General Body Meeting',
    date: '[DATE]',
    time: '[TIME]',
    location: '[LOCATION]',
    description: 'Chapter updates, announcements, and community. Open to all members.',
    category: 'Chapter',
    placeholder: true,
  },
  {
    id: 'prof-dev',
    title: 'Professional Development Workshop',
    date: '[DATE]',
    time: '[TIME]',
    location: '[LOCATION]',
    description: 'Career readiness session covering résumés, interviews, and recruiting.',
    category: 'Professional Development',
    placeholder: true,
  },
  {
    id: 'trailblazers-session',
    title: 'Trailblazers Cohort Session',
    date: '[DATE]',
    time: '[TIME]',
    location: '[LOCATION]',
    description: 'First-year cohort programming with mentors and workshops.',
    category: 'Trailblazers',
    placeholder: true,
  },
]

export const pastEvents: NsbeEvent[] = [
  {
    id: 'career-fair',
    title: 'Industry Networking Night',
    date: '[DATE]',
    time: '[TIME]',
    location: '[LOCATION]',
    description: 'Members connected with recruiters and industry professionals.',
    category: 'Professional Development',
    placeholder: true,
  },
  {
    id: 'convention',
    title: 'NSBE National Convention',
    date: '[DATE]',
    time: '[TIME]',
    location: '[LOCATION]',
    description: 'Chapter representation at the national NSBE gathering.',
    category: 'National',
    placeholder: true,
  },
  {
    id: 'service',
    title: 'STEM Community Outreach',
    date: '[DATE]',
    time: '[TIME]',
    location: '[LOCATION]',
    description: 'Mentoring local students through hands-on STEM activities.',
    category: 'Service',
    placeholder: true,
  },
]

/**
 * Event options for the meeting sign-in form. This list will eventually be
 * populated dynamically (e.g. from Google Calendar). Keep values URL-safe so
 * an event can be preselected via /sign-in?event=EVENT_ID.
 */
export const signInEventOptions: { id: string; label: string }[] = [
  { id: 'general-body-meeting', label: 'General Body Meeting' },
  { id: 'professional-development', label: 'Professional Development Workshop' },
  { id: 'trailblazers-session', label: 'Trailblazers Cohort Session' },
  { id: 'design-team-meeting', label: 'Design Team Meeting' },
  { id: 'social', label: 'Social / Community Event' },
  { id: 'other', label: 'Other' },
]
