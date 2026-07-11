const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Requis en Next 14 pour charger src/instrumentation.ts (init Sentry serveur)
    instrumentationHook: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Clickjacking : le site n'a aucune raison d'être affiché dans une iframe tierce
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Empêche le navigateur de "deviner" un type MIME différent de celui déclaré
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Ne divulgue pas les URLs internes (tokens de partage inclus) aux sites externes
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Le site n'utilise ni caméra, ni micro, ni géolocalisation
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

// Enrobage Sentry : instrumente les routes au build. L'upload des source maps
// ne se fait que si SENTRY_AUTH_TOKEN est présent (optionnel — sans lui les
// stack traces sont minifiées mais les erreurs remontent quand même).
module.exports = withSentryConfig(nextConfig, {
  org: 'harrelfactory',
  project: 'meetingflash',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  widenClientFileUpload: false,
})
