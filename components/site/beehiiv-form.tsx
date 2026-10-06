'use client'

import { useEffect, useRef } from 'react'

const FORM_ID = 'e3879c2e-c810-4060-9109-7d5e65fa06f6'

export function BeehiivForm() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) return

    // Make sure the container starts clean
    container.replaceChildren()

    const script = document.createElement('script')

    script.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js'
    script.async = true
    script.setAttribute('data-beehiiv-form', FORM_ID)

    // Important: the script is inserted exactly where we want
    // Beehiiv to mount the inline form.
    container.appendChild(script)

    return () => {
      container.replaceChildren()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full"
    />
  )
}
