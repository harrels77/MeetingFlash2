import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data?.user) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', req.url))
  }

  // Enforce single-method auth: if the OAuth flow ended up linked to an
  // account that already had email/password (= Supabase linked identities),
  // OR if a separate auth user exists with the same email, reject the login.
  // Both paths produce the dual-identity confusion (the "Pro/Free flicker"
  // bug). The user has to pick ONE method going forward.
  const user = data.user
  const identities = user.identities || []

  // Case 1: this user has both google and email identities linked.
  if (identities.length > 1) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=multi_identity', req.url))
  }

  // Case 2: this is a brand-new google-only user, but a separate auth user
  // with the same email already exists with email/password. Detect via RPC.
  if (user.email) {
    const { data: providers } = await supabase.rpc('get_auth_providers_for_email', { check_email: user.email })
    if (Array.isArray(providers) && providers.includes('email') && providers.includes('google') && identities.length === 1) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=use_email', req.url))
    }
  }

  return NextResponse.redirect(new URL('/', req.url))
}
