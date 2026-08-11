import type { Metadata } from 'next'
import { Check, Handshake, Users, Presentation, Trophy } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section, SectionHeading, CtaLink } from '@/components/site/primitives'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'Become a Sponsor',
  description:
    'Partner with UF NSBE to connect with a diverse, talented pipeline of engineering students at the University of Florida.',
}

const reasons = [
  { icon: Users, title: 'Talent pipeline', copy: 'Recruit from a motivated community of Black engineering students at a top-tier program.' },
  { icon: Presentation, title: 'Brand visibility', copy: 'Feature your company at meetings, workshops, and chapter events throughout the year.' },
  { icon: Trophy, title: 'Impact', copy: 'Directly support the academic and professional success of underrepresented engineers.' },
  { icon: Handshake, title: 'Partnership', copy: 'Build a lasting relationship with a chapter of a respected national organization.' },
]

const tiers = [
  {
    name: 'Gold',
    tagline: 'Cornerstone partner',
    perks: [
      'Premier logo placement on our website & materials',
      'Dedicated info session or tech talk',
      'Priority access at career events',
      'Résumé book access',
      'Recognition at all major events',
    ],
    featured: true,
  },
  {
    name: 'Silver',
    tagline: 'Growth partner',
    perks: [
      'Logo placement on our website',
      'Co-hosted workshop or event',
      'Access at career events',
      'Résumé book access',
    ],
    featured: false,
  },
  {
    name: 'Bronze',
    tagline: 'Community partner',
    perks: ['Logo placement on our website', 'Event announcement & recognition', 'Networking event access'],
    featured: false,
  },
]

export default function SponsorPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="Partnership"
        title="Partner with the next generation of Black engineers"
        description="Your support fuels programming, professional development, and community for our members — and connects your organization with exceptional emerging talent."
      >
        <CtaLink href={`mailto:${site.email}`} variant="onDark" external>
          Start a conversation
        </CtaLink>
        <CtaLink href="/contact" variant="outlineDark">
          Contact our board
        </CtaLink>
      </PageHero>

      <Section>
        <Container>
          <SectionHeading eyebrow="Why partner" title="What your sponsorship makes possible" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <r.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-medium text-foreground">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/40">
        <Container>
          <SectionHeading
            eyebrow="Sponsorship tiers"
            title="Levels of partnership"
            description="These tiers are a starting point — we're happy to build a custom package that fits your organization's goals."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-2xl border p-7 ${
                  tier.featured
                    ? 'border-nsbe-green bg-card shadow-sm ring-1 ring-nsbe-green/20'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl text-foreground">{tier.name}</h3>
                  {tier.featured ? (
                    <span className="rounded-full bg-nsbe-green px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-white">
                      Most impact
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-nsbe-green" aria-hidden />
                      <span className="leading-relaxed">{perk}</span>
                    </li>
                  ))}
                </ul>
                <CtaLink
                  href={`mailto:${site.email}?subject=${encodeURIComponent(`${tier.name} Sponsorship — UF NSBE`)}`}
                  variant={tier.featured ? 'accent' : 'outline'}
                  external
                  className="mt-7 w-full"
                >
                  Inquire about {tier.name}
                </CtaLink>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
