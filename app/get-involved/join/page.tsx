import type { Metadata } from 'next'
import { Sparkles, Users, Calendar, Award, ArrowUpRight } from 'lucide-react'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container, Section, SectionHeading } from '@/components/site/primitives'
import { ApplicationForm, type FormField } from '@/components/forms/application-form'

export const metadata: Metadata = {
  title: 'Join NSBE',
  description:
    'Become a member of the University of Florida Gator Chapter of the National Society of Black Engineers.',
}

const benefits = [
  { icon: Users, title: 'Community', copy: 'A network of peers, mentors, and friends who have your back.' },
  { icon: Calendar, title: 'Events', copy: 'General body meetings, socials, workshops, and service projects.' },
  { icon: Award, title: 'Development', copy: 'Résumé help, interview prep, and access to recruiters.' },
  { icon: Sparkles, title: 'Opportunity', copy: 'National conventions, scholarships, and career connections.' },
]

const joinFields: FormField[] = [
  { name: 'firstName', label: 'First name', type: 'text', required: true, placeholder: 'Jane' },
  { name: 'lastName', label: 'Last name', type: 'text', required: true, placeholder: 'Gator' },
  { name: 'email', label: 'UF email', type: 'email', required: true, placeholder: 'jane@ufl.edu' },
  { name: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '(000) 000-0000' },
  {
    name: 'classStanding',
    label: 'Class standing',
    type: 'select',
    required: true,
    options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'],
  },
  { name: 'major', label: 'Major', type: 'text', required: true, placeholder: 'e.g. Mechanical Engineering' },
  {
    name: 'interests',
    label: 'What are you hoping to get out of NSBE?',
    type: 'textarea',
    placeholder: 'Tell us what you are looking for — community, career prep, mentorship, or something else.',
  },
]

export default function JoinPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Join UF NSBE"
        description="Membership is open to all students who support our mission. Come as you are — you belong here."
      >
        <a
          href="https://www.nsbe.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-nsbe-green underline-offset-4 hover:underline"
        >
          Also register as a national NSBE member
          <ArrowUpRight className="size-4" />
        </a>
      </PageHero>

      <Section>
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-nsbe-green/10 text-nsbe-green">
                  <b.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-medium text-foreground">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-muted/40">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Membership"
            title="Become a member"
            description="Fill out the form below to join our chapter roster and start receiving updates about meetings and events."
          />
          <div className="mt-8">
            <PlaceholderNote>
              This form validates and confirms on-screen but is not yet connected to a backend. Wire it to your
              membership roster (a Google Sheet, database, or CRM) to start collecting real sign-ups.
            </PlaceholderNote>
          </div>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <ApplicationForm fields={joinFields} submitLabel="Join UF NSBE" accent="nsbe" />
          </div>
        </Container>
      </Section>
    </>
  )
}
