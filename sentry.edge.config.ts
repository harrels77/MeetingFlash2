import * as Sentry from '@sentry/nextjs'

// Runtime edge (utilisé par /opengraph-image).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN
    || 'https://150cb6c6860378021954947b7c9376ae@o4511711719587840.ingest.us.sentry.io/4511714986557442',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0,
})
