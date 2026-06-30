import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { buildBreadcrumb } from '@/lib/breadcrumb'
import s from '@/styles/marketing.module.css'

export const metadata: Metadata = {
  title: 'Free Meeting Action Items Extractor — MeetingFlash',
  description: 'Extract action items with owners and deadlines from any meeting notes in 20 seconds. Free, no signup required for the first one.',
  alternates: { canonical: '/tools/meeting-action-items-extractor' },
  openGraph: {
    title: 'Free Meeting Action Items Extractor — MeetingFlash',
    description: 'Extract action items with owners and deadlines from raw meeting notes in 20 seconds. Free, no signup.',
    url: 'https://www.meetingflash.work/tools/meeting-action-items-extractor',
    type: 'website',
  },
}

const FAQ_ITEMS = [
  {
    q: 'How does it know who owns each action?',
    a: 'It pulls owner names directly from your notes. If you wrote "Tom → feature list by Friday", Tom gets attributed. If your notes don\'t name an owner, the field is left blank — the tool doesn\'t guess and assign owners arbitrarily.',
  },
  {
    q: 'What if my notes don\'t have deadlines?',
    a: 'Same rule: if a deadline isn\'t in your notes, the deadline field is blank. The tool won\'t fabricate "by next Friday" out of nothing.',
  },
  {
    q: 'Can I export action items to a task tracker?',
    a: 'The output is plain structured text — copy-paste into Linear, Jira, Asana, Notion, or any tool. Direct integrations are on the roadmap.',
  },
  {
    q: 'Does it work for retros and standups, not just project meetings?',
    a: 'Yes. The tool extracts action items from any meeting type — retros, standups, 1-on-1s, planning, stakeholder reviews. Each is structured the same way: who, what, when.',
  },
]

const pageJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Meeting Action Items Extractor',
    url: 'https://www.meetingflash.work/tools/meeting-action-items-extractor',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Extract action items with named owners and deadlines from raw meeting notes.',
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
    { name: 'Free tools', path: '/tools/meeting-action-items-extractor' },
    { name: 'Action items extractor', path: '/tools/meeting-action-items-extractor' },
  ]),
]

export default function ActionItemsExtractorPage() {
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
                Extract action items <span className={s.h1Accent}>with owners and deadlines.</span>
              </h1>
              <p className={s.heroSubLeft}>
                Paste your meeting notes — get a clean list of action items, each with the right person attributed and the deadline mentioned. Free for your first one.
              </p>
              <div className={s.heroActionsLeft}>
                <Link href="/app" className={s.btnPrimary}>Extract my action items →</Link>
                <Link href="#example" className={s.btnGhost}>See an example ↓</Link>
              </div>
              <div className={s.heroStats}>
                <div className={s.heroStat}>
                  <span className={s.heroStatN}>20s</span>
                  <span className={s.heroStatL}>extract time</span>
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
                  <div className={s.mockupTitle}>Extracted action items</div>
                </div>
                <div className={s.mockupBody}>
                  <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
                    <div className={s.mockBlockLabel}>Action items</div>
                    <div className={s.mockBlockContent}>
                      ✓ <strong>Maya</strong> → Define story-breakdown criteria<br />
                      &nbsp;&nbsp;&nbsp;Due: next sprint planning · Priority: high<br /><br />
                      ✓ <strong>DevOps</strong> → Add CI rule blocking Fri-PM merges<br />
                      &nbsp;&nbsp;&nbsp;Due: Wednesday · Priority: medium<br /><br />
                      ✓ <strong>EM</strong> → Add Monday tech-debt slot to calendar<br />
                      &nbsp;&nbsp;&nbsp;Due: today · Priority: low
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section} id="example">
        <div className={s.container}>
          <div className={s.sectionHead}>
            <div className={s.sectionPill}>Example</div>
            <h2 className={s.sectionTitle}>Raw notes in. Action items out.</h2>
          </div>

          <div className={s.split}>
            <div className={s.mockup}>
              <div className={s.mockupHead}>
                <div className={s.mockupDots}><span /><span /><span /></div>
                <div className={s.mockupTitle}>Your raw notes</div>
              </div>
              <div className={s.mockupBody}>
                <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
                  <div className={s.mockBlockLabel}>Input</div>
                  <div className={s.mockBlockContent} style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                    sprint planning sat<br />
                    Maya story breakdown criteria, by next planning<br />
                    DevOps add CI rule blocking Fri PM merges, Wed<br />
                    EM add monday tech-debt slot to calendar today<br />
                    open: should we kill the old admin panel? need PM input<br />
                    risk: design system migration eating into capacity
                  </div>
                </div>
              </div>
            </div>

            <div className={s.mockup}>
              <div className={s.mockupHead}>
                <div className={s.mockupDots}><span /><span /><span /></div>
                <div className={s.mockupTitle}>Extracted action items</div>
              </div>
              <div className={s.mockupBody}>
                <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
                  <div className={s.mockBlockLabel}>Action items</div>
                  <div className={s.mockBlockContent}>
                    ✓ <strong>Maya</strong> → Define story-breakdown criteria<br />
                    &nbsp;&nbsp;&nbsp;Due: next sprint planning · Priority: high<br /><br />
                    ✓ <strong>DevOps</strong> → Add CI rule blocking Fri-PM merges<br />
                    &nbsp;&nbsp;&nbsp;Due: Wednesday · Priority: medium<br /><br />
                    ✓ <strong>EM</strong> → Add Monday tech-debt slot to calendar<br />
                    &nbsp;&nbsp;&nbsp;Due: today · Priority: low
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
            <div className={s.sectionPill}>Why this works</div>
            <h2 className={s.sectionTitle}>Designed around how meetings actually go.</h2>
          </div>
          <div className={s.painList}>
            <div className={s.pain}>
              <div className={s.painIcon}>👤</div>
              <div>
                <div className={s.painTitle}>Names are pulled from your notes — not assumed.</div>
                <p className={s.painDesc}>If your notes say &quot;Tom&quot;, the action goes to Tom. If they don&apos;t name anyone, the owner is left blank rather than guessed.</p>
              </div>
            </div>
            <div className={s.pain}>
              <div className={s.painIcon}>📅</div>
              <div>
                <div className={s.painTitle}>Deadlines stay literal.</div>
                <p className={s.painDesc}>&quot;by Friday&quot; becomes &quot;Due: Friday&quot;. &quot;EOD&quot; stays &quot;Due: today&quot;. The tool doesn&apos;t invent a deadline if your notes didn&apos;t mention one.</p>
              </div>
            </div>
            <div className={s.pain}>
              <div className={s.painIcon}>🎯</div>
              <div>
                <div className={s.painTitle}>Priorities inferred from urgency cues.</div>
                <p className={s.painDesc}>If a task has tight time pressure (&quot;ASAP&quot;, &quot;today&quot;) it&apos;s flagged high priority. Otherwise medium or low. You can override.</p>
              </div>
            </div>
            <div className={s.pain}>
              <div className={s.painIcon}>📋</div>
              <div>
                <div className={s.painTitle}>Output is paste-ready.</div>
                <p className={s.painDesc}>Drop the action items into Linear, Jira, Notion, or your todo list. No formatting cleanup — they come out clean.</p>
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
        <h2 className={s.ctaBannerTitle}>Extract your action items now.</h2>
        <p className={s.ctaBannerSub}>Free for your first meeting. No signup required.</p>
        <Link href="/app" className={s.btnPrimary}>Try the extractor free →</Link>
      </section>

      <footer className={s.miniFooter}>
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/blog/meeting-action-items-best-practices">Action items guide</Link>
        <Link href="/tools/follow-up-email-generator">Follow-up email generator</Link>
        <Link href="/tools/discovery-call-recap-tool">Discovery call recap</Link>
        <Link href="/pricing">Pricing</Link>
        <div style={{ marginTop: 16 }}>© 2026 MeetingFlash · hello@meetingflash.work</div>
      </footer>
    </div>
  )
}
