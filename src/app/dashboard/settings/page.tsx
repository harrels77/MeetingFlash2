'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthProvider'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './settings.module.css'

// Local shape used only for the API return types in this file. The canonical
// Profile lives in AuthProvider — we read it via useAuth() and never store
// our own copy.
interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: string
  uses_this_month: number
  created_at?: string
  default_lang?: string | null
  default_style?: string | null
}

export default function Settings() {
  const router = useRouter()
  // Single source of truth: useAuth().profile is the canonical store. The
  // page used to keep its own local profile state which diverged from the
  // AuthProvider one — that desync was the root cause of the "Settings shows
  // No name set / Dashboard shows Pro plan" bug. We mutate via the API and
  // then call refetchProfile() to re-hydrate the global store.
  const { user, profile, accessToken, loading: authLoading, signOut, refetchProfile } = useAuth()
  const [loading, setLoading]     = useState(true)
  const [name, setName]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [defaultLang, setDefaultLang]     = useState<'EN' | 'FR' | 'ES' | 'DE'>('EN')
  const [defaultStyle, setDefaultStyle]   = useState<'Concise' | 'Detailed' | 'Email'>('Concise')
  const [savingPrefs, setSavingPrefs]     = useState(false)
  const [prefsSaved, setPrefsSaved]       = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    // Safety net: never let the spinner spin more than 12s (covers a cold-start retry)
    const timeout = setTimeout(() => setLoading(false), 12000)

    // Server-side fetch via /api/account/me — uses service_role to bypass
    // the RLS race conditions that were silently returning null and rendering
    // "?", "No name set", "Invalid Date" and a misleading "Team plan"
    // fallback in this page.
    async function fetchOnce(): Promise<Profile | null> {
      if (!accessToken) return null
      try {
        const res = await fetch('/api/account/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) return null
        const body = await res.json()
        return body.profile ?? null
      } catch {
        return null
      }
    }
    async function load() {
      let data = await fetchOnce()
      if (!data) {
        await new Promise(r => setTimeout(r, 1500))
        data = await fetchOnce()
      }
      if (data) {
        // Push the fresh profile back into AuthProvider so the rest of the app
        // (sidebar plan badge, /app prefill) sees the same state. Pure form
        // state (name input, dropdowns) stays local — that's expected.
        refetchProfile().catch(() => {})
        setName(data.full_name || '')
        if (data.default_lang) setDefaultLang(data.default_lang as 'EN' | 'FR' | 'ES' | 'DE')
        if (data.default_style) setDefaultStyle(data.default_style as 'Concise' | 'Detailed' | 'Email')
      }
      clearTimeout(timeout)
      setLoading(false)
    }
    load()

    return () => clearTimeout(timeout)
  }, [user, authLoading, router])

  // Generic server-side update helper — funnels both saveName and savePrefs
  // through the same /api/account/update endpoint. Returns the new profile
  // on success (so we can update local state) or null on error.
  async function postUpdate(updates: Record<string, unknown>): Promise<Profile | null> {
    if (!accessToken) return null
    try {
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(updates),
      })
      if (!res.ok) return null
      const body = await res.json()
      return body.profile ?? null
    } catch {
      return null
    }
  }

  async function saveName() {
    if (!profile) return
    setSaving(true)
    const updated = await postUpdate({ full_name: name })
    setSaving(false)
    if (updated) {
      await refetchProfile().catch(() => {})
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      alert('Could not save your name. Please try again.')
    }
  }

  async function savePreferences() {
    if (!profile) return
    setSavingPrefs(true)
    const updated = await postUpdate({ default_lang: defaultLang, default_style: defaultStyle })
    setSavingPrefs(false)
    if (updated) {
      await refetchProfile().catch(() => {})
      setPrefsSaved(true)
      setTimeout(() => setPrefsSaved(false), 2000)
    } else {
      alert('Could not save preferences. Please try again.')
    }
  }

  async function openBillingPortal() {
    setOpeningPortal(true)
    try {
      if (!accessToken) {
        alert('Session expired. Please sign in again.')
        return
      }
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const body = await res.json()
      if (res.ok && body.url) {
        window.location.href = body.url
      } else {
        alert(body.error || 'Could not open billing portal. Please try again.')
      }
    } catch (err) {
      console.error('Billing portal error:', err)
      alert('Network error opening billing portal.')
    } finally {
      setOpeningPortal(false)
    }
  }

  async function deleteAccount() {
    if (!profile) return
    setDeleting(true)
    try {
      if (!accessToken) {
        alert('Session expired. Please sign in again before deleting your account.')
        setDeleting(false)
        return
      }
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert(`Couldn't delete your account: ${body.error || 'unknown error'}. Please try again or contact support.`)
        setDeleting(false)
        return
      }
      // Server has deleted profile, all data, AND the auth.users row.
      // Sign out the client-side session and redirect home.
      signOut()
    } catch (err) {
      console.error('Delete account error:', err)
      alert('Network error while deleting your account. Please try again.')
      setDeleting(false)
    }
  }

  const usesLeft = profile?.plan === 'free'
    ? Math.max(0, 5 - (profile?.uses_this_month ?? 0))
    : Infinity

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingGlyph} />
    </div>
  )

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.back}>← Dashboard</Link>
        <ThemeToggle />
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.sub}>Manage your account and preferences.</p>
        </div>

        {/* ACCOUNT */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Account</div>
          <div className={styles.card}>
            <div className={styles.cardRow}>
              <div className={styles.avatar}>
                {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
              </div>
              <div className={styles.accountInfo}>
                <div className={styles.accountName}>
                  {profile?.full_name || 'No name set'}
                </div>
                <div className={styles.accountEmail}>{profile?.email}</div>
                <div className={styles.accountDate}>
                  {profile?.created_at
                    ? <>Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</>
                    : <>Member since —</>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PLAN */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Plan</div>
          <div className={styles.card}>
            <div className={styles.planRow}>
              <div>
                <div className={styles.planName}>{
                  profile?.plan === 'free' ? 'Free plan'
                  : profile?.plan === 'pro' ? 'Pro plan'
                  : profile?.plan === 'team' ? 'Team plan'
                  : '— Loading…'
                }</div>
                <div className={styles.planDetail}>
                  {profile?.plan === 'free'
                    ? `${usesLeft} of 5 packs remaining this month`
                    : 'Unlimited packs per month'
                  }
                </div>
              </div>
              {profile?.plan === 'free' ? (
                <Link href="/pricing" className={styles.upgradeBtn}>
                  Upgrade to Pro →
                </Link>
              ) : (
                <button
                  className={styles.upgradeBtn}
                  onClick={openBillingPortal}
                  disabled={openingPortal}
                  type="button"
                >
                  {openingPortal ? 'Opening…' : 'Manage subscription →'}
                </button>
              )}
            </div>
            <div className={styles.usageBar}>
              <div
                className={styles.usageBarFill}
                style={{ width: `${profile?.plan === 'free' ? ((profile?.uses_this_month ?? 0) / 5) * 100 : 100}%` }}
              />
            </div>
            <div className={styles.usageLabel}>
              {profile?.plan === 'free'
                ? `${profile?.uses_this_month ?? 0} / 5 packs used this month`
                : 'Unlimited'
              }
            </div>
          </div>
        </div>

        {/* EDIT NAME */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Profile</div>
          <div className={styles.card}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Display name</label>
              <div className={styles.fieldRow}>
                <input
                  className={styles.input}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                />
                <button
                  className={styles.saveBtn}
                  onClick={saveName}
                  disabled={saving}
                >
                  {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            <div className={styles.fieldGroup} style={{ marginTop: 20 }}>
              <label className={styles.label}>Email</label>
              <div className={styles.emailDisplay}>{profile?.email}</div>
            </div>
          </div>
        </div>

        {/* PREFERENCES — pre-fills /app on every flash so the user doesn't reselect lang/style each time */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Flash preferences</div>
          <div className={styles.card}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Default output language</label>
              <div className={styles.fieldRow}>
                <select
                  className={styles.input}
                  value={defaultLang}
                  onChange={e => setDefaultLang(e.target.value as 'EN' | 'FR' | 'ES' | 'DE')}
                  disabled={profile?.plan === 'free'}
                >
                  <option value="EN">English</option>
                  <option value="FR">Français</option>
                  <option value="ES">Español</option>
                  <option value="DE">Deutsch</option>
                </select>
              </div>
              {profile?.plan === 'free' && (
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                  Free plan is English-only. <Link href="/pricing" style={{ color: 'var(--blue3)' }}>Upgrade to Pro</Link> to unlock FR/ES/DE.
                </div>
              )}
            </div>
            <div className={styles.fieldGroup} style={{ marginTop: 20 }}>
              <label className={styles.label}>Default style</label>
              <div className={styles.fieldRow}>
                <select
                  className={styles.input}
                  value={defaultStyle}
                  onChange={e => setDefaultStyle(e.target.value as 'Concise' | 'Detailed' | 'Email')}
                >
                  <option value="Concise">Concise — sharp and minimum words</option>
                  <option value="Detailed">Detailed — thorough, all relevant context</option>
                  <option value="Email">Email — formatted for professional follow-up</option>
                </select>
                <button
                  className={styles.saveBtn}
                  onClick={savePreferences}
                  disabled={savingPrefs}
                >
                  {prefsSaved ? '✓ Saved' : savingPrefs ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SIGN OUT */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Session</div>
          <div className={styles.card}>
            <div className={styles.sessionRow}>
              <div>
                <div className={styles.sessionTitle}>Sign out</div>
                <div className={styles.sessionSub}>You will be redirected to the homepage.</div>
              </div>
              <button className={styles.signOutBtn} onClick={signOut}>
                Sign out
              </button>
            </div>
            <div className={styles.sessionRow} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div>
                <div className={styles.sessionTitle}>Hard reset session</div>
                <div className={styles.sessionSub}>
                  Wipes all locally-stored auth data (localStorage, sessionStorage, cookies) and signs you out. Use this if the app gets stuck in a weird state — wrong name in the nav, plan flickering between Pro/Free, or the dashboard refusing to load.
                </div>
              </div>
              <button
                className={styles.signOutBtn}
                onClick={() => {
                  // Nuke every storage Supabase or our app might be reading from.
                  // Belt-and-braces: AuthProvider.signOut already clears sb-* keys,
                  // but a stuck state often comes from non-sb keys (analytics,
                  // cookies, sessionStorage) so we wipe wider here.
                  try { localStorage.clear() } catch {}
                  try { sessionStorage.clear() } catch {}
                  try {
                    document.cookie.split(';').forEach(c => {
                      const eq = c.indexOf('=')
                      const name = (eq > -1 ? c.substring(0, eq) : c).trim()
                      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
                    })
                  } catch {}
                  signOut()
                }}
              >
                Reset & sign out
              </button>
            </div>
          </div>
        </div>

        {/* DELETE ACCOUNT */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Danger zone</div>
          <div className={`${styles.card} ${styles.dangerCard}`}>
            <div className={styles.sessionRow}>
              <div>
                <div className={styles.dangerTitle}>Delete account</div>
                <div className={styles.sessionSub}>
                  Permanently delete your account and all data. This cannot be undone.
                </div>
              </div>
              {!confirmDelete ? (
                <button
                  className={styles.dangerBtn}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete account
                </button>
              ) : (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Are you sure?</span>
                  <button
                    className={styles.dangerBtnConfirm}
                    onClick={deleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}