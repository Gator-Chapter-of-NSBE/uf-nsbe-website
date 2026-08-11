import Image from 'next/image'
import { Container, CtaLink } from '@/components/site/primitives'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Background photograph */}
      <div className="absolute inset-0">
        <Image
          src="/photos/hero-general-body.png"
          alt="UF NSBE members gathered together at a chapter event"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
      </div>

      <Container className="relative">
        <div className="flex min-h-[calc(100dvh-4.5rem)] max-w-3xl flex-col justify-center py-20">
          <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            <span aria-hidden className="h-px w-8 bg-nsbe-green" />
            University of Florida · Gator Chapter
          </p>

          <h1 className="mt-6 font-serif text-[2.75rem] font-medium leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Engineering the future.
            <br />
            <span className="text-nsbe-green">Building Black excellence.</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75 text-pretty">
            The University of Florida chapter of the National Society of Black Engineers — a
            community of ambitious students advancing academically, professionally, and technically,
            together.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <CtaLink href="/get-involved/join" variant="accent" size="lg" withArrow>
              Join NSBE
            </CtaLink>
            <CtaLink href="/programs/trailblazers" variant="outlineDark" size="lg">
              Explore Trailblazers
            </CtaLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
