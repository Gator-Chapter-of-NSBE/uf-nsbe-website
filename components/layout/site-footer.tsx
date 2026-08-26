import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/site/primitives'
import { InstagramIcon } from '@/components/site/brand-icons'
import { site } from '@/data/site'

const footerColumns = [
  {
    heading: 'Explore',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Executive Board', href: '/about/executive-board' },
      { label: 'Chapter History', href: '/about/history' },
      { label: 'Events', href: '/events' },
    ],
  },
  {
    heading: 'Programs',
    links: [
      { label: 'Trailblazers', href: '/programs/trailblazers' },
      { label: 'Professional Development', href: '/programs#professional-development' },
      { label: 'Design Team', href: '/programs/design-team' },
      { label: 'Trailblazers Alumni', href: '/programs/trailblazers/alumni' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      // Presentations page is archived until the library is ready to launch — see app/resources/presentations/page.tsx
      { label: 'NSBE Resources', href: '/resources#nsbe' },
      { label: 'Useful Links', href: '/resources#links' },
      { label: 'Meeting Sign-In', href: '/sign-in' },
    ],
  },
  {
    heading: 'Get Involved',
    links: [
      { label: 'Join NSBE', href: '/get-involved/join' },
      { label: 'Apply to Trailblazers', href: 'https://forms.gle/VuzoDG9v61Q3cPMv5' },
      { label: 'Become a Sponsor', href: '/get-involved/sponsor' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      {/* Top CTA band */}
      <div className="border-b border-white/10">
        <Container className="flex flex-col gap-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl font-medium tracking-tight text-balance sm:text-3xl">
              Join the movement, or partner with the next generation of Black engineers.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/get-involved/join"
              className="group inline-flex h-11 items-center gap-2 rounded-md bg-nsbe-green px-6 text-sm font-medium text-white transition-colors hover:bg-nsbe-green/90"
            >
              Join NSBE
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/get-involved/sponsor"
              className="group inline-flex h-11 items-center gap-2 rounded-md border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Become a Partner
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Container>
      </div>

      {/* Main footer */}
      <Container className="grid grid-cols-2 gap-8 py-14 md:grid-cols-6">
        <div className="col-span-2">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="UF NSBE home">
            <span className="relative block h-11 w-10 shrink-0">
              <Image
                src="/logos/nsbe-logo.png"
                alt="National Society of Black Engineers logo"
                fill
                sizes="44px"
                className="object-contain"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-lg font-semibold">UF NSBE</span>
              <span className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white/60">
                Gator Chapter
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60 text-pretty">
            The University of Florida Gator Chapter of the National Society of Black Engineers —
            engineering the future and building Black excellence.
          </p>
          <a
            href={site.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <InstagramIcon className="size-4" />
            {site.social.instagram.handle}
          </a>
        </div>

        {footerColumns.map((col) => (
          <nav key={col.heading} aria-label={col.heading} className="col-span-1">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              {col.heading}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} UF NSBE — University of Florida Gator Chapter. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>{site.location}</span>
            <a
              href={site.social.national}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-white"
            >
              National NSBE
              <ArrowUpRight className="size-3" />
            </a>
          </div>
        </Container>
      </div>
    </footer>
  )
}
