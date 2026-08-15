import type { Metadata } from 'next'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container, CtaLink } from '@/components/site/primitives'
import { PersonCard } from '@/components/site/person-card'
import { currentCohort, currentCohortYear } from '@/data/trailblazers'

export const metadata: Metadata = {
  title: 'Trailblazers Cohort',
  description:
    'Meet the current cohort of UF NSBE Trailblazers — the first-year students blazing their trail through the program this year.',
}

export default function CohortPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow={`Cohort ${currentCohortYear}`}
        title="Meet this year’s Trailblazers"
        description="The first-year students growing together through the Trailblazers program — academically, professionally, technically, and socially."
      >
        <CtaLink href="https://forms.gle/VuzoDG9v61Q3cPMv5" external variant="onDark" withArrow>
          Apply to next year’s cohort
        </CtaLink>
        <CtaLink href="/programs/trailblazers/alumni" variant="outlineDark">
          View alumni
        </CtaLink>
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-10 max-w-2xl">
            <PlaceholderNote>
              Cohort profiles are placeholders. Add this year’s Trailblazers to{' '}
              <code className="rounded bg-foreground/10 px-1 py-0.5 text-xs">
                data/trailblazers.ts
              </code>{' '}
              and update the cohort year.
            </PlaceholderNote>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {currentCohort.map((member, i) => (
              <PersonCard
                key={i}
                name={member.name}
                major={member.major}
                year={member.year}
                bio={member.bio}
                photo={member.photo}
                accent="trailblazers"
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
