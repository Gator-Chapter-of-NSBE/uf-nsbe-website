import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readAll } from '@/lib/portal/read-all'
import { activeMembersCsv, type ActiveMemberRow } from '@/lib/portal/reporting'

export const dynamic = 'force-dynamic'
const privateHeaders = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: privateHeaders })

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return fail('Sign in to download this report.',401)
    const { data: admin, error: roleError } = await supabase.rpc('is_portal_admin')
    if (roleError) return fail('Report unavailable.',503)
    if (admin !== true) return fail('Administrator access required.',403)
    const semester = request.nextUrl.searchParams.get('semester') ?? ''
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(semester)) return fail('Select a valid semester.',400)
    const { data: term, error } = await supabase.from('semesters').select('id,name').eq('id',semester).maybeSingle()
    if (error) return fail('Report unavailable.',503)
    if (!term) return fail('Semester not found.',404)
    const rows = await readAll<ActiveMemberRow>((a,b) => supabase.rpc('active_semester_members', { p_semester: semester }).range(a,b))
    return new NextResponse(activeMembersCsv(term.name,rows), { headers: {
      ...privateHeaders, 'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="active-members-${semester}.csv"`,
      'X-Content-Type-Options': 'nosniff',
    } })
  } catch { return fail('The report could not be generated. Please try again.',503) }
}
