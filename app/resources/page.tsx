import type { Metadata } from 'next'
import { ArrowUpRight, FileText, ExternalLink, GraduationCap, Briefcase, Users, BookOpen } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section, SectionHeading, CtaLink } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'National NSBE tools, scholarships, career resources, and useful campus links for UF NSBE members.',
}

const nsbeResources = [
  {
    icon: GraduationCap,
    title: 'NSBE Scholarships',
    description: 'National scholarships and awards available to NSBE members across all academic levels.',
    href: 'https://nsbe.org/scholarships/',
  },
  {
    icon: Briefcase,
    title: 'NSBE Career Center',
    description: 'The national job board connecting members with internships and full-time engineering roles.',
    href: 'https://careers.nsbe.org/',
  },
  {
    icon: Users,
    title: 'NSBE Membership Portal',
    description: 'Manage your national membership, register for convention, and access member benefits.',
    href: 'https://mynsbe.nsbe.org/s/login/',
  },
  {
    icon: BookOpen,
    title: 'Convention & Conferences',
    description: 'Learn about the Annual Convention and Fall Regional Conference (FRC) opportunities.',
    href: 'https://convention.nsbe.org',
  },
]

const usefulLinks = [
  { title: 'UF Herbert Wertheim College of Engineering', href: 'https://www.eng.ufl.edu' },
  { title: 'UF Career Connections Center', href: 'https://career.ufl.edu' },
  { title: 'UF Multicultural & Diversity Affairs', href: 'https://multicultural.ufl.edu' },
  { title: 'UF Office for Academic Support', href: 'https://oas.aa.ufl.edu' },
  { title: 'NSBE National Website', href: 'https://www.nsbe.org' },
  { title: 'NSBE Region 3', href: 'https://nsbe.org/collegiate-region/collegiate-region-3/' },
]

export default function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Tools to help you thrive"
        description="Everything from national NSBE opportunities to campus support and career resources — gathered in one place."
      />

      {/*
        Presentation library teaser is archived until the page is ready to launch.
        See app/resources/presentations/page.tsx for the full implementation.
        <Section>
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Chapter"
                title="Presentation library"
                description="Slides and materials from our workshops, general body meetings, and professional development sessions."
              />
              <CtaLink href="/resources/presentations">
                Browse presentations
                <FileText className="size-4" />
              </CtaLink>
            </div>
          </Container>
        </Section>
      */}

      <Section id="nsbe" className="scroll-mt-24 border-t border-border bg-muted/40 first:border-t-0">
        <Container>
          <SectionHeading
            eyebrow="National NSBE"
            title="Beyond the chapter"
            description="As a UF NSBE member you are part of a national organization with resources that follow you throughout your career."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {nsbeResources.map((r) => (
              <a
                key={r.title}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <r.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="flex items-center gap-1.5 font-medium text-foreground">
                    {r.title}
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                </div>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="links" className="scroll-mt-24 border-t border-border">
        <Container>
          <SectionHeading eyebrow="Useful links" title="Campus & career" />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {usefulLinks.map((link) => (
              <li key={link.title}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {link.title}
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  )
}
