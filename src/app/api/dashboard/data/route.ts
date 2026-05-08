import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side dashboard data fetch. Replaces the four direct supabase.from()
// calls the client used to make. Why: the client-side path was hitting RLS
// race conditions on Supabase free-tier cold-starts — JWT looked attached,
// but RLS evaluated as anonymous and returned 0 rows for every query without
// throwing an error. Result: dashboard rendered "blank like a new account"
// even though the data existed in the DB.
//
// This route uses the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely.
// We FIRST verify the user identity via the Authorization header (using the
// anon key + the user's own JWT — that path is allowed to read auth.users),
// THEN use the service role to fetch their data filtered by user.id. So
// security is intact: a user can never read another user's data.

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Step 1 — verify the caller via their JWT (anon key + Authorization header).
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Step 2 — fetch data with service role (bypasses RLS, so no race conditions
  // possible). Always filter by user.id from step 1, never trust any client-
  // supplied id.
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [profResult, projResult, meetsResult, tasksResult] = await Promise.all([
    adminClient.from('profiles').select('*').eq('id', user.id).single(),
    adminClient.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    adminClient.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    adminClient.from('tasks').select('id, text, owner, deadline, meeting_id, status').eq('user_id', user.id).neq('status', 'done').order('created_at', { ascending: false }).limit(20),
  ])

  // Hard error on anything other than profile-not-found (PGRST116 — handled
  // upstream by AuthProvider creating the row).
  const profSoftError = profResult.error && profResult.error.code !== 'PGRST116'
  if (profSoftError || projResult.error || meetsResult.error || tasksResult.error) {
    console.error('Dashboard data fetch error:', {
      profErr: profResult.error,
      projErr: projResult.error,
      meetsErr: meetsResult.error,
      tasksErr: tasksResult.error,
    })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const meetings = meetsResult.data || []
  const meetingTitleById = new Map(meetings.map(m => [m.id, m.title]))
  const openTasks = (tasksResult.data || []).map(t => ({
    id: t.id,
    text: t.text,
    owner: t.owner,
    deadline: t.deadline,
    meeting_id: t.meeting_id,
    meeting_title: meetingTitleById.get(t.meeting_id) || 'Untitled meeting',
  }))

  return NextResponse.json({
    profile: profResult.data ?? null,
    projects: projResult.data || [],
    meetings,
    openTasks,
  })
}
