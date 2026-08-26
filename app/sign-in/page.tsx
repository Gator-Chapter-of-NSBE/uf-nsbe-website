import type { Metadata } from 'next'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section } from '@/components/site/primitives'

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
        <Container className="max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfGuWSoFI3hnsi4L5Otqyh2FUiCfjeGs8kETvpRerLzj5xbog/viewform?embedded=true"
              title="Meeting sign-in form"
              className="block h-[1349px] w-full"
              loading="lazy"
            >
              Loading…
            </iframe>
          </div>
        </Container>
      </Section>
    </>
  )
}
