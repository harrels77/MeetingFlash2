import s from './SlackPreview.module.css'

// Renders the generated Slack message as a chat bubble ("You · now") instead
// of raw text — signals "paste this straight into your channel".
// Server-component compatible (no hooks).
export default function SlackPreview({ text }: { text: string }) {
  const t = (text || '').trim()
  if (!t) return <>—</>

  return (
    <div className={s.slack}>
      <div className={s.avatar} aria-hidden="true">Y</div>
      <div className={s.msg}>
        <div className={s.meta}>
          <span className={s.author}>You</span>
          <span className={s.time}>now</span>
        </div>
        <div className={s.bubble}>{t}</div>
      </div>
    </div>
  )
}
