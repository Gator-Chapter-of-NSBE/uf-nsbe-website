'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl, getSupabaseConfig } from '@/lib/supabase/config'
import { requireMember } from '@/lib/portal/session'
import { classifications } from '@/lib/portal/rules'

export async function signInWithGoogle() {
  if (!getSupabaseConfig()) redirect('/portal/login?error=unavailable')
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
      queryParams: { hd: 'ufl.edu', prompt: 'select_account' },
    },
  })
  if (error || !data.url) redirect('/portal/login?error=login')
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (error) throw new Error('Sign out failed. Please try again.')
  revalidatePath('/', 'layout')
  redirect('/portal/login')
}

export type ProfileState = { error?: string }

export async function saveProfile(
  _previous: ProfileState,
  form: FormData,
): Promise<ProfileState> {
  const { supabase, member } = await requireMember()
  const field = (name: string) => String(form.get(name) ?? '').trim()
  const full_name = field('full_name')
  const major = field('major')
  const classification = field('classification')
  const nsbe_id = field('nsbe_id') || null
  const ufid = field('ufid') || null
  if (!full_name || full_name.length > 120 || !major || major.length > 120)
    return { error: 'Enter your name and major (up to 120 characters each).' }
  if (!classifications.some((value) => value === classification))
    return { error: 'Select your school year.' }
  if (nsbe_id && nsbe_id.length > 40)
    return { error: 'NSBE ID must be 40 characters or fewer.' }
  if (ufid && !/^\d{8}$/.test(ufid))
    return {
      error: 'UFID must contain eight digits, or you can leave it blank.',
    }
  const { error } = await supabase
    .from('members')
    .update({
      full_name,
      major,
      classification,
      nsbe_id,
      ufid,
      profile_completed_at:
        member.profile_completed_at ?? new Date().toISOString(),
    })
    .eq('id', member.id)
  if (error)
    return { error: 'Your profile could not be saved. Please try again.' }
  revalidatePath('/portal')
  redirect('/portal?profile=saved')
}
