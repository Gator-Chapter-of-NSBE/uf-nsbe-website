import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { Container, SectionHeading, CtaLink } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Design Team',
  description:
    'The Design Team is UF NSBE’s hands-on engineering projects division, bringing together mechanical, electrical, and computer engineering skills to build real systems.',
}

const disciplines = [
  {
    title: 'CAD & Mechanical Design',
    body: 'Create 3D models, assemblies, and technical drawings for mechanical systems using CAD workflows and design iteration.',
  },
  {
    title: 'Programming & Embedded Systems',
    body: 'Write software and firmware that gives projects intelligence, control, and useful real-world behavior.',
  },
  {
    title: 'Circuit Design & Electronics',
    body: 'Explore schematics, components, wiring, sensors, and circuit design as part of complete engineering systems.',
  },
  {
    title: 'Fabrication & Prototyping',
    body: 'Turn ideas into working prototypes through soldering, assembly, testing, troubleshooting, and hands-on iteration.',
  },
]

const reasons = [
  'Build a portfolio of real engineering projects from concept to prototype.',
  'Develop practical skills across mechanical, electrical, and computer engineering.',
  'Learn technical tools and workflows alongside a supportive project team.',
  'No prior experience required — just curiosity, commitment, and a willingness to learn.',
]

export default function DesignTeamPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="A UF NSBE Program"
        title="The Design Team"
        description="The technical engineering projects division of UF NSBE — where members build across mechanical, electrical, and computer engineering through CAD, programming, circuit design, soldering, and prototyping."
      >
        <CtaLink
          href="https://docs.google.com/forms/d/e/1FAIpQLSfxydq5Wtx6E35foCnsqW7-KgC-di4T81Vzly_MhLMswFsIOw/viewform"
          external
          variant="onDark"
          withArrow
        >
          Join the Design Team
        </CtaLink>
        <CtaLink href="/contact" variant="outlineDark">
          Ask a question
        </CtaLink>
      </PageHero>

      {/* Disciplines */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="What we do"
            title="Four technical lanes, one project team."
            description="Members can specialize or explore across the engineering process, from CAD and code to circuits, soldering, and working prototypes."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {disciplines.map((d, i) => (
              <div
                key={d.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif text-xl font-medium tracking-tight">{d.title}</h3>
                  <span className="font-serif text-2xl font-medium text-nsbe-red/70">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {d.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why join */}
      <section className="border-t border-border bg-secondary/40 py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <SectionHeading
              eyebrow="Why join"
              title="Build engineering work that actually works."
            />
            <ul className="space-y-4">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-nsbe-red/15 text-[0.7rem] font-bold text-nsbe-red"
                  >
                    {i + 1}
                  </span>
                  <span className="text-base leading-relaxed text-foreground/85">{r}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-12">
            <CtaLink
              href="https://docs.google.com/forms/d/e/1FAIpQLSfxydq5Wtx6E35foCnsqW7-KgC-di4T81Vzly_MhLMswFsIOw/viewform"
              external
              variant="accent"
              size="lg"
              withArrow
            >
              Get involved with Design
            </CtaLink>
          </div>
        </Container>
      </section>

      {/* Fall project */}
      <section className="border-t border-border py-20 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHeading
              eyebrow="Fall project"
              title="Building a self-balancing robot, from the ground up."
            />
            <div className="space-y-6 text-base leading-relaxed text-foreground/85 text-pretty">
              <p>
                In the fall semester, members will work together to design and build a
                self-balancing robot from the ground up. The project integrates mechanical
                design, electronics, embedded systems, sensing, controls, and software into a
                single autonomous platform, providing a hands-on introduction to how these
                systems interact in real engineering applications.
              </p>
              <p>
                Looking ahead to the spring semester and beyond, we&apos;re always open to
                exploring new ideas. We welcome ideas from our members and are eager to tackle
                new engineering challenges. As the team grows, so will the range and ambition of
                the projects we pursue.
              </p>
              <p className="font-serif text-xl font-medium tracking-tight text-foreground">
                Join us! It&apos;ll be fun.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
