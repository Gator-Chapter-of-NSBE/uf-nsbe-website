import type { Metadata } from 'next'
import { BeehiivForm } from '@/components/site/beehiiv-form'
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
      <section className="border-b border-border bg-ink text-white">
        <Container>
          <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-20 lg:py-24">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-nsbe-green">
              UF NSBE Newsletter
            </p>

            <img
              src={newsletterLogo}
              alt="The NSBE Wire"
              className="mb-8 h-auto w-full max-w-[20rem] object-contain sm:max-w-[24rem]"
            />

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Stay in the wire.
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/70 sm:text-lg">
              Chapter updates, opportunities, events, and stories from the
              University of Florida NSBE community — delivered straight to
              your inbox.
            </p>
          </div>
        </Container>
      </section>

      {/* Newsletter form */}
      <Section className="bg-background">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-nsbe-green">
                Subscribe
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Join The NSBE Wire
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Get the updates worth opening. No noise, just what's
                happening across UF NSBE.
              </p>
            </div>

            <div className="min-h-[650px] w-full overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-8 lg:p-10">
              <BeehiivForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}