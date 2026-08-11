'use client'

import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { presentations, presentationCategories } from '@/data/presentations'
import { cn } from '@/lib/utils'

const filters = ['All', ...presentationCategories] as const

export function PresentationLibrary() {
  const [active, setActive] = useState<(typeof filters)[number]>('All')

  const visible =
    active === 'All' ? presentations : presentations.filter((p) => p.category === active)

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter presentations by category">
        {filters.map((filter) => {
          const isActive = filter === active
          return (
            <button
              key={filter}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(filter)}
              className={cn(
                'rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {filter}
            </button>
          )
        })}
      </div>

      <div className="mt-8 grid gap-4">
        {visible.map((p) => (
          <article
            key={p.id}
            className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" aria-hidden />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="font-medium text-foreground">{p.title}</h3>
                  <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                    {p.category}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground/70">{p.date}</p>
              </div>
            </div>
            <button
              type="button"
              disabled
              title="Connect Google Drive to enable downloads"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground sm:self-center"
            >
              <Download className="size-4" aria-hidden />
              View
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
