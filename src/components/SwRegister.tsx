'use client'
import { useEffect } from 'react'

// Registers the service worker once on mount. No-op if SW is unsupported or in dev.
// Errors are swallowed — SW failure must never break the app.
export default function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })
  }, [])
  return null
}
