'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { signInEventOptions } from '@/data/events'
import { cn } from '@/lib/utils'

export function SignInForm() {
  const params = useSearchParams()
  const presetEvent = params.get('event') ?? ''

  const [event, setEvent] = useState(presetEvent)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const next: Record<string, string> = {}

    if (!String(data.get('name') ?? '').trim()) next.name = 'Please enter your name.'
    const email = String(data.get('email') ?? '').trim()
    if (!email) next.email = 'Please enter your UF email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email address.'
    if (!event) next.event = 'Please select the event you are attending.'

    setErrors(next)
    if (Object.keys(next).length === 0) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-nsbe-green/30 bg-nsbe-green/5 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-nsbe-green" aria-hidden />
        <h2 className="mt-4 font-serif text-2xl text-foreground">You&apos;re signed in</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Thanks for checking in. Your attendance has been recorded for this session. See you at the next one!
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setEvent(presetEvent)
          }}
          className="mt-6 text-sm font-semibold text-nsbe-green underline-offset-4 hover:underline"
        >
          Sign in another attendee
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-5">
      <Field label="Full name" name="name" error={errors.name} required>
        <Input id="name" name="name" placeholder="Jane Gator" aria-invalid={!!errors.name} />
      </Field>

      <Field label="UF email" name="email" error={errors.email} required>
        <Input id="email" name="email" type="email" placeholder="jane@ufl.edu" aria-invalid={!!errors.email} />
      </Field>

      <div className="grid gap-2">
        <Label htmlFor="event-trigger">
          Event <span className="text-nsbe-red">*</span>
        </Label>
        <Select value={event} onValueChange={setEvent}>
          <SelectTrigger id="event-trigger" aria-invalid={!!errors.event}>
            <SelectValue placeholder="Select the event you're attending" />
          </SelectTrigger>
          <SelectContent>
            {signInEventOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.event ? <p className="text-sm text-nsbe-red">{errors.event}</p> : null}
      </div>

      <Field label="Year / classification" name="year">
        <Input id="year" name="year" placeholder="e.g. Sophomore (optional)" />
      </Field>

      <Button type="submit" className="mt-1 h-11 bg-nsbe-green px-7 text-white hover:bg-nsbe-green/90">
        Sign in
      </Button>
    </form>
  )
}

function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string
  name: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn('grid gap-2')}>
      <Label htmlFor={name}>
        {label} {required ? <span className="text-nsbe-red">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-sm text-nsbe-red">{error}</p> : null}
    </div>
  )
}
