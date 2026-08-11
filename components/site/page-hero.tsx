import { Info } from 'lucide-react'
import { Container, Eyebrow } from '@/components/site/primitives'
import { cn } from '@/lib/utils'

/** Standard interior-page header used on all sub-pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  children,
  tone = 'light',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <section
      className={cn(
        'border-b',
        tone === 'dark' ? 'border-white/10 bg-ink text-white' : 'border-border bg-secondary/40',
        className,
      )}
    >
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl">
          {eyebrow ? (
            <Eyebrow className={cn(tone === 'dark' && 'text-white/70')}>{eyebrow}</Eyebrow>
          ) : null}
          <h1
            className={cn(
              'mt-4 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl',
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                'mt-6 max-w-2xl text-lg leading-relaxed text-pretty',
                tone === 'dark' ? 'text-white/70' : 'text-muted-foreground',
              )}
            >
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </Container>
    </section>
  )
}

/** Small inline banner marking placeholder content for the future webmaster. */
export function PlaceholderNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-nsbe-yellow/50 bg-nsbe-yellow/10 px-4 py-3 text-sm text-foreground/80">
      <Info className="mt-0.5 size-4 shrink-0 text-foreground/60" />
      <p className="leading-relaxed text-pretty">{children}</p>
    </div>
  )
}
