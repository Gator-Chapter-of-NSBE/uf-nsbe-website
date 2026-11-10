export type PortalRole = 'admin' | 'eboard' | 'member'
export type PortalView = { role: PortalRole; preview: 'member' | 'eboard' | null; readOnly: boolean; showAdmin: boolean; showEventManagement: boolean; showParticipation: boolean }

// Presentation only. Authorization must always use the real session/database role.
export function resolvePortalView(isAdmin: boolean, canManageEvents: boolean, requested?: string): PortalView {
  const preview = isAdmin && (requested==='member'||requested==='eboard') ? requested : null
  const role: PortalRole = preview ?? (isAdmin ? 'admin' : canManageEvents ? 'eboard' : 'member')
  return { role, preview, readOnly: preview!==null, showAdmin: role==='admin', showEventManagement: role!=='member', showParticipation: role!=='member' }
}

export function previewHref(href: string, preview: PortalView['preview']) {
  if (!preview) return href
  const url = new URL(href,'https://portal.local')
  url.searchParams.set('preview',preview)
  return url.pathname+url.search+url.hash
}
