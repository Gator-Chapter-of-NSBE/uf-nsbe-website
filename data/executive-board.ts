/**
 * Executive Board directory.
 * Photography is not yet available — leave `photo` undefined to render a
 * tasteful branded placeholder. Add a path under /public/photos when ready.
 * Replace [NAME] and other bracketed placeholders with confirmed details.
 */

export type BoardMember = {
  name: string
  position: string
  major?: string
  year?: string
  bio?: string
  photo?: string
  linkedin?: string
}

export const executiveBoard: BoardMember[] = [
  {
    name: '[NAME]',
    position: 'President',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
    linkedin: '[LINKEDIN URL]',
  },
  {
    name: '[NAME]',
    position: 'Vice President',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
  },
  {
    name: '[NAME]',
    position: 'Secretary',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
  },
  {
    name: '[NAME]',
    position: 'Treasurer',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
  },
  {
    name: '[NAME]',
    position: 'Programs Chair',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
  },
  {
    name: '[NAME]',
    position: 'Professional Development Chair',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
  },
  {
    name: '[NAME]',
    position: 'Design & Media Chair',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
  },
  {
    name: '[NAME]',
    position: 'Trailblazers Coordinator',
    major: '[MAJOR]',
    year: '[YEAR]',
    bio: '[SHORT BIO NEEDED]',
  },
]
