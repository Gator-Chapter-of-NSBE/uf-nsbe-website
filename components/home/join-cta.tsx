import { Container, CtaLink } from '@/components/site/primitives'

export function JoinCta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 22px)',
            }}
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground/70">
              Join the movement
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-balance sm:text-4xl md:text-5xl">
              Your seat at the table is ready
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-primary-foreground/80">
              Whether you&apos;re a first-year student, a rising leader, or a company that wants to
              invest in the next generation of Black engineers — there&apos;s a place for you here.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <CtaLink href="/get-involved/join" variant="onDark" size="lg" withArrow>
                Become a member
              </CtaLink>
              <CtaLink href="/sponsor" variant="outlineDark" size="lg">
                Partner with us
              </CtaLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
