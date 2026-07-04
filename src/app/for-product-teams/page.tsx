import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { buildBreadcrumb } from '@/lib/breadcrumb'
import { Check, RefreshCw, Calendar, Users, Target, Brain, CheckCircle2, ClipboardList, Send, ArrowRight, ArrowDown } from 'lucide-react'
import s from '@/styles/marketing.module.css'

export const metadata: Metadata = {
  title: 'AI Meeting Recap Tool for Product Teams — MeetingFlash',
  description: 'Sprint retros, planning, 1-on-1s, and stakeholder reviews — turned into structured commitments with owners and deadlines, in 20 seconds. Built for product teams.',
  alternates: { canonical: '/for-product-teams' },
  openGraph: {
    title: 'AI Meeting Recap Tool for Product Teams — MeetingFlash',
    description: 'Sprint retros, planning, 1-on-1s, and stakeholder reviews — turned into structured commitments in 20 seconds.',
    url: 'https://www.meetingflash.work/for-product-teams',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: 'Does it work with our existing tools (Linear, Jira, Notion)?',
    a: 'Output is plain text and structured blocks you can paste into any tool. Direct integrations with Linear, Jira, and Notion are on the roadmap — email hello@meetingflash.work to flag your priority.',
  },
  {
    q: 'Can multiple PMs / EMs use the same project?',
    a: 'Today, projects are per-user. A Team plan with shared workspaces is in development. For now, the share-link feature lets teammates view a Pack read-only without an account.',
  },
  {
    q: 'How does it handle technical jargon and team-specific terminology?',
    a: 'The model preserves your team\'s vocabulary verbatim. Acronyms, code names, and internal terms come through as written — it doesn\'t try to "explain" technical context that the team already shares.',
  },
  {
    q: 'Can I track action items from a retro week-over-week?',
    a: 'Yes. Each Pack saves its action items to a tasks list, scoped to its project. You can review last sprint\'s commitments at the start of next sprint planning — closing the loop is the single biggest fix for retros that go nowhere.',
  },
  {
    q: 'What about confidential roadmap discussions?',
    a: 'Notes are sent to Anthropic\'s Claude API, processed in-memory, and discarded — never stored on Anthropic\'s side or used for training. Your generated Packs are stored on Supabase (EU region). Delete any Pack in one click.',
  },
]

const pageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'AI Meeting Recap Tool for Product Teams — MeetingFlash',
    description: 'Sprint retros, planning, 1-on-1s, and stakeholder reviews turned into structured commitments in 20 seconds.',
    url: 'https://www.meetingflash.work/for-product-teams',
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
  buildBreadcrumb([{ name: 'For product teams', path: '/for-product-teams' }]),
]

export default function ForProductTeamsPage() {
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
            For product teams
          </div>
          <h1 className={s.h1}>
            Stop losing retro commitments. <span className={s.h1Accent}>Make every meeting ship something.</span>
          </h1>
          <p className={s.heroSub}>
            Sprint retros, planning, 1-on-1s, stakeholder reviews — turned into structured commitments with named owners and deadlines, in 20 seconds. So next sprint actually starts where the last one ended.
          </p>
          <div className={s.heroActions}>
            <Link href="/app?template=retro" className={s.btnPrimary}>Try it free <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></Link>
            <Link href="#meetings" className={s.btnGhost}>See meeting types <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" /></Link>
          </div>
          <div className={s.trustStrip}>
            <span><Check size={15} strokeWidth={1.75} aria-hidden="true" /> 20 seconds per recap</span>
            <span><Check size={15} strokeWidth={1.75} aria-hidden="true" /> Tasks tracked across sprints</span>
            <span><Check size={15} strokeWidth={1.75} aria-hidden="true" /> Decisions persist as project memory</span>
          </div>
        </div>
      </section>

      <section className={s.section} id="meetings">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>The product team meeting stack</div>
            <h2 className={s.sectionTitle}>Every recurring product meeting, from standup to retro.</h2>
            <p className={s.sectionLede}>
              The meetings product teams run on repeat — captured in a structure that drives follow-through.
            </p>
          </div>
          <div className={s.cardGrid}>
            <div className={s.card}>
              <div className={s.cardIcon}><RefreshCw size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Sprint retrospectives</div>
              <p className={s.cardDesc}>
                What worked, what didn&apos;t, and the top 3 changes — with owners and deadlines, not just venting. Use the <Link href="/blog/sprint-retrospective-template" style={{ color: 'var(--blue3)' }}>retro template</Link> we built for this.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><Calendar size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Sprint planning</div>
              <p className={s.cardDesc}>
                Story breakdown decisions, capacity reasoning, deferred items — captured in one structured pack you can paste into Linear or Jira.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><Users size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>1-on-1s</div>
              <p className={s.cardDesc}>
                Action items, growth commitments, blockers raised. The pack stays in your project memory so the next 1-on-1 picks up where the last one ended.
              </p>
            </div>
            <div className={s.card}>
              <div className={s.cardIcon}><Target size={22} strokeWidth={1.75} aria-hidden="true" /></div>
              <div className={s.cardTitle}>Stakeholder reviews</div>
              <p className={s.cardDesc}>
                Demos and roadmap reviews become a clear list of decisions, follow-up questions, and a draft summary email for absent stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Why product teams switch</div>
            <h2 className={s.sectionTitle}>Notes that actually drive next sprint.</h2>
          </div>

          <div className={s.split}>
            <div className={s.painList}>
              <div className={s.pain}>
                <div className={s.painIcon}><Brain size={22} strokeWidth={1.75} aria-hidden="true" /></div>
                <div>
                  <div className={s.painTitle}>Project memory across sprints.</div>
                  <p className={s.painDesc}>Retros, planning, and reviews on the same project share decisions and tasks. Last sprint&apos;s commitments surface at the top of the next sprint.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}><CheckCircle2 size={22} strokeWidth={1.75} aria-hidden="true" /></div>
                <div>
                  <div className={s.painTitle}>Owners + deadlines, every action.</div>
                  <p className={s.painDesc}>The model defaults to attributing every action item to a name and a date. No more &quot;we should improve X&quot; floating without an owner.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}><ClipboardList size={22} strokeWidth={1.75} aria-hidden="true" /></div>
                <div>
                  <div className={s.painTitle}>Paste-ready output for Linear / Jira / Notion.</div>
                  <p className={s.painDesc}>Tasks come out clean and structured — copy-paste into your issue tracker or project doc, no formatting cleanup.</p>
                </div>
              </div>
              <div className={s.pain}>
                <div className={s.painIcon}><Send size={22} strokeWidth={1.75} aria-hidden="true" /></div>
                <div>
                  <div className={s.painTitle}>Auto-drafted Slack updates for the team.</div>
                  <p className={s.painDesc}>Every Pack includes a draft Slack message — the kind a scrum master normally writes after the meeting. Skip the writing.</p>
                </div>
              </div>
            </div>

            <div className={s.mockup}>
              <div className={s.mockupHead}>
                <div className={s.mockupDots}><span /><span /><span /></div>
                <div className={s.mockupTitle}>Sprint 14 retro · Search Squad</div>
              </div>
              <div className={s.mockupBody}>
                <div className={`${s.mockBlock} ${s.mockBlockBlue}`}>
                  <div className={s.mockBlockLabel}>Decisions</div>
                  <div className={s.mockBlockContent}>
                    • Stories ≥ 3 points must be broken down before sprint planning<br />
                    • No merges to main after 3pm Friday (CI rule)<br />
                    • Reserve 1h Monday for tech debt, rotating owner
                  </div>
                </div>
                <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
                  <div className={s.mockBlockLabel}>Action items</div>
                  <div className={s.mockBlockContent}>
                    ✓ <strong>Maya</strong> → Define story-breakdown criteria (next planning)<br />
                    ✓ <strong>DevOps</strong> → Add CI rule blocking Fri afternoon merges (Wed)<br />
                    ✓ <strong>EM</strong> → Schedule Monday tech-debt slot in calendar (today)
                  </div>
                </div>
                <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
                  <div className={s.mockBlockLabel}>Slack message</div>
                  <div className={s.mockBlockContent}>
                    Sprint 14 retro recap 🚀 — 3 commitments for next sprint: story breakdown criteria (Maya), Fri-PM merge block (DevOps), Monday tech-debt slot (EM). Full pack in the thread.
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
            <h2 className={s.sectionTitle}>Product-team-specific answers.</h2>
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
        <h2 className={s.ctaBannerTitle}>Your next retro can end with three real commitments.</h2>
        <p className={s.ctaBannerSub}>
          Try it on your last sprint — no signup required for the first one.
        </p>
        <Link href="/app?template=retro" className={s.btnPrimary}>Run your first Flash free <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" /></Link>
      </section>

      <footer className={s.miniFooter}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/for-agencies">For agencies</Link>
        <Link href="/for-freelancers">For freelancers</Link>
        <Link href="/pricing">Pricing</Link>
        <div style={{ marginTop: 16 }}>© 2026 MeetingFlash · hello@meetingflash.work</div>
      </footer>
    </div>
  )
}
