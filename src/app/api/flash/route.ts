import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildFlashPrompt, generatePack, MAX_INPUT_CHARS, MIN_INPUT_CHARS } from '@/lib/flashCore'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  try {
    const { text, lang, style, projectId } = await req.json()

    if (text && text.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: 'Notes are too long (max ~60,000 characters). Paste the relevant part of the transcript.' },
        { status: 413 }
      )
    }
    if (!text || text.trim().length < MIN_INPUT_CHARS) {
      return NextResponse.json({ error: 'Transcript too short' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Plan-gate languages: only Pro+ may use non-English output.
    let effectiveLang = lang
    const authHeaderForGate = req.headers.get('authorization')
    if (lang && lang !== 'EN') {
      let allowed = false
      if (authHeaderForGate) {
        const gateClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: authHeaderForGate } } }
        )
        const { data: { user } } = await gateClient.auth.getUser()
        if (user) {
          const { data: gateProfile } = await gateClient
            .from('profiles').select('plan').eq('id', user.id).single()
          if (gateProfile?.plan === 'pro' || gateProfile?.plan === 'team') allowed = true
        }
      }
      if (!allowed) effectiveLang = 'EN'
    }

    // Active memory: if this meeting belongs to a project, pull prior decisions + open actions from earlier meetings on the same project
    // and inject them so Claude can cross-reference (= the moat vs ChatGPT, which has no access to prior context).
    let projectContext = ''
    if (projectId && authHeaderForGate) {
      try {
        const memClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: authHeaderForGate } } }
        )
        const { data: { user } } = await memClient.auth.getUser()
        if (user) {
          // Project-level free-text notes (long-running context: client info,
          // deal size, tone preferences, do's/don'ts). Edited from /dashboard/project/[id].
          const { data: projectRow } = await memClient
            .from('projects')
            .select('name, notes')
            .eq('id', projectId)
            .eq('user_id', user.id)
            .single()

          // Last 5 meetings on this project (most recent first), excluding the one we're about to create
          const { data: priorMeetings } = await memClient
            .from('meetings')
            .select('title, created_at, pack')
            .eq('user_id', user.id)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(5)

          // Open tasks (not done) on this project's meetings
          const { data: openTasks } = await memClient
            .from('tasks')
            .select('text, owner, deadline, priority, meetings!inner(project_id)')
            .eq('user_id', user.id)
            .eq('meetings.project_id', projectId)
            .neq('status', 'done')
            .limit(20)

          const priorBlocks: string[] = []
          if (projectRow?.notes && projectRow.notes.trim().length > 0) {
            priorBlocks.push(`PROJECT BRIEF (persistent context the user has set for "${projectRow.name}"):\n${projectRow.notes.trim()}`)
          }
          if (priorMeetings && priorMeetings.length > 0) {
            const decisions = priorMeetings
              .map(m => {
                const d = (m.pack as { decisions?: string })?.decisions
                return d && d !== 'No decisions identified.' ? `From "${m.title}":\n${d}` : null
              })
              .filter(Boolean)
              .slice(0, 3)
            if (decisions.length > 0) {
              priorBlocks.push(`PRIOR DECISIONS ON THIS PROJECT (most recent first):\n${decisions.join('\n\n')}`)
            }
          }
          if (openTasks && openTasks.length > 0) {
            const taskLines = openTasks
              .map(t => `- ${t.owner || 'Team'} → ${t.text}${t.deadline ? ` (by ${t.deadline})` : ''}${t.priority === 'high' ? ' [P0]' : ''}`)
              .join('\n')
            priorBlocks.push(`STILL-OPEN ACTIONS FROM PRIOR MEETINGS:\n${taskLines}`)
          }

          if (priorBlocks.length > 0) {
            projectContext = `\n\n=== PROJECT MEMORY (context from prior meetings on this same project) ===\n${priorBlocks.join('\n\n')}\n\nIMPORTANT: When relevant, your snapshot and questions sections should cross-reference this prior context. If a still-open action from a prior meeting was discussed in this meeting, mention progress (or lack of). If a prior decision is being revisited or contradicted, surface it. If a prior commitment is still hanging unresolved and this meeting did not address it, flag it as an inferred open question. This cross-reference is what separates this tool from a generic AI summarizer.\n=== END PROJECT MEMORY ===\n`
          }
        }
      } catch (memError) {
        console.error('Project memory fetch error:', memError)
        // Don't fail the flash — just skip the memory injection
      }
    }

    // Prompt + model call live in src/lib/flashCore.ts so the web app and the
    // email-ingestion route (/api/email/inbound) always produce identical packs.
    let pack
    try {
      pack = await generatePack(
        buildFlashPrompt({ text, lang: effectiveLang, style, projectContext })
      )
    } catch (genErr) {
      if (genErr instanceof Error && genErr.name === 'AbortError') {
        return NextResponse.json({ error: 'AI service timed out. Please try again.' }, { status: 504 })
      }
      console.error('Anthropic error:', genErr)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    // Save to database if user is logged in
    const authHeader = req.headers.get('authorization')
    if (authHeader) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: authHeader } } }
        )

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: savedMeeting } = await supabase.from('meetings').insert({
            user_id: user.id,
            project_id: projectId || null,
            title: pack.title || 'Untitled Meeting',
            raw_notes: text,
            pack,
            lang: effectiveLang,
            style,
          }).select('id').single()

          if (savedMeeting && pack.tasks && Array.isArray(pack.tasks) && pack.tasks.length > 0) {
            const tasksToInsert = pack.tasks.map(t => ({
              user_id: user.id,
              meeting_id: savedMeeting.id,
              text: t.text,
              owner: t.owner || 'Team',
              deadline: t.deadline || null,
              priority: t.priority || 'medium',
              status: 'todo',
            }))
            await supabase.from('tasks').insert(tasksToInsert)
          }

          // Increment usage count — via service role: the RPC's public
          // EXECUTE grants were revoked (security audit 2026-07) so the
          // user-scoped client can no longer call it.
          const adminClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )
          await adminClient.rpc('increment_uses', { user_id: user.id })

          // Send nudge email when free user hits their limit
          const { data: prof } = await supabase
            .from('profiles')
            .select('plan, uses_this_month, email, full_name')
            .eq('id', user.id)
            .single()
          if (prof?.plan === 'free' && prof.uses_this_month >= 5) {
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/nudge`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-internal-key': process.env.CRON_SECRET || '' },
              body: JSON.stringify({ email: prof.email, name: prof.full_name }),
            }).catch(() => {})
          }
        }
      } catch (saveError) {
        console.error('Save error:', saveError)
        // Don't fail the request if save fails
      }
    }

    return NextResponse.json({ pack })

  } catch (err) {
    console.error('Flash API error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}