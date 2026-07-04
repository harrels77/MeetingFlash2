import { emailParts } from '@/lib/packMeta'
import s from './EmailPreview.module.css'

// Renders the generated follow-up email as a mail-client preview instead of
// raw text: subject line in the header, body with generous line-height.
// Server-component compatible (no hooks) — used by /app, /share/[token] and
// the dashboard pack page, same pattern as <ActionTiers />.
export default function EmailPreview({ text }: { text: string }) {
  const t = (text || '').trim()
  if (!t) return <>—</>
  const { subject, body } = emailParts(t)

  return (
    <div className={s.mail}>
      <div className={s.head}>
        <div className={s.metaRow}>
          <span className={s.metaLabel}>To</span>
          <span className={s.metaValue}>client@…</span>
        </div>
        <div className={s.metaRow}>
          <span className={s.metaLabel}>Subject</span>
          <span className={s.subject}>{subject}</span>
        </div>
      </div>
      <div className={s.body}>{body}</div>
    </div>
  )
}
