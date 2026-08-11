import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  tone = 'dark',
}: {
  className?: string
  tone?: 'dark' | 'light'
}) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
      aria-label="UF NSBE — home"
    >
      <span className="relative block h-10 w-9 shrink-0">
        <Image
          src="/logos/nsbe-logo.png"
          alt=""
          fill
          sizes="40px"
          className="object-contain"
          priority
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-serif text-lg font-semibold tracking-tight',
            tone === 'light' ? 'text-white' : 'text-ink',
          )}
        >
          UF NSBE
        </span>
        <span
          className={cn(
            'mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em]',
            tone === 'light' ? 'text-white/70' : 'text-muted-foreground',
          )}
        >
          Gator Chapter
        </span>
      </span>
    </Link>
  )
}
