import Link from 'next/link'
import { Container, Section } from '@/components/site/primitives'
import { ProfileForm } from '@/components/portal/profile-form'
import { requireMember, getPortalView } from '@/lib/portal/session'
import { PortalViewShell } from '@/components/portal/portal-view'
import { previewHref } from '@/lib/portal/view'
import { signOut } from '../actions'

export default async function ProfilePage({searchParams}: {searchParams: Promise<{preview?: string}>}) {
  const { member, supabase } = await requireMember()
  const view=await getPortalView(supabase,(await searchParams).preview)
  return (
    <Section>
      <Container className="max-w-3xl">
        <PortalViewShell view={view}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href={previewHref('/portal',view.preview)} className="text-sm underline underline-offset-4">
            Back to dashboard
          </Link>
          <form action={signOut}>
            <button disabled={view.readOnly} className="text-sm underline underline-offset-4 disabled:opacity-50">
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
          <fieldset disabled={view.readOnly}><ProfileForm member={member} /></fieldset>
        </div>
        </PortalViewShell>
      </Container>
    </Section>
  )
}
