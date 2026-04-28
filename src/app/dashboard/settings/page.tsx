'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './settings.module.css'

interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: string
  uses_this_month: number
  created_at: string
}

export default function Settings() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const [profile, setProfile]     = useState<Profile | null>(null)
  const [loading, setLoading]     = useState(true)
  const [name, setName]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    // Safety net: never let the spinner spin more than 8s
    const timeout = setTimeout(() => setLoading(false), 8000)

    async function load() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user!.id)
          .single()

        if (data) {
          setProfile(data)
          setName(data.full_name || '')
        }
      } catch (err) {
        console.error('Settings load error:', err)
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    load()

    return () => clearTimeout(timeout)
  }, [user, authLoading, router])

  async function saveName() {
    if (!profile) return
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', profile.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function deleteAccount() {
    if (!profile) return
    setDeleting(true)
    await supabase.from('meetings').delete().eq('user_id', profile.id)
    await supabase.from('projects').delete().eq('user_id', profile.id)
    await supabase.from('profiles').delete().eq('id', profile.id)
    signOut()
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
                  Member since {new Date(profile?.created_at || '').toLocaleDateString('en-GB', {
                    month: 'long', year: 'numeric'
                  })}
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
                <div className={styles.planName}>{profile?.plan === 'free' ? 'Free plan' : profile?.plan === 'pro' ? 'Pro plan' : 'Team plan'}</div>
                <div className={styles.planDetail}>
                  {profile?.plan === 'free'
                    ? `${usesLeft} of 5 packs remaining this month`
                    : 'Unlimited packs per month'
                  }
                </div>
              </div>
              {profile?.plan === 'free' && (
                <Link href="/#pricing" className={styles.upgradeBtn}>
                  Upgrade to Pro →
                </Link>
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