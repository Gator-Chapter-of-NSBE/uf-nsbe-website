'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogIn, UserRound } from 'lucide-react'
import { signOut } from '@/app/portal/actions'

type Account = { name: string; email: string; isAdmin: boolean }

export function AccountMenu() {
  const pathname = usePathname()
  const [account, setAccount] = useState<Account | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [semester, setSemester] = useState<string | null>(null)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let controller: AbortController | undefined
    async function refresh() {
      controller?.abort()
      const request = new AbortController()
      controller = request
      try {
        const response = await fetch('/auth/account', {
          cache: 'no-store',
          signal: request.signal,
        })
        if (!response.ok) throw new Error('Account unavailable')
        const result = await response.json()
        if (!request.signal.aborted) setAccount(result.account)
      } catch {
        if (!request.signal.aborted) setAccount(null)
      }
    }
    void refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('ufnsbe:account-changed', refresh)
    return () => {
      controller?.abort()
      window.removeEventListener('focus', refresh)
      window.removeEventListener('ufnsbe:account-changed', refresh)
    }
  }, [pathname])

  useEffect(() => {
    if (!open) return
    function dismiss(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        container.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  if (account === undefined) {
    return (
      <span
        role="status"
        className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <UserRound className="size-4" aria-hidden />
        <span className="sr-only">Loading account</span>
      </span>
    )
  }
  if (!account) {
    return (
      <Link
        href="/portal/login"
        className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <LogIn className="size-4" aria-hidden />
        Sign in
      </Link>
    )
  }
  const initials = account.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const close = () => setOpen(false)
  async function handleSignOut() {
    try {
      await signOut()
    } finally {
      close()
      // Also refresh when signing out from the login page itself (same URL).
      window.dispatchEvent(new Event('ufnsbe:account-changed'))
    }
  }
  return (
    <div
      ref={container}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close()
      }}
    >
      <button
        type="button"
        onClick={() => {
          setSemester(new URLSearchParams(window.location.search).get('semester'))
          setOpen(!open)
        }}
        aria-expanded={open}
        aria-controls="header-account-panel"
        aria-label={`Account: ${account.name}`}
        className="flex min-h-9 items-center gap-2 rounded-md p-1 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nsbe-green/15 text-xs font-semibold">
          {initials}
        </span>
        <span className="hidden max-w-24 truncate xl:block">
          {account.name.split(' ')[0]}
        </span>
        <ChevronDown className="hidden size-3.5 sm:block" aria-hidden />
      </button>
      {open && (
        <div
          id="header-account-panel"
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] rounded-lg border border-border bg-popover p-2 shadow-lg"
        >
          <div className="border-b border-border px-3 py-3">
            <p className="truncate text-sm font-semibold">{account.name}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">
              {account.email}
            </p>
          </div>
          <nav aria-label="Your account" className="mt-1">
            <Link
              href="/portal"
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm hover:bg-secondary focus-visible:bg-secondary"
            >
              Member dashboard
            </Link>
            <Link
              href="/portal/profile"
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm hover:bg-secondary focus-visible:bg-secondary"
            >
              Edit profile
            </Link>
          </nav>
          {account.isAdmin && <nav aria-label="Dashboard previews" className="mt-1 border-t border-border pt-2">
            <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Preview dashboard</p>
            <Link href={`/portal?${new URLSearchParams({ preview: 'member', ...(semester ? { semester } : {}) })}`} onClick={close} className="block rounded-md px-3 py-2 text-sm hover:bg-secondary focus-visible:bg-secondary">Preview as Member</Link>
            <Link href={`/portal?${new URLSearchParams({ preview: 'eboard', ...(semester ? { semester } : {}) })}`} onClick={close} className="block rounded-md px-3 py-2 text-sm hover:bg-secondary focus-visible:bg-secondary">Preview as E-board</Link>
          </nav>}
          <form
            action={handleSignOut}
            className="mt-1 border-t border-border pt-1"
          >
            <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-secondary focus-visible:bg-secondary">
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
