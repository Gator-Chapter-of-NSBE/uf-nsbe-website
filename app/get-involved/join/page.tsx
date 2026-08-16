import type { Metadata } from 'next'
import { Sparkles, Users, Calendar, Award, ArrowUpRight } from 'lucide-react'
import { PageHero } from '@/components/site/page-hero'
import { Container, Section, SectionHeading, CtaLink } from '@/components/site/primitives'
import { DiscordIcon } from '@/components/site/brand-icons'

export const metadata: Metadata = {
  title: 'Join NSBE',
  description:
    'Become a member of the University of Florida Gator Chapter of the National Society of Black Engineers.',
}

const DISCORD_URL = 'https://discord.gg/Cf3GujpTRh'

const benefits = [
  { icon: Users, title: 'Community', copy: 'A network of peers, mentors, and friends who have your back.' },
  { icon: Calendar, title: 'Events', copy: 'General body meetings, socials, workshops, and service projects.' },
  { icon: Award, title: 'Development', copy: 'Résumé help, interview prep, and access to recruiters.' },
  { icon: Sparkles, title: 'Opportunity', copy: 'National conventions, scholarships, and career connections.' },
]

export default function JoinPage() {
  return (
    <>
      <PageHero
        eyebrow="Get involved"
        title="Join UF NSBE"
        description="Membership is open to all students who support our mission. Come as you are — you belong here."
      >
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div className="flex items-center gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-nsbe-green/10 text-nsbe-green">
                  <DiscordIcon className="size-7" />
                </span>
                <div>
                  <h3 className="text-lg font-medium text-foreground">Join our Discord</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Introduce yourself in #introductions and stay in the loop on everything UF NSBE.
                  </p>
                </div>
              </div>
              <CtaLink href={DISCORD_URL} variant="accent" size="lg" external className="w-full shrink-0 sm:w-auto">
                <DiscordIcon className="size-5" />
                Join the Discord
              </CtaLink>
            </div>
          </div>
        <a
          href="https://mynsbe.nsbe.org/s/joinprocess"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-nsbe-green underline-offset-4 hover:underline"
        >
          Also register as a national NSBE member
          <ArrowUpRight className="size-4" />
        </a>
      </PageHero>

      <Section>
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-nsbe-green/10 text-nsbe-green">
                  <b.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-medium text-foreground">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.copy}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

    </>
  )
}
