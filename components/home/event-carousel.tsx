'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import type { EventPhoto } from '@/data/photos'
import { cn } from '@/lib/utils'

const INTERVAL = 5000

export function EventCarousel({ photos }: { photos: EventPhoto[] }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const count = photos.length
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count])
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count])

  useEffect(() => {
    if (!playing || count <= 1) return
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    timer.current = setInterval(next, INTERVAL)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [playing, next, count])

  if (count === 0) return null

  return (
    <div
      className="group relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Event photography"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
    >
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-xl border border-border bg-secondary sm:aspect-16/9">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            {photo.caption ? (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-4 p-5 sm:p-6">
                <p className="font-serif text-lg font-medium text-white text-balance sm:text-xl">
                  {photo.caption}
                </p>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {i + 1} / {count}
                </span>
              </div>
            ) : null}
          </div>
        ))}

        {/* Controls */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 group-hover:opacity-100"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 z-10 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-ink opacity-0 shadow-md backdrop-blur transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 group-hover:opacity-100"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Indicators + play/pause */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose photo">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to ${photo.caption ?? `photo ${i + 1}`}`}
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-8 bg-nsbe-green' : 'w-4 bg-border hover:bg-muted-foreground/40',
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  )
}
