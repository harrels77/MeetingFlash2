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