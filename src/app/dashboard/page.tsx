'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthProvider'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './dashboard.module.css'


interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: string
  uses_this_month: number
}

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
  const { user, profile: authProfile, loading: authLoading } = useAuth()
  const [profile, setProfile]   = useState<Profile | null>(null)
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

  // Returns true on success, false if any of the underlying queries errored.
  // CRITICAL: only overwrites state on success — prevents the "dashboard goes
  // blank after navigating back from settings" bug where Supabase's cold-start
  // returned an error (not empty data) and the previous logic blindly did
  // setMeetings([]) / setProjects([]) etc., wiping the visible state.
  const loadData = useCallback(async (userId: string, userEmail: string): Promise<boolean> => {
    // Wait for the JWT to be present before firing queries — without this,
    // a navigation that races with a Supabase token refresh can issue all
    // four queries unauthenticated, RLS silently returns empty results
    // (no error code), and the dashboard renders blank + "FREE / Unlimited".
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      console.warn('Dashboard load: no session JWT yet, will retry')
      return false
    }

    const [profResult, projResult, meetsResult, tasksResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('meetings').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('tasks').select('id, text, owner, deadline, meeting_id, status').eq('user_id', userId).neq('status', 'done').order('created_at', { ascending: false }).limit(20)
    ])

    // Profile single() returns error PGRST116 when no row — that's not a real
    // failure, we'll create the row below. Any other error is treated as failure.
    const profSoftError = profResult.error && profResult.error.code !== 'PGRST116'
    const anyError = profSoftError || projResult.error || meetsResult.error || tasksResult.error
    if (anyError) {
      console.error('Dashboard load error:', { profErr: profResult.error, projErr: projResult.error, meetsErr: meetsResult.error, tasksErr: tasksResult.error })
      return false
    }

    let prof = profResult.data
    if (!prof) {
      const { data: newProf } = await supabase
        .from('profiles')
        .insert({ id: userId, email: userEmail, plan: 'free', uses_this_month: 0 })
        .select().single()
      prof = newProf
    }
    if (prof) setProfile(prof)
    setProjects(projResult.data || [])
    setMeetings(meetsResult.data || [])

    const allMeetings = meetsResult.data || []
    const meetingTitleById = new Map(allMeetings.map(m => [m.id, m.title]))
    const enrichedTasks = (tasksResult.data || []).map(t => ({
      id: t.id,
      text: t.text,
      owner: t.owner,
      deadline: t.deadline,
      meeting_id: t.meeting_id,
      meeting_title: meetingTitleById.get(t.meeting_id) || 'Untitled meeting',
    }))
    setOpenTasks(enrichedTasks)
    return true
  }, [])

  const runLoad = useCallback(async (userId: string, userEmail: string) => {
    setLoadError(false)
    let ok = await loadData(userId, userEmail)
    // Cold-start retry once after 1.5s — Supabase free tier wakes up on the second hit.
    if (!ok) {
      await new Promise(r => setTimeout(r, 1500))
      ok = await loadData(userId, userEmail)
    }
    if (!ok) setLoadError(true)
    setLoading(false)
  }, [loadData])

  useEffect(() => {
    // Wait for AuthProvider to finish its initial check (instant from React context)
    if (authLoading) return

    // Not signed in → redirect to login immediately, no spinner
    if (!user) { router.replace('/login'); return }

    // Safety net: never let the spinner run more than 12s (covers the 1.5s retry)
    const timeout = setTimeout(() => setLoading(false), 12000)
    runLoad(user.id, user.email ?? '').finally(() => clearTimeout(timeout))

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

  // Prefer the local profile (freshest, includes uses_this_month after a flash)
  // but fall back to AuthProvider's profile so the sidebar badge never shows
  // a contradictory "FREE / Unlimited" when local load hasn't completed yet.
  const effectiveProfile = profile ?? authProfile
  const usesLeft = effectiveProfile?.plan === 'free'
    ? Math.max(0, 5 - (effectiveProfile?.uses_this_month ?? 0))
    : Infinity

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
            <span className={styles.planName}>{effectiveProfile?.plan ?? '—'}</span>
            <span className={styles.planUses}>
              {effectiveProfile?.plan === 'free'
                ? `${usesLeft} / 5 left`
                : effectiveProfile?.plan === 'pro' || effectiveProfile?.plan === 'team'
                  ? 'Unlimited'
                  : '—'}
            </span>
          </div>
          {effectiveProfile?.plan === 'free' && (
            <Link href="/pricing" className={styles.upgradeBtn}>Upgrade to Pro →</Link>
          )}
          <div className={styles.userRow}>
            <div className={styles.userEmail}>{effectiveProfile?.email ?? user?.email}</div>
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
                runLoad(user.id, user.email ?? '')
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
            {meetings.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyGlyph}/>
                <p>No packs yet. Flash your first meeting.</p>
                <Link href="/app" className={styles.emptyBtn}>Flash a meeting →</Link>
              </div>
            ) : (
              <div className={styles.meetingList}>
                {meetings.map(m => (
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