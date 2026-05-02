import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  }
})

export type Plan = 'free' | 'pro' | 'team'

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 3,
  pro: Infinity,
  team: Infinity,
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  plan: Plan
  uses_this_month: number
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Pack {
  snapshot?: string
  decisions: string
  actions: string
  questions: string
  risks: string
  email: string
  slack: string
  agenda: string
}

/**
 * Safely render a pack field — Claude can occasionally return an object/array
 * even when the prompt says "string". This coerces anything to a clean,
 * line-broken string so the JSX never crashes with "Objects are not valid
 * as a React child."
 */
export function packFieldToString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    return value.map(v => packFieldToString(v)).filter(Boolean).join('\n')
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const inner = packFieldToString(v)
        return inner ? `${k}\n${inner}` : k
      })
      .join('\n\n')
  }
  return String(value)
}

export interface ActionTiers {
  p0: string[]
  p1: string[]
  p2: string[]
  /** Items that didn't fall under any tier header — usually a fallback when Claude skipped the section markers */
  unsorted: string[]
}

/**
 * Parses an action-items string with inline P0/P1/P2 section markers into 3 tiered lists.
 * Robust to header variations: "P0 — Blockers", "P0 - blockers", "P0:", etc.
 * Items keep their leading bullet (•) stripped for cleaner rendering.
 */
export function parseActionTiers(text: string): ActionTiers {
  const tiers: ActionTiers = { p0: [], p1: [], p2: [], unsorted: [] }
  if (!text || typeof text !== 'string') return tiers

  let current: 'p0' | 'p1' | 'p2' | 'unsorted' = 'unsorted'
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const headerMatch = line.match(/^P([0-2])\b/i)
    if (headerMatch) {
      current = (`p${headerMatch[1]}`) as 'p0' | 'p1' | 'p2'
      continue
    }
    // Strip leading bullet markers
    const cleaned = line.replace(/^[•\-*]\s*/, '').trim()
    if (!cleaned) continue
    tiers[current].push(cleaned)
  }
  return tiers
}

export interface Meeting {
  id: string
  user_id: string
  project_id: string | null
  title: string
  raw_notes: string
  pack: Pack
  lang: string
  style: string
  created_at: string
}