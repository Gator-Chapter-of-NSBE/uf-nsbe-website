import { CalendarDays, Clock3, MapPin, ArrowUpRight } from 'lucide-react'
import {
  dateLabel,
  eventDay,
  eventSchedule,
  groupEvents,
  type CalendarEvent,
} from '@/lib/calendar/events'

export function EventList({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="mt-10 space-y-12">
      {groupEvents(events).map((group) => (
        <section key={group.month} aria-labelledby={`month-${group.month}`}>
          <div className="mb-5 flex items-center gap-4">
            <h3
              id={`month-${group.month}`}
              className="shrink-0 font-serif text-2xl"
            >
              {group.label}
            </h3>
            <div className="h-px flex-1 bg-border" aria-hidden />
          </div>
          <ul className="space-y-4">
            {group.events.map((event) => {
              const day = eventDay(event)
              return (
                <li
                  key={event.id}
                  className="rounded-xl border border-border bg-card p-5 sm:p-7"
                >
                  <div className="flex items-start gap-4 sm:gap-7">
                    <div
                      aria-hidden
                      className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-nsbe-green/10 py-3 sm:w-20"
                    >
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {dateLabel(day, { weekday: 'short' })}
                      </span>
                      <span className="mt-1 font-serif text-3xl leading-none sm:text-4xl">
                        {dateLabel(day, { day: 'numeric' })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="break-words font-serif text-xl font-medium sm:text-2xl">
                        {event.title}
                      </h4>
                      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                        <CalendarDays
                          className="mt-0.5 size-4 shrink-0"
                          aria-hidden
                        />
                        <time dateTime={day}>
                          {dateLabel(day, {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      </p>
                      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                        <Clock3
                          className="mt-0.5 size-4 shrink-0"
                          aria-hidden
                        />
                        <span>
                          {eventSchedule(event)}
                          {!event.allDay && ' ET'}
                        </span>
                      </p>
                      {event.location && (
                        <p className="mt-2 flex items-start gap-2 break-words text-sm text-muted-foreground">
                          <MapPin
                            className="mt-0.5 size-4 shrink-0"
                            aria-hidden
                          />
                          <span className="min-w-0">{event.location}</span>
                        </p>
                      )}
                      {event.description && (
                        <details className="mt-4 text-sm">
                          <summary className="w-fit cursor-pointer rounded-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                            Event details
                          </summary>
                          <p className="mt-3 whitespace-pre-line break-words leading-relaxed text-muted-foreground">
                            {event.description}
                          </p>
                        </details>
                      )}
                      {event.url && (
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          View in Google Calendar
                          <ArrowUpRight className="size-4" aria-hidden />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
