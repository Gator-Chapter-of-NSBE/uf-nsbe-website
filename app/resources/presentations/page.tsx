import type { Metadata } from 'next'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container, Section } from '@/components/site/primitives'
import { PresentationLibrary } from '@/components/resources/presentation-library'

export const metadata: Metadata = {
  title: 'Presentations',
  description:
    'Slide decks and materials from UF NSBE workshops, general body meetings, and professional development sessions.',
}

export default function PresentationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Presentation library"
        description="Catch up on what you missed or revisit a workshop. Materials from meetings, workshops, and professional development live here."
      />

      <Section>
        <Container className="max-w-4xl">
          <PlaceholderNote>
            These entries are placeholders. The intended source of truth is the chapter&apos;s Google Drive — connect the
            Drive API so officers can upload decks and they appear here automatically with working download links.
          </PlaceholderNote>
          <div className="mt-10">
            <PresentationLibrary />
          </div>
        </Container>
      </Section>
    </>
  )
}
