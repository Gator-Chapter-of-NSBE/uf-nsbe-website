import type { Metadata } from 'next'
import { Container, Section } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'Subscribe to The NSBE Wire, the UF NSBE newsletter for chapter news, opportunities, and community highlights.',
}

const newsletterLogo =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nsbeWire-1LcpMZFB0EtPwPagpqLZrYGDjmYmgA.png'

export default function NewsletterPage() {
  return (
    <>
                  <iframe
  src="https://ufnsbe-newsletter.beehiiv.com/"
  title="The NSBE Wire"
  className="h-[1000px] w-full border-0"

/>
    </>
  )
}