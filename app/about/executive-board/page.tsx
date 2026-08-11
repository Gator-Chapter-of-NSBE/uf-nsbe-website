import type { Metadata } from 'next'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container } from '@/components/site/primitives'
import { PersonCard } from '@/components/site/person-card'
import { executiveBoard } from '@/data/executive-board'

export const metadata: Metadata = {
  title: 'Executive Board',
  description:
    'Meet the student leaders of the University of Florida Gator Chapter of the National Society of Black Engineers.',
}

export default function ExecutiveBoardPage() {
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="Meet the Executive Board"
        description="The elected and appointed students who lead UF NSBE — planning programming, representing the chapter, and serving the membership."
      />

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mb-10 max-w-2xl">
            <PlaceholderNote>
              Board member names, majors, photos, and LinkedIn profiles are placeholders. Update{' '}
              <code className="rounded bg-foreground/10 px-1 py-0.5 text-xs">
                data/executive-board.ts
              </code>{' '}
              each year to feature the current board.
            </PlaceholderNote>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {executiveBoard.map((member, i) => (
              <PersonCard
                key={`${member.position}-${i}`}
                name={member.name}
                role={member.position}
                major={member.major}
                year={member.year}
                bio={member.bio}
                photo={member.photo}
                linkedin={member.linkedin}
              />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}
