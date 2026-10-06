import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Get Involved',
  description:
    'Join UF NSBE, apply to Trailblazers, join the Design Team, or sponsor the chapter.',
}

const paths = [
  {
    title: 'Join NSBE',
    copy: 'Become a member of the chapter, get on our roster, and start showing up.',
    href: '/get-involved/join',
    tag: 'Students',
  },
  {
    title: 'Apply to Trailblazers',
    copy: 'First-year students: join the cohort that supports you from day one.',
    href: 'https://forms.gle/VuzoDG9v61Q3cPMv5',
    tag: 'First-years',
  },
  {
    title: 'Join the Design Team',
    copy: 'Build hands-on engineering projects across mechanical, electrical, and computer engineering.',
    href: '/programs/design-team',
    tag: 'Engineers',
  },
  {
    title: 'Become a Sponsor',
    copy: 'Companies & organizations: partner with us to reach exceptional talent.',
    href: '/get-involved/sponsor',
    tag: 'Partners',
  },
]

export default function GetInvolvedPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="There's a place for you here"
        description="Whether you're a student, a first-year, an engineer, or an industry partner — here's how to plug in."
      />

      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2">
            {paths.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="group flex flex-col rounded-2xl border border-border bg-card p-7 transition-colors hover:border-primary/40"
              >
                <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">{p.tag}</span>
                <h3 className="mt-3 font-serif text-2xl text-foreground">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{p.copy}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

    </>
  )
}
