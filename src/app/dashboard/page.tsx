'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
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

  const loadData = useCallback(async (userId: string, userEmail: string) => {
    try {
      const [profResult, projResult, meetsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('meetings').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50)
      ])

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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      loadData(session.user.id, session.user.email ?? '')
    })
  }, [router, loadData])

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

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newProject.trim() || !profile) return
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

  const usesLeft = profile?.plan === 'free'
    ? Math.max(0, 3 - (profile?.uses_this_month ?? 0))
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
          <img src="/logo.png" alt="MeetingFlash" width={28} height={28} style={{ borderRadius: 6 }} />
          <div className={styles.logoMark}><div className={styles.logoInner}/></div>
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
            <span className={styles.planName}>{profile?.plan ?? 'free'}</span>
            <span className={styles.planUses}>
              {profile?.plan === 'free' ? `${usesLeft} / 3 left` : 'Unlimited'}
            </span>
          </div>
          {profile?.plan === 'free' && (
            <Link href="/#pricing" className={styles.upgradeBtn}>Upgrade to Pro →</Link>
          )}
          <div className={styles.userRow}>
            <div className={styles.userEmail}>{profile?.email}</div>
            <Link href="/dashboard/settings" className={styles.settingsLink}>⚙</Link>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className={styles.main}>
        <div className={styles.mainHeader}>
          <div className={styles.mainTitle}>
            {tab === 'recent'
              ? <><span className={styles.titleSerif}>Recent</span> Execution Packs</>
              : <><span className={styles.titleSerif}>Your</span> Projects</>
            }
          </div>
          <div className={styles.mainHeaderRight}>
            {selectMode && selected.length > 0 && (
              <button
                className={styles.deleteSelectedBtn}
                onClick={tab === 'recent' ? deleteSelected : deleteSelectedProjects}
              >
                Delete {selected.length}
              </button>
            )}
            <button
              className={`${styles.selectModeBtn} ${selectMode ? styles.selectModeBtnActive : ''}`}
              onClick={() => { setSelectMode(!selectMode); setSelected([]) }}
            >
              {selectMode ? '✕ Cancel' : 'Select'}
            </button>
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