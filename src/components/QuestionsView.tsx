import s from './QuestionsView.module.css'

/**
 * Renders the open-questions block, visually distinguishing items prefixed with
 * "Inferred:" (gaps the tool surfaced from absences in the notes) from explicit
 * questions raised in the meeting. The "Inferred" badge is the hook that signals
 * the tool actually thought about the meeting — not just extracted text.
 *
 * Server-component compatible (no hooks, no event handlers).
 */
export default function QuestionsView({ text }: { text: string }) {
  if (!text || !text.trim()) return <>No open questions.</>

  const items = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[•\-*]\s*/, '').trim())
    .filter(line => line.length > 0)

  if (items.length === 0) return <>{text}</>

  // Detect if any inferred items exist so we can show the caveat once. Without
  // an explicit legend, an external reader of a shared pack might assume these
  // questions were raised in the meeting itself — which would damage trust
  // ("the AI is making things up"). The caveat is the small line of text that
  // makes the convention unambiguous and lets us keep the high-value
  // inferences in the output instead of hiding them.
  const hasInferred = items.some(line => /^Inferred:\s*/i.test(line))

  return (
    <>
      {hasInferred && (
        <p className={s.legend}>
          Items marked <span className={s.inferredBadge}>Inferred</span> were surfaced by AI from gaps in the notes — they were <em>not</em> raised in the meeting.
        </p>
      )}
      <ul className={s.list}>
        {items.map((raw, i) => {
          const inferredMatch = raw.match(/^Inferred:\s*(.*)$/i)
          if (inferredMatch) {
            return (
              <li key={i} className={`${s.item} ${s.itemInferred}`}>
                <span className={s.inferredBadge}>Inferred</span>
                {inferredMatch[1]}
              </li>
            )
          }
          return <li key={i} className={s.item}>{raw}</li>
        })}
      </ul>
    </>
  )
}
