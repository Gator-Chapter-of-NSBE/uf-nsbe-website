import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section, CtaLink } from '@/components/site/primitives'
import { sponsors } from '@/data/sponsors'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Our Sponsors',
  description:
    'Thank you to the sponsors supporting the University of Florida Gator Chapter of NSBE and investing in our members.',
}

export default function SponsorPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="With gratitude"
        title="Our Sponsors"
        description="Thank you to the organizations supporting UF NSBE. Your partnership helps our members grow, connect, and build a stronger engineering community."
      />
      <Section>
        <Container>
          <ul
            aria-label="Current sponsors"
            className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
          >
            {sponsors.map((sponsor) => (
              <li key={sponsor.name}>
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${sponsor.name} (opens in a new tab)`}
                  className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-4"
                >
                <figure>
                  <div
                    className={cn(
                      'relative h-36 overflow-hidden rounded-xl border border-border transition-colors group-hover:border-nsbe-green sm:h-40',
                      sponsor.darkBackground ? 'bg-ink' : 'bg-white',
                    )}
                  >
                    <Image
                      src={sponsor.logo}
                      alt={`${sponsor.name} logo`}
                      fill
                      sizes="(min-width: 1024px) 240px, (min-width: 640px) 30vw, 45vw"
                      className="object-contain p-6 sm:p-8"
                    />
                  </div>
                  <figcaption className="mt-3 text-center text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {sponsor.name}
                  </figcaption>
                </figure>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
      <section className="border-t border-border bg-muted/40 py-12 sm:py-16">
        <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">
            Interested in becoming a sponsor?
          </h2>
          <CtaLink
            href="/contact"
            variant="primary"
            className="shrink-0"
            withArrow
          >
            Contact our Board
          </CtaLink>
        </Container>
      </section>
    </>
  )
}
