'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import HeroCta from '@/components/HeroCta'
import ProductShowcase from '@/components/ProductShowcase'
import PricingCards from '@/components/PricingCards'
import DiscoveryMockup from '@/components/DiscoveryMockup'
import SiteFooter from '@/components/SiteFooter'
import HeroDemo from '@/components/HeroDemo'
import { Layers, Brain, Lock, Globe, ClipboardList, Search, Link2, Target, RefreshCw, Timer, Send, ArrowRight, ArrowDown, Plus } from 'lucide-react'
import s from './page.module.css'

const LOGOS = ['Notion', 'Slack', 'Linear', 'Figma', 'Loom', 'Asana', 'Jira', 'Zoom', 'Google Meet', 'Teams']

const FAQ_ITEMS = [
  {
    q: 'How accurate is it on messy notes?',
    a: 'It handles bullet points, half-sentences, and "Sarah said launch April 28" style fragments well. If your notes don\'t mention a deadline, MeetingFlash won\'t invent one — it leaves the field blank rather than guessing. Garbage-in still produces a structured pack, just with fewer details.',
  },
  {
    q: 'Where do my notes go?',
    a: 'Your notes are sent to Anthropic\'s Claude API to generate the pack — Anthropic processes them in-memory and never stores them or uses them for training. If you\'re signed in, the generated Pack and your original notes are saved in your account (Supabase, EU region) so you can come back to them; guest flashes aren\'t saved at all. You can delete any pack in one click, and your full account from Settings.',
  },
  {
    q: 'Can I send a recap to a client who has no account?',
    a: 'Yes. Every Execution Pack has a one-click Share button that creates a public read-only link — your client opens it in a browser, no signup, no login, nothing to install. Pro plans can also export the same recap as a clean PDF for formal deliverables. You can revoke a link at any time by deleting the pack.',
  },
  {
    q: 'Which languages work?',
    a: 'Input can be in any language. Output is currently English (Free plan) or English / French / Spanish / German (Pro). More languages coming as users request them.',
  },
  {
    q: 'What happens if I cancel?',
    a: 'You drop back to the Free plan: your account, all past packs, and projects stay accessible. You\'re just capped to 5 packs/month again. No data deletion, no lockout. Cancel from your Stripe portal in two clicks.',
  },
  {
    q: 'Is "Built solo" a problem for reliability?',
    a: 'It means MeetingFlash runs on the same infra as much bigger products — Vercel, Supabase, Stripe, Anthropic. The site itself is small enough that it doesn\'t go down for the reasons big SaaS does. If it ever does, email me and I\'ll have eyes on it within hours.',
  },
  {
    q: 'Why no Team plan yet?',
    a: 'Because building shared workspaces, per-seat billing, and Slack/Notion sync the right way takes weeks of focused work. I\'d rather ship a Pro plan that works than a Team plan that half-works. If you need Team features now, email me — I\'ll prioritize based on what real users actually want.',
  },
]

const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MeetingFlash',
    url: 'https://www.meetingflash.work',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.meetingflash.work/blog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'MeetingFlash',
    description: 'AI-powered post-meeting execution tool. Paste raw meeting notes, get decisions, action items, follow-up email, Slack message, and next agenda in under 20 seconds.',
    url: 'https://www.meetingflash.work',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: '5 Execution Packs per month, English output, 1 project',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '12',
        priceCurrency: 'USD',
        description: 'Unlimited packs, project memory, smart search, EN/FR/ES/DE output, PDF export',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  },
]

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />
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
          Send a client-ready meeting recap <span className={s.h1Accent}>before they finish their coffee.</span>
        </h1>

        <p className={s.heroSub}>
          Paste your notes. Get decisions, tasks, follow-up email,
          Slack message and next agenda in under 20 seconds.
          No prompts, no setup, no recordings stored.
        </p>

        <div className={s.heroActions}>
          <HeroCta className={s.btnPrimary} />
          <Link href="#features" className={s.btnGhost}>See how it works <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" /></Link>
        </div>

        <div className={s.heroStats}>
          <div className={s.heroStat}>
            <span className={s.heroStatN}>20s</span>
            <span className={s.heroStatL}>avg. time</span>
          </div>
          <HeroDemo />

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
          Everything after the meeting, handled automatically.
        </h2>

        <div className={`${s.bento} ${s.reveal}`}>
          <div className={`${s.bentoCard} ${s.bentoCardLarge} ${s.bentoCardBlue}`}>
            <div className={s.bentoIcon}><Layers size={24} strokeWidth={1.75} aria-hidden="true" /></div>
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
            <div className={s.bentoIcon}><Brain size={24} strokeWidth={1.75} aria-hidden="true" /></div>
            <h3 className={s.bentoTitle}>Project Memory</h3>
            <p className={s.bentoDesc}>Every decision tracked across meetings. Never wonder what was agreed 3 weeks ago.</p>
          </div>

          <div className={`${s.bentoCard}`}>
            <div className={s.bentoIcon}><Lock size={24} strokeWidth={1.75} aria-hidden="true" /></div>
            <h3 className={s.bentoTitle}>Private by design</h3>
            <p className={s.bentoDesc}>No bot joins your calls. Your notes stay in your account and are never used to train AI models.</p>
          </div>

          <div className={`${s.bentoCard}`}>
            <div className={s.bentoIcon}><Globe size={24} strokeWidth={1.75} aria-hidden="true" /></div>
            <h3 className={s.bentoTitle}>Any language</h3>
            <p className={s.bentoDesc}>Input in any language. Output in English, French, Spanish, German, or any other.</p>
          </div>

          <div className={`${s.bentoCard} ${s.bentoCardAmber}`}>
            <div className={s.bentoIcon}><ClipboardList size={24} strokeWidth={1.75} aria-hidden="true" /></div>
            <h3 className={s.bentoTitle}>Task Tracker</h3>
            <p className={s.bentoDesc}>Action items automatically extracted with owners, deadlines, and priority. Track status across meetings.</p>
          </div>

          <div className={`${s.bentoCard}`}>
            <div className={s.bentoIcon}><Search size={24} strokeWidth={1.75} aria-hidden="true" /></div>
            <h3 className={s.bentoTitle}>Smart Search</h3>
            <p className={s.bentoDesc}>Search across all your meetings instantly. Find any decision or commitment in seconds.</p>
          </div>

          <div className={`${s.bentoCard}`}>
            <div className={s.bentoIcon}><Link2 size={24} strokeWidth={1.75} aria-hidden="true" /></div>
            <h3 className={s.bentoTitle}>Client-ready share links</h3>
            <p className={s.bentoDesc}>Send any recap as a clean public link — read-only, no account needed on their side. Or export a formatted PDF.</p>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className={s.compare} id="compare">
        <div className={`${s.sectionPill} ${s.reveal}`}>Why MeetingFlash</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>
          Why not just paste it <span className={s.titleAccent}>into ChatGPT?</span>
        </h2>

        <p className={`${s.compareLede} ${s.reveal}`}>
          You can. Here is what the next twenty minutes look like in each case.
        </p>

        <div className={`${s.compareGrid} ${s.reveal}`}>
          <div className={s.compareCard}>
            <div className={s.compareCardHead}>With a general-purpose AI</div>
            {[
              ['Write a prompt explaining the format you want', '~3 min'],
              ['Paste the transcript, wait, reformat the output', '~8 min'],
              ['Draft the follow-up email from the summary', '~7 min'],
              ['Retype the action items into your task tracker', '~4 min'],
              ['Next meeting, it remembers none of this', 'every time'],
            ].map(([t, d]) => (
              <div key={t} className={s.compareRow}>
                <span>{t}</span>
                <span className={s.compareTime}>{d}</span>
              </div>
            ))}
            <div className={s.compareTotal}>Roughly 20 minutes, after every meeting</div>
          </div>
          <div className={`${s.compareCard} ${s.compareCardFeatured}`}>
            <div className={s.compareCardHead}>With MeetingFlash</div>
            {[
              ['Paste your raw notes as they are', '5 sec'],
              ['Get all 7 outputs, formatted and ready', '20 sec'],
              ['Send the email, post the Slack message', '~1 min'],
              ['Decisions and tasks carry into the next call', 'automatic'],
            ].map(([t, d]) => (
              <div key={t} className={s.compareRow}>
                <span>{t}</span>
                <span className={s.compareTime}>{d}</span>
              </div>
            ))}
            <div className={s.compareTotal}>About 90 seconds, then you move on</div>
          </div>
        </div>
      </section>

{/* ── FOR AGENCIES ── */}
<section className={s.agencySection} id="agencies">
  <div className={`${s.sectionPill} ${s.reveal}`}>For agencies</div>
  <h2 className={`${s.sectionTitle} ${s.reveal}`}>
    Built for the way agencies actually work.
  </h2>
  <p className={`${s.agencyLede} ${s.reveal}`}>
    Discovery calls, client status updates, sprint retros — turned into a client-ready recap before you leave the meeting room.
  </p>

  <div className={`${s.agencyGrid} ${s.reveal}`}>
    <div className={s.agencyPainList}>
      <div className={s.agencyPain}>
        <div className={s.agencyPainIcon}><Target size={22} strokeWidth={1.75} aria-hidden="true" /></div>
        <div>
          <div className={s.agencyPainTitle}>Discovery → recap, instantly.</div>
          <div className={s.agencyPainDesc}>
            No more &quot;I&apos;ll send a summary tomorrow.&quot; Every prospect call ends with a polished recap in their inbox before they leave the meeting.
          </div>
        </div>
      </div>
      <div className={s.agencyPain}>
        <div className={s.agencyPainIcon}><ClipboardList size={22} strokeWidth={1.75} aria-hidden="true" /></div>
        <div>
          <div className={s.agencyPainTitle}>Status updates without the admin.</div>
          <div className={s.agencyPainDesc}>
            Paste your weekly notes — get a client-ready update with decisions, blockers, and next steps already framed.
          </div>
        </div>
      </div>
      <div className={s.agencyPain}>
        <div className={s.agencyPainIcon}><RefreshCw size={22} strokeWidth={1.75} aria-hidden="true" /></div>
        <div>
          <div className={s.agencyPainTitle}>Project memory across calls.</div>
          <div className={s.agencyPainDesc}>
            Decisions and action items from every meeting persist in the project — so you walk into call #4 already knowing what was promised in call #1.
          </div>
        </div>
      </div>
    </div>

    <DiscoveryMockup />
  </div>

  <div className={`${s.agencyCta} ${s.reveal}`}>
    <Link href="/app" className={s.btnPrimary}>Try it on a discovery call <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></Link>
    <span className={s.agencyCtaNote}>No signup needed for the first one.</span>
  </div>
</section>

{/* ── OUTCOMES ── */}
<section className={s.sectionBlock}>
  <div className={`${s.sectionPill} ${s.reveal}`}>What changes</div>
  <h2 className={`${s.sectionTitle} ${s.reveal}`}>
    What changes when you stop writing recaps yourself.
  </h2>
  <div className={`${s.bento} ${s.bentoNarrow} ${s.reveal}`}>
    <div className={`${s.bentoCard} ${s.bentoCardBlue}`}>
      <div className={s.bentoIcon}><Timer size={24} strokeWidth={1.75} aria-hidden="true" /></div>
      <h3 className={s.bentoTitle}>20 minutes back per meeting</h3>
      <p className={s.bentoDesc}>
        That's the time it takes most people to type a recap, format an email, and copy actions into Slack. You stop doing it.
      </p>
    </div>
    <div className={`${s.bentoCard} ${s.bentoCardGreen}`}>
      <div className={s.bentoIcon}><Target size={24} strokeWidth={1.75} aria-hidden="true" /></div>
      <h3 className={s.bentoTitle}>Every action has an owner</h3>
      <p className={s.bentoDesc}>
        No more "who was supposed to do this?" three weeks later. Tasks come out with name, deadline, priority — by default.
      </p>
    </div>
    <div className={`${s.bentoCard} ${s.bentoCardAmber}`}>
      <div className={s.bentoIcon}><Send size={24} strokeWidth={1.75} aria-hidden="true" /></div>
      <h3 className={s.bentoTitle}>Recap sent before the next meeting</h3>
      <p className={s.bentoDesc}>
        The follow-up email goes out the same minute the call ends. Your client reads it while the meeting is still fresh in their mind.
      </p>
    </div>
  </div>
  <div className={`${s.makerNote} ${s.reveal}`}>
    <div className={s.makerLabel}>From the maker</div>
    <p className={s.makerText}>
      I built MeetingFlash because I was tired of writing the same recap email three times a week.
      I&apos;m Simon — solo founder, no VC, no growth-hacking nonsense. If something breaks or you have an idea,
      reply to <a href="mailto:hello@meetingflash.work">hello@meetingflash.work</a>{' '}
      and you&apos;ll get me directly.
    </p>
    <div className={s.makerFoot}>
      No fake quotes here — try it on your next meeting and tell me what you think.
    </div>
  </div>
</section>

      {/* ── PRICING ── */}
      <section className={s.pricing} id="pricing">
        <div className={`${s.sectionPill} ${s.reveal}`}>Pricing</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>One price, and the free plan actually stays free.</h2>
        <p className={`${s.pricingSub} ${s.reveal}`}>Start free. Upgrade when you're ready.</p>

        <div className={s.reveal}>
          <PricingCards />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={s.sectionBlock} id="faq" style={{ paddingBottom: 40 }}>
        <div className={`${s.sectionPill} ${s.reveal}`}>FAQ</div>
        <h2 className={`${s.sectionTitle} ${s.reveal}`}>Questions people ask before trying it.</h2>
        <div className={`${s.faqList} ${s.reveal}`}>
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} className={s.faqItem}>
              <summary className={s.faqQ}>
                <span>{item.q}</span>
                <span className={s.faqIcon}><Plus size={18} strokeWidth={1.75} aria-hidden="true" /></span>
              </summary>
              <p className={s.faqA}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={s.ctaBanner}>
        <div className={s.ctaGlow} />
        <h2 className={`${s.ctaBannerTitle} ${s.reveal}`}>
          Your next meeting can end with the recap already sent.
        </h2>
        <p className={`${s.ctaBannerSub} ${s.reveal}`}>
          Paste the notes from your last meeting and see what comes back.
        </p>
        <HeroCta className={`${s.btnPrimary} ${s.reveal}`} />
      </section>

      <SiteFooter />
    </div>
  )
}