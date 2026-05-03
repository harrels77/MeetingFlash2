'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './app.module.css'
import { supabase, packFieldToString } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import ActionTiers from '@/components/ActionTiers'
import QuestionsView from '@/components/QuestionsView'
import ThemeToggle from '@/components/ThemeToggle'
import { useEffect } from 'react'


type Pack = {
  snapshot?: string
  decisions: string
  actions: string
  questions: string
  risks: string
  email: string
  slack: string
  agenda: string
}

const SAMPLE = `Sarah: Three things today — Q2 launch, budget, hiring.

Tom: On the launch — agreed on April 28th. Marketing needs two weeks. I'll send the feature list by Friday EOD.

Sarah: Good. Lisa, you're on the press release.

Lisa: Draft ready by next Wednesday.

Sarah: Budget — 12% over on engineering. Decision: freeze all new tool subscriptions until end of Q2. David, I need an updated projection by Thursday.

David: Done.

Sarah: Hiring — two new roles: frontend dev and product designer. HR posts descriptions this week. Interviews start April 22nd. Tom leads technical interviews.

Tom: Understood.

Sarah: Next sync Monday morning.`

const TEMPLATES: Record<string, string> = {
  'Discovery call (agency → prospect)': `DISCOVERY CALL — [Prospect company]
Date: [Date]
Attendees: [You], [Prospect name + role]

What I asked:
- What's the problem you're trying to solve, in your own words?
- What have you tried already and why didn't it stick?
- Who else is involved in this decision?
- What does "success" look like in 90 days?
- What's the budget range you're working with?
- When do you need this delivered by?

What they said:
[Paste their responses here — quotes are fine]

Felt vs unsaid:
[Anything you sensed that wasn't on the agenda — hesitation, urgency, internal politics]

Next step proposed:
[E.g. send proposal by Friday / second call with their CMO / scope doc]`,

  'Client status update': `CLIENT STATUS UPDATE — [Client name]
Date: [Date]
Attendees: [Names]

Since last meeting we shipped:
- [Item 1]
- [Item 2]

In progress this week:
- [Item 1] — [owner]
- [Item 2] — [owner]

Blockers / things we need from the client:
- [Item 1]
- [Item 2]

Client feedback raised:
[Paste their feedback verbatim — good and bad]

Decisions made today:
[Anything that was confirmed during the call]

Next sync: [Date]`,

  'Sprint retro (product team)': `SPRINT RETRO — Sprint [#]
Date: [Date]
Team: [Names]

Sprint goal: [What we set out to do]
Did we hit it? [Yes / No / Partial — and why]

What worked:
- [Thing 1 — who/what made it work]
- [Thing 2]

What didn't:
- [Thing 1 — what was the actual cause, not the symptom]
- [Thing 2]

Carry-over from last sprint:
- [Item 1] → still owned by [name], why it slipped
- [Item 2]

Decisions for next sprint:
[Process changes, priorities, scope cuts]

Notes:
[Anything else that came up — interpersonal, strategic, off-topic-but-important]`,

  '1-on-1 (manager ↔ IC)': `1-ON-1 — [IC name]
Date: [Date]
Manager: [Name]

How are you, really?
[Their answer — energy level, mood, anything outside-work they shared]

What did you ship since last 1:1?
[Their list]

What's blocking you right now?
[Specific things — tools, people, decisions, context]

What do you need from me?
[Concrete asks]

Career / growth conversation:
[Anything they raised about role, scope, comp, learning]

What I'm committing to before next 1:1:
[Manager's action items]

What they're committing to:
[IC's action items]`,
}

// URL-friendly slugs → TEMPLATES keys, used by ICP landings (/for-agencies?…) to prefill /app
// e.g. /app?template=discovery loads the Discovery template into the textarea on mount.
const TEMPLATE_SLUG_MAP: Record<string, string> = {
  discovery: 'Discovery call (agency → prospect)',
  status:    'Client status update',
  retro:     'Sprint retro (product team)',
  oneonone:  '1-on-1 (manager ↔ IC)',
}

const LOADER_MSGS = [
  'Reading your notes—',
  'Identifying decisions—',
  'Mapping owners to actions—',
  'Drafting your follow-up email—',
  'Building the next agenda—',
]

export default function AppPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [text, setText]     = useState('')
  const [lang, setLang]     = useState('EN')
  const [style, setStyle]   = useState('Concise')
  const [loading, setLoading] = useState(false)
  const [loaderMsg, setLoaderMsg] = useState('')
  const [pack, setPack]     = useState<Pack | null>(null)
  const [error, setError]   = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [guestUsed, setGuestUsed]   = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projects, setProjects]   = useState<{id: string, name: string}[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName]       = useState('')
  const [timeSavedToast, setTimeSavedToast]       = useState<number | null>(null)
  const [creatingProject, setCreatingProject]     = useState(false)
  const [templateBanner, setTemplateBanner]       = useState<string | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const [showUpgradeModal, setShowUpgradeModal]   = useState(false)

  // Derived auth state — sourced from AuthProvider so it's consistent across pages
  // and never shows the wrong UI during initial mount race (the previous bug:
  // a Pro user briefly saw "Free pack used" + EN-only language locks because
  // /app ran its own getSession() that hadn't resolved yet).
  const isLoggedIn = authLoading ? null : !!user
  const plan = (profile?.plan as 'free' | 'pro' | 'team' | undefined) ?? null
  const usesLeft =
    !user || !profile ? null
    : profile.plan === 'free' ? Math.max(0, 5 - (profile.uses_this_month ?? 0))
    : Infinity

  // Prefill the textarea with a template when the user lands here from an ICP page
  // (e.g. /for-agencies CTA → /app?template=discovery).
  // Also surfaces a dismissible banner so the user knows WHY the textarea is pre-filled.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('template')
    if (slug && TEMPLATE_SLUG_MAP[slug] && TEMPLATES[TEMPLATE_SLUG_MAP[slug]]) {
      setText(TEMPLATES[TEMPLATE_SLUG_MAP[slug]])
      setTemplateBanner(TEMPLATE_SLUG_MAP[slug])
    }
  }, [])

  // Load projects once auth is resolved AND user is logged in.
  // (Guest users have no projects.) NOTE: rely on RLS (auth.uid() = user_id)
  // for filtering rather than an explicit .eq('user_id', user.id) — adding the
  // explicit filter caused projects to disappear in dual-profile edge cases
  // where useAuth().user.id didn't exactly match the row's user_id.
  // Also waits for the JWT to be present + retries once on cold-start —
  // without this, navigating from /dashboard to /app could fire the query
  // before the token attached and RLS would silently return [] (project
  // dropdown appears empty even though projects exist).
  useEffect(() => {
    if (authLoading || !user) return
    let cancelled = false

    async function loadProjects(): Promise<boolean> {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return false
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Projects load error:', error)
        return false
      }
      if (!cancelled) setProjects(data || [])
      return true
    }

    ;(async () => {
      const ok = await loadProjects()
      if (!ok && !cancelled) {
        await new Promise(r => setTimeout(r, 1500))
        if (!cancelled) await loadProjects()
      }
    })()

    return () => { cancelled = true }
  }, [authLoading, user])

  // Track guest free-pack usage in localStorage (only meaningful when not signed in)
  useEffect(() => {
    const used = localStorage.getItem('mf_guest_used')
    if (used) setGuestUsed(true)
  }, [])

  async function flash() {
    // Guest limit check
    if (isLoggedIn && usesLeft === 0) {
      setShowUpgradeModal(true)
      return
    }
    if (!isLoggedIn && guestUsed) {
      setShowUpgradeModal(true)
      return
    }

    if (text.trim().length < 40) return setError('Please paste a meeting transcript first.')
    setError('')
    setLoading(true)
    setPack(null)

    let i = 0
    setLoaderMsg(LOADER_MSGS[0])
    const interval = setInterval(() => {
      i = (i + 1) % LOADER_MSGS.length
      setLoaderMsg(LOADER_MSGS[i])
    }, 1100)

    try {
      // Get auth token if logged in
      const { data: { session } } = await supabase.auth.getSession()

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const res = await fetch('/api/flash', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, lang, style, projectId }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Unknown error')
      }

      setPack(data.pack)
      // usesLeft is derived from AuthProvider's profile; the next page render or
      // navigation refetches the profile via /api/flash's increment_uses RPC.
      // No local optimistic decrement needed.

      // Estimate time saved: ~3 min per action item + 8 min for the email + 2 min for slack/agenda formatting
      const actionsCount = (data.pack?.actions || '').split('\n').filter((l: string) => l.trim().startsWith('•')).length
      const estimatedMinutes = Math.max(15, actionsCount * 3 + 10)
      setTimeSavedToast(estimatedMinutes)
      setTimeout(() => setTimeSavedToast(null), 6000)

      // On mobile, the output is below the fold — scroll the user to it so they see the result
      if (typeof window !== 'undefined' && window.innerWidth < 900) {
        setTimeout(() => {
          outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 80)
      }
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }

    // Mark guest pack as used
    if (!isLoggedIn) {
      localStorage.setItem('mf_guest_used', 'true')
      setGuestUsed(true)
    }
  }

async function createProject() {
  if (!newProjectName.trim()) return
  if (plan === 'free' && projects.length >= 1) {
    setShowUpgradeModal(true)
    setShowCreateProject(false)
    return
  }
  setCreatingProject(true)
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('You must be logged in to create a project.')
      return
    }
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: session.user.id, name: newProjectName.trim() })
      .select()
      .single()
    if (error) {
      console.error('Project creation error:', error)
      setError('Failed to create project. Please try again.')
      return
    }
    if (data) {
      setProjects(prev => [data, ...prev])
      setProjectId(data.id)
      setNewProjectName('')
      setShowCreateProject(false)
    }
  } finally {
    setCreatingProject(false)
  }
}

  function copyAll() {
    if (!pack) return
    const all = [
      pack.snapshot ? `EXECUTIVE SNAPSHOT\n${packFieldToString(pack.snapshot)}` : null,
      `DECISIONS\n${packFieldToString(pack.decisions)}`,
      `ACTION ITEMS\n${packFieldToString(pack.actions)}`,
      `OPEN QUESTIONS\n${packFieldToString(pack.questions)}`,
      `RISKS\n${packFieldToString(pack.risks)}`,
      `FOLLOW-UP EMAIL\n${packFieldToString(pack.email)}`,
      `SLACK MESSAGE\n${packFieldToString(pack.slack)}`,
      `NEXT AGENDA\n${packFieldToString(pack.agenda)}`,
    ].filter(Boolean).join('\n\n')
    copy('all', all)
  }

  const blocks = pack ? [
    { id: 'decisions', label: 'Decisions',       color: 'spark',  content: packFieldToString(pack.decisions) },
    { id: 'actions',   label: 'Action Items',     color: 'ember',  content: packFieldToString(pack.actions)   },
    { id: 'questions', label: 'Open Questions',   color: 'fog',    content: packFieldToString(pack.questions) },
    { id: 'risks',     label: 'Risks',            color: 'danger', content: packFieldToString(pack.risks)     },
    { id: 'email',     label: 'Follow-up Email',  color: 'paper',  content: packFieldToString(pack.email)     },
    { id: 'slack',     label: 'Slack Message',    color: 'paper',  content: packFieldToString(pack.slack)     },
    { id: 'agenda',    label: 'Next Agenda',      color: 'spark',  content: packFieldToString(pack.agenda)    },
  ] : []

  function copy(id: string, content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // After a pack is generated, let the user start a new flash in one click:
  // wipe inputs/output and scroll back to the textarea (the pack pushes it
  // off-screen, especially on mobile). Keeps `projectId` so the user stays in
  // their project context — they explicitly opted in to that.
  function flashAnother() {
    setPack(null)
    setText('')
    setError('')
    setTemplateBanner(null)
    setCopied(null)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className={styles.page}>
      {/* Time-saved toast — celebrates the wow moment */}
      {timeSavedToast !== null && (
        <div style={{
          position: 'fixed',
          top: 80,
          right: 24,
          zIndex: 1000,
          background: 'linear-gradient(135deg, var(--blue), var(--blue2))',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(37,99,235,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 320,
          animation: 'mfToastIn 0.4s ease',
        }}>
          <div style={{ fontSize: 22 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
              ~{timeSavedToast} minutes back
            </div>
            <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.4 }}>
              That&apos;s how long this would&apos;ve taken to write by hand.
            </div>
          </div>
        </div>
      )}
      <style jsx>{`@keyframes mfToastIn { from { opacity: 0; transform: translateY(-12px) } to { opacity: 1; transform: translateY(0) } }`}</style>

      {/* NAV */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          <Image src="/logo.png" alt="MeetingFlash" width={28} height={28} style={{ borderRadius: 6 }} priority />
          MeetingFlash
        </Link>
        <div className={styles.navRight}>
          <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/" className={styles.navLink}>← Back</Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className={styles.main}>
        {/* LEFT — INPUT */}
        <div className={styles.inputSide}>
          <div className={styles.inputHeader}>
            <div className={styles.inputTitle}>
              <span className={styles.inputTitleSerif}>Execution</span> Pack Generator
            </div>
            <div className={styles.inputHeaderRight}>
              <div className={styles.templateWrap}>
                <button
                  className={styles.templateBtn}
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  Templates ▾
                </button>
                {showTemplates && (
                  <div className={styles.templateMenu}>
                    {Object.entries(TEMPLATES).map(([key, value]) => (
                      <button
                        key={key}
                        className={styles.templateMenuItem}
                        onClick={() => {
                          setText(value)
                          setShowTemplates(false)
                        }}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className={styles.sampleBtn} onClick={() => setText(SAMPLE)}>
                Load sample ↗
              </button>
              {text.length > 0 && (
                <button
                  className={styles.clearBtn}
                  onClick={() => {
                    setText('')
                    setTemplateBanner(null)
                    setError('')
                  }}
                  title="Clear meeting notes"
                  type="button"
                >
                  Clear ✕
                </button>
              )}
            </div>
          </div>

                      {isLoggedIn && (
              <div className={styles.field}>
                <div className={styles.fieldLabel}>
                  Project
                  {projectId && (
                    <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--blue3)', textTransform: 'none', letterSpacing: 0, fontWeight: 600 }}>
                      · memory active (last 5 meetings injected)
                    </span>
                  )}
                </div>
                <div className={styles.projectRow}>
                  {/* Dropdown stays visible even when a project is selected, so
                      the user can switch to another project at any time without
                      having to click "Change" first. */}
                  <select
                    className={`${styles.select} ${projectId ? styles.selectActive : ''}`}
                    value={projectId || ''}
                    onChange={e => setProjectId(e.target.value || null)}
                  >
                    <option value="">No project (single-shot flash)</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {/* "+ New" disappears once a project is selected — they're
                      already working in one. To create another, deselect first. */}
                  {!projectId && !showCreateProject && (
                    <button
                      className={styles.newProjectInlineBtn}
                      onClick={() => setShowCreateProject(true)}
                      type="button"
                    >
                      + New
                    </button>
                  )}
                </div>
                {showCreateProject && !projectId && (
                  <div className={styles.createProjectInline}>
                    <input
                      className={styles.createProjectInput}
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      placeholder="Project name… (e.g. Acme Corp, Q2 launch)"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') createProject() }}
                    />
                    <button
                      className={styles.createProjectSubmit}
                      onClick={createProject}
                      disabled={creatingProject || !newProjectName.trim()}
                    >
                      {creatingProject ? '…' : 'Create'}
                    </button>
                    <button
                      className={styles.createProjectCancel}
                      onClick={() => { setShowCreateProject(false); setNewProjectName('') }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

          <div className={styles.field}>
            <div className={styles.fieldLabel}>Meeting notes / transcript</div>
            {templateBanner && (
              <div className={styles.templateBanner}>
                <span className={styles.templateBannerIcon}>📋</span>
                <span className={styles.templateBannerText}>
                  <strong>{templateBanner}</strong> template loaded — replace the bracketed placeholders with your actual notes.
                </span>
                <button
                  type="button"
                  className={styles.templateBannerDismiss}
                  onClick={() => setTemplateBanner(null)}
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            )}
            <textarea
              className={styles.ta}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your meeting notes, transcript, or raw bullet points here…"
            />
            <div className={styles.charCount}>{text.length} chars</div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabel}>
              Output language
              {plan === 'free' && isLoggedIn && (
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--blue3)' }}>· Pro unlocks all</span>
              )}
            </div>
            <div className={styles.toggles}>
              {['EN', 'FR', 'ES', 'DE'].map(k => {
                const locked = plan === 'free' && k !== 'EN'
                return (
                  <button
                    key={k}
                    className={`${styles.toggle} ${lang === k ? styles.toggleOn : ''}`}
                    onClick={() => {
                      if (locked) { setShowUpgradeModal(true); return }
                      setLang(k)
                    }}
                    style={locked ? { opacity: 0.5, cursor: 'pointer' } : undefined}
                    title={locked ? 'Upgrade to Pro for all output languages' : undefined}
                  >{locked ? `🔒 ${k}` : k}</button>
                )
              })}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabel}>Style</div>
            <div className={styles.toggles}>
              {['Concise', 'Detailed', 'Email'].map(k => (
                <button
                  key={k}
                  className={`${styles.toggle} ${style === k ? styles.toggleOn : ''}`}
                  onClick={() => setStyle(k)}
                >{k}</button>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.flashBtn} onClick={flash} disabled={loading}>
            {loading ? (
              <><div className={styles.loaderDot}/><span>{loaderMsg}</span></>
            ) : (
              <><span className={styles.flashBtnIcon}/>Flash this meeting</>
            )}
          </button>

          <div className={styles.hint}>
            {authLoading ? (
              // Don't flash a guest CTA at a possibly-logged-in user while
              // the AuthProvider is still resolving — render a neutral spacer.
              <span style={{ opacity: 0.5 }}>Loading account…</span>
            ) : isLoggedIn ? (
              <>
                <span>
                  {usesLeft === null ? '…' :
                  usesLeft === Infinity ? 'Unlimited packs' :
                  `${usesLeft} pack${usesLeft !== 1 ? 's' : ''} left this month`}
                </span>
                <span className={styles.hintDot}>·</span>
                <Link href="/dashboard" className={styles.hintLink}>Dashboard →</Link>
              </>
            ) : guestUsed ? (
              <>
                <span>Free pack used</span>
                <span className={styles.hintDot}>·</span>
                <Link href="/signup" className={styles.hintLink}>Create account for 5 more →</Link>
              </>
            ) : (
              <>
                <span><strong>1 free pack</strong> without account</span>
                <span className={styles.hintDot}>·</span>
                <Link href="/signup" className={styles.hintLink}>Sign up for 5/month →</Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — OUTPUT */}
        <div className={styles.outputSide} ref={outputRef}>
          <div className={styles.outputHeader}>
            <div className={styles.outputTitle}>
              {pack ? '⚡ Your Execution Pack' : 'Awaiting flash—'}
            </div>
            {pack && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={styles.copyAllBtn} onClick={copyAll}>
                  {copied === 'all' ? '✓ Copied' : 'Copy all'}
                </button>
                <button
                  className={styles.flashAnotherBtn}
                  onClick={flashAnother}
                  title="Clear and flash another meeting"
                >
                  ⚡ Flash another →
                </button>
              </div>
            )}
          </div>

          {pack && !authLoading && !isLoggedIn && (
            <div className={styles.guestBanner}>
              <div className={styles.guestBannerText}>
                <strong>That took 20 seconds.</strong> Save this pack, and get 4 more like it this month — free, no credit card.
              </div>
              <Link href="/signup" className={styles.guestBannerBtn}>
                Save this pack →
              </Link>
            </div>
          )}

          {!pack && !loading && (
            <div className={styles.emptyState}>
              <div className={styles.emptyGlyph}/>
              <p>Your Execution Pack will appear here.<br/>Paste your notes and press Flash.</p>
              <div className={styles.emptyHints}>
                <div className={styles.emptyHint}><span className={styles.emptyHintN}>01</span>Decisions made</div>
                <div className={styles.emptyHint}><span className={styles.emptyHintN}>02</span>Action items</div>
                <div className={styles.emptyHint}><span className={styles.emptyHintN}>03</span>Open questions</div>
                <div className={styles.emptyHint}><span className={styles.emptyHintN}>04</span>Risks flagged</div>
                <div className={styles.emptyHint}><span className={styles.emptyHintN}>05</span>Follow-up email</div>
                <div className={styles.emptyHint}><span className={styles.emptyHintN}>06</span>Slack message</div>
                <div className={styles.emptyHint}><span className={styles.emptyHintN}>07</span>Next agenda</div>
              </div>
            </div>
          )}

          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loaderTrack}><div className={styles.loaderBar}/></div>
              <div className={styles.loaderTxt}>{loaderMsg}</div>
            </div>
          )}

          {pack?.snapshot && (
            <div className={styles.snapshot}>
              <div className={styles.snapshotHead}>
                <span className={styles.snapshotPill}>⚡ Executive snapshot</span>
                <button
                  className={`${styles.cpBtn} ${copied === 'snapshot' ? styles.cpDone : ''}`}
                  onClick={() => copy('snapshot', pack.snapshot!)}
                >
                  {copied === 'snapshot' ? '✓' : 'Copy'}
                </button>
              </div>
              <p className={styles.snapshotBody}>{pack.snapshot}</p>
            </div>
          )}

          {pack && (
            <div className={styles.blocks}>
              {blocks.map((block, i) => (
                <div
                  key={block.id}
                  className={`${styles.block} ${styles[`block_${block.color}`]}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={styles.blockHead}>
                    <div className={styles.blockType}>
                      <div className={`${styles.blockDot} ${styles[`dot_${block.color}`]}`}/>
                      <span className={`${styles.blockLabel} ${styles[`label_${block.color}`]}`}>
                        {block.label}
                      </span>
                    </div>
                    <button
                      className={`${styles.cpBtn} ${copied === block.id ? styles.cpDone : ''}`}
                      onClick={() => copy(block.id, block.content)}
                    >
                      {copied === block.id ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <div className={styles.blockContent}>
                    {block.id === 'actions' ? <ActionTiers text={block.content} />
                      : block.id === 'questions' ? <QuestionsView text={block.content} />
                      : block.content}
                  </div>
                </div>
              ))}
              {/* Bottom CTA — after the user has read the whole pack, they're
                  primed to do the next one. Don't make them scroll back up. */}
              <button
                className={styles.flashAnotherFooter}
                onClick={flashAnother}
              >
                ⚡ Flash another meeting →
              </button>
            </div>
          )}
        </div>
      </main>

      {showUpgradeModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={() => setShowUpgradeModal(false)}>
          <div style={{ background:'#0d1117', border:'1px solid #1e2a3a', borderRadius:16, padding:40, maxWidth:420, width:'90%', textAlign:'center' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:36, marginBottom:12 }}>⚡</div>
            <h2 style={{ color:'#f0ede8', fontSize:22, fontWeight:700, marginBottom:8 }}>
              {isLoggedIn ? "You're out of packs" : 'Free pack used'}
            </h2>
            <p style={{ color:'#7a7870', fontSize:15, marginBottom:28, lineHeight:1.6 }}>
              {isLoggedIn
                ? 'Upgrade to Pro for unlimited packs, project memory, full history and more.'
                : 'Create a free account to get 5 packs per month — or go Pro for unlimited access.'}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button
                style={{ background:'#2563EB', color:'#fff', border:'none', borderRadius:8, padding:'13px 24px', fontSize:15, fontWeight:600, cursor:'pointer' }}
                onClick={async () => {
                  const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID, email: '' }),
                  })
                  const { url } = await res.json()
                  if (url) window.location.href = url
                }}
              >
                Go Pro — $12/month →
              </button>
              {!isLoggedIn && (
                <Link href="/signup" style={{ background:'#1a2230', color:'#f0ede8', border:'1px solid #1e2a3a', borderRadius:8, padding:'13px 24px', fontSize:15, fontWeight:500, textDecoration:'none' }}>
                  Create free account →
                </Link>
              )}
              <button
                style={{ background:'none', border:'none', color:'#7a7870', fontSize:13, cursor:'pointer', marginTop:4 }}
                onClick={() => setShowUpgradeModal(false)}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

