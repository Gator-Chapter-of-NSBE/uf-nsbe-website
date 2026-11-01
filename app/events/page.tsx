import type { Metadata } from 'next'
import { CalendarDays } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import {
  Container,
  Section,
  SectionHeading,
  CtaLink,
} from '@/components/site/primitives'
import { EventList } from '@/components/events/event-list'
import { getCalendarEvents } from '@/lib/calendar/google'
import { calendarLinks } from '@/data/calendar'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'Explore upcoming UF NSBE meetings, workshops, socials, and chapter events.',
}

export const revalidate = 300

export default async function EventsPage() {
  const calendar = await getCalendarEvents()
  const links = calendarLinks(calendar.calendarId)
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="What's happening at UF NSBE"
        description="Find your next meeting, workshop, or chance to connect with the Gator Chapter. We look forward to seeing you there."
      />
      <Section id="calendar" className="scroll-mt-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Chapter calendar"
              title="Coming up"
              description="Upcoming events over the next six months. All times are Eastern."
            />
            <CtaLink href={links.subscribe} variant="outline" external>
              <CalendarDays className="size-4" aria-hidden />
              Subscribe to calendar
            </CtaLink>
          </div>
          {calendar.status === 'ready' && calendar.events.length > 0 ? (
            <EventList events={calendar.events} />
          ) : (
            <div className="mt-10 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center sm:px-10">
              <CalendarDays
                className="mx-auto size-8 text-nsbe-green"
                aria-hidden
              />
              <h3 className="mt-4 font-serif text-2xl">
                {calendar.status === 'ready'
                  ? 'More events are on the way.'
                  : 'See what’s next on our calendar.'}
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                {calendar.status === 'ready'
                  ? 'There are no upcoming events listed right now. Check back soon or subscribe to stay in the loop.'
                  : 'The event list is temporarily unavailable. You can still view the chapter schedule directly in Google Calendar.'}
              </p>
              <CtaLink
                href={links.view}
                variant="outline"
                external
                className="mt-6"
              >
                Open Google Calendar
              </CtaLink>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
