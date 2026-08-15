import type { Metadata } from 'next'
import Image from 'next/image'
import { Container, SectionHeading, CtaLink, ArrowLink } from '@/components/site/primitives'
import { trailblazerBenefits, programStructure } from '@/data/trailblazers'

export const metadata: Metadata = {
  title: 'Trailblazers',
  description:
    'Trailblazers is UF NSBE’s freshman development and community program — helping incoming students grow academically, professionally, technically, and socially from their first semester.',
}

export default function TrailblazersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-tb-ink text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(60% 60% at 80% 0%, var(--color-tb-purple) 0%, transparent 60%), radial-gradient(50% 50% at 0% 100%, var(--color-tb-navy) 0%, transparent 55%)',
          }}
        />
        <Container className="relative py-20 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-4">
                <span className="relative size-16 shrink-0">
                  <Image
                    src="/logos/trailblazers-logo.png"
                    alt="UF NSBE Trailblazers logo"
                    fill
                    className="object-contain"
                  />
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-tb-lilac">
                  A UF NSBE Sub-Brand
                </span>
              </div>
              <h1 className="mt-7 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Blaze your trail from day one.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75 text-pretty">
                Trailblazers is our freshman development and community program — a dedicated space
                for incoming students to grow academically, professionally, technically, and
                socially from their very first semester at the University of Florida.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <CtaLink href="https://forms.gle/VuzoDG9v61Q3cPMv5" external variant="onDark" size="lg" withArrow>
                  Apply to Trailblazers
                </CtaLink>
                <CtaLink
                  href="/programs/trailblazers/cohort"
                  variant="outlineDark"
                  size="lg"
                >
                  Meet the cohort
                </CtaLink>
              </div>
            </div>

            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/photos/trailblazers-cohort.png"
                alt="A cohort of first-year UF NSBE Trailblazers on campus"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Why Trailblazers"
            title="Everything a first-year engineer needs — in one community."
            description="Trailblazers wraps academic, professional, technical, and social support around your first year so you never have to figure it out alone."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trailblazerBenefits.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-tb-purple/40"
              >
                <span aria-hidden className="block h-1.5 w-8 rounded-full bg-tb-purple" />
                <h3 className="mt-4 font-serif text-lg font-medium tracking-tight">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Program structure */}
      <section className="border-t border-border bg-tb-tint py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="The journey"
            title="A year designed to build momentum."
            description="The Trailblazers experience unfolds across the academic year, from your first welcome to your transition into chapter leadership."
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {programStructure.map((step, i) => (
              <li
                key={step.phase}
                className="relative rounded-xl border border-tb-purple/20 bg-card p-6"
              >
                <span className="font-serif text-4xl font-medium text-tb-purple/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-serif text-lg font-medium tracking-tight">{step.phase}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-tb-ink py-20 text-white sm:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-medium leading-[1.1] tracking-tight text-balance sm:text-4xl">
              Ready to become a Trailblazer?
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-white/70">
              Applications open to first-year students. Take the first step toward a
              community that will have your back for the next four years and beyond.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <CtaLink href="https://forms.gle/VuzoDG9v61Q3cPMv5" external variant="onDark" size="lg" withArrow>
                Start your application
              </CtaLink>
              <ArrowLink
                href="/programs/trailblazers/alumni"
                className="text-tb-lilac hover:text-white"
              >
                See where alumni are now
              </ArrowLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
