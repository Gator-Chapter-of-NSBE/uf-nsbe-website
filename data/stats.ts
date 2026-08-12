/**
 * Impact statistics for the homepage.
 * Values are intentional placeholders — replace [NUMBER] with real figures
 * once confirmed. The design does not depend on the exact values.
 */

export type Stat = {
  value: string
  label: string
  suffix?: string
}

export const stats: Stat[] = [
  { value: '120', label: 'Active Members' },
  { value: '47', label: 'Annual Events' },
  { value: '33', label: 'Trailblazers' },
  { value: '14', label: 'Years at UF' },
]
