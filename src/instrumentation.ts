// Chargé par Next au démarrage du serveur (experimental.instrumentationHook).
// Initialise Sentry pour les runtimes node et edge.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}
