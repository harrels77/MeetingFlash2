import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { buildBreadcrumb } from '@/lib/breadcrumb'
import s from '@/styles/marketing.module.css'

export const metadata: Metadata = {
  title: 'Free Follow-Up Email Generator (After Meeting) — MeetingFlash',
  description: 'Paste your meeting notes — get a polished follow-up email drafted in 20 seconds. Free, no signup, no ChatGPT prompt-writing required.',
  alternates: { canonical: '/tools/follow-up-email-generator' },
  openGraph: {
    title: 'Free Follow-Up Email Generator — MeetingFlash',
    description: 'Paste your meeting notes, get a polished follow-up email in 20 seconds. Free, no signup.',
    url: 'https://www.meetingflash.work/tools/follow-up-email-generator',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Is this really free?',
    a: 'Yes. The first email is free without signup. Free accounts get 5 packs/month — each pack includes a follow-up email plus decisions, actions, and more. No credit card.',
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'No prompt-writing. Just paste your raw notes — the tool already knows what a follow-up email should look like (greeting, recap of decisions, action items with owners and deadlines, sign-off with next step). You get a structured, ready-to-send email, not a generic blob.',
  },
  {
    q: 'Will the email sound like AI wrote it?',
    a: 'It defaults to a neutral professional tone, but the email is built around the actual decisions, names, and commitments from your notes — not a template. Most people edit one sentence and send it.',
  },
  {
    q: 'Can I generate emails in French / Spanish / German?',
    a: 'Yes, on the Pro plan ($12/month). Free output is in English. Input language can be anything either way.',
  },
]

const pageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Follow-Up Email Generator',
    url: 'https://www.meetingflash.work/tools/follow-up-email-generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Generate polished post-meeting follow-up emails from raw notes in 20 seconds.',
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
    { name: 'Free tools', path: '/tools/follow-up-email-generator' },
    { name: 'Follow-up email generator', path: '/tools/follow-up-email-generator' },
  ]),
]

export default function FollowUpEmailGeneratorPage() {
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
                Free follow-up email generator. <span className={s.h1Accent}>Sent before they finish their coffee.</span>
              </h1>
              <p className={s.heroSubLeft}>
                Paste your raw meeting notes — get a polished follow-up email in 20 seconds. No prompt to write, no signup for the first one.
              </p>
              <div className={s.heroActionsLeft}>
                <Link href="/app" className={s.btnPrimary}>Generate my email →</Link>
                <Link href="#how" className={s.btnGhost}>See an example ↓</Link>
              </div>
              <div className={s.heroStats}>
                <div className={s.heroStat}>
                  <span className={s.heroStatN}>20s</span>
                  <span className={s.heroStatL}>draft time</span>
                </div>
                <div className={s.heroStatDiv} />
                <div className={s.heroStat}>
                  <span className={s.heroStatN}>0</span>
                  <span className={s.heroStatL}>prompts to write</span>
                </div>
                <div className={s.heroStatDiv} />
                <div className={s.heroStat}>
                  <span className={s.heroStatN}>Free</span>
                  <span className={s.heroStatL}>no credit card</span>
                </div>
              </div>
            </div>

            <div className={s.heroCard}>
              <div className={s.mockup}>
                <div className={s.mockupHead}>
                  <div className={s.mockupDots}><span /><span /><span /></div>
                  <div className={s.mockupTitle}>Generated follow-up email</div>
                </div>
                <div className={s.mockupBody}>
                  <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
                    <div className={s.mockBlockLabel}>Subject</div>
                    <div className={s.mockBlockContent}>
                      Acme rebuild — kickoff May 6, recap &amp; next steps
                    </div>
                  </div>
                  <div className={`${s.mockBlock} ${s.mockBlockBlue}`}>
                    <div className={s.mockBlockLabel}>Body</div>
                    <div className={s.mockBlockContent}>
                      Hi Sarah, great speaking today. Confirming we&apos;re aligned on the 12-week scope and $48k budget across 3 milestones. Kickoff May 6th.<br /><br />
                      Next steps:<br />
                      • <strong>You</strong> → SOW + first invoice (Mon)<br />
                      • <strong>Sarah</strong> → brand assets &amp; access (Tue)<br />
                      • <strong>You</strong> → kickoff agenda (Wed)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section} id="how">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>How it works</div>
            <h2 className={s.sectionTitle}>Three steps. 20 seconds total.</h2>
          </div>
          <div className={s.cardGrid}>
            <div className={s.card}>
              <div className={s.cardIcon}>📝</div>
              <div className={s.cardTitle}>1 · Paste your notes</div>
              <p className={s.cardDesc}>
                Bullet points, fragments, half-sentences from the meeting. No formatting required — &quot;Sarah → launch April 28&quot; works.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>⚡</div>
              <div className={s.cardTitle}>2 · Hit Flash</div>
              <p className={s.cardDesc}>
                The tool extracts decisions, action items with owners and deadlines, and drafts the follow-up email using your meeting&apos;s actual content.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>📤</div>
              <div className={s.cardTitle}>3 · Send</div>
              <p className={s.cardDesc}>
                Copy the email, edit one sentence if you want, send it. Most people send it as-is.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Example output</div>
            <h2 className={s.sectionTitle}>What a generated email looks like.</h2>
            <p className={s.sectionLede}>
              From the same bullets above, the tool produces a structured email with a clear recap, owners, and a next step.
            </p>
          </div>
          <div className={s.mockup}>
            <div className={s.mockupHead}>
              <div className={s.mockupDots}><span /><span /><span /></div>
              <div className={s.mockupTitle}>Generated follow-up email</div>
            </div>
            <div className={s.mockupBody}>
              <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
                <div className={s.mockBlockLabel}>Subject</div>
                <div className={s.mockBlockContent}>
                  Acme rebuild — kickoff May 6, recap & next steps
                </div>
              </div>
              <div className={`${s.mockBlock} ${s.mockBlockBlue}`}>
                <div className={s.mockBlockLabel}>Body</div>
                <div className={s.mockBlockContent}>
                  Hi Sarah, great speaking today. Confirming we&apos;re aligned on the 12-week scope and $48k budget across 3 milestones. Kickoff May 6th.<br /><br />
                  Next steps:<br />
                  • <strong>You</strong> → SOW + first invoice (Mon)<br />
                  • <strong>Sarah</strong> → brand assets &amp; access (Tue)<br />
                  • <strong>You</strong> → kickoff agenda (Wed)<br /><br />
                  Open question: confirming whether legacy product data needs migration. Will follow up Thursday.<br /><br />
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
        <h2 className={s.ctaBannerTitle}>Generate your follow-up email now.</h2>
        <p className={s.ctaBannerSub}>Free for the first one. No signup needed.</p>
        <Link href="/app" className={s.btnPrimary}>Try the generator free →</Link>
      </section>

      <footer className={s.miniFooter}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/blog/how-to-write-follow-up-email-after-meeting">Follow-up email guide</Link>
        <Link href="/tools/meeting-action-items-extractor">Action items extractor</Link>
        <Link href="/tools/discovery-call-recap-tool">Discovery call recap</Link>
        <Link href="/pricing">Pricing</Link>
        <div style={{ marginTop: 16 }}>© 2026 MeetingFlash · hello@meetingflash.work</div>
      </footer>
    </div>
  )
}
