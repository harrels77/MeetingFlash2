import * as Sentry from '@sentry/nextjs'
import { isThirdPartyEvent } from './src/lib/sentryFilter'

// Erreurs navigateur (React, fetch, runtime). Volontairement minimal :
// - erreurs uniquement (pas de tracing perf, pas de session replay) pour
//   rester loin des quotas du tier gratuit
// - désactivé hors production pour ne pas polluer avec le bruit du dev
// Le DSN n'est pas un secret (il est visible dans le bundle par design) —
// la valeur en dur sert de défaut, surchargeable par env.

// Vécu en prod : MEETINGFLASH-2 (ext:core/01_core.js, extension Chrome) et
// MEETINGFLASH-3 (app://navigation_performance_logger_android, navigateur
// in-app Facebook sur Android). Logique de filtrage dans src/lib/sentryFilter.

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
    // Pont natif du navigateur in-app Facebook sur Android
    'Java object is gone',
    'Error invoking postMessage',
  ],
  denyUrls: [
    /^app:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-(web-)?extension:\/\//i,
  ],
  // denyUrls ne filtre que sur l'URL du fichier ; les scripts injectés
  // apparaissent souvent en frames anonymes (`<script>`) avec un seul
  // marqueur exploitable plus bas dans la pile. On inspecte donc la pile
  // entière : si une frame vient d'un scheme tiers, l'erreur n'est pas la
  // nôtre. Les erreurs réelles de l'app pointent sur /_next/static/... et
  // ne matchent jamais ces schemes.
  beforeSend(event) {
    return isThirdPartyEvent(event) ? null : event
  },
})
