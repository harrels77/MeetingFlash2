'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import styles from '../login/auth.module.css'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [done, setDone]         = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  if (done) return (
    <div className={styles.page}>
      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className={styles.backLink}>← meetingflash</Link>
        <ThemeToggle />
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <img src="/logo.png" alt="MeetingFlash" className={styles.glyph} />
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.sub}>We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
        </div>
        <Link href="/login" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 24 }}>
          Go to login →
        </Link>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className={styles.backLink}>← meetingflash</Link>
        <ThemeToggle />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <img src="/logo.png" alt="MeetingFlash" className={styles.glyph} />
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.sub}>5 free Execution Packs per month. No credit card.</p>
        </div>

        <button className={styles.googleBtn} onClick={handleGoogle}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 01-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87z" fill="#4285F4"/>
            <path d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.58-2a4.8 4.8 0 01-7.17-2.52H.87v2.07A8 8 0 008 16z" fill="#34A853"/>
            <path d="M3.55 9.54A4.82 4.82 0 013.3 8c0-.53.1-1.05.25-1.54V4.39H.87A8 8 0 000 8c0 1.29.31 2.51.87 3.61l2.68-2.07z" fill="#FBBC05"/>
            <path d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 00.87 4.39L3.55 6.46A4.77 4.77 0 018 3.18z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.divider}><span>or</span></div>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input type="text" className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Sarah Martin" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input type="email" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@agency.com" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrap}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account—' : 'Create free account →'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link href="/login" className={styles.footerLink}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
