// Shared metadata + scan-helpers for pack rendering.
// Used by /app, /share/[token] and /dashboard/pack/[id] to keep block icons,
// labels and the "meeting outcome" pill computation in one place — without
// this, each render site drifted on its own block list.

import { packFieldToString } from '@/lib/supabase'

export const BLOCK_ICONS: Record<string, string> = {
  decisions: '📋',
  actions:   '🎯',
  questions: '💭',
  risks:     '🚨',
  email:     '✉️',
  slack:     '💬',
  agenda:    '📅',
}

export interface PackMetrics {
  decisions: number
  actions: number
  criticalRisks: number
  openQuestions: number
  hasRisks: boolean
}

function countBullets(text: string): number {
  return text
    .split('\n')
    .filter(line => line.trim().startsWith('•'))
    .length
}

export function computePackMetrics(pack: Record<string, unknown> | null | undefined): PackMetrics {
  if (!pack) {
    return { decisions: 0, actions: 0, criticalRisks: 0, openQuestions: 0, hasRisks: false }
  }
  const decisionsStr = packFieldToString(pack.decisions)
  const actionsStr = packFieldToString(pack.actions)
  const questionsStr = packFieldToString(pack.questions)
  const risksStr = packFieldToString(pack.risks)

  const isEmptyDecisions = /^no decisions identified\.?$/i.test(decisionsStr.trim())
  const isEmptyRisks = /^no risks identified\.?$/i.test(risksStr.trim())

  const criticalRisks = (risksStr.match(/\[CRITICAL\]/gi) || []).length

  return {
    decisions: isEmptyDecisions ? 0 : countBullets(decisionsStr),
    actions: countBullets(actionsStr),
    criticalRisks,
    openQuestions: countBullets(questionsStr),
    hasRisks: !isEmptyRisks && risksStr.trim().length > 0,
  }
}

// Renders the metrics as compact summary segments, e.g.
// ["3 decisions", "4 actions", "1 critical risk"]. Empty buckets are skipped.
export function metricsToSegments(m: PackMetrics): { label: string; tone: 'neutral' | 'critical' | 'muted' }[] {
  const out: { label: string; tone: 'neutral' | 'critical' | 'muted' }[] = []
  if (m.decisions > 0) out.push({ label: `${m.decisions} decision${m.decisions !== 1 ? 's' : ''}`, tone: 'neutral' })
  if (m.actions > 0) out.push({ label: `${m.actions} action${m.actions !== 1 ? 's' : ''}`, tone: 'neutral' })
  if (m.criticalRisks > 0) out.push({ label: `${m.criticalRisks} critical risk${m.criticalRisks !== 1 ? 's' : ''}`, tone: 'critical' })
  if (m.openQuestions > 0) out.push({ label: `${m.openQuestions} open question${m.openQuestions !== 1 ? 's' : ''}`, tone: 'muted' })
  return out
}
