import Image from 'next/image'
import { Container, CtaLink } from '@/components/site/primitives'

export function TrailblazersSpotlight() {
  return (
    <section className="bg-tb-ink py-20 text-white sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-last aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 lg:order-first">
            <Image
              src="/photos/trailblazers-cohort.png"
              alt="A cohort of first-year UF NSBE Trailblazers gathered together on campus"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-4">
              <div className="relative size-14 shrink-0">
                <Image
                  src="/logos/trailblazers-logo.png"
                  alt="UF NSBE Trailblazers logo"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tb-lilac">
                A UF NSBE Sub-Brand
              </p>
            </div>

            <h2 className="mt-6 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-balance sm:text-4xl">
              Trailblazers: where the first year becomes a foundation
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-white/70">
              Trailblazers is our freshman development and community program — a dedicated space for
              incoming students to grow academically, professionally, technically, and socially from
              their very first semester at the University of Florida.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href="/programs/trailblazers" variant="onDark" size="md" withArrow>
                Explore Trailblazers
              </CtaLink>
              <CtaLink href="/programs/trailblazers/apply" variant="outlineDark" size="md">
                Apply to join
              </CtaLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
