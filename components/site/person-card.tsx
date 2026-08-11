import Image from 'next/image'
import { cn } from '@/lib/utils'
import { LinkedinIcon } from '@/components/site/brand-icons'

export type PersonCardProps = {
  name: string
  role?: string
  major?: string
  year?: string
  bio?: string
  photo?: string
  linkedin?: string
  /** accent color for the placeholder monogram frame */
  accent?: 'nsbe' | 'trailblazers'
}

/**
 * A leadership/profile card. When no photo is provided it renders a tasteful
 * branded monogram placeholder (never a fake AI face).
 */
export function PersonCard({
  name,
  role,
  major,
  year,
  bio,
  photo,
  linkedin,
  accent = 'nsbe',
}: PersonCardProps) {
  const showPlaceholder = !photo || name.startsWith('[')

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-secondary">
        {showPlaceholder ? (
          <PlaceholderPortrait accent={accent} />
        ) : (
          <Image
            src={photo!}
            alt={`Portrait of ${name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        {role ? (
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.14em]',
              accent === 'trailblazers' ? 'text-tb-purple' : 'text-nsbe-green',
            )}
          >
            {role}
          </p>
        ) : null}
        <h3 className="font-serif text-lg font-medium tracking-tight text-foreground">{name}</h3>
        {(major || year) && (
          <p className="text-sm text-muted-foreground">
            {[major, year].filter(Boolean).join(' · ')}
          </p>
        )}
        {bio ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{bio}</p>
        ) : null}
        {linkedin ? (
          <div className="mt-auto pt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <LinkedinIcon className="size-4" />
              {linkedin.startsWith('[') ? 'LinkedIn' : linkedin}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function PlaceholderPortrait({ accent }: { accent: 'nsbe' | 'trailblazers' }) {
  return (
    <div
      aria-hidden
      className={cn(
        'flex h-full w-full items-center justify-center',
        accent === 'trailblazers'
          ? 'bg-gradient-to-br from-tb-navy to-tb-purple'
          : 'bg-gradient-to-br from-ink to-[#2f2c2a]',
      )}
    >
      <Image
        src="/logos/nsbe-logo.png"
        alt=""
        width={72}
        height={80}
        className="opacity-20 invert"
      />
    </div>
  )
}
