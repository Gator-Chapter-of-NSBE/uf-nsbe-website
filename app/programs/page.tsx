import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { Container, SectionHeading, CtaLink, ArrowLink } from '@/components/site/primitives'
import { programs } from '@/data/programs'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Programs',
  description:
    'Explore UF NSBE programs — Trailblazers, Professional Development, and the Design Team — built to support members at every stage of their journey.',
}

const accentBar: Record<string, string> = {
  trailblazers: 'bg-tb-purple',
  'professional-development': 'bg-nsbe-green',
  'design-team': 'bg-nsbe-red',
}

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Programming with purpose."
        description="Every UF NSBE program is designed to move our members forward — academically, professionally, technically, and personally."
      />

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col gap-8">
          {programs.map((program) => (
            <article
              key={program.slug}
              id={program.slug}
              className="scroll-mt-28 grid gap-8 rounded-2xl border border-border bg-card p-7 sm:p-9 lg:grid-cols-[1fr_1.4fr]"
            >
              <div>
                <span
                  className={cn(
                    'inline-block h-1 w-12 rounded-full',
                    accentBar[program.slug] ?? 'bg-primary',
                  )}
                />
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {program.tagline}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight">
                  {program.name}
                </h2>
              </div>

              <div>
                <p className="text-base leading-relaxed text-muted-foreground text-pretty">
                  {program.description}
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {program.highlights.map((h) => (
                    <li
                      key={h}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground/80"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  {program.href.startsWith('/programs/') ? (
                    <CtaLink href={program.href} variant="primary" withArrow>
                      {program.cta}
                    </CtaLink>
                  ) : (
                    <ArrowLink href="/get-involved/join">{program.cta}</ArrowLink>
                  )}
                </div>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section className="border-t border-border bg-secondary/40 py-16">
        <Container>
          <div className="flex flex-col items-center gap-6 text-center">
            <SectionHeading
              align="center"
              eyebrow="Not sure where to start?"
              title="Come to a meeting — everyone is welcome."
              description="The best way to find your place in UF NSBE is to show up. Check the calendar and join us."
            />
            <div className="flex flex-wrap justify-center gap-3">
              <CtaLink href="/events" variant="primary" withArrow>
                View upcoming events
              </CtaLink>
              <CtaLink href="/get-involved/join" variant="outline">
                Become a member
              </CtaLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
