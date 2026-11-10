import type { Metadata } from 'next'
import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How UF NSBE collects and uses information for its website, member portal, and event attendance system.',
  alternates: { canonical: '/privacy' },
}

const privacyEmail = 'webmaster.ufnsbe@gmail.com'
const linkClass = 'break-words font-medium text-foreground underline underline-offset-4'

export default function PrivacyPage() {
  return (
    <Section className="pt-12 sm:pt-20">
      <Container className="max-w-3xl">
        <p className="eyebrow">UF NSBE</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Privacy policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Effective November 1, 2026 · Last updated November 9, 2026</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          The University of Florida Gator Chapter of the National Society of Black Engineers
          (UF NSBE) operates ufnsbe.org. This policy explains how we handle information
          through our website, member portal, event check-in, and related chapter forms.
        </p>

        <div className="mt-10 space-y-9 text-sm leading-7 text-muted-foreground sm:text-base">
          <PolicySection title="Information we collect">
            <ul className="list-disc space-y-3 pl-5">
              <li><strong className="text-foreground">Account information:</strong> when you sign in with Google, our authentication provider receives your account identifier, email address, verification information, and basic profile information Google provides, such as your name and profile photo. Portal access requires a verified UF email and Google identity.</li>
              <li><strong className="text-foreground">Member profiles:</strong> your name, UF email, major, and school year, plus your NSBE ID and UFID if you choose to provide them. NSBE ID and UFID are optional.</li>
              <li><strong className="text-foreground">Chapter participation:</strong> event attendance, submission times, points, bonuses, membership eligibility, and administrative corrections with their reasons and authors. We also record E-board access assignments and revocations, including the member, administrator, and time of each change. This includes historical attendance imported from chapter forms.</li>
              <li><strong className="text-foreground">Messages and subscriptions:</strong> information you submit through our contact form, such as your name, email, organization, topic, and message; and information you provide when subscribing to our newsletter or completing a linked chapter form.</li>
              <li><strong className="text-foreground">Technical information:</strong> authentication cookies that keep you signed in, website usage measurements, and operational or security logs processed by our service providers. These may include device, browser, request, and network information.</li>
            </ul>
          </PolicySection>

          <PolicySection title="How we use information">
            <p>We use this information to authenticate accounts, maintain member profiles, record attendance, calculate points and semester membership status, display membership history and rankings, administer chapter activities, respond to messages, send requested newsletters, and operate and protect the website.</p>
            <p className="mt-3">Google sign-in is used for authentication. Our portal does not request access to your Gmail messages, Google Drive files, or private Google calendars. The chapter events calendar is read separately from the chapter’s public Google Calendar.</p>
          </PolicySection>

          <PolicySection title="Who can see chapter records">
            <p>Members can view their own profile, attendance, points, and membership history. Authorized chapter administrators can access member records, correct attendance, record point adjustments, and export active-member lists containing names, UF emails, attendance counts, and points.</p>
            <p className="mt-3">Authorized E-board members can manage event check-in settings and passwords. They can also search members and view names, UF emails, majors, school years, attendance, points, membership status, and previous-event rosters for chapter operations. This participation access is read-only and excludes UFIDs, NSBE IDs, administrator correction history, active-member exports, and role-assignment history.</p>
            <p className="mt-3">The points leaderboard is visible to signed-in UF portal users. It displays participating members’ names, points, and ranks, including members whose attendance was recorded before they first logged into the portal. It does not display emails, UFIDs, NSBE IDs, or individual attendance histories.</p>
            <p className="mt-3">We do not sell member personal information. We may also disclose information when required by applicable law or when needed to address misuse, protect users, or secure chapter services.</p>
          </PolicySection>

          <PolicySection title="Services we use">
            <p>We use service providers to operate the website and chapter communications. They process information relevant to their services under their own privacy policies:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li><a href="https://policies.google.com/privacy" className={linkClass}>Google</a>: account sign-in, the chapter calendar, and Google-hosted forms or maps where used.</li>
              <li><a href="https://supabase.com/privacy" className={linkClass}>Supabase</a>: authentication and storage of member, attendance, points, and administrative records.</li>
              <li><a href="https://vercel.com/legal/privacy-policy" className={linkClass}>Vercel</a>: website hosting, delivery, operational logs, and website analytics.</li>
              <li><a href="https://resend.com/legal/privacy-policy" className={linkClass}>Resend</a>: delivery of contact-form messages and email confirmations.</li>
              <li><a href="https://www.beehiiv.com/privacy" className={linkClass}>beehiiv</a>: newsletter content, subscriptions, and related newsletter services.</li>
            </ul>
            <p className="mt-3">Embedded content and external websites may collect information when you load or interact with them. Their privacy practices are governed by their respective policies. Chapter information may be processed in locations where our providers operate.</p>
          </PolicySection>

          <PolicySection title="Retention and security">
            <p>Semester points reset for each new semester, but we retain historical attendance, points, and membership records to support past-semester views, cumulative totals, and chapter administration. Other information, including messages and logs, may be retained as needed for communications, operations, security, and applicable obligations. We do not currently apply one automatic deletion deadline to all records.</p>
            <p className="mt-3">We use authentication, database access controls, and restricted administrator permissions to protect member information. Event passwords are stored as hashes. No online service or storage method can guarantee absolute security.</p>
          </PolicySection>

          <PolicySection title="Your choices and privacy requests">
            <p>You can edit profile information in the member portal and leave optional NSBE ID and UFID fields blank. Contact the chapter about incorrect attendance, points, account details, or leaderboard information. You may request access to or deletion of your information by emailing <a href={`mailto:${privacyEmail}`} className={linkClass}>{privacyEmail}</a>.</p>
            <p className="mt-3">We may need to verify your identity before acting on a request. We will review the request and explain any records we need to retain for chapter administration, security, or applicable obligations. Copies in backups, exported files, and service-provider systems may remain until their normal retention cycles complete. Removing Google authorization does not by itself delete chapter records; contact us to request deletion.</p>
            <p className="mt-3">You can sign out of the portal, manage Google authorization through your Google Account, and unsubscribe from newsletters through the link in those emails. Blocking authentication cookies may prevent portal sign-in.</p>
          </PolicySection>

          <PolicySection title="Changes and contact">
            <p>We may update this policy as chapter services change. The date at the top identifies the latest revision. For questions or privacy requests, email <a href={`mailto:${privacyEmail}`} className={linkClass}>{privacyEmail}</a> or visit our <Link href="/contact" className={linkClass}>contact page</Link>.</p>
          </PolicySection>
        </div>
      </Container>
    </Section>
  )
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="mb-3 font-serif text-2xl text-foreground">{title}</h2>{children}</section>
}
