import type { Metadata } from 'next'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container, SectionHeading } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Chapter History',
  description:
    'The story of the University of Florida Gator Chapter of the National Society of Black Engineers — its founding, milestones, and legacy.',
}

const timeline = [
  {
    year: '1975',
    title: 'NSBE is founded nationally',
    body: 'Six students at Purdue University establish the National Society of Black Engineers, launching what becomes the largest student-run organization in the United States.',
  },
  {
    year: '[YEAR]',
    title: 'The Gator Chapter is chartered',
    body: '[Add the founding story of UF NSBE — the students, faculty, and moment that brought the chapter to the University of Florida.]',
  },
  {
    year: '[YEAR]',
    title: 'Trailblazers launches',
    body: '[Describe when and why the Trailblazers first-year program was created and the impact it has had on incoming students.]',
  },
  {
    year: '[YEAR]',
    title: 'A milestone worth remembering',
    body: '[Add a notable award, convention performance, membership milestone, or community achievement.]',
  },
  {
    year: 'Today',
    title: 'Engineering the future',
    body: 'UF NSBE continues to grow — building Black excellence at the University of Florida one member, one meeting, and one milestone at a time.',
  },
]

export default function HistoryPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="A legacy of Black excellence at UF."
        description="From a national movement born in 1975 to a thriving chapter on the University of Florida campus — this is the story of UF NSBE."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-12 max-w-2xl">
            <PlaceholderNote>
              The chapter-specific dates and stories below are placeholders. Replace the bracketed
              text with confirmed history from chapter records or alumni.
            </PlaceholderNote>
          </div>

          <div className="grid gap-12 lg:grid-cols-[0.4fr_1fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <SectionHeading eyebrow="Timeline" title="Milestones" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                A living record of the moments that shaped our chapter.
              </p>
            </div>

            <ol className="relative border-l border-border pl-8">
              {timeline.map((item, i) => (
                <li key={i} className="relative pb-12 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[calc(2rem+1px)] top-1 flex size-4 -translate-x-1/2 items-center justify-center"
                  >
                    <span className="size-3 rounded-full border-2 border-nsbe-green bg-background" />
                  </span>
                  <p className="font-serif text-2xl font-medium text-nsbe-green">{item.year}</p>
                  <h3 className="mt-1 font-serif text-xl font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>
    </>
  )
}
