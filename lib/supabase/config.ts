export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return url && key ? { url, key } : null
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (!configured)
    throw new Error('NEXT_PUBLIC_SITE_URL is required for portal login.')
  const url = new URL(configured)
  if (
    url.protocol !== 'https:' &&
    !(url.protocol === 'http:' && url.hostname === 'localhost')
  ) {
    throw new Error(
      'The site URL must use HTTPS (or localhost for development).',
    )
  }
  return url.origin
}
