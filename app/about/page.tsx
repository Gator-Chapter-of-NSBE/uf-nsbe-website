import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHero } from '@/components/site/page-hero'
import { Container, SectionHeading, CtaLink } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about the University of Florida Gator Chapter of the National Society of Black Engineers — our mission, our values, and the community we build.',
}

const values = [
  {
    title: 'Academic Excellence',
    body: 'We support one another through the toughest engineering coursework with study sessions, resources, and accountability.',
  },
  {
    title: 'Professional Growth',
    body: 'From résumé reviews to recruiter connections, we prepare members to compete for and thrive in top industry roles.',
  },
  {
    title: 'Community & Belonging',
    body: 'We are a family. Members find mentorship, friendship, and a sense of home in a space built for Black engineers.',
  },
  {
    title: 'Service & Legacy',
    body: 'We give back to our campus and community, and we invest in the students who will come after us.',
  },
]

const mission = [
  'Stimulate and develop student interest in the various engineering disciplines.',
  'Increase the number of students studying engineering at both the undergraduate and graduate levels.',
  'Encourage members to seek advanced degrees in engineering or related fields and to obtain professional engineering registrations.',
  'Promote public awareness of engineering and the opportunities for Black and other minority students.',
  'Function as a representative body on issues and developments that affect the careers of Black engineers.',
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="A home for Black engineers at the University of Florida."
        description="The Gator Chapter of the National Society of Black Engineers exists to help our members succeed academically, excel professionally, and impact the community positively."
      >
        <CtaLink href="/about/executive-board" variant="primary" withArrow>
          Meet the Executive Board
        </CtaLink>
        <CtaLink href="/about/history" variant="outline">
          Our history
        </CtaLink>
      </PageHero>

      {/* Who we are */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-border">
              <Image
                src="/photos/NSBE_Eboard_25-26.JPG"
                alt="2025-2026 Eboard photo"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Who we are"
                title="More than an organization — a network built to last."
              />
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>
                  UF NSBE is a chapter of the largest student-governed organization in the country
                  dedicated to the academic and professional success of Black engineering students.
                  At the University of Florida, we translate that national mission into weekly
                  meetings, hands-on programming, and a community that shows up for one another.
                </p>
                <p>
                  Whether you are a first-year student searching for your footing or a senior
                  preparing for a full-time offer, UF NSBE meets you where you are and helps you get
                  where you want to go.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-t border-border bg-secondary/40 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="What we stand for"
            title="Our values"
            align="center"
            description="Four commitments guide everything we do as a chapter."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <span className="font-serif text-3xl font-medium text-nsbe-green">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 font-serif text-lg font-medium tracking-tight">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* NSBE mission */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading eyebrow="The NSBE mission" title="A national purpose, a local promise." />
              <p className="mt-6 text-base leading-relaxed text-muted-foreground text-pretty">
                Our national mission is “to increase the number of culturally responsible Black
                engineers who excel academically, succeed professionally, and positively impact the
                community.” As the Gator Chapter, we carry that mission forward every semester.
              </p>
              <div className="mt-8">
                <CtaLink href="/get-involved/join" variant="accent" withArrow>
                  Become a member
                </CtaLink>
              </div>
            </div>
            <ul className="space-y-4">
              {mission.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-lg border border-border bg-card p-5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nsbe-green/10 font-serif text-sm font-semibold text-nsbe-green">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/80">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  )
}
