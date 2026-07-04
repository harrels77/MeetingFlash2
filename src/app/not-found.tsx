import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, CreditCard, BookOpen, Target, ArrowLeft, ArrowRight } from 'lucide-react'
import SiteFooter from '@/components/SiteFooter'
import s from '@/styles/marketing.module.css'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className={s.root}>
      <div className={s.ambient}>
        <div className={s.ambientBlob1} />
        <div className={s.ambientBlob2} />
      </div>

      <section className={s.hero}>
        <div className={s.container}>
          <div className={s.heroBadge}>
            <span className={s.heroBadgeDot} />
            404
          </div>
          <h1 className={s.h1}>
            That page doesn&apos;t exist. <span className={s.h1Accent}>Yet.</span>
          </h1>
          <p className={s.heroSub}>
            The link is broken or the page moved. Here&apos;s where to go next.
          </p>
          <div className={s.heroActions}>
            <Link href="/" className={s.btnPrimary}><ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" /> Back to home</Link>
            <Link href="/app" className={s.btnGhost}>Try the flash tool <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Popular pages</div>
            <h2 className={s.sectionTitle}>You might be looking for…</h2>
          </div>
          <div className={s.cardGrid}>
            <Link href="/app" className={s.card} style={{ textDecoration: 'none' }}>
              <div className={s.cardIcon}><Zap size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Try the flash tool</div>
              <p className={s.cardDesc}>Paste your meeting notes, get a complete Execution Pack in 20 seconds.</p>
            </Link>
            <Link href="/pricing" className={s.card} style={{ textDecoration: 'none' }}>
              <div className={s.cardIcon}><CreditCard size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Pricing</div>
              <p className={s.cardDesc}>Free, Pro, and Team plans. Start free, upgrade when you need more.</p>
            </Link>
            <Link href="/blog" className={s.card} style={{ textDecoration: 'none' }}>
              <div className={s.cardIcon}><BookOpen size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Blog</div>
              <p className={s.cardDesc}>Practical guides on meeting workflows, follow-ups, retros, and more.</p>
            </Link>
            <Link href="/for-agencies" className={s.card} style={{ textDecoration: 'none' }}>
              <div className={s.cardIcon}><Target size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>For agencies</div>
              <p className={s.cardDesc}>Discovery, status, retros — turned into client-ready recaps.</p>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
