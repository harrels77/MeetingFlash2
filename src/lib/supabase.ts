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
  decisions: string
  actions: string
  questions: string
  risks: string
  email: string
  slack: string
  agenda: string
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