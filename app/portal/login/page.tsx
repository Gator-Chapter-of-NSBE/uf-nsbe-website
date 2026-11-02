import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Container, Section } from '@/components/site/primitives'
import { getSupabaseConfig } from '@/lib/supabase/config'
import { signInWithGoogle } from '../actions'

const messages: Record<string, string> = {
  'uf-account':
    'Please choose your University of Florida Google account ending in @ufl.edu.',
  login: 'We could not complete your Google login. Please try again.',
  unavailable: 'Member login is not available yet. Please check back soon.',
  member:
    'We could not load your member record. Please try again or contact the chapter.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const ready = Boolean(getSupabaseConfig() && process.env.NEXT_PUBLIC_SITE_URL)
  return (
    <Section>
      <Container className="max-w-5xl">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
          <div className="bg-ink p-8 text-white sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-nsbe-yellow">
              Gator Chapter / Members
            </p>
            <h1 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl">
              Your chapter.
              <br />
              Your progress.
            </h1>
            <p className="mt-6 leading-relaxed text-white/70">
              Keep up with your attendance, semester points, and progress toward
              active membership in one place.
            </p>
            <div className="mt-10 flex items-start gap-3 text-sm text-white/70">
              <ShieldCheck
                className="size-5 shrink-0 text-nsbe-yellow"
                aria-hidden
              />
              <p>
                Your attendance stays connected to your UF email, even before
                your first portal login.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <h2 className="font-serif text-3xl">Welcome to your portal</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Use your UF Google account ending in{' '}
              <strong className="text-foreground">@ufl.edu</strong> to continue.
            </p>
            {error && messages[error] && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-border bg-muted p-4 text-sm"
              >
                {messages[error]}
              </p>
            )}
            {ready ? (
              <form action={signInWithGoogle} className="mt-8">
                <button className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-input px-5 font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  Continue with Google{' '}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </form>
            ) : (
              <p className="mt-8 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                The member portal is being prepared. Event check-in is still
                available below.
              </p>
            )}
            <Link
              href="/sign-in"
              className="mt-6 text-sm font-medium underline underline-offset-4"
            >
              Here for an event? Check in
            </Link>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Your profile and attendance are visible to you and authorized
              chapter administrators. Your name and points also appear on the
              member leaderboard. Read our{' '}
              <Link href="/privacy" className="underline underline-offset-4">
                privacy policy
              </Link>{' '}
              for details.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
