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
  email: '[EMAIL NEEDED]',
  location: 'University of Florida · Gainesville, FL',
  social: {
    instagram: {
      handle: '@ufnsbe',
      url: 'https://www.instagram.com/ufnsbe/',
    },
    // Add more channels here as they become available.
    linkedin: '[LINKEDIN URL NEEDED]',
    national: 'https://www.nsbe.org/',
  },
} as const

export type Site = typeof site
