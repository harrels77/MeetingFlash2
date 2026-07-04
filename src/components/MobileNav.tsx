'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthProvider'
import { Zap, Sun, Moon, ChevronDown, ArrowRight } from 'lucide-react'
import styles from './MobileNav.module.css'

export default function MobileNav() {
  const { user, profile, loading, signOut } = useAuth()
  const [open, setOpen]               = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [forOpen, setForOpen]         = useState(false)
  const [theme, setTheme]             = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('mf_theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('mf_theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

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
        setForOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close any open dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest(`.${styles.accountWrap}`) && !target.closest(`.${styles.forWrap}`)) {
        setAccountOpen(false)
        setForOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setAccountOpen(false)
        setForOpen(false)
      }
    }
    if (accountOpen || forOpen) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [accountOpen, forOpen])

  // While auth is loading OR the profile hasn't arrived yet for a logged-in
  // user, show a neutral placeholder. Falling back to user.email.split('@')[0]
  // here would briefly render the email-prefix (e.g. "adrienharrel") before
  // the real Google/profile name ("Harrel") loads in — a confusing flash on
  // every cold-start refresh.
  const profilePending = loading || (!!user && !profile)
  const displayName = profilePending
    ? 'Account'
    : (profile?.full_name
        || profile?.email?.split('@')[0]
        || user?.email?.split('@')[0]
        || 'Account')
  const initial = profilePending ? '·' : (displayName[0] || 'A').toUpperCase()

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="MeetingFlash" width={28} height={28} style={{ borderRadius: 6 }} priority />
          MeetingFlash
        </Link>

        {/* DESKTOP LINKS — cachés sur mobile via CSS */}
        <div className={styles.desktopLinks}>
          <div className={styles.forWrap}>
            <button
              type="button"
              className={styles.navLink}
              onClick={() => setForOpen(o => !o)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', font: 'inherit', cursor: 'pointer' }}
              aria-expanded={forOpen}
            >
              For <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" style={{ transition: 'transform 0.15s', transform: forOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {forOpen && (
              <div className={styles.forMenu}>
                <Link href="/for-agencies"      className={styles.forMenuItem} onClick={() => setForOpen(false)}>For agencies</Link>
                <Link href="/for-product-teams" className={styles.forMenuItem} onClick={() => setForOpen(false)}>For product teams</Link>
                <Link href="/for-freelancers"   className={styles.forMenuItem} onClick={() => setForOpen(false)}>For freelancers</Link>
              </div>
            )}
          </div>
          <Link href="/pricing"  className={styles.navLink}>Pricing</Link>
          <Link href="/blog"     className={styles.navLink}>Blog</Link>
          
          

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
                <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" className={styles.accountChevron} />
              </button>

                {accountOpen && (
                  <div className={styles.accountMenu}>
                    <div className={styles.accountMenuHeader}>
                      <div className={styles.accountMenuName}>{displayName}</div>
                      <div className={styles.accountMenuEmail}>{profile?.email || user.email}</div>
                      <div className={styles.accountMenuPlan}>{profile?.plan || (profilePending ? '—' : 'free')}</div>
                    </div>
                    <Link href="/app" className={styles.accountMenuItem} onClick={() => setAccountOpen(false)}>
                      <Zap size={16} strokeWidth={1.75} aria-hidden="true" /> New Flash
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

              <Link href="/app"   className={styles.navCta}>Try it free <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" /></Link>
            </>
          )}
        </div>

        {/* THEME TOGGLE */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} aria-hidden="true" /> : <Moon size={18} strokeWidth={1.75} aria-hidden="true" />}
        </button>

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
          <Link href="/#features" className={styles.mobileLink} onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="/pricing" className={styles.mobileLink} onClick={() => setOpen(false)}>
            Pricing
          </Link>
          <Link href="/blog" className={styles.mobileLink} onClick={() => setOpen(false)}>
            Blog
          </Link>
          <Link href="/for-agencies" className={styles.mobileLink} onClick={() => setOpen(false)}>
            For agencies
          </Link>
          <Link href="/for-product-teams" className={styles.mobileLink} onClick={() => setOpen(false)}>
            For product teams
          </Link>
          <Link href="/for-freelancers" className={styles.mobileLink} onClick={() => setOpen(false)}>
            For freelancers
          </Link>

        {user ? (
          <>
            <div className={styles.mobileDivider} />

            {/* USER BUTTON */}
            <button
              className={styles.mobileLink}
              onClick={() => setAccountOpen(!accountOpen)}
            >
              {displayName} <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
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
                  <Zap size={16} strokeWidth={1.75} aria-hidden="true" /> New Flash
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
                Try it free <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
