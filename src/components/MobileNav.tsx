'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthProvider'
import styles from './MobileNav.module.css'

export default function MobileNav() {
  const { user, profile, loading, signOut } = useAuth()
  const [open, setOpen]               = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        setOpen(false)
        setAccountOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const displayName = profile?.full_name
    || profile?.email?.split('@')[0]
    || user?.email?.split('@')[0]
    || 'Account'
  const initial = (displayName[0] || 'A').toUpperCase()

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}><div className={styles.logoInner}/></div>
          MeetingFlash
        </Link>

        {/* DESKTOP LINKS — cachés sur mobile via CSS */}
        <div className={styles.desktopLinks}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="#features" className={styles.navLink}>Features</Link>
          <Link href="#pricing"  className={styles.navLink}>Pricing</Link>
          

          {loading ? (
            <div style={{ width: 80, height: 32 }} />
          ) : user ? (
            <div className={styles.accountWrap}>
              <button
                className={styles.accountBtn}
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <div className={styles.accountAvatar}>{initial}</div>
                <span className={styles.accountName}>{displayName}</span>
                <span className={styles.accountChevron}>▾</span>
              </button>

                {accountOpen && (
                  <div className={styles.accountMenu}>
                    <div className={styles.accountMenuHeader}>
                      <div className={styles.accountMenuName}>{displayName}</div>
                      <div className={styles.accountMenuEmail}>{profile?.email || user.email}</div>
                      <div className={styles.accountMenuPlan}>{profile?.plan || 'free'}</div>
                    </div>
                    <Link href="/app" className={styles.accountMenuItem} onClick={() => setAccountOpen(false)}>
                      ⚡ New Flash
                    </Link>
                    <Link href="/dashboard" className={styles.accountMenuItem} onClick={() => setAccountOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/dashboard/settings" className={styles.accountMenuItem} onClick={() => setAccountOpen(false)}>
                      Settings
                    </Link>
                    <button
                      className={`${styles.accountMenuItem} ${styles.accountMenuSignOut}`}
                      onClick={() => { setAccountOpen(false); signOut() }}
                    >
                      Sign out
                    </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.navLink}>Sign in</Link>

              <Link href="/app"   className={styles.navCta}>Get started free →</Link>
            </>
          )}
        </div>

        {/* BURGER — visible uniquement sur mobile via CSS */}
        <button
          className={styles.burger}
          onClick={() => {
            setOpen(!open)
            setAccountOpen(false)
          }}
          aria-label="Toggle menu"
        >
          <span className={`${styles.burgerLine} ${open ? styles.burgerLine1Open : ''}`}/>
          <span className={`${styles.burgerLine} ${open ? styles.burgerLineHide  : ''}`}/>
          <span className={`${styles.burgerLine} ${open ? styles.burgerLine3Open : ''}`}/>
        </button>
      </nav>

      {/* MOBILE MENU — rendu uniquement sur mobile via CSS */}
      {open && (
        <div className={styles.mobileMenu}>
          <Link href="#features" className={styles.mobileLink} onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="#pricing" className={styles.mobileLink} onClick={() => setOpen(false)}>
            Pricing
          </Link>

        {user ? (
          <>
            <div className={styles.mobileDivider} />

            {/* USER BUTTON */}
            <button
              className={styles.mobileLink}
              onClick={() => setAccountOpen(!accountOpen)}
            >
              {displayName} ▾
            </button>

            {/* SUB MENU */}
            {accountOpen && (
              <>
                <div className={styles.mobileProfile}>
                  <div className={styles.mobileAvatar}>{initial}</div>
                  <div>
                    <div className={styles.mobileProfileName}>{displayName}</div>
                    <div className={styles.mobileProfileEmail}>
                      {profile?.email || user.email}
                    </div>
                  </div>
                </div>

                <div className={styles.mobileDivider} />

                <Link href="/app" className={styles.mobileLink} onClick={() => setOpen(false)}>
                  ⚡ New Flash
                </Link>
                <Link href="/dashboard" className={styles.mobileLink} onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/dashboard/settings" className={styles.mobileLink} onClick={() => setOpen(false)}>
                  Settings
                </Link>
                <button
                  className={`${styles.mobileLink} ${styles.mobileSignOut}`}
                  onClick={() => { setOpen(false); signOut() }}
                >
                  Sign out
                </button>
              </>
            )}
          </>
        ) : (
            <>
              <div className={styles.mobileDivider} />
              <Link href="/login" className={styles.mobileLink} onClick={() => setOpen(false)}>
                Sign in
              </Link>
              <Link href="/signup" className={styles.mobileLink} onClick={() => setOpen(false)}>
                Create account
              </Link>
              <Link href="/app" className={styles.mobileCta} onClick={() => setOpen(false)}>
                Get started free →
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
