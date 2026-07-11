import * as Sentry from '@sentry/nextjs'

// Erreurs navigateur (React, fetch, runtime). Volontairement minimal :
// - erreurs uniquement (pas de tracing perf, pas de session replay) pour
//   rester loin des quotas du tier gratuit
// - désactivé hors production pour ne pas polluer avec le bruit du dev
// Le DSN n'est pas un secret (il est visible dans le bundle par design) —
// la valeur en dur sert de défaut, surchargeable par env.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN
    || 'https://150cb6c6860378021954947b7c9376ae@o4511711719587840.ingest.us.sentry.io/4511714986557442',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0,
  ignoreErrors: [
    // Bruit classique des extensions navigateur / réseaux mobiles
    'ResizeObserver loop',
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    'AbortError',
  ],
})
