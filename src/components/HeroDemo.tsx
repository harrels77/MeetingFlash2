'use client'
import { useEffect, useState } from 'react'
import { Zap, Check, Pin, AlertTriangle } from 'lucide-react'
import s from './HeroDemo.module.css'

// Animated before/after loop on the landing hero. A product whose pitch is
// "20 seconds" has to prove it visually: raw note lines drop in one by one,
// the flash fires, the pack builds itself, holds, restarts.
// prefers-reduced-motion → everything renders static (step stuck at max).

const NOTES = [
  'Sarah: launch April 28th',
  'Tom: feature list by Friday',
  'freeze tool subscriptions Q2',
  'interviews start April 22nd',
]

const OUTPUTS: { icon: 'pin' | 'check' | 'warn'; tone: 'blue' | 'green' | 'amber'; text: string }[] = [
  { icon: 'pin',   tone: 'blue',  text: 'Launch set for April 28th' },
  { icon: 'check', tone: 'green', text: 'Tom → Feature list (Fri)' },
  { icon: 'check', tone: 'green', text: 'Freeze subscriptions Q2' },
  { icon: 'warn',  tone: 'amber', text: 'Interview timeline tight' },
]

// Steps: 1..4 notes appear · 5 flash fires · 6..9 outputs appear · hold · reset
const MAX_STEP = 5 + OUTPUTS.length
const ICONS = {
  pin:   <Pin size={12} strokeWidth={1.75} aria-hidden="true" />,
  check: <Check size={12} strokeWidth={1.75} aria-hidden="true" />,
  warn:  <AlertTriangle size={12} strokeWidth={1.75} aria-hidden="true" />,
}

export default function HeroDemo() {
  const [step, setStep] = useState(0)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStep(MAX_STEP)
      return
    }
    setAnimate(true)
    let current = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      current = current > MAX_STEP + 5 ? 0 : current + 1 // +5 ticks of hold before reset
      setStep(current)
      timer = setTimeout(tick, current === 0 ? 700 : current <= 4 ? 550 : current === 5 ? 800 : 450)
    }
    timer = setTimeout(tick, 800)
    return () => clearTimeout(timer)
  }, [])

  const visible = (threshold: number) => !animate || step >= threshold

  return (
    <div className={s.demo} aria-label="Demo: raw meeting notes turned into an Execution Pack">
      <div className={s.col}>
        <div className={s.tag}>Raw notes</div>
        <div className={s.lines}>
          {NOTES.map((n, i) => (
            <span key={n} className={`${s.line} ${visible(i + 1) ? s.in : ''}`}>{n}</span>
          ))}
        </div>
      </div>

      <div className={s.arrow}>
        <div className={s.arrowLine} />
        <div className={s.arrowLabel}>20 seconds</div>
        <div className={`${s.arrowIcon} ${visible(5) && animate && step < MAX_STEP + 2 ? s.firing : ''}`}>
          <Zap size={16} strokeWidth={1.75} aria-hidden="true" />
        </div>
      </div>

      <div className={s.col}>
        <div className={`${s.tag} ${s.tagAccent}`}>Execution Pack</div>
        <div className={s.lines}>
          {OUTPUTS.map((o, i) => (
            <span key={o.text} className={`${s.output} ${s[`tone_${o.tone}`]} ${visible(6 + i) ? s.in : ''}`}>
              {ICONS[o.icon]} {o.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
