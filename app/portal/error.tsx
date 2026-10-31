'use client'

import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'

export default function PortalError({ reset }: { reset: () => void }) {
  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="font-serif text-3xl">
          Your portal is temporarily unavailable.
        </h1>
        <p className="mt-4 text-muted-foreground">
          We couldn’t load your member information. Please try again, or contact
          the chapter if this continues.
        </p>
        <div className="mt-6 flex flex-wrap gap-5">
          <button
            onClick={reset}
            className="rounded-md bg-primary px-5 py-3 text-sm text-primary-foreground"
          >
            Try again
          </button>
          <Link href="/contact" className="self-center text-sm underline">
            Contact the chapter
          </Link>
        </div>
      </Container>
    </Section>
  )
}
