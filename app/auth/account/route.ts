import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseConfig } from '@/lib/supabase/config'
import { isUfEmail } from '@/lib/portal/rules'

export const dynamic = 'force-dynamic'

function respond(
  account: { name: string; email: string; isAdmin: boolean } | null,
  status = 200,
) {
  return NextResponse.json(
    { account },
    {
      status,
      headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
    },
  )
}

export async function GET() {
  if (!getSupabaseConfig()) return respond(null)
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (
      error ||
      !user ||
      !user.email_confirmed_at ||
      !isUfEmail(user.email) ||
      !user.identities?.some((identity) => identity.provider === 'google')
    ) {
      return respond(null)
    }
    const { data: member, error: profileError } = await supabase
      .from('members')
      .select('full_name')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    if (profileError) return respond(null, 503)
    const { data: admin, error: roleError } = await supabase.rpc('is_portal_admin')
    return respond({ name: member?.full_name || 'Member', email: user.email!, isAdmin: !roleError && admin === true })
  } catch {
    return respond(null, 503)
  }
}
