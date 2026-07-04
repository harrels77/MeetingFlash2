import s from '@/styles/marketing.module.css'

/**
 * Mockup "Discovery call · Acme Corp" — utilisé par la landing (section
 * agencies) et /for-agencies. Une seule source pour que le contenu et le
 * style ne divergent plus (DESIGN-SYSTEM.md, pattern interdit n°13).
 */
export default function DiscoveryMockup() {
  return (
    <div className={s.mockup}>
      <div className={s.mockupHead}>
        <div className={s.mockupDots}><span /><span /><span /></div>
        <div className={s.mockupTitle}>Discovery call · Acme Corp</div>
      </div>
      <div className={s.mockupBody}>
        <div className={`${s.mockBlock} ${s.mockBlockBlue}`}>
          <div className={s.mockBlockLabel}>Decisions</div>
          <div className={s.mockBlockContent}>
            • Scope locked: e-commerce rebuild, 12-week timeline<br />
            • Budget approved at $48k, paid in 3 milestones<br />
            • Kickoff scheduled for May 6th
          </div>
        </div>
        <div className={`${s.mockBlock} ${s.mockBlockGreen}`}>
          <div className={s.mockBlockLabel}>Action items</div>
          <div className={s.mockBlockContent}>
            ✓ <strong>You</strong> → Send SOW + first invoice (Mon)<br />
            ✓ <strong>Sarah (Acme)</strong> → Share brand assets &amp; access (Tue)<br />
            ✓ <strong>You</strong> → Set up Slack channel + project doc (Wed)
          </div>
        </div>
        <div className={`${s.mockBlock} ${s.mockBlockPaper}`}>
          <div className={s.mockBlockLabel}>Follow-up email</div>
          <div className={s.mockBlockContent}>
            Hi Sarah, great speaking today. Confirming we&apos;re aligned on the 12-week scope and $48k budget across 3 milestones. Kickoff May 6th. I&apos;ll send the SOW &amp; first invoice Monday — you&apos;ll share brand assets Tuesday…
          </div>
        </div>
      </div>
    </div>
  )
}
