import type { Metadata } from 'next'
import Script from 'next/script'
import { ArrowRight, Mail, Sparkles } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section, SectionHeading } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Newsletter',
  description: 'Subscribe to The NSBE Wire, the UF NSBE newsletter for chapter news, opportunities, and community highlights.',
}

const newsletterLogo =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nsbeWire-1LcpMZFB0EtPwPagpqLZrYGDjmYmgA.png'

export default function NewsletterPage() {
  return (
    <>
      <PageHero
        eyebrow="Newsletter"
        title="Stay in the wire."
        description="The NSBE Wire brings the latest from UF NSBE straight to your inbox — chapter updates, opportunities, events, and stories from our community."
      />

      <Section>
        <Container>
          <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-[22rem] flex-col justify-between bg-ink p-8 text-white sm:p-12">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                <Sparkles className="size-4 text-nsbe-green" aria-hidden="true" />
                The NSBE Wire
              </div>

              <div className="flex items-center justify-center py-10">
                <img
                  src={newsletterLogo}
                  alt="The NSBE Wire logo"
                  className="h-auto w-full max-w-[17rem] object-contain"
                />
              </div>

              <p className="max-w-xs text-sm leading-relaxed text-white/65">
                News, resources, and momentum from the University of Florida Gator Chapter.
              </p>
            </div>

            <div className="flex flex-col justify-center p-8 sm:p-12">
              <SectionHeading
                eyebrow="Subscribe"
                title="Your next update starts here."
                description="Join the list to hear about what is happening across UF NSBE. No noise — just the notes worth opening."
              />

              <div className="mt-8 rounded-2xl border border-border bg-background p-5 sm:p-7">
                <div className="mb-5 flex items-center gap-3 text-sm font-medium text-muted-foreground">
                  <Mail className="size-4 text-nsbe-green" aria-hidden="true" />
                  Sign up for The NSBE Wire
                </div>
              //Where its supposed to be
              <script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="e3879c2e-c810-4060-9109-7d5e65fa06f6"></script>
              </div>

              <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="size-4 text-nsbe-green" aria-hidden="true" />
                Built for Gators. Powered by community.
              </p>
            </div>
          </div>
          // Doesnt work here
          <script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="e3879c2e-c810-4060-9109-7d5e65fa06f6"></script>
        </Container>
      </Section>
      //Will show here
                    <script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="e3879c2e-c810-4060-9109-7d5e65fa06f6"></script>

    </>
                  <script async src="https://subscribe-forms.beehiiv.com/v3/loader.js" data-beehiiv-form="e3879c2e-c810-4060-9109-7d5e65fa06f6"></script>

  )
}
