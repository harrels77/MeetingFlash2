'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './project.module.css'

interface Project {
  id: string
  name: string
  description: string | null
  notes: string | null
  created_at: string
}

interface Meeting {
  id: string
  title: string
  created_at: string
  pack: Record<string, string>
}

interface Task {
  id: string
  text: string
  owner: string
  deadline: string | null
  priority: string
  status: 'todo' | 'in_progress' | 'done'
  meeting_id: string
}

export default function ProjectDetail() {
  const router = useRouter()
  const params = useParams()
  const [project, setProject]   = useState<Project | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [tasks, setTasks]       = useState<Task[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'overview' | 'decisions' | 'tasks'>('overview')
  const [notesDraft, setNotesDraft] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [savingNotes, setSavingNotes]   = useState(false)


  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    // Load project
    const { data: proj } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (!proj) { router.push('/dashboard'); return }
    setProject(proj)
    setNotesDraft(proj.notes || '')

    // Load meetings in this project
    const { data: meets } = await supabase
      .from('meetings')
      .select('*')
      .eq('project_id', params.id)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    setMeetings(meets || [])

    // Load all tasks for meetings in this project
    if (meets && meets.length > 0) {
      const meetingIds = meets.map((m: Meeting) => m.id)
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .in('meeting_id', meetingIds)
        .order('created_at', { ascending: false })

      setTasks(taskData || [])
    }

    setLoading(false)
  }, [params.id, router])

  useEffect(() => { load() }, [load])

  async function saveNotes() {
    if (!project) return
    setSavingNotes(true)
    const trimmed = notesDraft.trim()
    await supabase
      .from('projects')
      .update({ notes: trimmed || null })
      .eq('id', project.id)
    setProject({ ...project, notes: trimmed || null })
    setSavingNotes(false)
    setEditingNotes(false)
  }

  async function updateTaskStatus(taskId: string, status: 'todo' | 'in_progress' | 'done') {
    await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
  }

  const allDecisions = meetings.flatMap(m => {
    const raw = typeof m.pack?.decisions === 'string' ? m.pack.decisions : ''
    return raw
      .split('\n')
      .filter((line: string) => line.trim().startsWith('•'))
      .map((line: string) => ({ text: line.replace('•', '').trim(), meetingTitle: m.title, meetingId: m.id, date: m.created_at }))
  })

  const tasksDone       = tasks.filter(t => t.status === 'done').length
  const tasksInProgress = tasks.filter(t => t.status === 'in_progress').length
  const tasksTodo       = tasks.filter(t => t.status === 'todo').length

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.loadingGlyph} />
    </div>
  )

  if (!project) return null

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.back}>← Dashboard</Link>
        <ThemeToggle />
      </nav>

      <div className={styles.content}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerMeta}>
            <span className={styles.date}>
              Created {new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className={styles.metaDot}>·</span>
            <span className={styles.date}>{meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</span>
          </div>
          <h1 className={styles.title}>{project.name}</h1>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <div className={styles.statN}>{meetings.length}</div>
              <div className={styles.statL}>Meetings</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>{allDecisions.length}</div>
              <div className={styles.statL}>Decisions</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>{tasks.length}</div>
              <div className={styles.statL}>Tasks</div>
            </div>
            <div className={styles.stat}>
              <div className={`${styles.statN} ${styles.statDone}`}>{tasksDone}</div>
              <div className={styles.statL}>Done</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className={styles.tabs}>
          {(['overview', 'decisions', 'tasks'] as const).map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className={styles.tabContent}>
            {/* Project notes — long-running context (client, deal size, do's/don'ts).
                Injected into every flash on this project as PROJECT MEMORY so the
                AI has persistent background that won't fit in any single transcript. */}
            <div style={{
              marginBottom: 28,
              padding: 20,
              background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(96,165,250,0.02) 100%)',
              border: '1px solid rgba(37,99,235,0.22)',
              borderRadius: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  <span style={{ fontSize: 16 }}>🧠</span>
                  Project notes
                  <span style={{ fontSize: 11, color: 'var(--blue3)', fontWeight: 500, fontStyle: 'italic' }}>
                    · injected into every new flash on this project
                  </span>
                </div>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border2)',
                      color: 'var(--muted)',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {project?.notes ? 'Edit' : '+ Add notes'}
                  </button>
                )}
              </div>

              {editingNotes ? (
                <>
                  <textarea
                    value={notesDraft}
                    onChange={e => setNotesDraft(e.target.value)}
                    placeholder="Long-running context for this project — e.g. client name + role of each contact, deal size, key constraints, things to avoid saying, the founder's tone preference. Anything that should colour every meeting recap."
                    style={{
                      width: '100%',
                      minHeight: 140,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontFamily: 'var(--font)',
                      fontSize: 13,
                      lineHeight: 1.6,
                      padding: 14,
                      borderRadius: 10,
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setEditingNotes(false); setNotesDraft(project?.notes || '') }}
                      style={{ background: 'none', border: '1px solid var(--border2)', color: 'var(--muted)', fontSize: 13, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNotes}
                      disabled={savingNotes}
                      style={{ background: 'var(--blue)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 8, cursor: 'pointer' }}
                    >
                      {savingNotes ? 'Saving…' : 'Save notes'}
                    </button>
                  </div>
                </>
              ) : project?.notes ? (
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                  {project.notes}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
                  No notes yet. Add context that should travel with every meeting on this project — client info, deal stage, language tone, key constraints.
                </div>
              )}
            </div>

            <div className={styles.sectionTitle}>Meeting history</div>
            {meetings.length === 0 ? (
              <div className={styles.empty}>
                <p>No meetings in this project yet.</p>
                <Link href="/app" className={styles.emptyBtn}>Flash a meeting →</Link>
              </div>
            ) : (
              <div className={styles.meetingList}>
                {meetings.map(m => (
                  <Link key={m.id} href={`/dashboard/pack/${m.id}`} className={styles.meetingRow}>
                    <div className={styles.meetingTitle}>{m.title}</div>
                    <div className={styles.meetingMeta}>
                      <span>{new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className={styles.meetingArrow}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DECISIONS TAB */}
        {tab === 'decisions' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionTitle}>All decisions across meetings</div>
            {allDecisions.length === 0 ? (
              <div className={styles.empty}><p>No decisions recorded yet.</p></div>
            ) : (
              <div className={styles.decisionList}>
                {allDecisions.map((d, i) => (
                  <div key={i} className={styles.decisionRow}>
                    <div className={styles.decisionDot} />
                    <div className={styles.decisionContent}>
                      <div className={styles.decisionText}>{d.text}</div>
                      <div className={styles.decisionMeta}>
                        <Link href={`/dashboard/pack/${d.meetingId}`} className={styles.decisionMeeting}>
                          {d.meetingTitle}
                        </Link>
                        <span className={styles.metaDot}>·</span>
                        <span className={styles.decisionDate}>
                          {new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === 'tasks' && (
          <div className={styles.tabContent}>
            <div className={styles.taskHeader}>
              <div className={styles.sectionTitle}>All tasks</div>
              <div className={styles.taskSummary}>
                <span className={styles.taskChip} style={{color:'var(--ash)'}}>Todo {tasksTodo}</span>
                <span className={styles.taskChip} style={{color:'var(--ember)'}}>In progress {tasksInProgress}</span>
                <span className={styles.taskChip} style={{color:'var(--spark)'}}>Done {tasksDone}</span>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className={styles.empty}><p>No tasks yet.</p></div>
            ) : (
              <div className={styles.taskList}>
                {tasks.map(task => {
                  const meeting = meetings.find(m => m.id === task.meeting_id)
                  return (
                    <div key={task.id} className={`${styles.taskRow} ${styles[`task_${task.status}`]}`}>
                      <div className={styles.taskLeft}>
                        <div className={styles.taskText}>{task.text}</div>
                        <div className={styles.taskMeta}>
                          {task.owner && <span className={styles.taskOwner}>{task.owner}</span>}
                          {task.deadline && (
                            <><span className={styles.metaDot}>·</span>
                            <span className={styles.taskDeadline}>{task.deadline}</span></>
                          )}
                          {meeting && (
                            <><span className={styles.metaDot}>·</span>
                            <Link href={`/dashboard/pack/${meeting.id}`} className={styles.taskMeetingLink}>
                              {meeting.title}
                            </Link></>
                          )}
                        </div>
                      </div>
                      <div className={styles.taskActions}>
                        {(['todo', 'in_progress', 'done'] as const).map(s => (
                          <button
                            key={s}
                            className={`${styles.statusBtn} ${task.status === s ? styles.statusBtnActive : ''} ${styles[`statusBtn_${s}`]}`}
                            onClick={() => updateTaskStatus(task.id, s)}
                          >
                            {s === 'todo' ? 'Todo' : s === 'in_progress' ? 'In progress' : 'Done'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}