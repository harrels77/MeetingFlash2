import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { buildBreadcrumb } from '@/lib/breadcrumb'
import { Pin, Banknote, CheckCircle2, HelpCircle, Send, MessageSquare, ArrowRight, ArrowDown } from 'lucide-react'
import s from '@/styles/marketing.module.css'

export const metadata: Metadata = {
  title: 'Free Discovery Call Recap Tool — MeetingFlash',
  description: 'Turn your discovery call notes into a polished recap email and action list in 20 seconds. Send the recap before the prospect finishes their coffee. Free, no signup.',
  alternates: { canonical: '/tools/discovery-call-recap-tool' },
  openGraph: {
    title: 'Free Discovery Call Recap Tool — MeetingFlash',
    description: 'Turn discovery call notes into a polished recap email and action list in 20 seconds. Free, no signup.',
    url: 'https://www.meetingflash.work/tools/discovery-call-recap-tool',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Is the recap good enough to send to a prospect without rewriting?',
    a: 'Usually yes. The recap is built from the actual decisions, scope, budget, and commitments in your notes — not a template. Most agencies and freelancers tweak one or two sentences and send it as-is.',
  },
  {
    q: 'Can I save recaps to revisit later in the sales cycle?',
    a: 'Yes. Free accounts auto-save every Pack and link them to a project, so by call #4 with the same prospect, you have all earlier decisions in one place.',
  },
  {
    q: 'How is this different from generic AI?',
    a: 'No prompt-writing. The tool already knows what a discovery call recap should contain — confirmed scope, budget, timeline, owners and dates for next steps, open questions, follow-up email. You just paste your notes.',
  },
  {
    q: 'Does it work for sales calls, not just discovery calls?',
    a: 'Yes. The structure (scope, decisions, owners, follow-up) maps to most consultative sales conversations: discovery, qualification, proposal calls, kickoff calls.',
  },
]

const pageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Discovery Call Recap Tool',
    url: 'https://www.meetingflash.work/tools/discovery-call-recap-tool',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Turn discovery call notes into a polished recap email and action list in 20 seconds.',
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
  buildBreadcrumb([
    { name: 'Free tools', path: '/tools/discovery-call-recap-tool' },
    { name: 'Discovery call recap tool', path: '/tools/discovery-call-recap-tool' },
  ]),
]

export default function DiscoveryCallRecapToolPage() {
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

      <section className={s.hero}>
        <div className={s.container}>
          <div className={s.heroSplit}>
            <div className={s.heroSplitContent}>
              <div className={s.heroBadgeSerif}>
                <span className={s.heroBadgeDot} />
                Free tool · no signup
              </div>
              <h1 className={s.h1Left}>
                Discovery call recap. <span className={s.h1Accent}>Sent before they leave the meeting.</span>
              </h1>
              <p className={s.heroSubLeft}>
                Paste your raw discovery call notes — get a polished recap email, scope confirmation, action items with owners and deadlines, and open questions. The recap email is part of the sale. Send it fast.
              </p>
              <div className={s.heroActionsLeft}>
                <Link href="/app" className={s.btnPrimary}>Generate my recap <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></Link>
                <Link href="/blog/discovery-call-recap-template" className={s.btnGhost}>Read the template guide <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" /></Link>
              </div>
              <div className={s.heroStats}>
                <div className={s.heroStat}>
                  <span className={s.heroStatN}>20s</span>
                  <span className={s.heroStatL}>recap time</span>
                </div>
                <div className={s.heroStatDiv} />
                <div className={s.heroStat}>
                  <span className={s.heroStatN}>6</span>
                  <span className={s.heroStatL}>outputs per call</span>
                </div>
                <div className={s.heroStatDiv} />
                <div className={s.heroStat}>
                  <span className={s.heroStatN}>Free</span>
                  <span className={s.heroStatL}>first one</span>
                </div>
              </div>
            </div>

            <div className={s.heroCard}>
              <div className={s.mockup}>
                <div className={s.mockupHead}>
                  <div className={s.mockupDots}><span /><span /><span /></div>
                  <div className={s.mockupTitle}>Discovery call · Acme Corp</div>
                </div>
                <div className={s.mockupBody}>
                  <div className={`${s.mockBlock} ${s.mockBlockBlue}`}>
                    <div className={s.mockBlockLabel}>Decisions</div>
                    <div className={s.mockBlockContent}>
                      • Scope locked: Shopify Plus rebuild, 12-week timeline<br />
                      • Budget approved at $48k, 3 milestones<br />
                      • Kickoff scheduled for May 6th
                    </div>
                  </div>
                  <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
                    <div className={s.mockBlockLabel}>Action items</div>
                    <div className={s.mockBlockContent}>
                      ✓ <strong>You</strong> → SOW + first invoice (Mon)<br />
                      ✓ <strong>Sarah (Acme)</strong> → Brand assets + access (Tue)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>What you get</div>
            <h2 className={s.sectionTitle}>One paste of notes becomes six ready-to-send outputs.</h2>
            <p className={s.sectionLede}>
              A discovery call recap isn&apos;t just an email — it&apos;s a complete handoff package the prospect can act on.
            </p>
          </div>
          <div className={s.cardGrid}>
            <div className={s.card}>
              <div className={s.cardIcon}><Pin size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Confirmed scope</div>
              <p className={s.cardDesc}>What they&apos;re hiring you for, in their language. Restated so there&apos;s no misalignment by week 2.</p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><Banknote size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Budget &amp; timeline</div>
              <p className={s.cardDesc}>The dollar figure, payment milestones, and project timeline pulled directly from what was discussed.</p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><CheckCircle2 size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Action items with owners</div>
              <p className={s.cardDesc}>Who is doing what by when — yours and theirs. No floating commitments without an owner.</p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><HelpCircle size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Open questions</div>
              <p className={s.cardDesc}>Things that came up but weren&apos;t resolved. Becomes the agenda for the next call.</p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><Send size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Follow-up email</div>
              <p className={s.cardDesc}>Drafted using all of the above — ready to copy, edit one line, and send to the prospect.</p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><MessageSquare size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Internal Slack message</div>
              <p className={s.cardDesc}>A separate update for your team channel — what we just won, what&apos;s next, who&apos;s on it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Example</div>
            <h2 className={s.sectionTitle}>From bullets to a sent email.</h2>
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
                  • Scope locked: e-commerce rebuild on Shopify Plus, 12-week timeline<br />
                  • Budget approved at $48k, 3 milestones (kickoff / midpoint / launch)<br />
                  • Kickoff scheduled for May 6th<br />
                  • Weekly Tuesday status calls
                </div>
              </div>
              <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
                <div className={s.mockBlockLabel}>Action items</div>
                <div className={s.mockBlockContent}>
                  ✓ <strong>You</strong> → SOW + first invoice (Mon)<br />
                  ✓ <strong>Sarah (Acme)</strong> → Brand assets + access (Tue)<br />
                  ✓ <strong>You</strong> → Slack channel + project doc (Wed)<br />
                  ✓ <strong>You</strong> → Kickoff agenda (Fri)
                </div>
              </div>
              <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
                <div className={s.mockBlockLabel}>Follow-up email</div>
                <div className={s.mockBlockContent}>
                  Hi Sarah — great speaking today. Confirming we&apos;re aligned on the 12-week scope and $48k budget across 3 milestones. Kickoff May 6th, weekly Tuesday status calls.<br /><br />
                  I&apos;ll send the SOW &amp; first invoice Monday morning — you&apos;ll share brand assets &amp; access Tuesday. Slack channel and project doc by Wednesday, and a draft kickoff agenda by Friday.<br /><br />
                  One open item: confirming whether legacy product data needs migration. Will follow up Thursday.<br /><br />
                  Looking forward to kickoff.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>FAQ</div>
            <h2 className={s.sectionTitle}>Common questions.</h2>
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
        <h2 className={s.ctaBannerTitle}>Send the recap<br />before they finish their coffee.</h2>
        <p className={s.ctaBannerSub}>Free for your first one. No signup required.</p>
        <Link href="/app" className={s.btnPrimary}>Try it free <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></Link>
      </section>

      <footer className={s.miniFooter}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/blog/discovery-call-recap-template">Discovery recap template</Link>
        <Link href="/for-agencies">For agencies</Link>
        <Link href="/tools/follow-up-email-generator">Follow-up email generator</Link>
        <Link href="/tools/meeting-action-items-extractor">Action items extractor</Link>
        <Link href="/pricing">Pricing</Link>
        <div style={{ marginTop: 16 }}>© 2026 MeetingFlash · hello@meetingflash.work</div>
      </footer>
    </div>
  )
}
