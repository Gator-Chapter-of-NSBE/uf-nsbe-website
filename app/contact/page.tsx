import type { Metadata } from 'next'
import { Mail, MapPin, ArrowUpRight } from 'lucide-react'
import { PageHero, PlaceholderNote } from '@/components/site/page-hero'
import { Container, Section, SectionHeading } from '@/components/site/primitives'
import { ApplicationForm, type FormField } from '@/components/forms/application-form'
import { DiscordIcon, InstagramIcon, LinkedinIcon } from '@/components/site/brand-icons'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the University of Florida Gator Chapter of the National Society of Black Engineers.',
}

const contactFields: FormField[] = [
  { name: 'name', label: 'Your name', type: 'text', required: true, placeholder: 'Jane Gator' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
  { name: 'organization', label: 'Organization (optional)', type: 'text', placeholder: 'Company or department' },
  {
    name: 'topic',
    label: 'What is this about?',
    type: 'select',
    required: true,
    options: ['General question', 'Membership', 'Sponsorship / partnership', 'Trailblazers program', 'Media / press', 'Other'],
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    placeholder: 'How can we help?',
  },
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        description="Questions about membership, partnership, or our programs? Reach out — we'd love to hear from you."
      />

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>

              <div className="mt-10 border-t border-border pt-8">
                <SectionHeading eyebrow="Chapter contacts" title="Reach the right person" />
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {site.contacts.map((contact) => (
                    <div key={contact.email} className="rounded-xl border border-border bg-card p-4">
                      <p className="font-medium text-foreground">{contact.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{contact.role}</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="mt-3 block break-all text-sm text-nsbe-green underline-offset-4 hover:underline"
                      >
                        {contact.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t border-border pt-8">
                <p className="text-sm font-medium text-foreground">Follow along</p>
                <div className="mt-4 flex gap-3">
                  <a
                    href={site.social.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <InstagramIcon className="size-4" />
                    {site.social.instagram.handle}
                  </a>
                  <a
                    href={site.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <LinkedinIcon className="size-4" />
                    LinkedIn
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                  </a>
                  <a
                    href={site.social.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <DiscordIcon className="size-4" />
                    Discord
                    <ArrowUpRight className="size-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <PlaceholderNote>
                This contact form validates and confirms on-screen but is not yet connected to a backend. Wire it to an
                email service or inbox to start receiving messages.
              </PlaceholderNote>
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
                <ApplicationForm fields={contactFields} submitLabel="Send message" accent="nsbe" />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
