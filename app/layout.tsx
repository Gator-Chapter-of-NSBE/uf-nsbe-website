import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const SITE_URL = 'https://ufnsbe.org'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'UF NSBE — University of Florida Gator Chapter',
    template: '%s | UF NSBE',
  },
  description:
    'The University of Florida Gator Chapter of the National Society of Black Engineers. Engineering the future and building Black excellence through community, professional development, and academic achievement.',
  keywords: [
    'UF NSBE',
    'NSBE UF',
    'National Society of Black Engineers University of Florida',
    'Black engineers University of Florida',
    'Trailblazers UF NSBE',
    'Gator Chapter NSBE',
  ],
  authors: [{ name: 'University of Florida NSBE' }],
  generator: 'v0.app',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'UF NSBE — University of Florida Gator Chapter',
    description:
      'Engineering the future and building Black excellence at the University of Florida.',
    siteName: 'UF NSBE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UF NSBE — University of Florida Gator Chapter',
    description:
      'Engineering the future and building Black excellence at the University of Florida.',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', type: 'image/png' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1a1818',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="min-h-dvh font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
