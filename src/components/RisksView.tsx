import s from './RisksView.module.css'

/**
 * Renders the risks block with severity badges (CRITICAL / MEDIUM / LOW) parsed
 * from inline markers the model emits. Each risk carries a colored pill so a PM
 * can scan severity at a glance instead of reading every mitigation.
 *
 * Falls back to plain rendering if no markers are present (legacy packs).
 * Server-component compatible (no hooks).
 */

type Severity = 'critical' | 'medium' | 'low' | 'unknown'

interface ParsedRisk {
  severity: Severity
  description: string
  mitigation: string
}

function parseRisks(text: string): ParsedRisk[] {
  if (!text || !text.trim()) return []
  const blocks: string[] = []
  let current = ''
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (line.startsWith('•')) {
      if (current.trim()) blocks.push(current.trim())
      current = line
    } else if (line.length > 0) {
      current += '\n' + rawLine
    }
  }
  if (current.trim()) blocks.push(current.trim())

  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    const head = lines[0].replace(/^•\s*/, '')
    const sevMatch = head.match(/^\[(CRITICAL|MEDIUM|LOW)\]\s*(.*)$/i)
    const severity: Severity = sevMatch
      ? (sevMatch[1].toLowerCase() as Severity)
      : 'unknown'
    const description = sevMatch ? sevMatch[2].trim() : head.trim()
    const mitigationLine = lines.find(l => /^mitigation\s*:/i.test(l))
    const mitigation = mitigationLine
      ? mitigationLine.replace(/^mitigation\s*:\s*/i, '').trim()
      : ''
    return { severity, description, mitigation }
  })
}

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  medium: 'Medium',
  low: 'Low',
  unknown: '',
}

export default function RisksView({ text }: { text: string }) {
  if (!text || !text.trim()) return <>No risks identified.</>
  if (/^no risks identified\.?$/i.test(text.trim())) return <>{text}</>

  const risks = parseRisks(text)
  if (risks.length === 0) return <>{text}</>

  return (
    <ul className={s.list}>
      {risks.map((r, i) => (
        <li key={i} className={`${s.item} ${s[`sev_${r.severity}`]}`}>
          <div className={s.head}>
            {r.severity !== 'unknown' && (
              <span className={`${s.badge} ${s[`badge_${r.severity}`]}`}>
                {SEVERITY_LABELS[r.severity]}
              </span>
            )}
            <span className={s.desc}>{r.description}</span>
          </div>
          {r.mitigation && (
            <div className={s.mitigation}>
              <span className={s.mitLabel}>Mitigation</span>
              {r.mitigation}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
