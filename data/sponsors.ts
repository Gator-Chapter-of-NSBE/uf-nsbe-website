// Logos are stored locally. See docs/SPONSOR_LOGOS.md for their source URLs.
export const sponsors = [
  {
    name: 'Honeywell Aerospace',
    website: 'https://aerospace.honeywell.com/',
    logo: '/logos/sponsors/honeywell-aerospace.svg',
  },
  { name: 'GE Vernova', logo: '/logos/sponsors/ge-vernova.svg', website: 'https://www.gevernova.com/' },
  {
    name: 'DraftKings',
    website: 'https://www.draftkings.com/',
    logo: '/logos/sponsors/draftkings.svg',
    darkBackground: true,
  },
  { name: 'Disney', logo: '/logos/sponsors/disney.svg', website: 'https://thewaltdisneycompany.com/' },
  {
    name: 'Edwards Lifesciences',
    website: 'https://www.edwards.com/',
    logo: '/logos/sponsors/edwards-lifesciences.svg',
    darkBackground: true,
  },
  {
    name: 'Solidigm',
    website: 'https://www.solidigm.com/',
    logo: '/logos/sponsors/solidigm.png',
    darkBackground: true,
  },
  { name: 'Texas Instruments', logo: '/logos/sponsors/texas-instruments.png', website: 'https://www.ti.com/' },
  { name: 'ExxonMobil', logo: '/logos/sponsors/exxonmobil.png', website: 'https://corporate.exxonmobil.com/' },
  { name: 'Bloomberg', logo: '/logos/sponsors/bloomberg.svg', website: 'https://www.bloomberg.com/company/' },
  { name: 'UKG', logo: '/logos/sponsors/ukg.jpg', website: 'https://www.ukg.com/' },
  { name: 'Jane Street', logo: '/logos/sponsors/jane-street.svg', website: 'https://www.janestreet.com/' },
  { name: 'Procter & Gamble', logo: '/logos/sponsors/procter-gamble.svg', website: 'https://us.pg.com/' },
  { name: 'Duke Energy', logo: '/logos/sponsors/duke-energy.svg', website: 'https://www.duke-energy.com/' },
] satisfies { name: string; logo: string; website: string; darkBackground?: boolean }[]
