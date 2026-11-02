export type Member = {
  id: string
  email: string
  full_name: string
  major: string
  classification: string
  nsbe_id: string | null
  ufid: string | null
  joined_on: string | null
  profile_completed_at: string | null
}

export type Semester = {
  id: string
  name: string
  starts_on: string
  ends_on: string
  external_counts_for_membership: boolean
}

export type PortalEvent = {
  id: string
  semester_id: string
  title: string
  starts_at: string
  category: 'general' | 'gbm' | 'external'
  zone: string | null
  base_points: number
}

export type Attendance = { id: string; event_id: string; checked_in_at: string }
export type Adjustment = {
  id: string
  semester_id: string
  points: number
  reason: string
  created_at: string
}
