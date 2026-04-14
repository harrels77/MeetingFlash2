'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Nav.module.css'

export default function Nav() {
  const [compact, setCompact] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${compact ? styles.compact : ''}`}>
      <Link href="/" className={styles.logo}>
        <div className={styles.logoMark}>
          <div className={styles.logoInner} />
        </div>
        <span>meetingflash</span>
      </Link>

      <div className={styles.links}>
        <Link href="#how" className={styles.link}>Process</Link>
        <Link href="#pack" className={styles.link}>The Pack</Link>
        <Link href="#pricing" className={styles.link}>Pricing</Link>
        <Link href="/app" className={styles.cta}>Get your pack →</Link>
      </div>

      <button
        className={styles.burger}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={menuOpen ? styles.burgerOpen : ''} />
        <span className={menuOpen ? styles.burgerOpen : ''} />
      </button>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="#how" onClick={() => setMenuOpen(false)}>Process</Link>
          <Link href="#pack" onClick={() => setMenuOpen(false)}>The Pack</Link>
          <Link href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link href="/app" className={styles.mobileCta}>Get your pack →</Link>
        </div>
      )}
    </nav>
  )
}
