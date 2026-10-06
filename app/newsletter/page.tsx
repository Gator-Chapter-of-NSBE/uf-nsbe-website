import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'The NSBE Wire, the UF NSBE newsletter for chapter news, opportunities, and community highlights.',
}

export default function NewsletterPage() {
  return (
    <iframe
      src="https://ufnsbe-newsletter.beehiiv.com/"
      title="The NSBE Wire"
      className="block min-h-screen w-full border-0"
      style={{ height: '1200px' }}
    />
  )
}