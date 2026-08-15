/**
 * Global site configuration.
 * A future UF NSBE webmaster can update contact details and social links here.
 * Use the [PLACEHOLDER] markers until real information is confirmed.
 */

export const site = {
  name: 'UF NSBE',
  fullName: 'University of Florida Gator Chapter of the National Society of Black Engineers',
  shortTagline: 'Engineering the future. Building Black excellence.',
  url: 'https://ufnsbe.org',
  // Contact information — replace placeholders with real values when available.
  email: 'president.ufnsbe@gmail.com',
  location: 'University of Florida · Gainesville, FL',
  social: {
    instagram: {
      handle: '@ufnsbe',
      url: 'https://www.instagram.com/ufnsbe/',
    },
    // Add more channels here as they become available.
    linkedin: 'https://www.linkedin.com/in/nsbe-uf-gator-chapter-203046419/',
    discord: 'https://discord.gg/Cf3GujpTRh',
    national: 'https://www.nsbe.org/',
  },
  contacts: [
    { name: 'Bakari Kerr', role: 'Webmaster', email: 'webmaster.ufnsbe@gmail.com' },
    { name: 'Franck Mboussou', role: 'President', email: 'president.ufnsbe@gmail.com' },
    { name: 'Ryan Lowe', role: 'Vice President', email: 'vpresidentufnsbe@gmail.com' },
    { name: 'Bolu Abegunde', role: 'Treasurer', email: 'treasurer.ufnsbe@gmail.com' },
  ],
} as const

export type Site = typeof site
