import styles from './Ticker.module.css'

const items = [
  'Execution Pack', 'Decisions extracted', 'Tasks with owners',
  'Deadlines surfaced', 'Follow-up email generated', 'Slack message ready',
  'Next agenda built', 'Open risks flagged', 'Zero friction',
  'Project memory', 'No ChatGPT prompt needed', '20 seconds flat',
]

export default function Ticker() {
  const doubled = [...items, ...items]
  return (
    <div className={styles.ticker}>
      <div className={styles.inner}>
        {doubled.map((item, i) => (
          <span key={i} className={styles.item}>
            {item} <span className={styles.sep}>◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}