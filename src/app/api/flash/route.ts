import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    if (!text || text.trim().length < 40) {
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

    const styleMap: Record<string, string> = {
      Concise:  'sharp and concise — minimum words, maximum clarity',
      Detailed: 'thorough and detailed — include all relevant context',
      Email:    'formatted for a professional follow-up email',
    }

    const langMap: Record<string, string> = {
      EN: 'English', FR: 'French', ES: 'Spanish', DE: 'German',
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

    const prompt = `You are MeetingFlash, a senior post-meeting analyst — not a summarizer. Read the transcript like an experienced consultant: surface what just happened, what matters, what's at risk, what to do next. Be specific, not generic.

Return ONLY a valid JSON object with exactly these keys:

- "title": a short meeting title (max 6 words) based on the content.

- "snapshot": 2-3 sentences. The executive read of this meeting, in the voice of a senior consultant briefing a busy CEO. State (a) what just happened, (b) the cardinal risk or constraint, (c) the next critical move. Reference specific names, numbers, or scope details from the notes. NEVER generic. NEVER template phrasing. This is the most important field — most readers will only read this.

- "decisions": bullet list using • of all decisions actually made (not discussed, not proposed). If none: "No decisions identified."

- "actions": MUST BE A SINGLE STRING (not an object, not an array). The string contains a bulleted list of action items GROUPED BY PRIORITY using inline section headers (capital-letter lines, NOT markdown headings). Format the string EXACTLY like this example, with literal line breaks:

P0 — Blockers
• Sarah → Send SOW (by Mon)
• You → Confirm migration scope (by Wed)

P1 — Commitments
• Tom → Share brand assets (by Tue)

P2 — Maintenance
• Maya → Update internal wiki (when convenient)

Skip a priority section entirely if it has zero items (do not emit empty section headers). Infer priority from signals: client-facing commitments / unblocks-other-work → P0, internal promises with deadlines → P1, nice-to-have / docs / cleanup → P2. Default to P1 if uncertain. THE ENTIRE actions VALUE IS ONE STRING — do not return it as a JSON object or an array of objects.

- "questions": bullet list using • of open questions. Include BOTH (a) questions explicitly raised but not answered AND (b) implicit gaps you noticed (missing approvers, unconfirmed dependencies, unstated assumptions, unscoped commitments). Prefix inferred items with "Inferred:" so the reader knows you surfaced something not said out loud. Be intelligent — surface real gaps, not noise.

- "risks": bullet list using • of risks. EVERY risk MUST be followed by a "Mitigation:" line on the next line, indented with two spaces. Format:
  "• [Risk description]
    Mitigation: [specific, concrete mitigation step]"
  If a real risk has no clean mitigation, write "Mitigation: surface and discuss next meeting." but only as a last resort. If none: "No risks identified."

- "email": complete professional follow-up email with subject line, greeting, body, and sign-off. Audience: an external client. Tone: agency-premium — warm but structured, references at least one specific detail from the call (not generic "great speaking with you"). Lead with the recap of decisions. End with a clear next-step anchor and date. Do NOT use template phrases like "I hope this email finds you well" or "thank you for your time."

- "slack": concise Slack recap under 90 words. Audience: internal team. Tone: casual-direct, bullet-friendly, "we won X" framing, emojis allowed (1-2 max). Different register than the email — this is for colleagues, not clients. Plain text only.

- "agenda": bullet list using • of items for the NEXT meeting. Tone: strategic, not generic. Each item should explain what decision is needed or what it unblocks. Avoid bland phrasing like "Status update" or "Q&A". Format example: "• Decision needed: confirm migration scope (gates week-4 design phase)" — i.e. say WHY it's on the agenda.

- "tasks": array of task objects extracted from the action items. Each object must have:
  - "text": the task description
  - "owner": person responsible (or "Team" if unknown)
  - "deadline": deadline mentioned or null
  - "priority": "high" (=P0), "medium" (=P1), or "low" (=P2) based on the same signals as the actions block

Output language: ${langMap[effectiveLang] || 'English'}
Style hint: ${styleMap[style] || styleMap.Concise}

Quality bar: a senior consultant should read your output and say "this person was actually in the meeting." Avoid template language. Avoid hedging filler. Be specific to the notes.

Return ONLY raw JSON. No markdown. No explanation.${projectContext}

Meeting transcript:
${text}`

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: [
          {
            type: 'text',
            text: 'You are MeetingFlash, a professional post-meeting execution assistant. Return ONLY valid JSON — no markdown, no explanation.',
            cache_control: { type: 'ephemeral' },
          }
        ],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await res.json()
    const raw = data.content
      .map((b: { text?: string }) => b.text || '')
      .join('')
      .replace(/```json|```/g, '')
      .trim()

    const pack = JSON.parse(raw)

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
            const tasksToInsert = pack.tasks.map((t: {
              text: string
              owner: string
              deadline: string | null
              priority: string
            }) => ({
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

          // Increment usage count
          await supabase.rpc('increment_uses', { user_id: user.id })

          // Send nudge email when free user hits their limit
          const { data: prof } = await supabase
            .from('profiles')
            .select('plan, uses_this_month, email, full_name')
            .eq('id', user.id)
            .single()
          if (prof?.plan === 'free' && prof.uses_this_month >= 3) {
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/nudge`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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