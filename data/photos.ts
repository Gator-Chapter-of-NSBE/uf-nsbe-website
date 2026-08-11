/**
 * Event photography for the homepage carousel.
 *
 * Long-term workflow (not implemented yet):
 *   UF NSBE Google Drive → Event Photos folder → website lists photos
 *   → homepage displays them automatically (no code change / redeploy).
 *
 * For now these are mock entries pointing at bundled placeholder images.
 * Replace `getEventPhotos()` with a fetch to a Google Drive API endpoint that
 * returns the same `EventPhoto[]` shape.
 */

export type EventPhoto = {
  id: string
  src: string
  alt: string
  caption?: string
}

const mockEventPhotos: EventPhoto[] = [
  {
    id: 'gbm',
    src: '/photos/hero-general-body.png',
    alt: 'UF NSBE members gathered at a general body meeting',
    caption: 'General Body Meeting',
  },
  {
    id: 'networking',
    src: '/photos/event-networking.png',
    alt: 'Members networking with recruiters at a career event',
    caption: 'Industry Networking',
  },
  {
    id: 'workshop',
    src: '/photos/event-workshop.png',
    alt: 'Members collaborating during a technical workshop',
    caption: 'Technical Workshop',
  },
  {
    id: 'conference',
    src: '/photos/event-conference.png',
    alt: 'Chapter members representing UF at a national convention',
    caption: 'National Convention',
  },
  {
    id: 'community',
    src: '/photos/event-community.png',
    alt: 'Members mentoring students at a community outreach event',
    caption: 'Community Outreach',
  },
  {
    id: 'social',
    src: '/photos/event-social.png',
    alt: 'Members enjoying a social gathering on campus',
    caption: 'Chapter Social',
  },
]

/**
 * Returns event photos. Swap this implementation for a Google Drive fetch
 * later — the return shape stays the same so the UI does not change.
 */
export function getEventPhotos(): EventPhoto[] {
  return mockEventPhotos
}
