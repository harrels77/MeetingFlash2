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

    const styleMap: Record<string, string> = {
      Concise:  'sharp and concise — minimum words, maximum clarity',
      Detailed: 'thorough and detailed — include all relevant context',
      Email:    'formatted for a professional follow-up email',
    }

    const langMap: Record<string, string> = {
      EN: 'English', FR: 'French', ES: 'Spanish', DE: 'German',
    }

    const prompt = `You are MeetingFlash, a professional post-meeting execution assistant.

Analyze this meeting transcript and return ONLY a valid JSON object with exactly these keys:

- "title": a short meeting title (max 6 words) based on the content
- "decisions": bullet list using • of all decisions made. If none: "No decisions identified."
- "actions": bullet list using • formatted as "• [Person] → [Task] (by [deadline if mentioned])". If none: "No action items identified."
- "questions": bullet list using • of unresolved questions. If none: "No open questions."
- "risks": bullet list using • of potential blockers. If none: "No risks identified."
- "email": complete professional follow-up email with subject line, greeting, body, and sign-off.
- "slack": concise Slack recap under 80 words. Plain text only.
- "agenda": bullet list using • of agenda items for next meeting.
- "tasks": array of task objects extracted from action items. Each object must have:
  - "text": the task description
  - "owner": person responsible (or "Team" if unknown)
  - "deadline": deadline mentioned or null
  - "priority": "high", "medium", or "low" based on context

Output language: ${langMap[lang] || 'English'}
Style: ${styleMap[style] || styleMap.Concise}

Return ONLY raw JSON. No markdown. No explanation.

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
            lang,
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