import type { Metadata } from 'next'
import { CalendarDays, Clock, MapPin, ArrowUpRight } from 'lucide-react'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container, Section, SectionHeading, CtaLink } from '@/components/site/primitives'
import { Badge } from '@/components/ui/badge'
import { upcomingEvents, pastEvents, type NsbeEvent } from '@/data/events'

export const metadata: Metadata = {
  title: 'Events',
  description:
    'General body meetings, professional development workshops, socials, and service — see what UF NSBE has coming up.',
}

function EventCard({ event, past }: { event: NsbeEvent; past?: boolean }) {
  return (
    <article
      className={`flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 ${
        past ? 'opacity-90' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {event.category ? (
          <Badge variant="secondary" className="rounded-full font-mono text-[0.7rem] uppercase tracking-wider">
            {event.category}
          </Badge>
        ) : (
          <span />
        )}
        {event.placeholder ? (
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">Placeholder</span>
        ) : null}
      </div>

      <h3 className="mt-4 font-serif text-xl text-foreground text-balance">{event.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{event.description}</p>

      <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
          <dt className="sr-only">Date</dt>
          <dd>{event.date}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4 shrink-0 text-primary" aria-hidden />
          <dt className="sr-only">Time</dt>
          <dd>{event.time}</dd>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
          <dt className="sr-only">Location</dt>
          <dd>{event.location}</dd>
        </div>
      </dl>
    </article>
  )
}

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="What's happening at UF NSBE"
        description="From general body meetings to professional development and national convention travel, there is always a way to plug in."
      />

      <Section>
        <Container>
          <PlaceholderNote>
            These events are placeholders for layout. The chapter&apos;s Google Calendar is the intended source of truth
            — connect the Google Calendar API to populate this page automatically and keep the meeting sign-in list in
            sync.
          </PlaceholderNote>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Upcoming" title="On the calendar" />
            <CtaLink href="https://calendar.google.com" variant="outline" external>
              Subscribe to calendar
              <ArrowUpRight className="size-4" />
            </CtaLink>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/40">
        <Container>
          <SectionHeading eyebrow="Recap" title="Recent highlights" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <EventCard key={event.id} event={event} past />
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
