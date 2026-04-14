'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import HeroCta from '@/components/HeroCta'
import FooterAccount from '@/components/FooterAccount'
import s from './page.module.css'

// ── LIVE DEMO DATA ──────────────────────────────────────────
const RAW_NOTES = [
  "Sarah: Launch pushed to April 28th",
  "Tom: I'll send feature list by Friday",
  "Lisa: Press release draft by Wednesday",
  "Decision: freeze tool subscriptions Q2",
  "David: budget projection by Thursday",
  "Interviews start April 22nd",
]

const OUTPUTS = [
  { type: 'decision', color: 'blue',  icon: '📌', text: 'Launch set for April 28th' },
  { type: 'action',   color: 'green', icon: '✓',  text: 'Tom → Feature list (by Friday)' },
  { type: 'action',   color: 'green', icon: '✓',  text: 'Lisa → Press release (by Wed)' },
  { type: 'decision', color: 'blue',  icon: '📌', text: 'Tool subscriptions frozen Q2' },
  { type: 'action',   color: 'green', icon: '✓',  text: 'David → Budget projection (Thu)' },
  { type: 'risk',     color: 'amber', icon: '⚠',  text: 'Interview timeline tight' },
]

const LOGOS = ['Notion', 'Slack', 'Linear', 'Figma', 'Vercel', 'Stripe', 'Loom', 'Asana', 'Jira', 'Zoom']

const TESTIMONIALS = [
  {
    text: "We cut post-meeting admin time by 80%. The follow-up email alone saves us 20 minutes per meeting.",
    name: "Sarah K.",
    role: "Ops Lead · SaaS startup"
  },
  {
    text: "Finally a tool that actually does something useful with meeting notes. Not just a summary — actual deliverables.",
    name: "Marcus T.",
    role: "Product Manager · Fintech"
  },
  {
    text: "The project memory feature is a game changer. I can search across 3 months of meetings in seconds.",
    name: "Lena R.",
    role: "Agency founder"
  },
  {
    text: "My clients get a professional recap within minutes of the call ending. It changed how they perceive my work.",
    name: "David M.",
    role: "Freelance consultant"
  },
  {
    text: "We used to spend 30 minutes writing meeting notes. Now it's done before we leave the room.",
    name: "Priya S.",
    role: "Engineering Lead · Series B"
  },
  {
    text: "The Slack message output alone is worth the subscription. Exactly what I'd write, instantly.",
    name: "James L.",
    role: "CEO · Remote-first startup"
  },
]

function LiveDemo() {
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  function start() {
    if (running) return
    setRunning(true)
    setDone(false)
    setStep(0)
    let i = 0
    const t = setInterval(() => {
      i++
      setStep(i)
      if (i >= OUTPUTS.length) {
        clearInterval(t)
        setDone(true)
        setRunning(false)
      }
    }, 400)
  }

  function reset() {
    setStep(0)
    setDone(false)
    setRunning(false)
  }

  return (
    <div className={s.demo}>
      <div className={s.demoLeft}>
        <div className={s.demoLabel}>
          <div className={s.demoDot} />
          Raw meeting notes
        </div>
        <div className={s.demoNotes}>
          {RAW_NOTES.map((note, i) => (
            <div
              key={i}
              className={`${s.demoNote} ${step > i ? s.demoNoteProcessed : ''}`}
            >
              {step > i && <span className={s.demoNoteCheck}>✓</span>}
              {note}
            </div>
          ))}
        </div>
      </div>

      <div className={s.demoCenter}>
        <button
          className={`${s.demoRunBtn} ${running ? s.demoRunBtnActive : ''}`}
          onClick={done ? reset : start}
          disabled={running}
        >
          {running ? (
            <span className={s.demoSpinner} />
          ) : done ? (
            '↺ Reset'
          ) : (
            <>
              <span className={s.demoFlashIcon} />
              Flash
            </>
          )}
        </button>
        {running && (
          <div className={s.demoProcessing}>Processing…</div>
        )}
      </div>

      <div className={s.demoRight}>
        <div className={s.demoLabel}>
          <div className={`${s.demoDot} ${s.demoDotBlue}`} />
          Execution Pack
        </div>
        <div className={s.demoOutputs}>
          {OUTPUTS.map((out, i) => (
            <div
              key={i}
              className={`${s.demoOutput} ${step > i ? s.demoOutputVisible : ''} ${s[`demoOutput_${out.color}`]}`}
            >
              <span className={s.demoOutputIcon}>{out.icon}</span>
              <span className={s.demoOutputText}>{out.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const revealRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    revealRef.current = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add(s.visible) }),
      { threshold: 0.1 }
    )
    document.querySelectorAll(`.${s.reveal}`).forEach(el => revealRef.current?.observe(el))
    return () => revealRef.current?.disconnect()
  }, [])

  return (
    <div className={s.root}>
      {/* AMBIENT */}
      <div className={s.ambient}>
        <div className={s.ambientBlob1} />
        <div className={s.ambientBlob2} />
      </div>

      <MobileNav />

      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={s.heroBadge}>
          <span className={s.heroBadgeDot} />
          Post-meeting execution layer
        </div>

        <h1 className={s.h1}>
          Turn meeting notes into<br />
          <span className={s.h1Accent}>execution — instantly.</span>
        </h1>

        <p className={s.heroSub}>
          Paste your notes. Get decisions, tasks, follow-up email,
          Slack message and next agenda in under 20 seconds.
          No prompts. No setup.
        </p>

        <div className={s.heroActions}>
          <HeroCta className={s.btnPrimary} />
          <Link href="#demo" className={s.btnGhost}>See it live ↓</Link>
        </div>

        <div className={s.heroStats}>
          <div className={s.heroStat}>
            <span className={s.heroStatN}>20s</span>
            <span className={s.heroStatL}>avg. time</span>
          </div>
          <div className={s.heroStatDiv} />
          <div className={s.heroStat}>
            <span className={s.heroStatN}>7</span>
            <span className={s.heroStatL}>outputs generated</span>
          </div>
          <div className={s.heroStatDiv} />
          <div className={s.heroStat}>
            <span className={s.heroStatN}>0</span>
            <span className={s.heroStatL}>setup needed</span>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO ── */}
      <section className={s.demoSection} id="demo">
        <div className={`${s.demoWrap} ${s.reveal}`}>
          <div className={s.demoHeader}>
            <div className={s.sectionPill}>Live demo</div>
            <h2 className={s.demoTitle}>Watch it work</h2>
            <p className={s.demoSub}>Click Flash and watch raw notes become an Execution Pack in real time.</p>
          </div>
          <LiveDemo />
        </div>
      </section>

      {/* ── LOGOS ── */}
      <div className={s.logoBar}>
        <div className={s.logoBarLabel}>Trusted by teams using</div>
        <div className={s.logoTrack}>
          <div className={s.logoInner}>
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <span key={i} className={s.logoItem}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES BENTO ── */}
      <section className={s.features} id="features">
        <div className={`${s.sectionPill} ${s.reveal}`}>Features</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>
          Everything after the meeting,<br />handled automatically.
        </h2>

        <div className={`${s.bento} ${s.reveal}`}>
          <div className={`${s.bentoCard} ${s.bentoCardLarge} ${s.bentoCardBlue}`}>
            <div className={s.bentoIcon}>⚡</div>
            <h3 className={s.bentoTitle}>Execution Pack</h3>
            <p className={s.bentoDesc}>7 ready-to-use outputs from one paste. Decisions, tasks with owners, open questions, risks, follow-up email, Slack message, and next agenda.</p>
            <div className={s.bentoBadges}>
              <span className={s.bentoBadge}>Decisions</span>
              <span className={s.bentoBadge}>Action Items</span>
              <span className={s.bentoBadge}>Follow-up Email</span>
              <span className={s.bentoBadge}>Slack Message</span>
            </div>
          </div>

          <div className={`${s.bentoCard} ${s.bentoCardGreen}`}>
            <div className={s.bentoIcon}>🧠</div>
            <h3 className={s.bentoTitle}>Project Memory</h3>
            <p className={s.bentoDesc}>Every decision tracked across meetings. Never wonder what was agreed 3 weeks ago.</p>
          </div>

          <div className={`${s.bentoCard}`}>
            <div className={s.bentoIcon}>🔒</div>
            <h3 className={s.bentoTitle}>Private by design</h3>
            <p className={s.bentoDesc}>Transcripts processed and discarded. Never stored. Never used for training.</p>
          </div>

          <div className={`${s.bentoCard}`}>
            <div className={s.bentoIcon}>🌍</div>
            <h3 className={s.bentoTitle}>Any language</h3>
            <p className={s.bentoDesc}>Input in any language. Output in English, French, Spanish, German, or any other.</p>
          </div>

          <div className={`${s.bentoCard} ${s.bentoCardAmber}`}>
            <div className={s.bentoIcon}>📋</div>
            <h3 className={s.bentoTitle}>Task Tracker</h3>
            <p className={s.bentoDesc}>Action items automatically extracted with owners, deadlines, and priority. Track status across meetings.</p>
          </div>

          <div className={`${s.bentoCard}`}>
            <div className={s.bentoIcon}>🔍</div>
            <h3 className={s.bentoTitle}>Smart Search</h3>
            <p className={s.bentoDesc}>Search across all your meetings instantly. Find any decision or commitment in seconds.</p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className={s.compare} id="compare">
        <div className={`${s.sectionPill} ${s.reveal}`}>Why MeetingFlash</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>
          ChatGPT writes.<br />
          <span className={s.titleAccent}>MeetingFlash executes.</span>
        </h2>

        <div className={`${s.compareGrid} ${s.reveal}`}>
          <div className={s.compareCard}>
            <div className={s.compareCardHead}>ChatGPT / Generic AI</div>
            {[
              'Requires a well-crafted prompt every time',
              'Forgets everything after the session',
              'Returns unstructured text to reformat',
              'No project context or meeting history',
              'You still have to write the follow-up email',
            ].map(t => (
              <div key={t} className={s.compareRow}>
                <span className={s.compareCross}>✕</span>{t}
              </div>
            ))}
          </div>
          <div className={`${s.compareCard} ${s.compareCardFeatured}`}>
            <div className={s.compareCardHead}>MeetingFlash</div>
            {[
              'Zero prompts — paste and get results',
              'Remembers all decisions across meetings',
              '7 structured, copy-ready outputs',
              'Full project memory and history',
              'Follow-up email generated and ready to send',
            ].map(t => (
              <div key={t} className={s.compareRow}>
                <span className={s.compareCheck}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ── TESTIMONIALS ── */}
<section className={s.testimonials}>
  <div className={`${s.sectionPill} ${s.reveal}`}>What teams say</div>
  <h2 className={`${s.sectionTitle} ${s.reveal}`}>
    Loved by teams who run<br />back-to-back meetings.
  </h2>
  <div className={`${s.testimonialsTrack} ${s.reveal}`}>
    <div className={s.testimonialsInner}>
      {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
        <div key={i} className={s.testimonialCard}>
          <div className={s.testimonialStars}>{'★'.repeat(5)}</div>
          <p className={s.testimonialText}>{t.text}</p>
          <div className={s.testimonialAuthor}>
            <div className={s.testimonialAvatar}>{t.name[0]}</div>
            <div>
              <div className={s.testimonialName}>{t.name}</div>
              <div className={s.testimonialRole}>{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ── PRICING ── */}
      <section className={s.pricing} id="pricing">
        <div className={`${s.sectionPill} ${s.reveal}`}>Pricing</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>Simple. Honest. No surprises.</h2>
        <p className={`${s.pricingSub} ${s.reveal}`}>Start free. Upgrade when you're ready.</p>

        <div className={`${s.pricingGrid} ${s.reveal}`}>
          <div className={s.priceCard}>
            <div className={s.planName}>Free</div>
            <div className={s.planPrice}>€0</div>
            <div className={s.planPeriod}>Forever</div>
            <ul className={s.planFeats}>
              {['3 Execution Packs / month', 'All 7 outputs', 'EN + FR + ES', 'Copy to clipboard'].map(f => (
                <li key={f}><span className={s.featCheck}>✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/app" className={s.planBtnFree}>Start free →</Link>
          </div>

          <div className={`${s.priceCard} ${s.priceCardFeatured}`}>
            <div className={s.planBadge}>Most popular</div>
            <div className={s.planName}>Pro</div>
            <div className={s.planPrice}>$10</div>
            <div className={s.planPeriod}>per month · cancel anytime</div>
            <ul className={s.planFeats}>
              {['Unlimited packs', 'Project memory', 'Full history + search', 'All languages', 'PDF + Notion export', 'Priority processing'].map(f => (
                <li key={f}><span className={s.featCheck}>✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/signup" className={s.planBtnPro}>Go Pro →</Link>
          </div>

          <div className={s.priceCard}>
            <div className={s.planName}>Team</div>
            <div className={s.planPrice}>$25</div>
            <div className={s.planPeriod}>5 seats · per month</div>
            <ul className={s.planFeats}>
              {['Everything in Pro', 'Shared project memory', 'Team dashboard', 'Slack + Notion sync', 'Priority support'].map(f => (
                <li key={f}><span className={s.featCheck}>✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/signup" className={s.planBtnFree}>Start team trial →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={s.ctaBanner}>
        <div className={s.ctaGlow} />
        <h2 className={`${s.ctaBannerTitle} ${s.reveal}`}>
          Your next meeting ends<br />with total clarity.
        </h2>
        <p className={`${s.ctaBannerSub} ${s.reveal}`}>
          Join teams who never leave a meeting without a complete execution plan.
        </p>
        <HeroCta className={`${s.btnPrimary} ${s.reveal}`} />
      </section>

      {/* ── FOOTER ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <Link href="/" className={s.footerLogo}>
              <div className={s.footerLogoMark} />
              MeetingFlash
            </Link>
            <p className={s.footerTagline}>
              Built for teams who believe every meeting<br />should end with total clarity.
            </p>
          </div>
          <div className={s.footerCols}>
            <div className={s.footerCol}>
              <div className={s.footerColTitle}>Product</div>
              <Link href="#features">Features</Link>
              <Link href="#pricing">Pricing</Link>
              <Link href="/app">Try free</Link>
            </div>
            <FooterAccount className={s.footerCol} colTitleClass={s.footerColTitle} />
            <div className={s.footerCol}>
              <div className={s.footerColTitle}>Legal</div>
              <a href="/privacy" target="_blank" rel="noopener">Privacy</a>
              <a href="/terms" target="_blank" rel="noopener">Terms</a>
            </div>
          </div>
        </div>
        <div className={s.footerBottom}>
          <span>© 2026 MeetingFlash</span>
          <span className={s.footerAccent}>Built differently.</span>
        </div>
      </footer>
    </div>
  )
}