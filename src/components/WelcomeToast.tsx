'use client'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/AuthProvider'
import { timeGreeting, firstNameOf } from '@/lib/greeting'
import { Zap } from 'lucide-react'
import s from './WelcomeToast.module.css'

// Post-login greeting. Login (password) and /auth/callback (Google) redirect
// to /?welcome=1 — this component (mounted in the root layout) catches the
// flag, strips it from the URL, waits briefly for the profile name to arrive,
// then shows "Good morning, Simon." for a few seconds.
export default function WelcomeToast() {
  const { user, profile } = useAuth()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const shownRef = useRef(false)

  // Catch ?welcome=1 once, then clean the URL so refresh/bookmark don't re-greet.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('welcome') === '1') {
      params.delete('welcome')
      const qs = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      setPending(true)
    }
  }, [])

  // Fire as soon as we know the name; give the profile up to 4s to arrive,
  // then greet generically rather than not at all.
  useEffect(() => {
    if (!pending || shownRef.current) return

    const name = firstNameOf(profile?.full_name)
      || firstNameOf((user?.user_metadata as { full_name?: string } | undefined)?.full_name)

    const show = (n: string) => {
      shownRef.current = true
      setMessage(n ? `${timeGreeting()}, ${n}.` : 'Welcome back.')
    }

    if (name) { show(name); return }
    const fallback = setTimeout(() => show(''), 4000)
    return () => clearTimeout(fallback)
  }, [pending, profile, user])

  // Auto-dismiss: fade out after 4.5s, unmount after the transition.
  useEffect(() => {
    if (!message) return
    const out = setTimeout(() => setLeaving(true), 4500)
    const gone = setTimeout(() => { setMessage(null); setPending(false) }, 5200)
    return () => { clearTimeout(out); clearTimeout(gone) }
  }, [message])

  if (!message) return null

  return (
    <div
      className={`${s.toast} ${leaving ? s.leaving : ''}`}
      role="status"
      onClick={() => { setMessage(null); setPending(false) }}
    >
      <span className={s.icon}><Zap size={15} strokeWidth={1.75} aria-hidden="true" /></span>
      <span className={s.text}>{message}</span>
    </div>
  )
}
