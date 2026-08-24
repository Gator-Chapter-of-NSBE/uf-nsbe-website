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
    id: 'eboard-25-26',
    src: '/photos/NSBE_Eboard_25-26.JPG',
    alt: '2025-2026 Eboard photo',
    caption: '2025-2026 Eboard',
  },
  {
    id: 'gcc',
    src: '/photos/NSBExSASE_GCC.JPG',
    alt: 'SASE and NSBE Gators members networking with industry professionals',
    caption: 'SASE x NSBE Gators and Industry',
  },
  {
    id: 'pci-shadow-day',
    src: '/photos/PCI_Shadow_Day.JPG',
    alt: 'Members participating in PCI Shadow Day',
    caption: 'PCI Shadow Day',
  },
  {
    id: 'golf-clinic',
    src: '/photos/Honeywell_Golf_Clinic.JPG',
    alt: 'UF NSBE members participating in a golf clinic',
    caption: 'Honeywell Golf Clinic',
  },
  {
    id: 'beach-volleyball',
    src: '/photos/NSBE_Beach_Volleyball.JPG',
    alt: 'Members playing beach volleyball at a social event',
    caption: 'Beach Volleyball Social',
  },
  {
    id: 'banquet',
    src: '/photos/Fall_Banquet.JPG',
    alt: 'Members at the Fall Banquet',
    caption: 'Fall Banquet',
  },
]

/**
 * Returns event photos. Swap this implementation for a Google Drive fetch
 * later — the return shape stays the same so the UI does not change.
 */
export function getEventPhotos(): EventPhoto[] {
  return mockEventPhotos
}
