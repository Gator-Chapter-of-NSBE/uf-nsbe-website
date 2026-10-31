import { Container, Section } from '@/components/site/primitives'

export default function Loading() {
  return (
    <Section>
      <Container>
        <p role="status" className="text-muted-foreground">
          Loading your member portal…
        </p>
      </Container>
    </Section>
  )
}
