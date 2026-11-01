'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu } from 'lucide-react'
import { AccountMenu } from '@/components/layout/account-menu'
import { navigation } from '@/data/navigation'
import { Logo } from '@/components/site/logo'
import { Container } from '@/components/site/primitives'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-colors duration-200',
        scrolled
          ? 'border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75'
          : 'border-transparent bg-background',
      )}
    >
      <Container className="flex h-18 items-center justify-between gap-6 py-3">
        <Logo />

        {/* Desktop navigation */}
        <nav
          aria-label="Primary"
          className="hidden lg:flex lg:items-center lg:gap-1"
        >
          {navigation.map((group) => {
            const active =
              pathname === group.href || pathname.startsWith(group.href + '/')
            return (
              <div key={group.label} className="group relative">
                <Link
                  href={group.href}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    active && 'text-foreground',
                  )}
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden
                    className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                  />
                </Link>
                {/* Dropdown */}
                <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="w-72 overflow-hidden rounded-lg border border-border bg-popover p-1.5 shadow-lg ring-1 ring-black/5">
                    {group.items.map((item) => (
                      <Link
                        key={item.label + item.href}
                        href={item.href}
                        className="flex flex-col gap-0.5 rounded-md px-3 py-2.5 transition-colors hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="text-xs leading-snug text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* Shared account controls keep desktop and mobile in sync. */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/contact"
            className="hidden rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:block"
          >
            Contact
          </Link>
          <Link
            href="/sign-in"
            className="hidden h-9 items-center rounded-md border border-input px-3 text-sm font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline-flex"
          >
            Event check-in
          </Link>
          <AccountMenu />
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <button
                    type="button"
                    aria-label="Open menu"
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground"
                  />
                }
              >
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[86%] max-w-sm p-0">
                <MobileNav pathname={pathname} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  )
}

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-5">
        <Logo />
      </div>
      <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-1">
          {navigation.map((group) => (
            <li key={group.label} className="py-1">
              <SheetClose
                render={
                  <Link
                    href={group.href}
                    className="block rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide text-foreground"
                  />
                }
              >
                {group.label}
              </SheetClose>
              <ul className="mt-0.5 flex flex-col border-l border-border pl-3">
                {group.items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <li key={item.label + item.href}>
                      <SheetClose
                        render={
                          <Link
                            href={item.href}
                            className={cn(
                              'block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                              active && 'text-foreground',
                            )}
                          />
                        }
                      >
                        {item.label}
                      </SheetClose>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-border p-4">
        <SheetClose
          render={
            <Link
              href="/sign-in"
              className="mb-3 flex h-11 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground"
            />
          }
        >
          Event check-in
        </SheetClose>
        <SheetClose
          render={
            <Link
              href="/contact"
              className="flex h-11 items-center justify-center rounded-md border border-input text-sm font-medium text-foreground"
            />
          }
        >
          Contact UF NSBE
        </SheetClose>
      </div>
    </div>
  )
}
