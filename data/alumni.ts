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

export const alumniProfiles: TrailblazerProfile[] = [
  { name: 'Abigail Scott', 
    major: 'Mechanical Engineering',
  },
  { name: 'Aryanna Williams', 
    major: 'Mechanical Engineering',
  },
  { name: 'Belal Mansour', 
    major: 'Computer Science',
  },
  { name: 'Elijah Sherman', 
    major: 'Computer Science',
  },
  { name: 'Emanique Cunningham', 
    major: 'Electrical Engineering',
  },
  { name: 'Giorgio Rusconi', 
    major: 'Electrical Engineering',
  },
  { name: 'Howard Miller', 
    major: 'Computer Science',
  },
  { name: 'Jaden Edgecombe', 
    major: 'Computer Science',
  },
  { name: 'Jalen White', 
    major: 'Astrophysics',
  },
  { name: 'Jeremiah St. Fleur', 
    major: 'Mechanical Engineering & Electrical Engineering',
  },
  { name: 'Randy Smith Jr.', 
    major: 'Civil Engineering',
  },
  { name: 'Rayanah Mkuu', 
    major: 'Mechanical Engineering',
  },
  { name: 'Sarena Samuels', 
    major: 'Mechanical Engineering',
  },
  { name: 'Selasi Nukunya', 
    major: 'Biomedical Engineering',
  },
  { name: 'Shanique Glasgow', 
    major: 'Mechanical Engineering',
  },
  { name: 'Tyeisha Johnson', 
    major: 'Political Science',
  },
  { name: 'Wisner Henry', 
    major: 'Civil Engineering', 
  },
]

export const alumniCohorts: AlumniCohort[] = [
  //{ year: '2025–2026', members: alumniProfiles.slice(0, 6) },
  //{ year: '2024–2025', members: alumniProfiles.slice(6, 12) },
  { year: '2023–2024', members: alumniProfiles.slice(0, 17) },
]
