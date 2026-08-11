import { Container, SectionHeading, ArrowLink } from '@/components/site/primitives'
import { programs } from '@/data/programs'
import { cn } from '@/lib/utils'

const accents: Record<string, string> = {
  trailblazers: 'before:bg-tb-purple',
  'professional-development': 'before:bg-nsbe-green',
  'design-team': 'before:bg-nsbe-red',
}

export function ProgramsPreview() {
  return (
    <section className="border-t border-border bg-secondary/40 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title="Programs built for every stage of your journey"
          description="From your first semester to your first offer, UF NSBE meets you where you are with focused, member-driven programming."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {programs.map((program) => (
            <article
              key={program.slug}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
                "before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-['']",
                accents[program.slug] ?? 'before:bg-primary',
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {program.tagline}
              </p>
              <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight">
                {program.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {program.description}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {program.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80"
                  >
                    {h}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <ArrowLink href={program.href}>{program.cta}</ArrowLink>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
