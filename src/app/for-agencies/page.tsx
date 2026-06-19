import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { buildBreadcrumb } from '@/lib/breadcrumb'
import s from '@/styles/marketing.module.css'

export const metadata: Metadata = {
  title: 'AI Meeting Recap Tool for Agencies — MeetingFlash',
  description: 'Send client-ready discovery, status, and retrospective recaps in 20 seconds. Built for agencies who run too many client meetings to write recaps by hand.',
  alternates: { canonical: '/for-agencies' },
  openGraph: {
    title: 'AI Meeting Recap Tool for Agencies — MeetingFlash',
    description: 'Send client-ready discovery, status, and retrospective recaps in 20 seconds. Built for agencies.',
    url: 'https://www.meetingflash.work/for-agencies',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Can I share recaps directly with clients?',
    a: 'Yes. Every Pack has a one-click "Share" button that creates a public link — read-only, no login required for the client. You can also export to PDF for formal deliverables.',
  },
  {
    q: 'Does the recap email need to be rewritten before sending?',
    a: 'Usually no. The follow-up email is drafted using the actual decisions, owners, and deadlines from your notes — it reads like you wrote it. Most agencies tweak one or two sentences and send it.',
  },
  {
    q: 'Can multiple people on my team use the same account?',
    a: 'Today, accounts are per-user. A Team plan with shared workspaces and per-seat billing is in development — email hello@meetingflash.work if you want early access.',
  },
  {
    q: 'Is the data secure for client-confidential meetings?',
    a: 'Notes are sent to Anthropic\'s Claude API, processed in-memory, and discarded — never stored on Anthropic\'s side or used for training. Your generated Packs are stored in your account on Supabase (EU region). You can delete any Pack in one click.',
  },
  {
    q: 'Does it support multiple languages for international clients?',
    a: 'Yes. Input can be in any language. Output is currently English (Free) or English / French / Spanish / German (Pro). More languages roll out as users request them.',
  },
]

const pageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Meeting Recap Tool for Agencies — MeetingFlash',
    description: 'Send client-ready discovery, status, and retrospective recaps in 20 seconds. Built for agencies.',
    url: 'https://www.meetingflash.work/for-agencies',
    isPartOf: {
      '@type': 'WebSite',
      name: 'MeetingFlash',
      url: 'https://www.meetingflash.work',
    },
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
  buildBreadcrumb([{ name: 'For agencies', path: '/for-agencies' }]),
]

export default function ForAgenciesPage() {
  return (
    <div className={s.root}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <div className={s.ambient}>
        <div className={s.ambientBlob1} />
        <div className={s.ambientBlob2} />
      </div>

      <MobileNav />

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.container}>
          <div className={s.heroBadge}>
            <span className={s.heroBadgeDot} />
            For agencies
          </div>
          <h1 className={s.h1}>
            Send client-ready meeting recaps <span className={s.h1Accent}>before they finish their coffee.</span>
          </h1>
          <p className={s.heroSub}>
            Discovery calls, weekly status updates, sprint retros, quarterly reviews — turned into a polished recap email and Slack message in 20 seconds. Built for agencies who run too many client meetings to write recaps by hand.
          </p>
          <div className={s.heroActions}>
            <Link href="/app?template=discovery" className={s.btnPrimary}>Try it free →</Link>
            <Link href="#how" className={s.btnGhost}>See how it works ↓</Link>
          </div>
          <div className={s.trustStrip}>
            <span>✓ 20 seconds per recap</span>
            <span>✓ Project memory across calls</span>
            <span>✓ EN / FR / ES / DE output</span>
          </div>
        </div>
      </section>

      {/* THE 4 MEETING TYPES */}
      <section className={s.section} id="how">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>The 4 meetings agencies run on repeat</div>
            <h2 className={s.sectionTitle}>One tool. Every meeting type.</h2>
            <p className={s.sectionLede}>
              MeetingFlash extracts decisions, owners, deadlines, and follow-ups from raw notes — whatever the meeting format.
            </p>
          </div>
          <div className={s.cardGrid}>
            <div className={s.card}>
              <div className={s.cardIcon}>🎯</div>
              <div className={s.cardTitle}>Discovery calls</div>
              <p className={s.cardDesc}>
                Capture the prospect&apos;s goals, scope, budget, and timeline. Get a recap email in their inbox before they leave the meeting room — the recap email is part of the sale.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>📋</div>
              <div className={s.cardTitle}>Weekly client status</div>
              <p className={s.cardDesc}>
                Paste your weekly notes — get a polished status email with what shipped, what&apos;s next, decisions needed, and risks. Calm clients renew.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>🔁</div>
              <div className={s.cardTitle}>Sprint check-ins</div>
              <p className={s.cardDesc}>
                Internal team retros and standups become structured improvement commitments — with owners and deadlines, not just venting.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>📊</div>
              <div className={s.cardTitle}>Quarterly reviews</div>
              <p className={s.cardDesc}>
                Strategic sessions become a clear list of decisions, action items, and a starting agenda for the next quarter — written, not lost in a Notion doc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN + MOCKUP */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Why agencies switch</div>
            <h2 className={s.sectionTitle}>Most AI meeting tools were built for sales teams.<br />MeetingFlash was built for agencies.</h2>
          </div>

          <div className={s.split}>
            <div className={s.painList}>
              <div className={s.pain}>
                <div className={s.painIcon}>📤</div>
                <div>
                  <div className={s.painTitle}>Client-ready output, not internal note dumps.</div>
                  <p className={s.painDesc}>The follow-up email is drafted using the actual decisions and owners from the call. Edit one line, send it — no template rewriting.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}>🧠</div>
                <div>
                  <div className={s.painTitle}>Project memory across calls.</div>
                  <p className={s.painDesc}>By call #4 with a client, your tool should remember calls 1-3. MeetingFlash projects keep decisions and tasks across every meeting on the same engagement.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}>🌍</div>
                <div>
                  <div className={s.painTitle}>Multi-language for international clients.</div>
                  <p className={s.painDesc}>Take notes in your language, deliver the recap in your client&apos;s language. EN / FR / ES / DE on Pro, more on request.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}>📎</div>
                <div>
                  <div className={s.painTitle}>Shareable links + PDF export.</div>
                  <p className={s.painDesc}>One-click share link or a clean PDF for formal deliverables. Clients see the recap exactly as you do — no login, no friction.</p>
                </div>
              </div>
            </div>

            <div className={s.mockup}>
              <div className={s.mockupHead}>
                <div className={s.mockupDots}><span /><span /><span /></div>
                <div className={s.mockupTitle}>Discovery call · Acme Corp</div>
              </div>
              <div className={s.mockupBody}>
                <div className={`${s.mockBlock} ${s.mockBlockBlue}`}>
                  <div className={s.mockBlockLabel}>Decisions</div>
                  <div className={s.mockBlockContent}>
                    • Scope locked: e-commerce rebuild, 12-week timeline<br />
                    • Budget approved at $48k, paid in 3 milestones<br />
                    • Kickoff scheduled for May 6th
                  </div>
                </div>
                <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
                  <div className={s.mockBlockLabel}>Action items</div>
                  <div className={s.mockBlockContent}>
                    ✓ <strong>You</strong> → Send SOW + first invoice (Mon)<br />
                    ✓ <strong>Sarah (Acme)</strong> → Share brand assets &amp; access (Tue)<br />
                    ✓ <strong>You</strong> → Set up Slack channel + project doc (Wed)
                  </div>
                </div>
                <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
                  <div className={s.mockBlockLabel}>Follow-up email</div>
                  <div className={s.mockBlockContent}>
                    Hi Sarah, great speaking today. Confirming we&apos;re aligned on the 12-week scope and $48k budget across 3 milestones. Kickoff May 6th. I&apos;ll send the SOW &amp; first invoice Monday — you&apos;ll share brand assets Tuesday…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>FAQ</div>
            <h2 className={s.sectionTitle}>Agency-specific answers.</h2>
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

      {/* CTA */}
      <section className={s.ctaBanner}>
        <h2 className={s.ctaBannerTitle}>Your next discovery call ends with a sent recap.</h2>
        <p className={s.ctaBannerSub}>
          Try it on your last meeting — no signup required for the first one.
        </p>
        <Link href="/app?template=discovery" className={s.btnPrimary}>Run your first Flash free →</Link>
      </section>

      <footer className={s.miniFooter}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/for-product-teams">For product teams</Link>
        <Link href="/for-freelancers">For freelancers</Link>
        <Link href="/pricing">Pricing</Link>
        <div style={{ marginTop: 16 }}>© 2026 MeetingFlash · hello@meetingflash.work</div>
      </footer>
    </div>
  )
}
