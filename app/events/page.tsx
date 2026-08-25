import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section, SectionHeading, CtaLink } from '@/components/site/primitives'
import { InstagramEmbed } from '@/components/events/instagram-embed'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'Events',
  description:
    "See what's next on the UF NSBE calendar and catch up with the chapter on Instagram.",
}

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="What's happening at UF NSBE"
        description="Everything the chapter has on the books lives on our Google Calendar, and everything we've already been up to lives on Instagram. Both are the source of truth — check here first."
      />

      <Section id="calendar-instagram">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <div id="calendar">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="Calendar" title="On the schedule" />
                <CtaLink href="https://calendar.google.com" variant="outline" external>
                  Subscribe to calendar
                  <ArrowUpRight className="size-4" />
                </CtaLink>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="aspect-4/3 w-full">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FNew_York&src=ZjMwMjU3N2U3Mjk1NjU4ZjE3OGIwOGU4Zjg5Yzc0NmEwOTk2YWM5Y2Q4YjIxYjgxOTRkNTk1OWI4NmNmMDQwZkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%233f51b5"
                    title="UF NSBE chapter events calendar"
                    className="h-full w-full border-0"
                    frameBorder={0}
                    scrolling="no"
                  />
                </div>
              </div>
            </div>

            <div id="instagram">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow="Instagram" title="Recent highlights" />
                <CtaLink href={site.social.instagram.url} variant="outline" external>
                  {site.social.instagram.handle}
                  <ArrowUpRight className="size-4" />
                </CtaLink>
              </div>

              <div className="mt-8 flex justify-center">
                <InstagramEmbed />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
