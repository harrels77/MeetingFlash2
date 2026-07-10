'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import { MailCheck } from 'lucide-react'
import styles from '../login/auth.module.css'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Google-only accounts have no password to reset — tell the user instead
    // of sending an email that leads nowhere (same pre-flight as /login).
    const { data: providers } = await supabase.rpc('get_auth_providers_for_email', { check_email: email })
    if (Array.isArray(providers) && providers.length > 0 && !providers.includes('email')) {
      setError('This email signs in with Google — there is no password to reset. Use "Continue with Google" on the sign-in page.')
      setLoading(false)
      return
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className={styles.page}>
      <div style={{ position: 'absolute', top: 24, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className={styles.backLink}>← meetingflash</Link>
        <ThemeToggle />
      </div>

      <div className={styles.card}>
        {sent ? (
          <div className={styles.cardHeader}>
            <div className={styles.successIcon}><MailCheck size={28} strokeWidth={1.75} aria-hidden="true" /></div>
            <h1 className={styles.title}>Check your inbox</h1>
            <p className={styles.sub}>
              If an account exists for <strong>{email}</strong>, a password reset
              link is on its way. The link is valid for one hour.
            </p>
            <p className={styles.footer} style={{ marginTop: 20 }}>
              Nothing after a few minutes? Check spam, or{' '}
              <button className={styles.footerLink} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => setSent(false)}>
                try again
              </button>.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.cardHeader}>
              <Image src="/logo.png" alt="MeetingFlash" width={44} height={44} className={styles.glyph} priority />
              <h1 className={styles.title}>Reset your password</h1>
              <p className={styles.sub}>Enter your email and we&apos;ll send you a link to set a new one.</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  autoFocus
                  required
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending—' : 'Send reset link'}
              </button>
            </form>

            <p className={styles.footer}>
              Remembered it? <Link href="/login" className={styles.footerLink}>Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
