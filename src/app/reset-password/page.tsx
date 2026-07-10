'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import styles from '../login/auth.module.css'

// Landing page of the email reset link. Supabase puts a recovery session in
// the URL hash; the client picks it up (detectSessionInUrl) and we let the
// user set a new password. No session after a few seconds = expired link.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus]     = useState<'checking' | 'ready' | 'expired' | 'done'>('checking')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    let cancelled = false

    // The recovery hash can take a beat to be exchanged for a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (session) setStatus(s => (s === 'checking' ? 'ready' : s))
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) setStatus(s => (s === 'checking' ? 'ready' : s))
    })

    const timeout = setTimeout(() => {
      if (!cancelled) setStatus(s => (s === 'checking' ? 'expired' : s))
    }, 5000)

    return () => { cancelled = true; subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('The two passwords don\'t match.'); return }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    setStatus('done')
    setTimeout(() => router.push('/?welcome=1'), 1400)
  }

  return (
    <div className={styles.page}>
      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className={styles.backLink}>← meetingflash</Link>
        <ThemeToggle />
      </div>

      <div className={styles.card}>
        {status === 'checking' && (
          <div className={styles.cardHeader}>
            <Image src="/logo.png" alt="MeetingFlash" width={44} height={44} className={styles.glyph} priority />
            <h1 className={styles.title}>One moment</h1>
            <p className={styles.sub}>Verifying your reset link…</p>
          </div>
        )}

        {status === 'expired' && (
          <div className={styles.cardHeader}>
            <Image src="/logo.png" alt="MeetingFlash" width={44} height={44} className={styles.glyph} priority />
            <h1 className={styles.title}>This link has expired</h1>
            <p className={styles.sub}>
              Reset links are valid for one hour and can only be used once.
            </p>
            <p className={styles.footer} style={{ marginTop: 20 }}>
              <Link href="/forgot-password" className={styles.footerLink}>Request a new link</Link>
            </p>
          </div>
        )}

        {status === 'done' && (
          <div className={styles.cardHeader}>
            <div className={styles.successIcon}><CheckCircle2 size={28} strokeWidth={1.75} aria-hidden="true" /></div>
            <h1 className={styles.title}>Password updated</h1>
            <p className={styles.sub}>You&apos;re signed in. Taking you home…</p>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className={styles.cardHeader}>
              <Image src="/logo.png" alt="MeetingFlash" width={44} height={44} className={styles.glyph} priority />
              <h1 className={styles.title}>Choose a new password</h1>
              <p className={styles.sub}>Minimum 8 characters. You&apos;ll be signed in right after.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>New password</label>
                <div className={styles.passwordWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={1.75} aria-hidden="true" /> : <Eye size={16} strokeWidth={1.75} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm new password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Saving—' : 'Set new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
