import { parseActionTiers } from '@/lib/supabase'
import s from './ActionTiers.module.css'

/**
 * Shared P0/P1/P2 priority view used by /app, /share, /dashboard/pack.
 * Falls back to plain text when the model didn't include section markers.
 *
 * Server-component compatible (no hooks, no event handlers).
 */
export default function ActionTiers({ text }: { text: string }) {
  const tiers = parseActionTiers(text)
  const total = tiers.p0.length + tiers.p1.length + tiers.p2.length
  if (total === 0) {
    return <>{text || 'No action items identified.'}</>
  }
  return (
    <div className={s.tiers}>
      {tiers.p0.length > 0 && (
        <div className={`${s.tier} ${s.tierP0}`}>
          <div className={s.tierHead}>
            <span className={s.tierIcon}>🔴</span>
            <span className={s.tierLabel}>P0 — Blockers</span>
            <span className={s.tierCount}>{tiers.p0.length}</span>
          </div>
          <ul className={s.tierList}>
            {tiers.p0.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {tiers.p1.length > 0 && (
        <div className={`${s.tier} ${s.tierP1}`}>
          <div className={s.tierHead}>
            <span className={s.tierIcon}>📌</span>
            <span className={s.tierLabel}>P1 — Commitments</span>
            <span className={s.tierCount}>{tiers.p1.length}</span>
          </div>
          <ul className={s.tierList}>
            {tiers.p1.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {tiers.p2.length > 0 && (
        <div className={`${s.tier} ${s.tierP2}`}>
          <div className={s.tierHead}>
            <span className={s.tierIcon}>○</span>
            <span className={s.tierLabel}>P2 — Maintenance</span>
            <span className={s.tierCount}>{tiers.p2.length}</span>
          </div>
          <ul className={s.tierList}>
            {tiers.p2.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {tiers.unsorted.length > 0 && (
        <ul className={s.tierList}>
          {tiers.unsorted.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      )}
    </div>
  )
}
