import Link from 'next/link'
import Image from 'next/image'
import FooterAccount from '@/components/FooterAccount'
import s from './Footer.module.css'

/**
 * Footer unique du site — remplace le footer local de la landing ET les
 * miniFooter des pages ICP/tools (DESIGN-SYSTEM.md, pattern interdit n°13).
 */
export default function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.footerBrand}>
          <Link href="/" className={s.footerLogo}>
            <Image src="/logo.png" alt="" width={20} height={20} style={{ borderRadius: 5 }} />
            MeetingFlash
          </Link>
          <p className={s.footerTagline}>
            Raw meeting notes in, client-ready recap out — in about 20 seconds.
          </p>
        </div>
        <div className={s.footerCols}>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>Product</div>
            <Link href="/#features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/app">Try free</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>Use cases</div>
            <Link href="/for-agencies">For agencies</Link>
            <Link href="/for-product-teams">For product teams</Link>
            <Link href="/for-freelancers">For freelancers</Link>
          </div>
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>Free tools</div>
            <Link href="/tools/follow-up-email-generator">Follow-up email generator</Link>
            <Link href="/tools/meeting-action-items-extractor">Action items extractor</Link>
            <Link href="/tools/discovery-call-recap-tool">Discovery call recap</Link>
          </div>
          <FooterAccount className={s.footerCol} colTitleClass={s.footerColTitle} />
          <div className={s.footerCol}>
            <div className={s.footerColTitle}>Legal</div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
      <div className={s.footerBottom}>
        <span>© 2026 MeetingFlash</span>
        <span className={s.footerAccent}>Made by one person who answers his own email.</span>
      </div>
    </footer>
  )
}
