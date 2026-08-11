/**
 * Resource library. Placeholder presentations for layout only.
 * The long-term source is Google Drive — replace this array with a Drive
 * listing so officers can upload materials without editing code.
 */

export type Presentation = {
  id: string
  title: string
  date: string
  category: string
  description: string
  href?: string // future Google Drive view/download link
  placeholder?: boolean
}

export const presentationCategories = [
  'Professional Development',
  'Technical',
  'General Body',
  'Trailblazers',
] as const

export const presentations: Presentation[] = [
  {
    id: 'resume-workshop',
    title: 'Résumé & LinkedIn Workshop',
    date: '[DATE]',
    category: 'Professional Development',
    description: 'Building a standout engineering résumé and professional profile.',
    placeholder: true,
  },
  {
    id: 'interview-prep',
    title: 'Technical Interview Prep',
    date: '[DATE]',
    category: 'Professional Development',
    description: 'Approaches, practice problems, and behavioral interview guidance.',
    placeholder: true,
  },
  {
    id: 'internship-search',
    title: 'Internship Search Strategies',
    date: '[DATE]',
    category: 'Professional Development',
    description: 'Finding, applying to, and landing internships in engineering.',
    placeholder: true,
  },
  {
    id: 'git-basics',
    title: 'Intro to Git & Version Control',
    date: '[DATE]',
    category: 'Technical',
    description: 'Fundamentals of Git for engineering coursework and projects.',
    placeholder: true,
  },
  {
    id: 'gbm-kickoff',
    title: 'Fall Kickoff — General Body Meeting',
    date: '[DATE]',
    category: 'General Body',
    description: 'Chapter goals, calendar, and how to get involved this year.',
    placeholder: true,
  },
  {
    id: 'trailblazers-orientation',
    title: 'Trailblazers Orientation',
    date: '[DATE]',
    category: 'Trailblazers',
    description: 'Program overview and expectations for the incoming cohort.',
    placeholder: true,
  },
]
