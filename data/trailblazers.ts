/**
 * Current Trailblazers cohort.
 * `cohortYear` is displayed as the program year (e.g. "2026–2027").
 * Add student profiles to `members`. Leave `photo` undefined for a branded
 * placeholder. Do not invent real student information — use [NAME] etc.
 */

export type TrailblazerProfile = {
  name: string
  major?: string
  year?: string
  bio?: string
  photo?: string
}

export const currentCohortYear = '[YEAR]'

export const currentCohort: TrailblazerProfile[] = Array.from({ length: 8 }).map(() => ({
  name: '[NAME]',
  major: '[MAJOR]',
  year: 'Freshman',
  bio: '[SHORT BIO NEEDED]',
}))

/** A small subset spotlighted on the homepage. */
export const cohortSpotlight: TrailblazerProfile[] = currentCohort.slice(0, 4)

/** What participants gain from the program. */
export const trailblazerBenefits = [
  { title: 'Community', description: 'A tight-knit family of peers navigating engineering together from day one.' },
  { title: 'Mentorship', description: 'Guidance from upperclassmen and board members who have walked the path.' },
  { title: 'Professional Development', description: 'Résumé, interview, and career readiness before your first career fair.' },
  { title: 'Academic Support', description: 'Study strategies, course advice, and accountability for a strong start.' },
  { title: 'Technical Development', description: 'Hands-on exposure to tools, projects, and engineering fundamentals.' },
  { title: 'Leadership', description: 'Opportunities to lead initiatives and grow into future chapter leaders.' },
  { title: 'Networking', description: 'Connections with industry, alumni, and the broader NSBE community.' },
] as const

/** High-level program structure across the year. */
export const programStructure = [
  { phase: 'Fall Kickoff', detail: 'Welcome, cohort formation, and mentor pairing.' },
  { phase: 'Skill Building', detail: 'Workshops spanning academics, professional, and technical growth.' },
  { phase: 'Community & Service', detail: 'Social events, service projects, and chapter engagement.' },
  { phase: 'Spring Showcase', detail: 'Reflection, recognition, and transition into chapter leadership.' },
] as const
