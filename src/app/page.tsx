'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import HeroCta from '@/components/HeroCta'
import FooterAccount from '@/components/FooterAccount'
import ProductShowcase from '@/components/ProductShowcase'
import s from './page.module.css'

const LOGOS = ['Notion', 'Slack', 'Linear', 'Figma', 'Loom', 'Asana', 'Jira', 'Zoom', 'Google Meet', 'Teams']

export default function Home() {
  const revealRef = useRef<IntersectionObserver | null>(null)
  const [annual, setAnnual] = useState(false)

  useEffect(() => {
    revealRef.current = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add(s.visible) }),
      { threshold: 0.1 }
    )
    document.querySelectorAll(`.${s.reveal}`).forEach(el => revealRef.current?.observe(el))
    return () => revealRef.current?.disconnect()
  }, [])

  function MiniBeforeAfter() {
    return (
      <div className={s.miniDemo}>
        <div className={s.miniDemoLeft}>
          <div className={s.miniDemoTag}>Raw notes</div>
          <div className={s.miniDemoContent}>
            <span className={s.miniLine}>Sarah: launch April 28th</span>
            <span className={s.miniLine}>Tom: feature list by Friday</span>
            <span className={s.miniLine}>freeze tool subscriptions Q2</span>
            <span className={s.miniLine}>interviews start April 22nd</span>
          </div>
        </div>

        <div className={s.miniDemoArrow}>
          <div className={s.miniDemoArrowLine} />
          <div className={s.miniDemoArrowLabel}>20 seconds</div>
          <div className={s.miniDemoArrowIcon}>⚡</div>
        </div>

        <div className={s.miniDemoRight}>
          <div className={s.miniDemoTag} style={{color:'var(--blue3)'}}>Execution Pack</div>
          <div className={s.miniDemoContent}>
            <span className={s.miniOutput} style={{color:'var(--blue3)'}}>📌 Launch set for April 28th</span>
            <span className={s.miniOutput} style={{color:'var(--green)'}}>✓ Tom → Feature list (Fri)</span>
            <span className={s.miniOutput} style={{color:'var(--green)'}}>✓ Freeze subscriptions Q2</span>
            <span className={s.miniOutput} style={{color:'#FCD34D)'}}>⚠ Interview timeline tight</span>
          </div>
        </div>
      </div>
    )
  }

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
          For agencies, freelancers & small teams
        </div>

        <h1 className={s.h1}>
          Send a client-ready meeting recap<br />
          <span className={s.h1Accent}>before they finish their coffee.</span>
        </h1>

        <p className={s.heroSub}>
          Paste your notes. Get decisions, tasks, follow-up email,
          Slack message and next agenda in under 20 seconds.
          No prompts, no setup, no recordings stored.
        </p>

        <div className={s.heroActions}>
          <HeroCta className={s.btnPrimary} />
          <Link href="#features" className={s.btnGhost}>See how it works ↓</Link>
        </div>

        <div className={s.heroStats}>
          <div className={s.heroStat}>
            <span className={s.heroStatN}>20s</span>
            <span className={s.heroStatL}>avg. time</span>
          </div>
          <MiniBeforeAfter />

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

      {/* ── PRODUCT SHOWCASE ── */}
      <ProductShowcase />

      {/* ── LOGOS ── */}
      <div className={s.logoBar}>
        <div className={s.logoBarLabel}>Works alongside your existing stack</div>
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

{/* ── FOR AGENCIES ── */}
<section className={s.agencySection} id="agencies">
  <div className={`${s.sectionPill} ${s.reveal}`}>For agencies</div>
  <h2 className={`${s.sectionTitle} ${s.reveal}`}>
    Built for the way<br />agencies actually work.
  </h2>
  <p className={`${s.agencyLede} ${s.reveal}`}>
    Discovery calls, client status updates, sprint retros — turned into a client-ready recap before you leave the meeting room.
  </p>

  <div className={`${s.agencyGrid} ${s.reveal}`}>
    <div className={s.agencyPainList}>
      <div className={s.agencyPain}>
        <div className={s.agencyPainIcon}>🎯</div>
        <div>
          <div className={s.agencyPainTitle}>Discovery → recap, instantly.</div>
          <div className={s.agencyPainDesc}>
            No more &quot;I&apos;ll send a summary tomorrow.&quot; Every prospect call ends with a polished recap in their inbox before they leave the meeting.
          </div>
        </div>
      </div>
      <div className={s.agencyPain}>
        <div className={s.agencyPainIcon}>📋</div>
        <div>
          <div className={s.agencyPainTitle}>Status updates without the admin.</div>
          <div className={s.agencyPainDesc}>
            Paste your weekly notes — get a client-ready update with decisions, blockers, and next steps already framed.
          </div>
        </div>
      </div>
      <div className={s.agencyPain}>
        <div className={s.agencyPainIcon}>🔁</div>
        <div>
          <div className={s.agencyPainTitle}>Project memory across calls.</div>
          <div className={s.agencyPainDesc}>
            Decisions and action items from every meeting persist in the project — so you walk into call #4 already knowing what was promised in call #1.
          </div>
        </div>
      </div>
    </div>

    <div className={s.agencyMockup}>
      <div className={s.agencyMockupHead}>
        <div className={s.agencyMockupDots}>
          <span /><span /><span />
        </div>
        <div className={s.agencyMockupTitle}>Discovery call · Acme Corp</div>
      </div>
      <div className={s.agencyMockupBody}>
        <div className={`${s.agencyBlock} ${s.agencyBlockBlue}`}>
          <div className={s.agencyBlockLabel}>Decisions</div>
          <div className={s.agencyBlockContent}>
            • Scope locked: e-commerce rebuild, 12-week timeline<br />
            • Budget approved at $48k, paid in 3 milestones<br />
            • Kickoff scheduled for May 6th
          </div>
        </div>
        <div className={`${s.agencyBlock} ${s.agencyBlockGreen}`}>
          <div className={s.agencyBlockLabel}>Action items</div>
          <div className={s.agencyBlockContent}>
            ✓ <strong>You</strong> → Send SOW + first invoice (Mon)<br />
            ✓ <strong>Sarah (Acme)</strong> → Share brand assets &amp; access (Tue)<br />
            ✓ <strong>You</strong> → Set up Slack channel + project doc (Wed)
          </div>
        </div>
        <div className={`${s.agencyBlock} ${s.agencyBlockPaper}`}>
          <div className={s.agencyBlockLabel}>Follow-up email</div>
          <div className={s.agencyBlockContent}>
            Hi Sarah, great speaking today. Confirming we&apos;re aligned on the 12-week scope and $48k budget across 3 milestones. Kickoff May 6th. I&apos;ll send the SOW &amp; first invoice Monday — you&apos;ll share brand assets Tuesday…
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className={`${s.agencyCta} ${s.reveal}`}>
    <Link href="/app" className={s.btnPrimary}>Try it on a discovery call →</Link>
    <span className={s.agencyCtaNote}>No signup needed for the first one.</span>
  </div>
</section>

{/* ── OUTCOMES ── */}
<section className={s.testimonials}>
  <div className={`${s.sectionPill} ${s.reveal}`}>What changes</div>
  <h2 className={`${s.sectionTitle} ${s.reveal}`}>
    What changes when you stop<br />writing recaps yourself.
  </h2>
  <div className={`${s.bento} ${s.reveal}`} style={{ maxWidth: 1100, margin: '40px auto 0' }}>
    <div className={`${s.bentoCard} ${s.bentoCardBlue}`}>
      <div className={s.bentoIcon}>⏱</div>
      <h3 className={s.bentoTitle}>20 minutes back per meeting</h3>
      <p className={s.bentoDesc}>
        That's the time it takes most people to type a recap, format an email, and copy actions into Slack. You stop doing it.
      </p>
    </div>
    <div className={`${s.bentoCard} ${s.bentoCardGreen}`}>
      <div className={s.bentoIcon}>🎯</div>
      <h3 className={s.bentoTitle}>Every action has an owner</h3>
      <p className={s.bentoDesc}>
        No more "who was supposed to do this?" three weeks later. Tasks come out with name, deadline, priority — by default.
      </p>
    </div>
    <div className={`${s.bentoCard} ${s.bentoCardAmber}`}>
      <div className={s.bentoIcon}>📤</div>
      <h3 className={s.bentoTitle}>Recap sent before the next meeting</h3>
      <p className={s.bentoDesc}>
        The follow-up email goes out the same minute the call ends. Clients perceive you differently when you respond at machine speed.
      </p>
    </div>
  </div>
  <div className={`${s.reveal}`} style={{ textAlign: 'center', maxWidth: 620, margin: '40px auto 0', padding: '24px 28px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>From the maker</div>
    <p style={{ color: 'var(--text)', fontSize: 15, lineHeight: 1.65, marginBottom: 12 }}>
      I built MeetingFlash because I was tired of writing the same recap email three times a week.
      I&apos;m Simon — solo founder, no VC, no growth-hacking nonsense. If something breaks or you have an idea,
      reply to <a href="mailto:hello@meetingflash.work" style={{ color: 'var(--blue3)', textDecoration: 'none', fontWeight: 600 }}>hello@meetingflash.work</a>{' '}
      and you&apos;ll get me directly.
    </p>
    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
      No fake quotes here — try it on your next meeting and tell me what you think.
    </div>
  </div>
</section>

      {/* ── PRICING ── */}
      <section className={s.pricing} id="pricing">
        <div className={`${s.sectionPill} ${s.reveal}`}>Pricing</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>Simple. Honest. No surprises.</h2>
        <p className={`${s.pricingSub} ${s.reveal}`}>Start free. Upgrade when you're ready.</p>

        <div className={`${s.reveal}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:32 }}>
          <span style={{ color: !annual ? 'var(--text)' : 'var(--muted)', fontSize:14, fontWeight:500 }}>Monthly</span>
          <button
            onClick={() => setAnnual(a => !a)}
            style={{ position:'relative', width:44, height:24, borderRadius:12, background: annual ? 'var(--blue)' : 'var(--surface2)', border:'1px solid var(--border)', cursor:'pointer', transition:'background 0.2s' }}
          >
            <span style={{ position:'absolute', top:3, left: annual ? 22 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
          </button>
          <span style={{ color: annual ? 'var(--text)' : 'var(--muted)', fontSize:14, fontWeight:500 }}>
            Annual <span style={{ color:'var(--green)', fontSize:12, fontWeight:600 }}>Save 20%</span>
          </span>
        </div>

        <div className={`${s.pricingGrid} ${s.reveal}`}>
          <div className={s.priceCard}>
            <div className={s.planName}>Free</div>
            <div className={s.planPrice}>$0</div>
            <div className={s.planPeriod}>Forever</div>
            <ul className={s.planFeats}>
              {['5 Execution Packs / month', 'All 7 outputs', 'English output', '1 project', 'Copy to clipboard'].map(f => (
                <li key={f}><span className={s.featCheck}>✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/app" className={s.planBtnFree}>Start free →</Link>
          </div>

          <div className={`${s.priceCard} ${s.priceCardFeatured}`}>
            <div className={s.planBadge}>Most popular</div>
            <div className={s.planName}>Pro</div>
            <div className={s.planPrice}>{annual ? '$8' : '$12'}</div>
            <div className={s.planPeriod}>{annual ? 'per month · billed $96/yr' : 'per month · cancel anytime'}</div>
            <ul className={s.planFeats}>
              {['Unlimited Execution Packs', 'Unlimited projects + project memory', 'Smart search across meetings', 'Output in EN, FR, ES, DE', 'PDF export', 'Priority email support'].map(f => (
                <li key={f}><span className={s.featCheck}>✓</span>{f}</li>
              ))}
            </ul>
              <button
                className={s.planBtnPro}
                onClick={async () => {
                  const priceId = annual
                    ? process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID
                    : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priceId, email: '' })
                  })
                  const { url } = await res.json()
                  if (url) window.location.href = url
                }}
              >
                Go Pro →
              </button>
          </div>

          <div className={s.priceCard}>
            <div className={s.planName}>Team</div>
            <div className={s.planPrice} style={{ fontSize: 28, color: 'var(--muted)', fontWeight: 600 }}>Coming soon</div>
            <div className={s.planPeriod}>Shared workspaces & seats</div>
            <ul className={s.planFeats}>
              {['Shared project memory', 'Team workspace', 'Per-seat billing', 'Get notified on launch'].map(f => (
                <li key={f}><span className={s.featCheck}>·</span>{f}</li>
              ))}
            </ul>
            <a
              href="mailto:hello@meetingflash.work?subject=Team%20plan%20interest"
              className={s.planBtnFree}
              style={{ textAlign: 'center' }}
            >
              Notify me →
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={s.testimonials} id="faq" style={{ paddingBottom: 40 }}>
        <div className={`${s.sectionPill} ${s.reveal}`}>FAQ</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>Honest answers,<br />before you ask.</h2>
        <div className={`${s.reveal}`} style={{ maxWidth: 760, margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              q: 'How accurate is it on messy notes?',
              a: 'It handles bullet points, half-sentences, and "Sarah said launch April 28" style fragments well. If your notes don\'t mention a deadline, MeetingFlash won\'t invent one — it leaves the field blank rather than guessing. Garbage-in still produces a structured pack, just with fewer details.'
            },
            {
              q: 'Where do my notes go?',
              a: 'Transcripts are sent to Anthropic\'s Claude API, processed in-memory, and discarded — never stored on Anthropic\'s side or used for training. The generated Pack (decisions, actions, etc.) is stored in your account on Supabase (EU region) so you can come back to it. You can delete any pack in one click, and your full account from Settings.'
            },
            {
              q: 'Which languages work?',
              a: 'Input can be in any language. Output is currently English (Free plan) or English / French / Spanish / German (Pro). More languages coming as users request them.'
            },
            {
              q: 'What happens if I cancel?',
              a: 'You drop back to the Free plan: your account, all past packs, and projects stay accessible. You\'re just capped to 5 packs/month again. No data deletion, no lockout. Cancel from your Stripe portal in two clicks.'
            },
            {
              q: 'Is "Built solo" a problem for reliability?',
              a: 'It means MeetingFlash runs on the same infra as much bigger products — Vercel, Supabase, Stripe, Anthropic. The site itself is small enough that it doesn\'t go down for the reasons big SaaS does. If it ever does, email me and I\'ll have eyes on it within hours.'
            },
            {
              q: 'Why no Team plan yet?',
              a: 'Because building shared workspaces, per-seat billing, and Slack/Notion sync the right way takes weeks of focused work. I\'d rather ship a Pro plan that works than a Team plan that half-works. If you need Team features now, email me — I\'ll prioritize based on what real users actually want.'
            },
          ].map((item, i) => (
            <details
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '18px 22px',
                cursor: 'pointer',
              }}
            >
              <summary style={{
                listStyle: 'none',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}>
                <span>{item.q}</span>
                <span style={{ color: 'var(--muted)', fontSize: 18, flexShrink: 0 }}>+</span>
              </summary>
              <p style={{
                color: 'var(--muted)',
                fontSize: 14,
                lineHeight: 1.7,
                marginTop: 14,
                paddingTop: 14,
                borderTop: '1px solid var(--border)',
              }}>{item.a}</p>
            </details>
          ))}
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