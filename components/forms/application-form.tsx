'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
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
}: {
  fields: FormField[]
  submitLabel?: string
  accent?: 'nsbe' | 'trailblazers'
}) {
  const [submitted, setSubmitted] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  function setValue(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: Record<string, boolean> = {}
    for (const f of fields) {
      if (f.required && !values[f.name]?.trim()) nextErrors[f.name] = true
      if (f.type === 'email' && values[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.name])) {
        nextErrors[f.name] = true
      }
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      // No backend is wired up yet — this simulates a successful submission.
      console.log('[v0] Application form submitted', values)
      setSubmitted(true)
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
        <h3 className="font-serif text-2xl font-medium tracking-tight">Application received</h3>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
          Thanks for applying! A member of our team will be in touch soon. Keep an eye on your email
          and our Instagram for next steps.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
                  onValueChange={(v) => setValue(field.name, v)}
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

      <div className="flex items-center gap-4">
        <Button type="submit" className={cn('h-11 px-7', accentBtn)}>
          {submitLabel}
        </Button>
        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-nsbe-red">*</span> are required.
        </p>
      </div>
    </form>
  )
}
