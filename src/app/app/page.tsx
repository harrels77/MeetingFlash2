'use client'
import { useState } from 'react'
import Link from 'next/link'
import styles from './app.module.css'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'


type Pack = {
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

const TEMPLATES = {
  sprint: `SPRINT PLANNING MEETING
Date: [Date]
Team: [Names]

Agenda:
- Review last sprint velocity
- Demo completed stories
- Retrospective: what went well / what didn't
- Plan next sprint backlog
- Assign story points and owners

Notes:
[Paste your meeting notes here]`,

  client: `CLIENT MEETING
Date: [Date]
Client: [Client name]
Attendees: [Names]

Agenda:
- Project status update
- Review deliverables
- Client feedback
- Next steps and timeline
- Open questions

Notes:
[Paste your meeting notes here]`,

  standup: `DAILY STANDUP
Date: [Date]
Team: [Names]

Format:
- Yesterday: what did each person complete?
- Today: what is each person working on?
- Blockers: what is blocking progress?

Notes:
[Paste your meeting notes here]`,

  product: `PRODUCT MEETING
Date: [Date]
Attendees: [Names]

Agenda:
- Review metrics and KPIs
- Product roadmap updates
- Feature prioritization
- User feedback review
- Technical dependencies

Notes:
[Paste your meeting notes here]`,
}

const LOADER_MSGS = [
  'Analyzing transcript—',
  'Extracting decisions—',
  'Building action items—',
  'Generating your pack—',
]

export default function AppPage() {
  const [text, setText]     = useState('')
  const [lang, setLang]     = useState('EN')
  const [style, setStyle]   = useState('Concise')
  const [loading, setLoading] = useState(false)
  const [loaderMsg, setLoaderMsg] = useState('')
  const [pack, setPack]     = useState<Pack | null>(null)
  const [error, setError]   = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [guestUsed, setGuestUsed]   = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projects, setProjects]   = useState<{id: string, name: string}[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [usesLeft, setUsesLeft] = useState<number | null>(null)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName]       = useState('')
  const [creatingProject, setCreatingProject]     = useState(false)

  useEffect(() => {
  if (!isLoggedIn) return
  supabase
    .from('projects')
    .select('id, name')
    .order('created_at', { ascending: false })
    .then(({ data }) => setProjects(data || []))
  }, [isLoggedIn])  

  useEffect(() => {
    async function loadAuth(session: import('@supabase/supabase-js').Session | null) {
      if (session) {
        setIsLoggedIn(true)
        const { data: profile } = await supabase
          .from('profiles')
          .select('uses_this_month, plan')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          const limit = profile.plan === 'free' ? 3 : Infinity
          setUsesLeft(Math.max(0, limit - profile.uses_this_month))
        }
         {
          const { data } = await supabase
            .from('projects')
            .select('id, name')
            .order('created_at', { ascending: false })
          setProjects(data || [])
        }
      } else {
        setIsLoggedIn(false)
        setUsesLeft(null)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadAuth(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      loadAuth(session)
    })

    const used = localStorage.getItem('mf_guest_used')
    if (used) setGuestUsed(true)

    return () => subscription.unsubscribe()
  }, [])

  async function flash() {
    // Guest limit check
    if (isLoggedIn && usesLeft === 0) {
      setError('You have used all your packs this month. Upgrade to Pro for unlimited access.')
      return
    }
    if (!isLoggedIn && guestUsed) {

    if (text.trim().length < 40) return setError('Please paste a meeting transcript first.')
    setError('')
    setLoading(true)
    setPack(null)
    } 

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
        if (isLoggedIn && usesLeft !== null && usesLeft !== Infinity) {
        setUsesLeft(prev => prev !== null ? Math.max(0, prev - 1) : null)
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
      `DECISIONS\n${pack.decisions}`,
      `ACTION ITEMS\n${pack.actions}`,
      `OPEN QUESTIONS\n${pack.questions}`,
      `RISKS\n${pack.risks}`,
      `FOLLOW-UP EMAIL\n${pack.email}`,
      `SLACK MESSAGE\n${pack.slack}`,
      `NEXT AGENDA\n${pack.agenda}`,
    ].join('\n\n')
    copy('all', all)
  }

  const blocks = pack ? [
    { id: 'decisions', label: 'Decisions',       color: 'spark',  content: pack.decisions },
    { id: 'actions',   label: 'Action Items',     color: 'ember',  content: pack.actions   },
    { id: 'questions', label: 'Open Questions',   color: 'fog',    content: pack.questions  },
    { id: 'risks',     label: 'Risks',            color: 'danger', content: pack.risks      },
    { id: 'email',     label: 'Follow-up Email',  color: 'paper',  content: pack.email      },
    { id: 'slack',     label: 'Slack Message',    color: 'paper',  content: pack.slack      },
    { id: 'agenda',    label: 'Next Agenda',      color: 'spark',  content: pack.agenda     },
  ] : []

  function copy(id: string, content: string): void {
    throw new Error('Function not implemented.')
  }

  return (
    <div className={styles.page}>
      {/* NAV */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          <div className={styles.logoMark}><div className={styles.logoInner}/></div>
          MeetingFlash
        </Link>
        <div className={styles.navRight}>
          <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/" className={styles.navLink}>← Back</Link>
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
                        {key === 'sprint'   ? '⚡ Sprint planning' :
                        key === 'client'  ? '👤 Client meeting'  :
                        key === 'standup' ? '☀️ Daily standup'   :
                        '📦 Product meeting'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className={styles.sampleBtn} onClick={() => setText(SAMPLE)}>
                Load sample ↗
              </button>
            </div>
          </div>

                      {isLoggedIn && (
              <div className={styles.field}>
                <div className={styles.fieldLabel}>Project</div>
                <div className={styles.projectRow}>
                  <select
                    className={styles.select}
                    value={projectId || ''}
                    onChange={e => setProjectId(e.target.value || null)}
                  >
                    <option value="">No project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button
                    className={styles.newProjectInlineBtn}
                    onClick={() => setShowCreateProject(!showCreateProject)}
                    type="button"
                  >
                    + New
                  </button>
                </div>
                {showCreateProject && (
                  <div className={styles.createProjectInline}>
                    <input
                      className={styles.createProjectInput}
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      placeholder="Project name…"
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
            <textarea
              className={styles.ta}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste your meeting notes, transcript, or raw bullet points here…"
            />
            <div className={styles.charCount}>{text.length} chars</div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldLabel}>Output language</div>
            <div className={styles.toggles}>
              {['EN', 'FR', 'ES', 'DE'].map(k => (
                <button
                  key={k}
                  className={`${styles.toggle} ${lang === k ? styles.toggleOn : ''}`}
                  onClick={() => setLang(k)}
                >{k}</button>
              ))}
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
            {isLoggedIn ? (
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
                <Link href="/signup" className={styles.hintLink}>Create account for 3 more →</Link>
              </>
            ) : (
              <>
                <span><strong>1 free pack</strong> without account</span>
                <span className={styles.hintDot}>·</span>
                <Link href="/signup" className={styles.hintLink}>Sign up for 3/month →</Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT — OUTPUT */}
        <div className={styles.outputSide}>
          <div className={styles.outputHeader}>
            <div className={styles.outputTitle}>
              {pack ? '⚡ Your Execution Pack' : 'Awaiting flash—'}
            </div>
            {pack && (
              <button className={styles.copyAllBtn} onClick={copyAll}>
                {copied === 'all' ? '✓ Copied' : 'Copy all'}
              </button>
            )}
          </div>

          {isLoggedIn && projects.length > 0 && (
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Assign to project (optional)</div>
              <select
                className={styles.select}
                value={projectId || ''}
                onChange={e => setProjectId(e.target.value || null)}
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {pack && !isLoggedIn && (
            <div className={styles.guestBanner}>
              <div className={styles.guestBannerText}>
                <strong>Pack generated.</strong> Create a free account to save it and get 3 packs per month.
              </div>
              <Link href="/signup" className={styles.guestBannerBtn}>
                Create free account →
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
                  <div className={styles.blockContent}>{block.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

