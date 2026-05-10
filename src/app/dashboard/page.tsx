'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './dashboard.module.css'


interface Project {
  id: string
  name: string
  created_at: string
}

interface Meeting {
  id: string
  title: string
  project_id: string | null
  created_at: string
  pack: Record<string, unknown>
}

export default function Dashboard() {
  const router = useRouter()
  // Single source of truth: useAuth().profile is the canonical store.
  // The dashboard previously had its own local `profile` state that could
  // desync from AuthProvider (one would load while the other failed on
  // cold-start, producing the "Settings shows No name set / Dashboard
  // shows Pro plan" inconsistency). Now we read from useAuth() and drop
  // the local copy entirely.
  const { user, profile, loading: authLoading, refetchProfile } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tab, setTab]           = useState<'recent' | 'projects'>('recent')
  const [loading, setLoading]   = useState(true)
  const [newProject, setNewProject]         = useState('')
  const [showNewProject, setShowNewProject] = useState(false)
  const [creating, setCreating]             = useState(false)
  const [menuOpen, setMenuOpen]             = useState<string | null>(null)
  const [renaming, setRenaming]             = useState<string | null>(null)
  const [renameValue, setRenameValue]       = useState('')
  const [selected, setSelected]             = useState<string[]>([])
  const [selectMode, setSelectMode]         = useState(false)
  const [hovered, setHovered]               = useState<string | null>(null)
  const [openTasks, setOpenTasks]           = useState<{ id: string; text: string; owner: string | null; deadline: string | null; meeting_id: string; meeting_title: string }[]>([])
  const [loadError, setLoadError]           = useState(false)
  // Project filter on the Recent packs tab. 'all' = no filter, 'none' = packs
  // without a project, otherwise = a project id.
  const [projectFilter, setProjectFilter]   = useState<'all' | 'none' | string>('all')

  // Returns true on success, false if any of the underlying queries errored.
  // CRITICAL: only overwrites state on success — prevents the "dashboard goes
  // blank after navigating back from settings" bug where Supabase's cold-start
  // returned an error (not empty data) and the previous logic blindly did
  // setMeetings([]) / setProjects([]) etc., wiping the visible state.
  const loadData = useCallback(async (): Promise<boolean> => {
    console.log('[dashboard] loadData: start')
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
    console.log('[dashboard] loadData: getSession result', {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      tokenPrefix: session?.access_token?.slice(0, 12),
      sessionErr,
    })
    if (!session?.access_token) {
      console.warn('[dashboard] loadData: no session JWT yet, will retry')
      return false
    }

    try {
      console.log('[dashboard] loadData: fetching /api/dashboard/data')
      const res = await fetch('/api/dashboard/data', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      console.log('[dashboard] loadData: response status', res.status)
      if (!res.ok) {
        console.error('[dashboard] loadData: HTTP error', res.status)
        return false
      }
      const data = await res.json()
      console.log('[dashboard] loadData: payload', {
        hasProfile: !!data.profile,
        projectsCount: data.projects?.length,
        meetingsCount: data.meetings?.length,
      })

      // Coherence guard: AuthProvider has already confirmed this user has a
      // real profile in the DB (otherwise profile would be null and we'd
      // have redirected to /login). If the API somehow returned a fully
      // empty payload — no profile, no projects, no meetings — that's an
      // upstream blip, not the truth. Trigger a retry instead of rendering
      // a blank "new account" dashboard, which is what was happening
      // intermittently on navigation.
      if (
        profile &&
        !data.profile &&
        (!data.projects || data.projects.length === 0) &&
        (!data.meetings || data.meetings.length === 0)
      ) {
        console.warn('Dashboard load: API returned empty for a known user — retrying')
        return false
      }

      // If the API got a fresher profile (e.g. uses_this_month bumped after
      // a recent flash), push it back into the AuthProvider store so the
      // sidebar badge stays in sync without us keeping a duplicate copy.
      if (data.profile && data.profile.uses_this_month !== profile?.uses_this_month) {
        refetchProfile().catch(() => {})
      }
      setProjects(data.projects || [])
      setMeetings(data.meetings || [])
      setOpenTasks(data.openTasks || [])
      return true
    } catch (err) {
      console.error('Dashboard load network error:', err)
      return false
    }
  }, [profile, refetchProfile])

  const runLoad = useCallback(async () => {
    setLoadError(false)
    let ok = await loadData()
    // Single retry at 1.5s for the rare case where the API route itself
    // hits Supabase mid-cold-start. Service-role queries don't have RLS
    // race issues, so we don't need the 3-attempt budget the old client-
    // side path needed.
    if (!ok) {
      await new Promise(r => setTimeout(r, 1500))
      ok = await loadData()
    }
    if (!ok) setLoadError(true)
    setLoading(false)
  }, [loadData])

  useEffect(() => {
    console.log('[dashboard] useEffect fire', { authLoading, hasUser: !!user, userId: user?.id })
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    console.log('[dashboard] useEffect: triggering runLoad')
    const timeout = setTimeout(() => {
      console.warn('[dashboard] 12s safety timeout fired — runLoad never finished')
      setLoading(false)
    }, 12000)
    runLoad().finally(() => clearTimeout(timeout))

    return () => clearTimeout(timeout)
  }, [user, authLoading, router, runLoad])

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-menu]')) setMenuOpen(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function deleteSelected() {
    if (!selected.length) return
    await supabase.from('meetings').delete().in('id', selected)
    setMeetings(prev => prev.filter(m => !selected.includes(m.id)))
    setSelected([]); setSelectMode(false)
  }

  async function deleteSelectedProjects() {
    if (!selected.length) return
    await supabase.from('projects').delete().in('id', selected)
    setProjects(prev => prev.filter(p => !selected.includes(p.id)))
    setSelected([]); setSelectMode(false)
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProject.trim() || !profile) return
    if (profile.plan === 'free' && projects.length >= 1) {
      alert('Free plan is limited to 1 project. Upgrade to Pro for unlimited projects.')
      window.location.href = '/pricing'
      return
    }
    setCreating(true)
    const { data } = await supabase
      .from('projects')
      .insert({ user_id: profile.id, name: newProject.trim() })
      .select().single()
    if (data) setProjects(prev => [data, ...prev])
    setNewProject(''); setShowNewProject(false); setCreating(false)
  }

  async function deleteMeeting(id: string) {
    await supabase.from('meetings').delete().eq('id', id)
    setMeetings(prev => prev.filter(m => m.id !== id))
    setMenuOpen(null)
  }

  async function deleteProject(id: string) {
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
    setMenuOpen(null)
  }

  async function renameMeeting(id: string, title: string) {
    if (!title.trim()) return
    await supabase.from('meetings').update({ title }).eq('id', id)
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, title } : m))
    setRenaming(null)
  }

  async function renameProject(id: string, name: string) {
    if (!name.trim()) return
    await supabase.from('projects').update({ name }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    setRenaming(null)
  }

  async function shareMeeting(id: string) {
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    await supabase.from('meetings').update({ share_token: token }).eq('id', id)
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`)
    setMenuOpen(null)
  }

  function getPackSummary(pack: Record<string, unknown>): string {
    const decisions = typeof pack?.decisions === 'string' ? pack.decisions : ''
    const actions   = typeof pack?.actions === 'string' ? pack.actions : ''
    const lines = [...decisions.split('\n'), ...actions.split('\n')]
      .filter(l => l.trim().startsWith('•'))
      .slice(0, 3)
      .map(l => l.replace('•', '').trim())
    return lines.join(' · ') || 'No summary available'
  }

  // Single source of truth — profile comes from useAuth() above. No more
  // local copy that could desync from the AuthProvider store.
  const usesLeft = profile?.plan === 'free'
    ? Math.max(0, 5 - (profile?.uses_this_month ?? 0))
    : Infinity

  // === DERIVED METRICS ===

  // Time saved this month — same heuristic as the post-flash toast on /app:
  // ~3 min per action item + 8 min for the email + 2 min for slack/agenda
  // formatting, floor 15 min per pack. Aggregates over packs created this
  // calendar month (1st → today).
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const minutesSavedThisMonth = meetings.reduce((acc, m) => {
    const created = new Date(m.created_at)
    if (created < monthStart) return acc
    const actionsStr = typeof m.pack?.actions === 'string' ? m.pack.actions : ''
    const actionsCount = actionsStr.split('\n').filter(l => l.trim().startsWith('•')).length
    return acc + Math.max(15, actionsCount * 3 + 10)
  }, 0)
  const hoursSavedThisMonth = Math.floor(minutesSavedThisMonth / 60)
  const minutesSavedRemainder = minutesSavedThisMonth % 60
  const packsThisMonth = meetings.filter(m => new Date(m.created_at) >= monthStart).length

  // Filter recent meetings by project (or "no project" or "all").
  const filteredMeetings = projectFilter === 'all'
    ? meetings
    : projectFilter === 'none'
      ? meetings.filter(m => !m.project_id)
      : meetings.filter(m => m.project_id === projectFilter)

  if (loading) return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingGlyph} />
    </div>
  )

  return (
    <div className={styles.page}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.sidebarLogo}>
          <Image src="/logo.png" alt="MeetingFlash" width={28} height={28} style={{ borderRadius: 6, objectFit: 'contain' }} priority />
          meetingflash
        </Link>

        <nav className={styles.sidebarNav}>
          <button className={`${styles.navItem} ${tab === 'recent' ? styles.navActive : ''}`} onClick={() => setTab('recent')}>
            <span className={styles.navDot}/>Recent packs
          </button>
          <button className={`${styles.navItem} ${tab === 'projects' ? styles.navActive : ''}`} onClick={() => setTab('projects')}>
            <span className={styles.navDot}/>Projects
          </button>
          <Link href="/dashboard/search" className={styles.navItem}>
            <span className={styles.navDot}/>Search
          </Link>
          <Link href="/dashboard/settings" className={styles.navItem}>
            <span className={styles.navDot}/>Settings
          </Link>
          <Link href="/app" className={styles.navFlash}>
            <span className={styles.flashIcon}/>New Flash
          </Link>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.planBadge}>
            <span className={styles.planName}>{profile?.plan ?? '—'}</span>
            <span className={styles.planUses}>
              {profile?.plan === 'free'
                ? `${usesLeft} / 5 left`
                : profile?.plan === 'pro' || profile?.plan === 'team'
                  ? 'Unlimited'
                  : '—'}
            </span>
          </div>
          {profile?.plan === 'free' && (
            <Link href="/pricing" className={styles.upgradeBtn}>Upgrade to Pro →</Link>
          )}
          <div className={styles.userRow}>
            <div className={styles.userEmail}>{profile?.email ?? user?.email}</div>
            <Link href="/dashboard/settings" className={styles.settingsLink}>⚙</Link>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        {loadError && (
          // Surface load failures explicitly instead of letting the dashboard
          // appear empty. The "blank dashboard after settings" bug was this:
          // queries errored on Supabase cold start, state stayed empty, user
          // assumed their data was lost. Now we tell them, and offer a retry.
          <div style={{
            margin: '0 0 24px 0',
            padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.03))',
            border: '1px solid rgba(245,158,11,0.32)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 13,
            color: 'var(--text)',
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong>Couldn&apos;t load your data.</strong> Your packs are still saved — this is a temporary connection issue.
            </div>
            <button
              onClick={() => {
                if (!user) return
                setLoading(true)
                runLoad()
              }}
              style={{
                background: 'var(--blue)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}
        <div className={styles.mainHeader}>
          <div className={styles.mainTitle}>
            {tab === 'recent'
              ? <><span className={styles.titleSerif}>Recent</span> Execution Packs</>
              : <><span className={styles.titleSerif}>Your</span> Projects</>
            }
          </div>
          <div className={styles.mainHeaderRight}>
            <ThemeToggle />
            {selectMode && selected.length > 0 && (
              <button
                className={styles.deleteSelectedBtn}
                onClick={tab === 'recent' ? deleteSelected : deleteSelectedProjects}
              >
                Delete {selected.length}
              </button>
            )}
            {/* Hide Select when there's nothing to select on the active tab */}
            {((tab === 'recent' && meetings.length > 0) || (tab === 'projects' && projects.length > 0)) && (
              <button
                className={`${styles.selectModeBtn} ${selectMode ? styles.selectModeBtnActive : ''}`}
                onClick={() => { setSelectMode(!selectMode); setSelected([]) }}
              >
                {selectMode ? '✕ Cancel' : 'Select'}
              </button>
            )}
            {tab === 'projects' && (
              <button
                className={styles.newProjectBtn}
                onClick={() => setShowNewProject(!showNewProject)}
              >
                + New project
              </button>
            )}
            <Link href="/app" className={styles.newFlashBtn}>
              <span className={styles.flashIcon}/>New Flash
            </Link>
          </div>
        </div>

        {/* NEW PROJECT FORM */}
        {tab === 'projects' && showNewProject && (
          <form onSubmit={handleCreateProject} className={styles.newProjectForm}>
            <input
              className={styles.projectInput}
              value={newProject}
              onChange={e => setNewProject(e.target.value)}
              placeholder="Project name — e.g. Client Acme, Product Q2…"
              autoFocus
            />
            <button type="submit" className={styles.projectSubmit} disabled={creating}>
              {creating ? 'Creating—' : 'Create →'}
            </button>
            <button type="button" className={styles.projectCancel} onClick={() => setShowNewProject(false)}>
              Cancel
            </button>
          </form>
        )}

        {/* OPEN ACTIONS WIDGET — sticky reason to come back */}
        {tab === 'recent' && openTasks.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(245,158,11,0.03))',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 14,
            padding: '20px 24px',
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                  {openTasks.length} open action{openTasks.length > 1 ? 's' : ''} across your meetings
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pick one and close it ↓</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {openTasks.slice(0, 5).map(t => (
                <Link
                  key={t.id}
                  href={`/dashboard/pack/${t.meeting_id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'var(--text)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.text}
                  </span>
                  {t.owner && t.owner !== 'Team' && (
                    <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{t.owner}</span>
                  )}
                  {t.deadline && (
                    <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, flexShrink: 0 }}>{t.deadline}</span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0, fontStyle: 'italic' }}>
                    {t.meeting_title}
                  </span>
                </Link>
              ))}
            </div>
            {openTasks.length > 5 && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>
                +{openTasks.length - 5} more — open a pack to mark them done
              </div>
            )}
          </div>
        )}

        {/* RECENT PACKS */}
        {tab === 'recent' && (
          <div className={styles.content}>
            {/* TIME SAVED THIS MONTH — value reinforcement at every dashboard
                visit. Hidden if the user has zero packs (nothing to celebrate
                yet) or zero packs THIS MONTH (don't show "0h saved" — it's
                discouraging). */}
            {meetings.length > 0 && minutesSavedThisMonth > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                marginBottom: 24,
                background: 'linear-gradient(135deg, rgba(37,99,235,0.10) 0%, rgba(96,165,250,0.03) 100%)',
                border: '1px solid rgba(37,99,235,0.22)',
                borderRadius: 14,
              }}>
                <div style={{ fontSize: 28 }}>⏱️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
                    {hoursSavedThisMonth > 0
                      ? <>~{hoursSavedThisMonth}h{minutesSavedRemainder > 0 ? ` ${minutesSavedRemainder}m` : ''}</>
                      : <>~{minutesSavedThisMonth} min</>
                    }
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)', marginLeft: 8 }}>
                      saved this month
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    Across {packsThisMonth} pack{packsThisMonth !== 1 ? 's' : ''} — that&apos;s admin time you got back.
                  </div>
                </div>
              </div>
            )}

            {/* PROJECT FILTER — only shown when at least one project exists,
                otherwise the dropdown would be useless single-option. */}
            {meetings.length > 0 && projects.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
                fontSize: 13,
                color: 'var(--muted)',
              }}>
                <span>Filter:</span>
                <select
                  value={projectFilter}
                  onChange={e => setProjectFilter(e.target.value)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 13,
                    fontFamily: 'var(--font)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All packs ({meetings.length})</option>
                  <option value="none">No project ({meetings.filter(m => !m.project_id).length})</option>
                  {projects.map(p => {
                    const count = meetings.filter(m => m.project_id === p.id).length
                    return <option key={p.id} value={p.id}>{p.name} ({count})</option>
                  })}
                </select>
                {projectFilter !== 'all' && (
                  <button
                    onClick={() => setProjectFilter('all')}
                    style={{ background: 'none', border: 'none', color: 'var(--blue3)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}

            {meetings.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyGlyph}/>
                <p>No packs yet. Flash your first meeting.</p>
                <Link href="/app" className={styles.emptyBtn}>Flash a meeting →</Link>
              </div>
            ) : filteredMeetings.length === 0 ? (
              <div className={styles.empty}>
                <p>No packs in this filter. <button onClick={() => setProjectFilter('all')} style={{ background: 'none', border: 'none', color: 'var(--blue3)', cursor: 'pointer', textDecoration: 'underline' }}>Show all packs</button></p>
              </div>
            ) : (
              <div className={styles.meetingList}>
                {filteredMeetings.map(m => (
                  <div
                    key={m.id}
                    className={`${styles.meetingRow} ${selectMode && selected.includes(m.id) ? styles.meetingRowSelected : ''}`}
                    onMouseEnter={() => setHovered(m.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {selectMode && (
                      <div
                        className={`${styles.checkbox} ${selected.includes(m.id) ? styles.checkboxChecked : ''}`}
                        onClick={() => toggleSelect(m.id)}
                      >
                        {selected.includes(m.id) && '✓'}
                      </div>
                    )}

                    <Link href={`/dashboard/pack/${m.id}`} className={styles.meetingLeft}>
                      <div className={styles.meetingTitle}>{m.title}</div>
                      <div className={styles.meetingMeta}>
                        {m.project_id && (
                          <span className={styles.meetingProject}>
                            {projects.find(p => p.id === m.project_id)?.name ?? 'Project'}
                          </span>
                        )}
                        <span className={styles.meetingDate}>
                          {new Date(m.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                      {hovered === m.id && (
                        <div className={styles.packSummary}>
                          {getPackSummary(m.pack)}
                        </div>
                      )}
                    </Link>

                    {!selectMode && (
                      <div className={styles.rowActions}>
                        <button
                          className={styles.menuTrigger}
                          data-menu="true"
                          onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === m.id ? null : m.id) }}
                        >
                          ···
                        </button>
                        {menuOpen === m.id && (
                          <div className={styles.contextMenu} data-menu="true" onClick={e => e.stopPropagation()}>
                            <button className={styles.contextMenuItem} onClick={() => { setRenaming(m.id); setRenameValue(m.title) }}>
                              Rename
                            </button>
                            <button className={styles.contextMenuItem} onClick={() => shareMeeting(m.id)}>
                              Copy share link
                            </button>
                            <button className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`} onClick={() => deleteMeeting(m.id)}>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROJECTS */}
        {tab === 'projects' && (
          <div className={styles.content}>
            {projects.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyGlyph}/>
                <p>No projects yet. Create one to track meeting history.</p>
              </div>
            ) : (
              <div className={styles.projectGrid}>
                {projects.map(p => (
                  <div
                    key={p.id}
                    className={`${styles.projectCard} ${selectMode && selected.includes(p.id) ? styles.projectCardSelected : ''}`}
                  >
                    {selectMode && (
                      <div
                        className={`${styles.checkbox} ${selected.includes(p.id) ? styles.checkboxChecked : ''}`}
                        onClick={() => toggleSelect(p.id)}
                      >
                        {selected.includes(p.id) && '✓'}
                      </div>
                    )}

                    <Link href={`/dashboard/project/${p.id}`} className={styles.projectCardTop}>
                      <div className={styles.projectName}>{p.name}</div>
                      <span className={styles.projectArrow}>→</span>
                    </Link>

                    <div className={styles.projectBottom}>
                      <div className={styles.projectStats}>
                        <span>{meetings.filter(m => m.project_id === p.id).length} meetings</span>
                        <span>{new Date(p.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                      </div>
                      {!selectMode && (
                        <div className={styles.rowActions}>
                          <button
                            className={styles.menuTrigger}
                            data-menu="true"
                            onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id) }}
                          >
                            ···
                          </button>
                          {menuOpen === p.id && (
                            <div className={styles.contextMenu} onClick={e => e.stopPropagation()}>
                              <button className={styles.contextMenuItem} onClick={() => { setRenaming(p.id); setRenameValue(p.name) }}>
                                Rename
                              </button>
                              <button className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`} onClick={() => deleteProject(p.id)}>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* RENAME MODAL */}
      {renaming && (
        <div className={styles.modalOverlay} onClick={() => setRenaming(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Rename</div>
            <input
              className={styles.modalInput}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const m = meetings.find(x => x.id === renaming)
                  if (m) renameMeeting(m.id, renameValue)
                  else {
                    const p = projects.find(x => x.id === renaming)
                    if (p) renameProject(p.id, renameValue)
                  }
                }
              }}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalSave}
                onClick={() => {
                  const m = meetings.find(x => x.id === renaming)
                  if (m) renameMeeting(m.id, renameValue)
                  else {
                    const p = projects.find(x => x.id === renaming)
                    if (p) renameProject(p.id, renameValue)
                  }
                }}
              >Save</button>
              <button className={styles.modalCancel} onClick={() => setRenaming(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}