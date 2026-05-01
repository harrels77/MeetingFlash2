'use client'
import { useState } from 'react'
import Link from 'next/link'
import s from './pricing.module.css'

export default function PricingClient() {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(false)

  const proPrice = annual ? 8 : 12
  const proPriceId = annual
    ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID
    : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID

  async function startCheckout() {
    if (!proPriceId) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: proPriceId, email: '' }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={s.pricingSection}>
      <div className={s.container}>
        <div className={s.toggleRow}>
          <span className={!annual ? s.toggleLabelActive : s.toggleLabel}>Monthly</span>
          <button
            type="button"
            onClick={() => setAnnual(a => !a)}
            className={`${s.toggle} ${annual ? s.toggleOn : ''}`}
            aria-label="Toggle annual billing"
          >
            <span className={s.toggleKnob} />
          </button>
          <span className={annual ? s.toggleLabelActive : s.toggleLabel}>
            Annual <span className={s.savePill}>Save 33%</span>
          </span>
        </div>

        <div className={s.cards}>
          {/* FREE */}
          <div className={s.card}>
            <div className={s.cardName}>Free</div>
            <div className={s.cardPrice}>
              <span className={s.priceCurrency}>$</span>0
              <span className={s.pricePer}>/ month</span>
            </div>
            <p className={s.cardSub}>Try the full workflow without a credit card.</p>
            <Link href="/signup" className={s.cardBtnGhost}>Start free →</Link>
            <ul className={s.featList}>
              <li>5 Execution Packs / month</li>
              <li>English output only</li>
              <li>1 project</li>
              <li>Copy to clipboard</li>
              <li>Auto-saved meeting history</li>
              <li>Guest mode (1 pack without signup)</li>
            </ul>
          </div>

          {/* PRO */}
          <div className={`${s.card} ${s.cardFeatured}`}>
            <div className={s.featuredBadge}>Most popular</div>
            <div className={s.cardName}>Pro</div>
            <div className={s.cardPrice}>
              <span className={s.priceCurrency}>$</span>{proPrice}
              <span className={s.pricePer}>/ month</span>
            </div>
            <p className={s.cardSub}>
              {annual ? '$96 billed annually — save 33%' : 'Or $96/year — save 33%'}
            </p>
            <button
              onClick={startCheckout}
              disabled={loading}
              className={s.cardBtnPrimary}
            >
              {loading ? 'Loading…' : 'Go Pro →'}
            </button>
            <ul className={s.featList}>
              <li><strong>Unlimited</strong> Execution Packs</li>
              <li><strong>Unlimited</strong> projects + project memory</li>
              <li>Smart search across meetings</li>
              <li>Output in EN / FR / ES / DE</li>
              <li>PDF export</li>
              <li>Priority email support</li>
            </ul>
          </div>

          {/* TEAM */}
          <div className={`${s.card} ${s.cardComing}`}>
            <div className={s.cardName}>Team</div>
            <div className={s.cardPrice}>
              <span className={s.comingSoon}>Coming soon</span>
            </div>
            <p className={s.cardSub}>Shared workspaces, per-seat billing, admin controls.</p>
            <a
              href="mailto:hello@meetingflash.work?subject=Notify me about Team"
              className={s.cardBtnGhost}
            >
              Notify me →
            </a>
            <ul className={s.featList}>
              <li>Everything in Pro</li>
              <li>Shared workspaces</li>
              <li>Per-seat billing</li>
              <li>Admin controls + SSO (planned)</li>
              <li>Slack &amp; Notion integration (planned)</li>
              <li>Priority roadmap input</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
