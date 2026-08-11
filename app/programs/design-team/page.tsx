import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { Container, SectionHeading, CtaLink } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Design Team',
  description:
    'The Design Team is the creative and digital division of UF NSBE — shaping the chapter’s visual identity, media, branding, and digital experiences.',
}

const disciplines = [
  {
    title: 'Brand & Identity',
    body: 'Own and evolve the UF NSBE visual language — logos, color, typography, and sub-brands like Trailblazers.',
  },
  {
    title: 'Graphic Design',
    body: 'Design flyers, social graphics, merch, and event collateral that make the chapter impossible to ignore.',
  },
  {
    title: 'Photo & Video',
    body: 'Capture our events and members, and turn footage into recap reels and highlight content.',
  },
  {
    title: 'Web & Digital',
    body: 'Build and maintain digital experiences — including this website — and manage the chapter’s online presence.',
  },
]

const reasons = [
  'Build a real portfolio with work that ships to a live audience.',
  'Learn industry tools and workflows alongside a supportive team.',
  'Shape how thousands of people experience UF NSBE.',
  'No prior experience required — just curiosity and commitment.',
]

export default function DesignTeamPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="A UF NSBE Program"
        title="The Design Team"
        description="The creative and digital division of UF NSBE — responsible for shaping the organization’s visual identity, media presence, branding, and digital experiences."
      >
        <CtaLink href="/get-involved/join" variant="onDark" withArrow>
          Join the Design Team
        </CtaLink>
        <CtaLink href="/contact" variant="outlineDark">
          Ask a question
        </CtaLink>
      </PageHero>

      {/* Disciplines */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="What we do"
            title="Four disciplines, one creative vision."
            description="Members can specialize or explore across every part of the chapter’s creative output."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {disciplines.map((d, i) => (
              <div
                key={d.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-xl font-medium tracking-tight">{d.title}</h3>
                  <span className="font-serif text-2xl font-medium text-nsbe-red/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why join */}
      <section className="border-t border-border bg-secondary/40 py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionHeading
              eyebrow="Why join"
              title="Do creative work that actually gets seen."
            />
            <ul className="space-y-4">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-nsbe-red/15 text-[0.7rem] font-bold text-nsbe-red"
                  >
                    {i + 1}
                  </span>
                  <span className="text-base leading-relaxed text-foreground/85">{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-12">
            <CtaLink href="/get-involved/join" variant="accent" size="lg" withArrow>
              Get involved with Design
            </CtaLink>
          </div>
        </Container>
      </section>
    </>
  )
}
