import type { Metadata } from 'next'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container } from '@/components/site/primitives'
import { PersonCard } from '@/components/site/person-card'
import { executiveBoard, ZONE_ORDER } from '@/data/executive-board'

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
          <div className="flex flex-col gap-16">
            {ZONE_ORDER.map((zone) => {
              const members = executiveBoard.filter((member) => member.zone === zone)
              if (members.length === 0) return null

              return (
                <div key={zone} className="flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground">
                      {zone}
                    </h2>
                    <div className="h-px flex-1 bg-border" aria-hidden />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {members.map((member, i) => (
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
                </div>
              )
            })}
          </div>
        </Container>
      </section>
    </>
  )
}
