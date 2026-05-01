import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { buildBreadcrumb } from '@/lib/breadcrumb'
import s from '@/styles/marketing.module.css'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Pricing — MeetingFlash',
  description: 'Simple, honest pricing. Free plan with 5 packs / month, Pro at $12/month or $96/year for unlimited packs, project memory, smart search, multi-language output, and PDF export.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing — MeetingFlash',
    description: 'Free, Pro, and Team plans. Start free, upgrade when ready.',
    url: 'https://meetingflash.work/pricing',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Is there a free trial?',
    a: 'Better than a trial — there\'s a permanent Free plan with 5 Execution Packs every month. No credit card required. You can also try one Pack as a guest without signing up.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your Stripe customer portal in two clicks. You drop to the Free plan immediately — your account, past Packs, and projects stay accessible.',
  },
  {
    q: 'What\'s the difference between monthly and annual?',
    a: 'Annual saves you 33% — Pro is $12/month billed monthly, or $8/month billed annually ($96 upfront). Same features either way.',
  },
  {
    q: 'Why is Team marked "coming soon"?',
    a: 'Team needs shared workspaces, per-seat billing, and admin controls done right — that\'s weeks of focused work. Rather than ship Team half-finished, we made Pro excellent first. Email hello@meetingflash.work to be notified when Team ships.',
  },
  {
    q: 'Do I lose my data if I downgrade?',
    a: 'No. Your account, past Packs, and projects all stay accessible on the Free plan. You\'re just capped to 5 new Packs per month and lose access to Pro-only features (multi-language, smart search, PDF export, unlimited projects).',
  },
  {
    q: 'Can I expense MeetingFlash?',
    a: 'Yes. Stripe sends a clean invoice on every charge. Make sure your billing email matches what your finance team needs.',
  },
]

const pricingJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'MeetingFlash',
    description: 'AI-powered post-meeting execution tool. Paste raw meeting notes, get a complete Execution Pack in under 20 seconds.',
    brand: { '@type': 'Brand', name: 'MeetingFlash' },
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        url: 'https://meetingflash.work/signup',
        availability: 'https://schema.org/InStock',
        description: '5 Execution Packs per month, English output, 1 project',
      },
      {
        '@type': 'Offer',
        name: 'Pro (Monthly)',
        price: '12',
        priceCurrency: 'USD',
        url: 'https://meetingflash.work/pricing',
        availability: 'https://schema.org/InStock',
        description: 'Unlimited packs, project memory, smart search, EN/FR/ES/DE output, PDF export, priority support',
      },
      {
        '@type': 'Offer',
        name: 'Pro (Annual)',
        price: '96',
        priceCurrency: 'USD',
        url: 'https://meetingflash.work/pricing',
        availability: 'https://schema.org/InStock',
        description: 'Pro plan billed annually — save 33%',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  },
  buildBreadcrumb([{ name: 'Pricing', path: '/pricing' }]),
]

export default function PricingPage() {
  return (
    <div className={s.root}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      <div className={s.ambient}>
        <div className={s.ambientBlob1} />
        <div className={s.ambientBlob2} />
      </div>

      <MobileNav />

      <section className={s.hero}>
        <div className={s.container}>
          <div className={s.heroBadge}>
            <span className={s.heroBadgeDot} />
            Pricing
          </div>
          <h1 className={s.h1}>
            Simple. Honest. <span className={s.h1Accent}>No surprises.</span>
          </h1>
          <p className={s.heroSub}>
            Start free with 5 Execution Packs per month. Upgrade to Pro when you need more — every Pro feature is backed by code, not marketing.
          </p>
        </div>
      </section>

      <PricingClient />

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Pricing FAQ</div>
            <h2 className={s.sectionTitle}>Honest answers.</h2>
          </div>
          <div className={s.faqList}>
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className={s.faqItem}>
                <summary className={s.faqQ}>
                  <span>{item.q}</span>
                  <span className={s.faqQPlus}>+</span>
                </summary>
                <p className={s.faqA}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={s.ctaBanner}>
        <h2 className={s.ctaBannerTitle}>Try one Pack free.<br />No credit card.</h2>
        <p className={s.ctaBannerSub}>
          See exactly what an Execution Pack looks like before you commit to anything.
        </p>
        <Link href="/app" className={s.btnPrimary}>Run your first Flash free →</Link>
      </section>

      <footer className={s.miniFooter}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/for-agencies">For agencies</Link>
        <Link href="/for-product-teams">For product teams</Link>
        <Link href="/for-freelancers">For freelancers</Link>
        <div style={{ marginTop: 16 }}>© 2026 MeetingFlash · hello@meetingflash.work</div>
      </footer>
    </div>
  )
}
