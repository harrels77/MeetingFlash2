import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { buildBreadcrumb } from '@/lib/breadcrumb'
import s from '@/styles/marketing.module.css'

export const metadata: Metadata = {
  title: 'AI Meeting Recap Tool for Freelancers — MeetingFlash',
  description: 'You don\'t have an admin team. Get client-ready recap emails, action lists, and follow-ups in 20 seconds — so you can charge for delivery, not paperwork.',
  alternates: { canonical: '/for-freelancers' },
  openGraph: {
    title: 'AI Meeting Recap Tool for Freelancers — MeetingFlash',
    description: 'You don\'t have an admin team. Get client-ready recap emails in 20 seconds — so you can charge for delivery, not paperwork.',
    url: 'https://www.meetingflash.work/for-freelancers',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Is the Free plan enough if I have only a few clients?',
    a: 'For 1-3 active clients with weekly check-ins, the Free plan (5 packs/month) covers most use cases. Beyond that, Pro at $12/month — less than 1 hour of your billable rate — pays back the moment you stop writing recap emails by hand.',
  },
  {
    q: 'Can I add my own branding to the recap email?',
    a: 'The output is plain, professional text — easy to paste into your own email signature and template. There\'s no MeetingFlash branding on the recap itself. White-label PDF export is on the roadmap for Pro.',
  },
  {
    q: 'Is it worth it for a 30-minute client call?',
    a: 'A 30-minute call typically generates 15-20 minutes of post-call admin work — recap email, todo list, calendar updates. That\'s ~50% overhead. MeetingFlash compresses that admin to under 2 minutes. The math works at any meeting length.',
  },
  {
    q: 'Can I use it for non-client meetings (workshops, calls with my own contractors, etc.)?',
    a: 'Yes. The tool doesn\'t care who the meeting is with. Discovery calls, contractor briefings, mastermind groups, podcast guest interviews — anywhere you take notes and need a recap, it works.',
  },
  {
    q: 'What happens to my notes? Are they private?',
    a: 'Notes are sent to Anthropic\'s Claude API, processed in-memory, and discarded — never stored on Anthropic\'s side or used for training. Your generated Packs are stored on Supabase (EU region). Delete any Pack in one click.',
  },
]

const pageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Meeting Recap Tool for Freelancers — MeetingFlash',
    description: 'You don\'t have an admin team. Get client-ready recap emails in 20 seconds.',
    url: 'https://www.meetingflash.work/for-freelancers',
    isPartOf: { '@type': 'WebSite', name: 'MeetingFlash', url: 'https://www.meetingflash.work' },
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
  buildBreadcrumb([{ name: 'For freelancers', path: '/for-freelancers' }]),
]

export default function ForFreelancersPage() {
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
          <div className={s.heroBadge}>
            <span className={s.heroBadgeDot} />
            For freelancers
          </div>
          <h1 className={s.h1}>
            You don&apos;t have an admin team. <span className={s.h1Accent}>Stop acting like one.</span>
          </h1>
          <p className={s.heroSub}>
            Recap emails, action lists, follow-ups — in 20 seconds. So you can charge for delivery, not for the paperwork that comes after every client call.
          </p>
          <div className={s.heroActions}>
            <Link href="/app?template=status" className={s.btnPrimary}>Try it free →</Link>
            <Link href="#math" className={s.btnGhost}>See the math ↓</Link>
          </div>
          <div className={s.trustStrip}>
            <span>✓ 5 packs free / month</span>
            <span>✓ No credit card</span>
            <span>✓ Pro at $12 / month</span>
          </div>
        </div>
      </section>

      <section className={s.section} id="math">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>The math</div>
            <h2 className={s.sectionTitle}>If you bill $100+/hour,<br />MeetingFlash pays for itself in one call.</h2>
            <p className={s.sectionLede}>
              Most freelancers spend 15-20 minutes after every client call writing the recap email and updating their todo list. At a $100/hr rate, that&apos;s $25-33 of unbilled admin per call.
            </p>
          </div>
          <div className={s.cardGrid}>
            <div className={s.card}>
              <div className={s.cardIcon}>⏱</div>
              <div className={s.cardTitle}>20 minutes per call back</div>
              <p className={s.cardDesc}>
                That&apos;s the time most freelancers lose to recap admin after every client call. MeetingFlash compresses it to under 2 minutes.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>💸</div>
              <div className={s.cardTitle}>$144 / month at 30 calls</div>
              <p className={s.cardDesc}>
                30 calls × 20 minutes saved × $100/hr × 24% (proportional time-back) = ~$144 / month of unbilled admin reclaimed. Pro costs $12.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>📅</div>
              <div className={s.cardTitle}>Recap before the next call</div>
              <p className={s.cardDesc}>
                Send the follow-up email the same minute the call ends. Clients perceive freelancers who respond at machine speed differently — they refer them.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}>🎯</div>
              <div className={s.cardTitle}>Action lists you actually use</div>
              <p className={s.cardDesc}>
                Every Pack&apos;s action items are saved to a tasks list. Open the dashboard, see your 8 outstanding actions across clients, knock them out.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Built for solo work</div>
            <h2 className={s.sectionTitle}>Run client calls. Don&apos;t run the admin.</h2>
          </div>

          <div className={s.split}>
            <div className={s.painList}>
              <div className={s.pain}>
                <div className={s.painIcon}>📤</div>
                <div>
                  <div className={s.painTitle}>Recap email already drafted.</div>
                  <p className={s.painDesc}>Not a template — a real email using the actual decisions and actions from your call. Edit one sentence, send it.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}>📋</div>
                <div>
                  <div className={s.painTitle}>Todo list builds itself.</div>
                  <p className={s.painDesc}>Every action item from every Pack lands in your task list. No more &quot;wait, what did I commit to last Tuesday?&quot; — it&apos;s right there.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}>🧠</div>
                <div>
                  <div className={s.painTitle}>Project memory across calls.</div>
                  <p className={s.painDesc}>Tag each Pack to a project (one client = one project). By call #4, the tool knows what was decided in calls 1-3.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}>🌍</div>
                <div>
                  <div className={s.painTitle}>Output in the client&apos;s language.</div>
                  <p className={s.painDesc}>Take notes in your language, deliver the recap in your client&apos;s. EN / FR / ES / DE on Pro.</p>
                </div>
              </div>
            </div>

            <div className={s.mockup}>
              <div className={s.mockupHead}>
                <div className={s.mockupDots}><span /><span /><span /></div>
                <div className={s.mockupTitle}>Client check-in · Acme</div>
              </div>
              <div className={s.mockupBody}>
                <div className={`${s.mockBlock} ${s.mockBlockBlue}`}>
                  <div className={s.mockBlockLabel}>Decisions</div>
                  <div className={s.mockBlockContent}>
                    • Wireframes approved, moving to high-fidelity<br />
                    • Final delivery extended to May 15 (mutual)<br />
                    • Adding 2-week post-launch support window
                  </div>
                </div>
                <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
                  <div className={s.mockBlockLabel}>Action items</div>
                  <div className={s.mockBlockContent}>
                    ✓ <strong>You</strong> → Send revised SOW reflecting May 15 (Mon)<br />
                    ✓ <strong>You</strong> → Start Figma high-fidelity (this week)<br />
                    ✓ <strong>Acme</strong> → Provide final brand guidelines (Wed)
                  </div>
                </div>
                <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
                  <div className={s.mockBlockLabel}>Follow-up email</div>
                  <div className={s.mockBlockContent}>
                    Hi — recap from today. Wireframes approved, moving to high-fidelity. We agreed final delivery shifts to May 15 with a 2-week post-launch support window. I&apos;ll send the revised SOW Monday…
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
            <div className={s.sectionPill}>FAQ</div>
            <h2 className={s.sectionTitle}>Freelancer-specific answers.</h2>
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
        <h2 className={s.ctaBannerTitle}>Charge for delivery.<br />Skip the paperwork.</h2>
        <p className={s.ctaBannerSub}>
          Try MeetingFlash on your last client call. No signup needed for the first one.
        </p>
        <Link href="/app?template=status" className={s.btnPrimary}>Run your first Flash free →</Link>
      </section>

      <footer className={s.miniFooter}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/for-agencies">For agencies</Link>
        <Link href="/for-product-teams">For product teams</Link>
        <Link href="/pricing">Pricing</Link>
        <div style={{ marginTop: 16 }}>© 2026 MeetingFlash · hello@meetingflash.work</div>
      </footer>
    </div>
  )
}
