import * as Sentry from '@sentry/nextjs'

// Erreurs côté serveur (routes API : flash, checkout, webhook, comptes…).
// C'est la moitié la plus précieuse : un échec silencieux de /api/flash ou
// du webhook Stripe devient une alerte au lieu d'un mystère.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN
    || 'https://150cb6c6860378021954947b7c9376ae@o4511711719587840.ingest.us.sentry.io/4511714986557442',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0,
})
