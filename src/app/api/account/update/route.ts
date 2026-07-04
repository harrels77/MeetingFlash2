import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side profile update. Accepts a small whitelist of fields the user is
// allowed to change themselves (full_name + flash preferences). Anything else
// in the body is silently ignored — never let the client write plan,
// uses_this_month, etc. The plan/usage fields are only written by the Stripe
// webhook (server-side, service role) and the increment_uses RPC.

const ALLOWED_FIELDS = ['full_name', 'default_lang', 'default_style', 'weekly_digest'] as const
type AllowedField = typeof ALLOWED_FIELDS[number]

export async function POST(req: NextRequest) {
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

  const body = await req.json().catch(() => ({}))
  const updates: Partial<Record<AllowedField, unknown>> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field in body) updates[field] = body[field]
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No allowed fields in request' }, { status: 400 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await adminClient
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Account update error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
