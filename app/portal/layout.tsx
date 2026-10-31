import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member Portal',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
