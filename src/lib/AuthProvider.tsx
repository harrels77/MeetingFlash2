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
    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!data) {
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

    if (data) setProfile(data)
  }

  useEffect(() => {
    // Charge la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id, session.user.email || '')
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Écoute tous les changements
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id, session.user.email || '')
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
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