import type { Metadata } from 'next'
import { Container, Section } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'Subscribe to The NSBE Wire, the UF NSBE newsletter for chapter news, opportunities, and community highlights.',
}

const newsletterLogo =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nsbeWire-1LcpMZFB0EtPwPagpqLZrYGDjmYmgA.png'

export default function NewsletterPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-background">
        <Container>
          <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-20 lg:py-24">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-nsbe-green">
              UF NSBE Newsletter
            </p>

            <img
              src={newsletterLogo}
              alt="The NSBE Wire"
              className="mb-8 h-auto w-full max-w-[18rem] object-contain sm:max-w-[22rem]"
            />

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Stay in the wire.
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Chapter updates, opportunities, events, and stories from the
              University of Florida NSBE community.
            </p>
          </div>
        </Container>
      </section>

      {/* Newsletter form */}
      <Section className="bg-background">
        <Container>
          <div className="mx-auto w-full max-w-[760px]">
            <iframe
              src="https://subscribe-forms.beehiiv.com/v3/forms/e3879c2e-c810-4060-9109-7d5e65fa06f6"
              title="Subscribe to The NSBE Wire"
              className="block min-h-[650px] w-full border-0"
            />

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Having trouble with the form?{' '}
              <a
                href="https://ufnsbe-newsletter.beehiiv.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-nsbe-green"
              >
                Subscribe directly here.
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}