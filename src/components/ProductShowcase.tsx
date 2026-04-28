'use client'
import { useState } from 'react'
import s from './ProductShowcase.module.css'

type Tab = 'app' | 'dashboard' | 'pack'

export default function ProductShowcase() {
  const [tab, setTab] = useState<Tab>('app')

  return (
    <section className={s.section} id="product">
      <div className={s.sectionInner}>
        <div className={s.header}>
          <div className={s.pill}>The product</div>
          <h2 className={s.title}>See what you'll actually use.</h2>
          <p className={s.sub}>Three views, one workflow: paste your notes, get an Execution Pack, track every action across meetings.</p>
        </div>

        <div className={s.tabsWrap}>
          <div className={s.tabs} role="tablist">
            <button className={`${s.tab} ${tab === 'app' ? s.tabActive : ''}`} onClick={() => setTab('app')} role="tab" aria-selected={tab === 'app'}>
              ⚡ Flash tool
            </button>
            <button className={`${s.tab} ${tab === 'dashboard' ? s.tabActive : ''}`} onClick={() => setTab('dashboard')} role="tab" aria-selected={tab === 'dashboard'}>
              Dashboard
            </button>
            <button className={`${s.tab} ${tab === 'pack' ? s.tabActive : ''}`} onClick={() => setTab('pack')} role="tab" aria-selected={tab === 'pack'}>
              Pack + Tasks
            </button>
          </div>
        </div>

        {tab === 'app' && <AppMockup />}
        {tab === 'dashboard' && <DashboardMockup />}
        {tab === 'pack' && <PackDetailMockup />}
      </div>
    </section>
  )
}

function TopBar({ right }: { right: React.ReactNode }) {
  return (
    <div className={s.topbar}>
      <div className={s.logo}>
        <img src="/logo.png" alt="" className={s.logoMark} />
        MeetingFlash
      </div>
      <div className={s.topbarRight}>{right}</div>
    </div>
  )
}

function AppMockup() {
  return (
    <div className={s.root}>
      <TopBar right={
        <>
          <div className={s.btn}>Dashboard</div>
          <div className={s.btn}>← Back</div>
        </>
      } />
      <div className={s.appBody}>
        {/* LEFT — input */}
        <div className={s.appLeft}>
          <div className={s.appHead}>
            <div className={s.appHeadTitle}>Execution Pack Generator</div>
            <div className={s.appHeadActions}>
              <div className={s.btn} style={{ fontSize: 11 }}>Templates ▾</div>
              <div className={s.btn} style={{ fontSize: 11 }}>Load sample ↗</div>
            </div>
          </div>

          <div>
            <div className={s.label}>Meeting notes / transcript</div>
            <div className={s.textarea}>
              ## Q2 Product Sync<br />
              Sarah: Launch April 28. Tom sends feature list<br />
              by Friday. Lisa: press release by Wednesday.<br />
              Decision: freeze tool subscriptions Q2.<br />
              David: budget projection by Thursday.<br />
              Interviews start April 22. Tom leads tech.
            </div>
            <div className={s.charCount}>312 chars</div>
          </div>

          <div>
            <div className={s.label}>Output language</div>
            <div className={s.toggles}>
              <div className={`${s.toggle} ${s.toggleOn}`}>EN</div>
              <div className={s.toggle}>FR</div>
              <div className={s.toggle}>ES</div>
              <div className={s.toggle}>DE</div>
            </div>
          </div>

          <div>
            <div className={s.label}>Style</div>
            <div className={s.toggles}>
              <div className={`${s.toggle} ${s.toggleOn}`}>Concise</div>
              <div className={s.toggle}>Detailed</div>
              <div className={s.toggle}>Email</div>
            </div>
          </div>

          <div className={s.flashBtn}>
            <span className={s.flashIcon} />
            Flash this meeting
          </div>

          <div className={s.appFootnote}>
            5 free packs / month · <span>Sign up to save history</span>
          </div>
        </div>

        {/* RIGHT — output */}
        <div className={s.appRight}>
          <div className={s.outputHeader}>
            <div className={s.outputTitle}>
              <span>⚡</span> Your Execution Pack
            </div>
            <div className={s.btn}>Copy all</div>
          </div>

          <div className={`${s.block} ${s.blockDecisions}`}>
            <div className={s.blockHead}>
              <div className={s.blockLabel}>
                <div className={`${s.dot} ${s.dotBlue}`} />
                <span className={s.labelBlue}>Decisions</span>
              </div>
              <div className={s.copy}>Copy</div>
            </div>
            <div className={s.blockBody}>
              • Launch date set for April 28th<br />
              • Tool subscriptions frozen for Q2<br />
              • Tom leads all technical interviews
            </div>
          </div>

          <div className={`${s.block} ${s.blockActions}`}>
            <div className={s.blockHead}>
              <div className={s.blockLabel}>
                <div className={`${s.dot} ${s.dotGreen}`} />
                <span className={s.labelGreen}>Action Items</span>
              </div>
              <div className={s.copy}>Copy</div>
            </div>
            <div className={s.blockBody}>
              • Tom → Feature list (by Friday)<br />
              • Lisa → Press release draft (by Wed)<br />
              • David → Budget projection (by Thu)
            </div>
          </div>

          <div className={`${s.block} ${s.blockRisks}`}>
            <div className={s.blockHead}>
              <div className={s.blockLabel}>
                <div className={`${s.dot} ${s.dotAmber}`} />
                <span className={s.labelAmber}>Risks</span>
              </div>
              <div className={s.copy}>Copy</div>
            </div>
            <div className={s.blockBody}>
              • Interview timeline tight — starts Apr 22<br />
              • Budget overrun risk if subscriptions resume
            </div>
          </div>

          <div className={`${s.block} ${s.blockEmail}`}>
            <div className={s.blockHead}>
              <div className={s.blockLabel}>
                <div className={`${s.dot} ${s.dotMuted}`} />
                <span className={s.labelMuted}>Follow-up Email</span>
              </div>
              <div className={s.copy}>Copy</div>
            </div>
            <div className={s.blockBody}>
              Subject: Q2 Product Sync — Follow-up<br /><br />
              Team, here&apos;s a recap of today&apos;s sync.<br />
              Launch confirmed Apr 28. Key actions:<br />
              Tom (feature list Fri), Lisa (PR Wed),<br />
              David (budget Thu). Next sync Monday.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardMockup() {
  const packs = [
    { title: 'MeetingFlash Core Functionality Sync', date: '22 Apr 2026' },
    { title: 'Alpha Stream Integration Kickoff', date: '11 Apr 2026' },
    { title: 'Q2 Product Roadmap Review', date: '8 Apr 2026' },
    { title: 'Client Onboarding — Acme Corp', date: '3 Apr 2026' },
    { title: 'Sprint Planning — Week 14', date: '1 Apr 2026' },
  ]
  return (
    <div className={s.root}>
      <div className={s.dashRoot}>
        <div className={s.sidebar}>
          <div className={s.sidebarLogo}>
            <img src="/logo.png" alt="" className={s.logoMark} />
            meetingflash
          </div>
          <div className={s.sidebarNav}>
            <div className={`${s.navItem} ${s.navItemActive}`}>
              <div className={s.navDot} />
              Recent packs
            </div>
            <div className={s.navItem}><div className={s.navDot} />Projects</div>
            <div className={s.navItem}><div className={s.navDot} />Search</div>
            <div className={s.navItem}><div className={s.navDot} />Settings</div>
            <div className={s.navFlash}>
              <span className={s.flashIcon} />
              New Flash
            </div>
          </div>
          <div className={s.sidebarBottom}>
            <div className={s.planRow}>
              <div className={s.planBadge}>PRO</div>
              <div className={s.planUses}>Unlimited</div>
            </div>
            <div className={s.email}>googlemail@gmail.com</div>
          </div>
        </div>

        <div className={s.dashMain}>
          <div className={s.dashHeader}>
            <div className={s.dashTitle}>
              <span className={s.dashTitleAccent}>Recent</span> Execution Packs
            </div>
            <div className={s.topbarRight}>
              <div className={s.btn}>Select</div>
              <div className={`${s.btn} ${s.btnPrimary}`}>
                <span className={s.flashIcon} />
                New Flash
              </div>
            </div>
          </div>
          {packs.map((p, i) => (
            <div key={i} className={s.packRow}>
              <div>
                <div className={s.packTitle}>{p.title}</div>
                <div className={s.packDate}>{p.date}</div>
              </div>
              <div className={s.packMenu}>···</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PackDetailMockup() {
  return (
    <div className={s.root}>
      <TopBar right={
        <>
          <div className={s.btn}>Copy all</div>
          <div className={s.btn}>Export PDF</div>
          <div className={`${s.btn} ${s.btnShare}`}>Share</div>
        </>
      } />
      <div className={s.packContent}>
        <div className={s.packMeta}>Wednesday, 22 April 2026 · EN · Concise</div>
        <div className={s.packTitleBig}>MeetingFlash Core Functionality Sync</div>

        <div className={`${s.block} ${s.blockDecisions} ${s.packBlock}`}>
          <div className={s.blockHead}>
            <div className={s.blockLabel}>
              <div className={`${s.dot} ${s.dotBlue}`} />
              <span className={s.labelBlue}>Decisions</span>
            </div>
            <div className={s.copy}>Copy</div>
          </div>
          <div className={s.blockBody}>
            • Launch date confirmed April 28th<br />
            • Tool subscriptions frozen until end of Q2<br />
            • Tom leads all technical interviews
          </div>
        </div>

        <div className={`${s.block} ${s.blockActions} ${s.packBlock}`}>
          <div className={s.blockHead}>
            <div className={s.blockLabel}>
              <div className={`${s.dot} ${s.dotGreen}`} />
              <span className={s.labelGreen}>Action Items</span>
            </div>
            <div className={s.copy}>Copy</div>
          </div>
          <div className={s.blockBody}>
            • Tom → Feature list (by Friday EOD)<br />
            • Lisa → Press release draft (by Wednesday)<br />
            • David → Updated budget projection (by Thursday)
          </div>
        </div>

        <div className={`${s.block} ${s.blockRisks} ${s.packBlock}`}>
          <div className={s.blockHead}>
            <div className={s.blockLabel}>
              <div className={`${s.dot} ${s.dotAmber}`} />
              <span className={s.labelAmber}>Risks</span>
            </div>
            <div className={s.copy}>Copy</div>
          </div>
          <div className={s.blockBody}>
            • Interview timeline is tight — starts April 22nd<br />
            • Budget overrun risk if engineering freeze isn&apos;t enforced
          </div>
        </div>

        <div className={s.tracker}>
          <div className={s.trackerHead}>
            <div className={s.trackerTitle}><span>Task</span> Tracker</div>
            <div className={s.trackerStat}>1 / 3 done</div>
          </div>
          <div className={s.progress}><div className={s.progressBar} /></div>

          <div className={s.task}>
            <div>
              <div className={s.taskText}>Resolve Vercel DNS latency issues</div>
              <div className={s.taskMeta}>
                <div className={s.owner}>Dev Team</div>
                <div className={s.deadline}>April 25</div>
                <div className={s.priorityHigh}>HIGH</div>
              </div>
            </div>
            <div className={s.statusBtns}>
              <div className={s.statusBtn}>Todo</div>
              <div className={`${s.statusBtn} ${s.statusProg}`}>In progress</div>
              <div className={s.statusBtn}>Done</div>
            </div>
          </div>

          <div className={s.task}>
            <div>
              <div className={s.taskText}>Finalize Resume Rewriter integration module</div>
              <div className={s.taskMeta}>
                <div className={s.owner}>Project Lead</div>
                <div className={s.deadline}>April 28</div>
                <div className={s.priorityMed}>MEDIUM</div>
              </div>
            </div>
            <div className={s.statusBtns}>
              <div className={`${s.statusBtn} ${s.statusTodo}`}>Todo</div>
              <div className={s.statusBtn}>In progress</div>
              <div className={s.statusBtn}>Done</div>
            </div>
          </div>

          <div className={s.task}>
            <div>
              <div className={`${s.taskText} ${s.lineThrough}`}>Export final logo assets for landing page</div>
              <div className={s.taskMeta}>
                <div className={s.owner}>Design</div>
                <div className={s.deadline}>April 23</div>
                <div className={s.priorityHigh}>HIGH</div>
              </div>
            </div>
            <div className={s.statusBtns}>
              <div className={s.statusBtn}>Todo</div>
              <div className={s.statusBtn}>In progress</div>
              <div className={`${s.statusBtn} ${s.statusDone}`}>Done</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
