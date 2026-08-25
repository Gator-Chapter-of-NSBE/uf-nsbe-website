'use client'

import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type FormField =
  | { name: string; label: string; type: 'text' | 'email' | 'tel'; required?: boolean; placeholder?: string }
  | { name: string; label: string; type: 'textarea'; required?: boolean; placeholder?: string }
  | { name: string; label: string; type: 'select'; required?: boolean; options: string[] }

export function ApplicationForm({
  fields,
  submitLabel = 'Submit',
  accent = 'nsbe',
  action,
  honeypotName,
  successTitle = 'Message received',
  successMessage = "Thanks for reaching out! A member of our team will be in touch soon. Keep an eye on your email and our Instagram for next steps.",
}: {
  fields: FormField[]
  submitLabel?: string
  accent?: 'nsbe' | 'trailblazers'
  /** Called with the submitted values. Throw or return a rejected promise to signal failure. */
  action?: (values: Record<string, string>) => Promise<void>
  /** Name of a hidden honeypot field included in submissions for spam protection. */
  honeypotName?: string
  successTitle?: string
  successMessage?: string
}) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [formError, setFormError] = useState<string | null>(null)

  function setValue(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return

    setFormError(null)
    const nextErrors: Record<string, boolean> = {}
    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) nextErrors[f.name] = true
      if (f.type === 'email' && values[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.name])) {
        nextErrors[f.name] = true
      }
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    if (!action) {
      // No backend is wired up — this simulates a successful submission.
      console.log('[v0] Application form submitted', values)
      setSubmitted(true)
      return
    }

    setSubmitting(true)
    try {
      await action(values)
      setSubmitted(true)
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Something went wrong while sending your message. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const accentBtn =
    accent === 'trailblazers'
      ? 'bg-tb-purple text-white hover:bg-tb-purple/90'
      : 'bg-nsbe-green text-white hover:bg-nsbe-green/90'

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-14 text-center">
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-full',
            accent === 'trailblazers' ? 'bg-tb-purple/10 text-tb-purple' : 'bg-nsbe-green/10 text-nsbe-green',
          )}
        >
          <CheckCircle className="size-7" />
        </span>
        <h3 className="font-serif text-2xl font-medium tracking-tight">{successTitle}</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">{successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {honeypotName ? (
        <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor={honeypotName}>Do not fill this out</label>
          <input
            id={honeypotName}
            name={honeypotName}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values[honeypotName] ?? ''}
            onChange={(e) => setValue(honeypotName, e.target.value)}
          />
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        {fields.map((field) => {
          const isFull = field.type === 'textarea'
          return (
            <div key={field.name} className={cn('flex flex-col gap-2', isFull && 'sm:col-span-2')}>
              <Label htmlFor={field.name}>
                {field.label}
                {field.required ? <span className="ml-1 text-nsbe-red">*</span> : null}
              </Label>

              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  rows={5}
                  value={values[field.name] ?? ''}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  aria-invalid={errors[field.name] || undefined}
                  className={cn(errors[field.name] && 'border-nsbe-red')}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={values[field.name] ?? ''}
                  onValueChange={(v) => setValue(field.name, v ?? '')}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={errors[field.name] || undefined}
                    className={cn('w-full', errors[field.name] && 'border-nsbe-red')}
                  >
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ''}
                  onChange={(e) => setValue(field.name, e.target.value)}
                  aria-invalid={errors[field.name] || undefined}
                  className={cn(errors[field.name] && 'border-nsbe-red')}
                />
              )}

              {errors[field.name] ? (
                <p className="text-xs text-nsbe-red">
                  {field.type === 'email'
                    ? 'Please enter a valid email address.'
                    : 'This field is required.'}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-nsbe-red">
          {formError}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={submitting} className={cn('h-11 px-7', accentBtn)}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-nsbe-red">*</span> are required.
        </p>
      </div>
    </form>
  )
}
