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

  return (
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
  )
}
