import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side fetch of the authenticated user's full profile. Replaces the
// direct supabase.from('profiles').select(...) call the settings page used to
// make. Same rationale as /api/dashboard/data: the client-side path was
// hitting RLS race conditions on Supabase free-tier cold-starts and silently
// returning null, leaving the settings page rendering "No name set",
// "Invalid Date" and a misleading "Team plan" fallback.

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const { data: { user }, error: userError } = await userClient.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Account fetch error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (data) {
    return NextResponse.json({ profile: data })
  }

  // No profile row exists yet — create one. This is the canonical place to
  // do that now (used to live in AuthProvider, but client-side creation
  // collided with RLS races and the handle_new_user trigger to silently
  // produce missing/duplicated rows). Doing it here with the service role
  // is race-free.
  const { data: newProf, error: insertError } = await adminClient
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      plan: 'free',
      uses_this_month: 0,
    })
    .select()
    .single()

  if (insertError) {
    // Most likely a race with the handle_new_user trigger — re-read.
    const { data: retried } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (retried) return NextResponse.json({ profile: retried, created: false })
    console.error('Profile insert error:', insertError)
    return NextResponse.json({ error: 'Could not create profile' }, { status: 500 })
  }

  // Brand-new account → fire-and-forget welcome email.
  if (newProf) {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/email/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.CRON_SECRET || '' },
      body: JSON.stringify({ email: user.email, name: '' }),
    }).catch(() => {})
  }

  return NextResponse.json({ profile: newProf, created: true })
}
