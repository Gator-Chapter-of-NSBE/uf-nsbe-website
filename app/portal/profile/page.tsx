import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'
import { ProfileForm } from '@/components/portal/profile-form'
import { requireMember } from '@/lib/portal/session'
import { signOut } from '../actions'

export default async function ProfilePage() {
  const { member } = await requireMember()
  return (
    <Section>
      <Container className="max-w-3xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/portal" className="text-sm underline underline-offset-4">
            Back to dashboard
          </Link>
          <form action={signOut}>
            <button className="text-sm underline underline-offset-4">
              Sign out
            </button>
          </form>
        </div>
        <p className="eyebrow">Member profile</p>
        <h1 className="mt-3 font-serif text-4xl">
          {member.profile_completed_at
            ? 'Make yourself at home.'
            : 'Let’s get to know you.'}
        </h1>
        <p className="mt-4 text-muted-foreground">
          Add your name, major, and school year. You can update these details
          anytime. NSBE ID and UFID are optional.
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ProfileForm member={member} />
        </div>
      </Container>
    </Section>
  )
}
