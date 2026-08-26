/**
 * Primary site navigation. Grouped items render as dropdown menus on desktop
 * and as expandable sections on mobile.
 */

export type NavLink = {
  label: string
  href: string
  description?: string
}

export type NavGroup = {
  label: string
  href: string
  items: NavLink[]
}

export const navigation: NavGroup[] = [
  {
    label: 'About',
    href: '/about',
    items: [
      { label: 'About UF NSBE', href: '/about', description: 'Our mission, purpose, and community' },
      { label: 'Executive Board', href: '/about/executive-board', description: 'Meet the chapter leadership' },
      { label: 'Chapter History', href: '/about/history', description: 'How the Gator Chapter came to be' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    items: [
      { label: 'Trailblazers', href: '/programs/trailblazers', description: 'First-year development program' },
      { label: 'Professional Development', href: '/programs#professional-development', description: 'Career prep, workshops & networking' },
      { label: 'Design Team', href: '/programs/design-team', description: 'Technical engineering projects' },
    ],
  },
  {
    label: 'Events',
    href: '/events',
    items: [
      { label: 'Calendar', href: '/events#calendar', description: 'Full chapter calendar' },
      { label: 'Instagram', href: '/events#instagram', description: 'Photos & updates from @ufnsbe' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    items: [
      { label: 'Presentations', href: '/resources/presentations', description: 'Slides & materials from events' },
      { label: 'NSBE Resources', href: '/resources#nsbe', description: 'National tools & opportunities' },
      { label: 'Useful Links', href: '/resources#links', description: 'Campus & career resources' },
    ],
  },
  {
    label: 'Get Involved',
    href: '/get-involved',
    items: [
      { label: 'Join NSBE', href: '/get-involved/join', description: 'Become a member' },
      { label: 'Design Team', href: '/programs/design-team', description: 'Build engineering projects' },
      { label: 'Become a Sponsor', href: '/get-involved/sponsor', description: 'Partner with UF NSBE' },
      { label: 'Volunteer / Participate', href: '/get-involved#volunteer', description: 'Give back with the chapter' },
    ],
  },
]
