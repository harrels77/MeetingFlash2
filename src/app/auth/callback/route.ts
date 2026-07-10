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
  const now = Date.now()
  const FRESH_MS = 60_000  // an identity created in the last minute = just-linked
  const isFresh = (createdAt: string | undefined) => {
    if (!createdAt) return false
    return now - new Date(createdAt).getTime() < FRESH_MS
  }

  // Case 1: this user has both google and email identities linked AND the
  // link was just created. Existing legacy dual users (with both identities
  // already established) are allowed through — only NEW cross-method links
  // are blocked, otherwise we'd permanently lock out anyone who already
  // linked both before this rule shipped.
  if (identities.length > 1 && identities.some(i => isFresh(i.created_at))) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=multi_identity', req.url))
  }

  // Case 2: brand-new google-only user, but a separate auth user with the
  // same email already exists via email/password. Detect via RPC. Only the
  // freshly-created google user is blocked; the email/password user keeps
  // working as before.
  if (user.email && identities.length === 1 && isFresh(identities[0].created_at)) {
    const { data: providers } = await supabase.rpc('get_auth_providers_for_email', { check_email: user.email })
    if (Array.isArray(providers) && providers.includes('email') && providers.includes('google')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=use_email', req.url))
    }
  }

  return NextResponse.redirect(new URL('/?welcome=1', req.url))
}
