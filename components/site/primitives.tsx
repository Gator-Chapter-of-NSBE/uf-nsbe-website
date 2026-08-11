import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Container                                                          */
/* ------------------------------------------------------------------ */

export function Container({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section (vertical rhythm wrapper)                                  */
/* ------------------------------------------------------------------ */

export function Section({
  className,
  children,
  id,
}: {
  className?: string
  children: React.ReactNode
  id?: string
}) {
  return (
    <section id={id} className={cn('py-16 sm:py-20 lg:py-24', className)}>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Eyebrow                                                            */
/* ------------------------------------------------------------------ */

export function Eyebrow({
  children,
  className,
  as: Tag = 'p',
}: {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}) {
  return (
    <Tag
      className={cn(
        'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-nsbe-green" />
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------ */
/* Section heading                                                    */
/* ------------------------------------------------------------------ */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  headingClassName,
  eyebrowClassName,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
  headingClassName?: string
  eyebrowClassName?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <Eyebrow className={cn(align === 'center' && 'justify-center', eyebrowClassName)}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={cn(
          'font-serif text-3xl font-medium leading-[1.1] tracking-tight text-balance sm:text-4xl md:text-[2.75rem]',
          headingClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* CTA link (button-styled anchor)                                    */
/* ------------------------------------------------------------------ */

const ctaVariants = cva(
  'group inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        accent: 'bg-nsbe-green text-white hover:bg-nsbe-green/90',
        outline: 'border border-input bg-transparent text-foreground hover:bg-secondary',
        onDark:
          'bg-white text-ink hover:bg-white/90 focus-visible:ring-offset-ink',
        outlineDark:
          'border border-white/30 bg-transparent text-white hover:bg-white/10 focus-visible:ring-offset-ink',
        ghost: 'text-foreground hover:bg-secondary',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-7 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type CtaLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  withArrow?: boolean
  external?: boolean
} & VariantProps<typeof ctaVariants>

export function CtaLink({
  href,
  children,
  className,
  variant,
  size,
  withArrow = false,
  external = false,
}: CtaLinkProps) {
  const content = (
    <>
      {children}
      {withArrow ? (
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      ) : null}
    </>
  )
  const classes = cn(ctaVariants({ variant, size }), className)

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* Text link with arrow                                               */
/* ------------------------------------------------------------------ */

export function ArrowLink({
  href,
  children,
  className,
  external = false,
}: {
  href: string
  children: React.ReactNode
  className?: string
  external?: boolean
}) {
  const classes = cn(
    'group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-nsbe-green',
    className,
  )
  const inner = (
    <>
      {children}
      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
    </>
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  )
}
