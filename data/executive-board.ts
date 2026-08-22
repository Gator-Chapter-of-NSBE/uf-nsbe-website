/**
 * Executive Board directory.
 * Photography is not yet available — leave `photo` undefined to render a
 * tasteful branded placeholder. Add a path under /public/photos when ready.
 * Replace [NAME] and other bracketed placeholders with confirmed details.
 *
 * ZONES: the chapter groups its e-board into "zones." Every member has a
 * `zone` field (one of the `Zone` values below) that controls which heading
 * their card appears under on the Executive Board page. To move someone to
 * a different zone, just change their `zone` value — no other code needs
 * to change. `ZONE_ORDER` controls the order zones are displayed in.
 */

export const ZONES = [
  'Admin Zone',
  'Membership Zone',
  'Trailblazers Zone',
  'Finance Zone',
  'Communications Zone',
  'Programs Zone',
  'Senate Zone',
] as const

export type Zone = (typeof ZONES)[number]

/** Display order for zone sections on the Executive Board page. */
export const ZONE_ORDER: Zone[] = [...ZONES]

export type BoardMember = {
  name: string
  position: string
  major?: string
  year?: string
  bio?: string
  photo?: string
  linkedin?: string
  /** Which e-board zone this member belongs to. Defaults everyone to 'Admin Zone' until assigned. */
  zone: Zone
}

export const executiveBoard: BoardMember[] = [
  {
    name: 'Franck Mboussou',
    position: 'President',
    major: 'Computer Science & Linguistics',
    year: '5th Year',
    linkedin: 'https://www.linkedin.com/in/franck-mboussou/',
    zone: 'Admin Zone',
  },
  {
    name: 'Ryan Lowe',
    position: '1st Vice President',
    major: 'Mechanical Engineering',
    year: 'Senior',
    linkedin: 'https://www.linkedin.com/in/ryan-a-lowe/',
    zone: 'Admin Zone',
  },
  {
    name: 'Zion Tomlin',
    position: '2nd Vice President',
    major: 'Mechanical Engineering & Dance',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/zion-tomlin-1b8998313/',
    zone: 'Admin Zone',
  },
  {
    name: 'Boluwatife \'Bolu\' Abegunde',
    position: 'Treasurer',
    major: 'Computer Science & Economics',
    year: 'Senior',
    linkedin: 'https://www.linkedin.com/in/boluwatife-abegunde/',
    zone: 'Admin Zone',
  },
  {
    name: 'Tiffany Jones',
    position: 'Secretary',
    major: 'Environmental Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/tiffanyjones05/',
    zone: 'Admin Zone',
  },
  {
    name: 'Keith Joseph',
    position: 'Programs Chair',
    major: 'Civil Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/keith-arma-joseph/',
    zone: 'Admin Zone',
  },
  {
    name: 'Brenley \'JJ\' Jean',
    position: 'Parliamentarian',
    major: 'Computer Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/brenleyjean/',
    zone: 'Admin Zone',
  },
  {
    name: 'Brenley \'JJ\' Jean',
    position: 'Parliamentarian',
    major: 'Computer Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/brenleyjean/',
    zone: 'Admin Zone',
  },
  {
    name: 'Ryon Williams',
    position: 'Membership Chair',
    major: 'Environmental Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/ryonwilliams/',
    zone: 'Admin Zone',
  },
  {
    name: 'Xeno Long',
    position: 'Co-Social Chair',
    major: 'Computer Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/xenolong/',
    zone: 'Admin Zone',
  },
  {
    name: 'Abigail Alcide',
    position: 'Co-Social Chair',
    major: 'Aerospace Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/abigail-kayla-alcide-548a35337/',
    zone: 'Admin Zone',
  },
  {
    name: 'Keiya Johnson',
    position: 'Health & Wellness Chair',
    major: 'Nuclear Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/keiya-johnson/',
    zone: 'Admin Zone',
  },
  {
    name: 'Oluchi \'Lu\' Ighodalo',
    position: 'International Chair',
    major: 'Computer Science',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/luighodalo/',
    zone: 'Admin Zone',
  },
  {
    name: 'Noel Clarke',
    position: 'Pre-Professional Director',
    major: 'Electrical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/noel-clarke-uf/',
    zone: 'Admin Zone',
  }, 
  {
    name: 'Danielle Morgan',
    position: 'Internal & Social Director',
    major: 'Computer Science & Biology',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/danielle-morgan28/',
    zone: 'Admin Zone',
  },   
  {
    name: 'Taliya Denis',
    position: 'External & Financial Director',
    major: 'Computer Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/taliya-denis/',
    zone: 'Admin Zone',
  },
  {
    name: 'Kaden Cameron',
    position: 'Co-Software Technical Director',
    major: 'Electrical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/kaden-cameron/',
    zone: 'Admin Zone',
  },
  {
    name: 'Moline Charles',
    position: 'Co-Software Technical Director',
    major: 'Computer Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/molinecharles/',
    zone: 'Admin Zone',
  },
  {
    name: 'Giorgio Rusconi',
    position: 'Electrical Technical Director',
    major: 'Electrical Engineering',
    year: 'Senior',
    linkedin: 'https://www.linkedin.com/in/giorgio-rusconi-63b896285/',
    zone: 'Admin Zone',
  },
  {
    name: 'Marques Alsopp',
    position: 'Mechanical Technical Director',
    major: 'Mechanical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/marques-alsopp/',
    zone: 'Admin Zone',
  },
  {
    name: 'Emily Forestier',
    position: 'Co-Media & Relations Director',
    major: 'Computer Science',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/emily-forestier/',
    zone: 'Admin Zone',
  },
  {
    name: 'Junia Celestin',
    position: 'Co-Media & Relations Director',
    major: 'Computer Science',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/juniacelestin/',
    zone: 'Admin Zone',
  },
  {
    name: 'Aliayah Coleman',
    position: 'Assistant Treasurer',
    major: 'Industrial Engineering & Sales Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/aliayah-coleman/',
    zone: 'Admin Zone',
  }, 
  {
    name: 'Jonicia Cardin',
    position: 'Finance Chair',
    major: 'Civil Engineering',
    year: 'Senior',
    linkedin: 'https://www.linkedin.com/in/jonicia-cardin/',
    zone: 'Admin Zone',
  },  
  {
    name: 'Chukwuanonyelum \'Chuks\' Ofojuah',
    position: 'Co-Conference Planning Chair',
    major: 'Computer Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/chukwuanonyelum-ofojuah-2a2888288/',
    zone: 'Admin Zone',
  },  
  {
    name: 'Kenneth \'Kent\' Fluitt',
    position: 'Co-Conference Planning Chair',
    major: 'Electrical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/kenneth-fluitt/',
    zone: 'Admin Zone',
  },
  {
    name: 'Amanda Gilzean',
    position: 'Co-Public Relations Chair',
    major: 'Computer Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/amanda-gilzean/',
    zone: 'Admin Zone',
  },  
  {
    name: 'Alanna Richardson',
    position: 'Co-Public Relations Chair',
    major: 'Digital Arts & Sciences',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/alanna-richardson-a8b555396/',
    zone: 'Admin Zone',
  },
  {
    name: 'Ayira Alston',
    position: 'Co-Public Relations Chair',
    major: 'Computer Science',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/ayiraalston/',
    zone: 'Admin Zone',
  },
  {
    name: 'Bakari Kerr',
    position: 'Webmaster',
    major: 'Computer Science & Electrical Engineering',
    year: 'Junior',
    linkedin: 'https://www.linkedin.com/in/bakari-kerr/',
    zone: 'Admin Zone',
  },
  {
    name: 'Jovani Francois',
    position: 'Historian',
    major: 'Computer Science',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/jovani-francois/',
    zone: 'Admin Zone',
  },
  {
    name: 'Rayanah Mkuu',
    position: 'PCI Chair',
    major: 'Mechanical Engineering',
    year: 'Senior',
    linkedin: 'https://www.linkedin.com/in/rayanah-mkuu/',
    zone: 'Admin Zone',
  },
  {
    name: 'Bruno Kolombia',
    position: 'TORCH Chair',
    major: 'Computer Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/bruno-kolombia/',
    zone: 'Admin Zone',
  },  
  {
    name: 'Aryanna Williams',
    position: 'Academic Excellence Chair',
    major: 'Mechanical Engineering',
    year: 'Senior',
    linkedin: 'https://www.linkedin.com/in/aryannawilliams/',
    zone: 'Admin Zone',
  },
  {
    name: 'Weedchenska Jeanbaptiste',
    position: 'Co-Technical Development Chair',
    major: 'Computer Science',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/weedchenska-jeanbaptiste/',
    zone: 'Admin Zone',
  },
  {
    name: 'Abigail Hepburn',
    position: 'Co-Technical Development Chair',
    major: 'Computer Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/abigail-hepburn/',
    zone: 'Admin Zone',
  },     
  {
    name: 'Abigail Hepburn',
    position: 'Co-Technical Development Chair',
    major: 'Computer Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/abigail-hepburn/',
    zone: 'Admin Zone',
  },
  {
    name: 'Leah Habte',
    position: 'Co-Technical Development Chair',
    major: 'Electrical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/leah-habte/',
    zone: 'Admin Zone',
  },
  {
    name: 'Leah Habte',
    position: 'Co-Technical Development Chair',
    major: 'Electrical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/leah-habte/',
    zone: 'Admin Zone',
  },
  {
    name: 'Matan Mulugeta',
    position: 'Co-Technical Development Chair',
    major: 'Mechanical Engineering & Electrical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/matan-mulugeta-169972370/',
    zone: 'Admin Zone',
  },
  {
    name: 'Randy Smith Jr.',
    position: 'Senator',
    major: 'Civil Engineering',
    year: 'Senior',
    linkedin: 'https://www.linkedin.com/in/randysmithjr/',
    zone: 'Admin Zone',
  },
  {
    name: 'Michael Liburd',
    position: 'Senator',
    major: 'Biomedical Engineering',
    year: 'Sophomore',
    linkedin: 'https://www.linkedin.com/in/msliburdjr/',
    zone: 'Admin Zone',
  },
]
