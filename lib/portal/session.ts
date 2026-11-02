import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseConfig } from '@/lib/supabase/config'
import { isUfEmail } from './rules'
import type { Member } from './types'

export async function requireMember() {
  if (!getSupabaseConfig()) redirect('/portal/login')
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) redirect('/portal/login')
  if (
    !isUfEmail(user.email) ||
    !user.email_confirmed_at ||
    !user.identities?.some((identity) => identity.provider === 'google')
  ) {
    redirect('/portal/login?error=uf-account')
  }
  // Database verifies the Google identity and claims only the matching email.
  const { data, error: claimError } = await supabase.rpc('claim_member')
  if (claimError || !data)
    throw new Error(
      'Your member record could not be loaded. Please try again or contact the chapter.',
    )
  return { supabase, member: data as Member }
}

export async function requireAdmin() {
  const context = await requireMember()
  const { data, error } = await context.supabase.rpc('is_portal_admin')
  if (error || data !== true) redirect('/portal')
  return context
}
