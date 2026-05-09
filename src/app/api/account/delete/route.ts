import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side account deletion. The previous implementation was client-side
// and only deleted profiles + meetings + projects — it never removed the
// auth.users row, so the "deleted" user could sign in again with the same
// credentials and effectively un-delete themselves (a fresh profile would
// auto-create on next login). It also missed the tasks table, leaving
// orphan rows that violated FK assumptions in the dashboard.
//
// This route does the full cleanup with the service role:
//   1. Verify the caller via Authorization header
//   2. Delete tasks → meetings → projects → profile (respects FK chains)
//   3. Delete the auth.users row via the admin API
//   4. Return success — client follows up with the canonical signOut()
//
// Stripe subscription cancellation is NOT handled here. If a Pro/Team user
// deletes their account, the recurring charge continues until they cancel
// from the customer portal. TODO: hook up admin-driven cancellation here
// once we have a clean "find subscription by userId" lookup.

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Step 1 — verify the caller. Never trust a client-supplied user id.
  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Step 2 — delete all data with service role (bypasses RLS, so we don't
  // hit cold-start race conditions and partially-delete the account).
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Order matters when there are FK constraints: child rows first.
  const tasksDel = await adminClient.from('tasks').delete().eq('user_id', user.id)
  const meetingsDel = await adminClient.from('meetings').delete().eq('user_id', user.id)
  const projectsDel = await adminClient.from('projects').delete().eq('user_id', user.id)
  const profileDel = await adminClient.from('profiles').delete().eq('id', user.id)

  if (tasksDel.error || meetingsDel.error || projectsDel.error || profileDel.error) {
    console.error('Account delete partial failure:', {
      tasks: tasksDel.error,
      meetings: meetingsDel.error,
      projects: projectsDel.error,
      profile: profileDel.error,
    })
    return NextResponse.json({ error: 'Failed to delete all data' }, { status: 500 })
  }

  // Step 3 — delete the auth.users row. Without this, the user's email/Google
  // identity stays and they can sign in again, auto-creating a fresh profile.
  const { error: authDelError } = await adminClient.auth.admin.deleteUser(user.id)
  if (authDelError) {
    console.error('Auth user delete failed:', authDelError)
    return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
