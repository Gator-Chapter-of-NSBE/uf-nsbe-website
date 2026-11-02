export const zones = ['Admin Zone', 'Programs Zone', 'Finance Zone', 'Membership Zone', 'Communication Zone', 'Senate Zone'] as const
export type OpenEvent = { id: string; title: string; starts_at: string; category: string }
export type CheckInState = { error?: string; success?: boolean }
export const fieldClass = 'min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
export const buttonClass = 'min-h-11 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50'
export function checkInMessage(code: string) {
  switch (code) {
    case 'closed': return 'Check-in is closed for this event. Ask an officer for help.'
    case 'password': return 'That event password is incorrect. Please check with an officer.'
    case 'rate_limited': return 'Too many attempts for this email and event. Please wait 15 minutes.'
    case 'invalid': return 'Enter your name, UF email, event, and event password.'
    default: return 'Attendance could not be recorded. Please try again or ask an officer.'
  }
}
