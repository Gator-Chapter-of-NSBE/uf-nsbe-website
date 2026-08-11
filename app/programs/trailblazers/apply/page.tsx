import type { Metadata } from 'next'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container } from '@/components/site/primitives'
import { ApplicationForm, type FormField } from '@/components/forms/application-form'

export const metadata: Metadata = {
  title: 'Apply to Trailblazers',
  description:
    'Apply to join the UF NSBE Trailblazers freshman development and community program.',
}

const fields: FormField[] = [
  { name: 'firstName', label: 'First name', type: 'text', required: true },
  { name: 'lastName', label: 'Last name', type: 'text', required: true },
  { name: 'email', label: 'UF email', type: 'email', required: true, placeholder: 'you@ufl.edu' },
  { name: 'ufid', label: 'UFID (optional)', type: 'text' },
  {
    name: 'classYear',
    label: 'Class standing',
    type: 'select',
    required: true,
    options: ['Incoming Freshman', 'Freshman', 'Sophomore', 'Transfer Student'],
  },
  {
    name: 'major',
    label: 'Intended major',
    type: 'text',
    required: true,
    placeholder: 'e.g. Computer Engineering',
  },
  {
    name: 'why',
    label: 'Why do you want to join Trailblazers?',
    type: 'textarea',
    required: true,
    placeholder: 'Tell us what you hope to gain from the program.',
  },
  {
    name: 'goals',
    label: 'What are your goals for your first year?',
    type: 'textarea',
  },
]

export default function ApplyPage() {
  return (
    <>
      <PageHero
        tone="dark"
        eyebrow="Application"
        title="Apply to Trailblazers"
        description="Take the first step toward a community that will support you from your very first semester. Complete the form below to apply."
      />

      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          <div className="mb-8">
            <PlaceholderNote>
              This form validates input and confirms submission on-screen, but is not yet connected
              to a backend or spreadsheet. Wire it up to email, a database, or a form service to
              start collecting real applications.
            </PlaceholderNote>
          </div>
          <ApplicationForm
            fields={fields}
            submitLabel="Submit application"
            accent="trailblazers"
          />
        </Container>
      </section>
    </>
  )
}
