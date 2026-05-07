'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: string
  uses_this_month: number
}

interface AuthCtx {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string, email: string) {
    // Confirm the JWT is attached to the supabase client before querying.
    // Without this, the profile request goes out without auth, RLS returns
    // 0 rows (PGRST116), and the code below thinks "this is a brand-new
    // user, let me create a Free profile" — which then conflicts with the
    // existing Pro row and leaves profile=null. Symptom: "Account" placeholder
    // and free-mode UI even though the user is a paying Pro.
    async function waitForToken(attempts = 4): Promise<boolean> {
      for (let i = 0; i < attempts; i++) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) return true
        await new Promise(r => setTimeout(r, 500))
      }
      return false
    }

    async function fetchOnce() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, errorCode: error?.code ?? null }
    }

    const tokenReady = await waitForToken()
    if (!tokenReady) return  // bail; onAuthStateChange will retry when token arrives

    // Up to 3 attempts with backoff — Supabase free tier can take several
    // seconds to wake on a true cold start.
    const delays = [0, 1500, 3000]
    let data = null
    let errorCode: string | null = null
    for (const delay of delays) {
      if (delay > 0) await new Promise(r => setTimeout(r, delay))
      const r = await fetchOnce()
      data = r.data
      errorCode = r.errorCode
      if (data) break
    }

    if (!data) {
      // Only create a new profile when we're confident the row truly doesn't
      // exist (PGRST116 after multiple attempts). A persistent hard error
      // leaves profile=null and the next auth event will retry.
      if (errorCode === 'PGRST116') {
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({ id: userId, email, plan: 'free', uses_this_month: 0 })
          .select()
          .single()
        data = newProf
        // Send welcome email for new accounts (fire and forget)
        fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: data?.full_name || '' }),
        }).catch(() => {})
      }
    }

    if (data) setProfile(data)
  }

  useEffect(() => {
    let sessionResolved = false

    // Hard safety: if getSession itself doesn't respond in 4s, stop blocking
    // the UI (treat as no session). But once getSession HAS resolved with a
    // session, we let loadProfile run its own retry budget — otherwise the
    // 4s timer would fire mid-fetch, set loading=false with profile=null, and
    // the nav would render the email-prefix ("adrienharrel") for a beat.
    const timeout = setTimeout(() => {
      if (!sessionResolved) setLoading(false)
    }, 4000)

    // Charge la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      sessionResolved = true
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '')
          .finally(() => { clearTimeout(timeout); setLoading(false) })
      } else {
        clearTimeout(timeout)
        setLoading(false)
      }
    }).catch(err => {
      console.error('Auth getSession error:', err)
      sessionResolved = true
      clearTimeout(timeout)
      setLoading(false)
    })

    // Écoute tous les changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id, session.user.email || '').catch(() => {})
          setLoading(false)
          return
        }

        // No session in this event. Could be:
        //  (a) explicit sign-out — our signOut() cleared sb-* tokens first
        //  (b) cold-start token-refresh failure — sb-* tokens still present
        // Without distinguishing these, a transient (b) wipes user+profile and
        // the app silently shows Free mode even though the user is logged in.
        let hasSbTokens = false
        try {
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith('sb-') || key.includes('supabase.auth')) {
              hasSbTokens = true
              break
            }
          }
        } catch { /* localStorage may be unavailable */ }

        if (hasSbTokens) {
          // Transient refresh failure — keep state, retry getSession after a
          // brief delay to give the Supabase free-tier instance time to wake.
          setTimeout(() => {
            supabase.auth.getSession().then(({ data: { session: s } }) => {
              if (s?.user) {
                setUser(s.user)
                loadProfile(s.user.id, s.user.email || '').catch(() => {})
              }
            }).catch(() => {})
          }, 1500)
          setLoading(false)
          return
        }

        // Real sign-out — clear state.
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // Background recovery: if user is set but profile failed to load (cold-start
  // exhausted retries), keep retrying every 4s until it succeeds. Without this,
  // the nav stays on "Account" placeholder and downstream pages treat the user
  // as having no plan until they manually refresh.
  useEffect(() => {
    if (!user || profile) return
    const id = setInterval(() => {
      loadProfile(user.id, user.email || '').catch(() => {})
    }, 4000)
    return () => clearInterval(id)
  }, [user, profile])

  const signOut = async () => {
    // Fire-and-forget — don't block the UI if Supabase hangs.
    supabase.auth.signOut().catch(() => {})
    // CRITICAL: also clear Supabase auth tokens from localStorage synchronously,
    // because the redirect below races against supabase.auth.signOut(). Without
    // this, the next page load restores the session from still-present tokens
    // and "sign out" silently fails.
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-') || key.includes('supabase.auth')) {
          localStorage.removeItem(key)
        }
      }
    } catch { /* localStorage may be unavailable in some contexts */ }
    setUser(null)
    setProfile(null)
    window.location.replace('/')
  }

  return (
    <Ctx.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)