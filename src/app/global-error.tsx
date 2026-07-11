'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Filet de sécurité ultime de l'App Router : attrape les erreurs de rendu
// React qui feraient planter toute la page, les remonte à Sentry, et affiche
// un écran de secours sobre au lieu d'une page blanche.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: '#0A101F', color: '#EDF1F9', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, textAlign: 'center', padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#98A4BC', fontSize: 14, marginBottom: 20 }}>
            The error has been reported. Reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#2E62FF', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, cursor: 'pointer' }}
          >
            Reload the page
          </button>
        </div>
      </body>
    </html>
  )
}
