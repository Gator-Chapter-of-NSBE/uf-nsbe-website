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
    </>
  )
}
