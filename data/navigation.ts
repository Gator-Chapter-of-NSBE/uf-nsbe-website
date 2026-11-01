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
      {
        label: 'About UF NSBE',
        href: '/about',
        description: 'Our mission, purpose, and community',
      },
      {
        label: 'Executive Board',
        href: '/about/executive-board',
        description: 'Meet the chapter leadership',
      },
      {
        label: 'Chapter History',
        href: '/about/history',
        description: 'How the Gator Chapter came to be',
      },
    ],
  },
  {
    label: 'Trailblazers',
    href: '/programs/trailblazers',
    items: [
      {
        label: 'Current Cohort',
        href: '/programs/trailblazers/cohort',
        description: 'Meet the Trailblazers cohort',
      },
      {
        label: 'Alumni',
        href: '/programs/trailblazers/alumni',
        description: 'Our past Trailblazers',
      },
    ],
  },
  {
    label: 'Events',
    href: '/events',
    items: [
      {
        label: 'Calendar',
        href: '/events#calendar',
        description: 'Full chapter calendar',
      },
      {
        label: 'Newsletter',
        href: '/newsletter',
        description: 'The NSBE Wire newsletter',
      },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    items: [
      // Presentations page is archived until the library is ready to launch — see app/resources/presentations/page.tsx
      {
        label: 'NSBE Resources',
        href: '/resources#nsbe',
        description: 'National tools & opportunities',
      },
      {
        label: 'Useful Links',
        href: '/resources#links',
        description: 'Campus & career resources',
      },
    ],
  },
  {
    label: 'Get Involved',
    href: '/get-involved',
    items: [
      {
        label: 'Join NSBE',
        href: '/get-involved/join',
        description: 'Become a member',
      },
      {
        label: 'Member Portal',
        href: '/portal',
        description: 'Your attendance, points, and membership',
      },
      {
        label: 'Our Sponsors',
        href: '/get-involved/sponsor',
        description: 'Meet the organizations supporting our chapter',
      },
    ],
  },
]
