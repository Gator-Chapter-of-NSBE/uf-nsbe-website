/**
 * Trailblazers alumni, organized by cohort year. Add new cohorts to the top of
 * the array. The directory scales to many years automatically.
 * Do not invent alumni — use placeholders until real data is provided.
 */

import type { TrailblazerProfile } from './trailblazers'

export type AlumniCohort = {
  year: string
  members: TrailblazerProfile[]
}

const placeholderProfiles = (count: number): TrailblazerProfile[] =>
  Array.from({ length: count }).map(() => ({
    name: '[NAME]',
    major: '[MAJOR]',
    bio: '[CONTENT NEEDED]',
  }))

export const alumniCohorts: AlumniCohort[] = [
  { year: '2025–2026', members: placeholderProfiles(6) },
  { year: '2024–2025', members: placeholderProfiles(6) },
  { year: '2023–2024', members: placeholderProfiles(6) },
]
