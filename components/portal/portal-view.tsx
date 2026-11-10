'use client'

import { createContext, useContext, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { previewHref, type PortalView } from '@/lib/portal/view'

const ViewContext = createContext<PortalView | null>(null)
export function usePortalView() {
  const view = useContext(ViewContext)
  if (!view) throw new Error('usePortalView requires PortalViewShell')
  return view
}

export function PortalViewShell({ view, children }: { view: PortalView; children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [blocked,setBlocked] = useState(false)
  const block = (event: React.SyntheticEvent) => { event.preventDefault(); event.stopPropagation(); setBlocked(true) }
  const allowed = (path: string) => ['/portal','/portal/profile','/portal/leaderboard'].includes(path) || (view.role==='eboard' && (
    path==='/portal/admin/events' || /^\/portal\/admin\/(members|previous-events)(\/[0-9a-f-]{36})?$/.test(path)))
  return <ViewContext.Provider value={view}>
    {view.preview&&<aside className="mb-6 rounded-xl border border-nsbe-green/30 bg-nsbe-green/5 p-5" aria-label="Dashboard preview">
      <p className="font-medium">Previewing {view.preview==='member'?'Member':'E-board'} dashboard — read-only</p>
      <p className="mt-2 text-sm text-muted-foreground">Showing your own records with this role’s interface. Your actual administrator permissions are unchanged.</p>
      <div className="mt-3 flex flex-wrap gap-5 text-sm">{pathname!=='/portal'&&<Link href={previewHref('/portal',view.preview)} className="underline underline-offset-4">Back to preview dashboard</Link>}<Link href="/portal" className="font-medium underline underline-offset-4">Exit preview</Link></div>
      {blocked&&<p role="status" className="mt-3 text-sm">Preview is read-only. Exit preview to make changes or open a page outside this preview.</p>}
    </aside>}
    <div onClickCapture={event=>{
      if (!view.readOnly) return
      const target=event.target as HTMLElement
      const button=target.closest('button')
      if (button && !button.hasAttribute('data-preview-safe') && !(button.type==='submit'&&button.form?.method.toLowerCase()==='get')) { block(event); return }
      const anchor=target.closest('a[href]')
      if (!anchor) return
      const url=new URL(anchor.getAttribute('href')!,window.location.href)
      if (url.origin!==window.location.origin||!allowed(url.pathname)) { block(event); return }
      if (url.searchParams.get('preview')!==view.preview) {
        event.preventDefault(); event.stopPropagation()
        router.push(previewHref(url.pathname+url.search+url.hash,view.preview))
      }
    }} onSubmitCapture={event=>{
      if (!view.readOnly) return
      const form=event.target as HTMLFormElement
      if (form.method.toLowerCase()!=='get') { block(event); return }
      const destination=new URL(form.action,window.location.href)
      if (destination.origin!==window.location.origin||!allowed(destination.pathname)) { block(event); return }
      // Preserve preview in future read-only search/filter forms as well.
      if (!form.querySelector('input[name="preview"]')) {
        const input=document.createElement('input'); input.type='hidden'; input.name='preview'; input.value=view.preview!
        form.appendChild(input)
      }
    }}>{children}</div>
  </ViewContext.Provider>
}
