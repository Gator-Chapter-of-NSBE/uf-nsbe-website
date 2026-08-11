import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container, Section } from '@/components/site/primitives'
import { SignInForm } from '@/components/forms/sign-in-form'

export const metadata: Metadata = {
  title: 'Meeting Sign-In',
  description: 'Check in to a UF NSBE general body meeting, workshop, or event to record your attendance.',
}

export default function SignInPage() {
  return (
    <>
      <PageHero
        eyebrow="Attendance"
        title="Meeting sign-in"
        description="Checking in for a general body meeting, workshop, or event? Record your attendance here."
      />

      <Section>
        <Container className="max-w-xl">
          <PlaceholderNote>
            This sign-in confirms on-screen but is not yet connected to a backend. Wire it to a Google Sheet, database,
            or the chapter&apos;s attendance system to persist check-ins. The event list can be preselected with a link
            like <code className="font-mono text-xs">/sign-in?event=general-body-meeting</code>.
          </PlaceholderNote>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
            <Suspense fallback={<div className="h-96" aria-hidden />}>
              <SignInForm />
            </Suspense>
          </div>
        </Container>
      </Section>
    </>
  )
}
