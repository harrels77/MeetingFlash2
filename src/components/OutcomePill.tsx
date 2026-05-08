import s from './OutcomePill.module.css'
import { computePackMetrics, metricsToSegments } from '@/lib/packMeta'

/**
 * Compact "meeting outcome" badge shown above the executive snapshot.
 * Computed from the pack itself — gives the reader a 1-second scan of the
 * meeting's shape ("3 decisions · 4 actions · 1 critical risk") before they
 * read anything. The critical-risk segment is tinted red so it pops.
 *
 * Hidden when the pack has nothing to show (avoids an empty pill).
 */
export default function OutcomePill({ pack }: { pack: Record<string, unknown> | null | undefined }) {
  const metrics = computePackMetrics(pack)
  const segments = metricsToSegments(metrics)
  if (segments.length === 0) return null

  return (
    <div className={s.pill} aria-label="Meeting outcome at a glance">
      {segments.map((seg, i) => (
        <span key={i} className={`${s.seg} ${s[`tone_${seg.tone}`]}`}>
          {seg.label}
        </span>
      ))}
    </div>
  )
}
