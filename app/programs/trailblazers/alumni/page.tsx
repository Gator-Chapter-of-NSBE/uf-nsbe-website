import type { Metadata } from 'next'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container } from '@/components/site/primitives'
import { PersonCard } from '@/components/site/person-card'
import { alumniCohorts } from '@/data/alumni'

export const metadata: Metadata = {
  title: 'Trailblazers Alumni',
  description:
    'The growing network of UF NSBE Trailblazers alumni — past cohorts who blazed the trail and continue to lead in engineering and beyond.',
}

export default function AlumniPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="Alumni Network"
        title="Once a Trailblazer, always a Trailblazer."
        description="Every cohort adds to a growing legacy. Explore the students who came before and see where the trail can lead."
      />

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col gap-16">
          <div className="max-w-2xl">
            <PlaceholderNote>
              Alumni are organized by cohort year in{' '}
              <code className="rounded bg-foreground/10 px-1 py-0.5 text-xs">data/alumni.ts</code>.
              Add new cohorts to the top of the list each year — the page scales automatically.
            </PlaceholderNote>
          </div>

          {alumniCohorts.map((cohort) => (
            <div key={cohort.year}>
              <div className="mb-6 flex items-baseline gap-4 border-b border-border pb-4">
                <h2 className="font-serif text-2xl font-medium tracking-tight">
                  Cohort {cohort.year}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {cohort.members.length} Trailblazers
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cohort.members.map((member, i) => (
                  <PersonCard
                    key={`${cohort.year}-${i}`}
                    name={member.name}
                    major={member.major}
                    bio={member.bio}
                    photo={member.photo}
                    accent="trailblazers"
                  />
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
    </>
  )
}
