'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import styles from './search.module.css'

interface MeetingRaw {
  id: string
  title: string
  created_at: string
  pack: Record<string, string>
}

interface Result {
  id: string
  title: string
  created_at: string
  pack: Record<string, string>
  matchedIn: string[]
}

export default function Search() {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [all, setAll]         = useState<MeetingRaw[]>([])
  const [loading, setLoading] = useState(true)
  const [locked, setLocked]   = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', session.user.id)
        .single()

      if (profile?.plan !== 'pro' && profile?.plan !== 'team') {
        setLocked(true)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('meetings')
        .select('id, title, created_at, pack')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setAll(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const search = useCallback((q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }

    const lower = q.toLowerCase()
    const matched = all
      .map(m => {
        const matchedIn: string[] = []
        const fields = ['decisions', 'actions', 'questions', 'risks', 'email', 'slack', 'agenda']
        fields.forEach(f => {
          if (typeof m.pack?.[f] === 'string' && m.pack[f].toLowerCase().includes(lower)) {
            matchedIn.push(f)
          }
        })
        if (m.title?.toLowerCase().includes(lower)) matchedIn.push('title')
        return { ...m, matchedIn }
      })
      .filter(m => m.matchedIn.length > 0)

    setResults(matched)
  }, [all])

  function highlight(text: string, q: string) {
    if (!q || !text) return text
    const parts = text.split(new RegExp(`(${q})`, 'gi'))
    return parts.map((p, i) =>
      p.toLowerCase() === q.toLowerCase()
        ? `<mark>${p}</mark>`
        : p
    ).join('')
  }

  function getSnippet(pack: Record<string, string>, q: string) {
    const fields = ['decisions', 'actions', 'questions', 'risks']
    for (const f of fields) {
      const raw = pack?.[f]

      const text =
        typeof raw === 'string'
          ? raw
          : raw
          ? JSON.stringify(raw)
          : ''

      const idx = text.toLowerCase().indexOf(q.toLowerCase())

      if (idx !== -1) {
        const start = Math.max(0, idx - 40)
        const end = Math.min(text.length, idx + q.length + 80)
      }
    }
    return ''
  }

  if (locked) return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.back}>← Dashboard</Link>
        <ThemeToggle />
      </nav>
      <div className={styles.content} style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Smart Search is a Pro feature</h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, maxWidth: 480, margin: '0 auto 28px' }}>
          Search across every decision, action, and follow-up you&apos;ve ever flashed. Available on the Pro plan.
        </p>
        <Link href="/#pricing" style={{ display: 'inline-block', background: 'var(--blue)', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/dashboard" className={styles.back}>← Dashboard</Link>
        <ThemeToggle />
      </nav>

      <div className={styles.content}>
        <div className={styles.searchWrap}>
          <div className={styles.searchIcon}>⌕</div>
          <input
            className={styles.searchInput}
            value={query}
            onChange={e => search(e.target.value)}
            placeholder="Search across all meetings…"
            autoFocus
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => search('')}>✕</button>
          )}
        </div>

        {loading && (
          <div className={styles.status}>Loading meetings…</div>
        )}

        {!loading && !query && (
          <div className={styles.status}>
            {all.length} meeting{all.length !== 1 ? 's' : ''} indexed. Start typing to search.
          </div>
        )}

        {query && results.length === 0 && (
          <div className={styles.status}>No results for "{query}"</div>
        )}

        {results.length > 0 && (
          <>
            <div className={styles.resultCount}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </div>
            <div className={styles.results}>
              {results.map(r => {
                const snippet = getSnippet(r.pack, query)
                return (
                  <Link key={r.id} href={`/dashboard/pack/${r.id}`} className={styles.result}>
                    <div className={styles.resultTop}>
                      <div
                        className={styles.resultTitle}
                        dangerouslySetInnerHTML={{ __html: highlight(r.title, query) }}
                      />
                      <div className={styles.resultDate}>
                        {new Date(r.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className={styles.resultTags}>
                      {r.matchedIn.map(f => (
                        <span key={f} className={styles.resultTag}>{f}</span>
                      ))}
                    </div>
                    {snippet && (
                      <div
                        className={styles.resultSnippet}
                        dangerouslySetInnerHTML={{ __html: highlight(snippet, query) }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}