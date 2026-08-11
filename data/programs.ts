/**
 * UF NSBE programs. Add future programs to this array and they will appear
 * automatically across the Programs experience.
 */

export type Program = {
  slug: string
  name: string
  tagline: string
  description: string
  href: string
  cta: string
  highlights: string[]
}

export const programs: Program[] = [
  {
    slug: 'trailblazers',
    name: 'Trailblazers',
    tagline: 'First-year development & community',
    description:
      'A freshman development and community program designed to help incoming students grow academically, professionally, technically, and socially — from their very first semester at UF.',
    href: '/programs/trailblazers',
    cta: 'Explore Trailblazers',
    highlights: ['Mentorship', 'Academic support', 'Professional growth', 'Community'],
  },
  {
    slug: 'professional-development',
    name: 'Professional Development',
    tagline: 'Career preparation & industry access',
    description:
      'Workshops, career preparation, industry events, networking, and technical development that prepare members to lead in engineering and beyond.',
    href: '/programs#professional-development',
    cta: 'Learn more',
    highlights: ['Career workshops', 'Industry networking', 'Technical skills', 'Interview prep'],
  },
  {
    slug: 'design-team',
    name: 'Design Team',
    tagline: 'The creative & digital division',
    description:
      'The creative and digital division of UF NSBE — responsible for shaping the organization’s visual identity, media presence, branding, and digital experiences.',
    href: '/programs/design-team',
    cta: 'Join the Design Team',
    highlights: ['Branding', 'Graphic design', 'Photo & video', 'Web & digital'],
  },
]
