import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, getSupabaseConfig } from '@/lib/supabase/config'
import { isUfEmail } from '@/lib/portal/rules'

export async function GET(request: NextRequest) {
  if (!getSupabaseConfig() || !process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.redirect(new URL('/portal/login?error=unavailable', request.url))
  }
  const origin = getSiteUrl()
  const fail = (error: string) =>
    NextResponse.redirect(new URL(`/portal/login?error=${error}`, origin))
  if (!getSupabaseConfig()) return fail('unavailable')
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return fail('login')
  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) return fail('login')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (
    !user ||
    !isUfEmail(user.email) ||
    !user.email_confirmed_at ||
    !user.identities?.some((identity) => identity.provider === 'google')
  ) {
    await supabase.auth.signOut({ scope: 'local' })
    return fail('uf-account')
  }
  const { data: member, error: memberError } =
    await supabase.rpc('claim_member')
  if (memberError || !member) {
    await supabase.auth.signOut({ scope: 'local' })
    return fail('member')
  }
  return NextResponse.redirect(
    new URL(
      member.profile_completed_at ? '/portal' : '/portal/profile',
      origin,
    ),
  )
}
