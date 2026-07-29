// Shared Execution Pack generation — the single source of truth for the
// prompt and the Anthropic call. Used by BOTH /api/flash (web app) and
// /api/email/inbound (email ingestion). Never duplicate the prompt: the two
// entry points must always produce identical packs.

export const LANG_MAP: Record<string, string> = {
  EN: 'English', FR: 'French', ES: 'Spanish', DE: 'German',
}

export const STYLE_MAP: Record<string, string> = {
  Concise:  'sharp and concise — minimum words, maximum clarity',
  Detailed: 'thorough and detailed — include all relevant context',
  Email:    'formatted for a professional follow-up email',
}

export const MAX_INPUT_CHARS = 60_000
export const MIN_INPUT_CHARS = 40

export type Pack = {
  title?: string
  snapshot?: string
  decisions: string
  actions: string
  questions: string
  risks: string
  email: string
  slack: string
  agenda: string
  tasks?: Array<{ text: string; owner?: string; deadline?: string | null; priority?: string }>
}

export function buildFlashPrompt(opts: {
  text: string
  lang?: string
  style?: string
  projectContext?: string
}): string {
  const { text, lang, style, projectContext = '' } = opts

  return `You are MeetingFlash, a senior post-meeting analyst — not a summarizer. Read the transcript like an experienced consultant: surface what just happened, what matters, what's at risk, what to do next. Be specific, not generic.

Return ONLY a valid JSON object with exactly these keys:

- "title": a short meeting title (max 6 words) based on the content.

- "snapshot": 2-3 sentences. The executive read of this meeting, in the voice of a senior consultant briefing a busy CEO. State (a) what just happened, (b) the cardinal risk or constraint, (c) the next critical move. Reference specific names, numbers, or scope details from the notes. NEVER generic. NEVER template phrasing. This is the most important field — most readers will only read this.

- "decisions": bullet list using • of all decisions actually made (not discussed, not proposed). EVERY decision MUST include the rationale on the same line, separated by " — " (em dash with spaces). The rationale comes from the notes ("to ensure X", "because Y", "in order to Z"). If the notes give no rationale for a specific decision, append " — *(rationale not stated)*" so the reader knows the why is missing. A decision without its why is half a decision. Format: "• [Decision] — [rationale from notes]". If none: "No decisions identified."

- "actions": MUST BE A SINGLE STRING (not an object, not an array). The string contains a bulleted list of action items GROUPED BY PRIORITY using inline section headers (capital-letter lines, NOT markdown headings). Format the string EXACTLY like this example, with literal line breaks:

P0 — Blockers
• Sarah → Send SOW (by Mon)
• You → Confirm migration scope (by Wed)

P1 — Commitments
• Tom → Share brand assets (by Tue)

P2 — Maintenance
• Maya → Update internal wiki (when convenient)

Skip a priority section entirely if it has zero items (do not emit empty section headers). Infer priority from signals: client-facing commitments / unblocks-other-work → P0, internal promises with deadlines → P1, nice-to-have / docs / cleanup → P2. Default to P1 if uncertain. THE ENTIRE actions VALUE IS ONE STRING — do not return it as a JSON object or an array of objects.

- "questions": bullet list using • of open questions. Include BOTH (a) questions explicitly raised but not answered AND (b) implicit gaps you noticed. Prefix inferred items with "Inferred:" so the reader knows you surfaced something not said out loud. PRIORITIZE these inference patterns in this exact order — they're what separates a senior analyst from a summarizer:
  1. A stakeholder ask was made but NO OWNER was assigned (e.g. "David requested security audits in every sprint" → who owns this?). This is the highest-value inference.
  2. A success metric or outcome was named but no measurement criteria were defined (e.g. "mobile responsive" → measured how? what breakpoints?).
  3. A commitment was made but the precise scope is fuzzy (e.g. "simplify the UI" → simplify how, by how much, reviewed by whom?).
  4. A dependency or approval is implied but not confirmed.
Generic gaps ("when does the project end?", "what's the budget?") are noise unless they were specifically discussed without resolution. Surface 2-4 high-value inferences, not 6 weak ones.

- "risks": bullet list using • of risks that are STILL OPEN at the end of the meeting. CRITICAL: if a concern was raised AND addressed/resolved within the same meeting (e.g. "Mark flagged technical feasibility, Elena agreed to simplify" — that's resolved), DO NOT list it as a risk. Resolved-in-meeting items belong in the snapshot or decisions, not in risks. A risk is something that could derail the work and remains unaddressed when the meeting ends. EVERY risk line MUST start with a severity marker — "[CRITICAL]", "[MEDIUM]", or "[LOW]" — and be followed by a "Mitigation:" line on the next line, indented with two spaces. Severity guide: CRITICAL = could block delivery / hit a deadline / costs money; MEDIUM = could cause rework or delay a workstream; LOW = minor friction. Format:
  "• [CRITICAL] [Risk description]
    Mitigation: [specific, concrete mitigation step]"
  If a real risk has no clean mitigation, write "Mitigation: surface and discuss next meeting." but only as a last resort. If none: "No risks identified."

- "email": complete professional follow-up email with subject line, greeting, body, and sign-off. Audience: an external client. Tone: agency-premium — warm but structured, references at least one specific detail from the call (not generic "great speaking with you"). Lead with the recap of decisions. End with a clear next-step anchor and date. Do NOT use template phrases like "I hope this email finds you well" or "thank you for your time."

- "slack": concise Slack recap under 90 words. Audience: internal team. Tone: casual-direct, bullet-friendly, "we won X" framing, emojis allowed (1-2 max). Different register than the email — this is for colleagues, not clients. Plain text only.

- "agenda": bullet list using • of items for the NEXT meeting. Tone: strategic, not generic. Each item should explain what decision is needed or what it unblocks. Avoid bland phrasing like "Status update" or "Q&A". Format example: "• Decision needed: confirm migration scope (gates week-4 design phase)" — i.e. say WHY it's on the agenda. When an agenda item depends on a precondition that may or may not be met (e.g. "if API docs are received in time"), make the branching explicit using the format "• If [condition]: [path A] / Otherwise: [path B]". Don't paper over uncertainty with a single optimistic item — the conditional structure is what makes the next meeting actually useful instead of stalled.

- "tasks": array of task objects extracted from the action items. Each object must have:
  - "text": the task description
  - "owner": person responsible (or "Team" if unknown)
  - "deadline": deadline mentioned or null
  - "priority": "high" (=P0), "medium" (=P1), or "low" (=P2) based on the same signals as the actions block

Output language: ${LANG_MAP[lang || 'EN'] || 'English'}
Style hint: ${STYLE_MAP[style || 'Concise'] || STYLE_MAP.Concise}

Quality bar: a senior consultant should read your output and say "this person was actually in the meeting." Avoid template language. Avoid hedging filler. Be specific to the notes.

Return ONLY raw JSON. No markdown. No explanation.${projectContext}

Meeting transcript:
${text}`
}

/**
 * Calls Anthropic and parses the pack. Throws on failure — callers decide how
 * to surface the error (HTTP status for the web app, a reply email for
 * inbound ingestion).
 */
export async function generatePack(prompt: string, opts?: { timeoutMs?: number }): Promise<Pack> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), opts?.timeoutMs ?? 25_000)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'prompt-caching-2024-07-31',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        system: [
          {
            type: 'text',
            text: 'You are MeetingFlash, a professional post-meeting execution assistant. Return ONLY valid JSON — no markdown, no explanation.',
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic error ${res.status}: ${err.slice(0, 300)}`)
    }

    const data = await res.json()
    const raw = (data.content as Array<{ text?: string }>)
      .map(b => b.text || '')
      .join('')
      .replace(/```json|```/g, '')
      .trim()

    return JSON.parse(raw) as Pack
  } finally {
    clearTimeout(timeout)
  }
}
