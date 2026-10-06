import type { Metadata } from 'next'
import { Container, Section } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'Subscribe to The NSBE Wire, the UF NSBE newsletter for chapter news, opportunities, and community highlights.',
}

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