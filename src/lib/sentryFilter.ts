// Filtrage du bruit tiers avant envoi à Sentry.
//
// On écoute window.onerror globalement, donc on récupère aussi les erreurs
// des scripts que d'autres injectent dans la page : navigateurs in-app
// (Facebook, Instagram) et extensions de navigateur. On ne peut ni les
// reproduire ni les corriger, et sur le tier gratuit elles consomment le
// quota tout en noyant le vrai signal.
//
// Extrait ici (plutôt qu'inline dans sentry.client.config.ts) pour être
// testable : un filtre trop large masquerait de vraies erreurs en silence.

const THIRD_PARTY_FRAME =
  /^(app|ext|chrome-extension|moz-extension|safari-web-extension|safari-extension|webkit-masked-url):/i

type MinimalFrame = { filename?: string | null }
type MinimalEvent = {
  exception?: {
    values?: Array<{ stacktrace?: { frames?: MinimalFrame[] } | null } | null> | null
  } | null
}

/**
 * true quand au moins une frame de la pile provient d'un scheme tiers.
 * Les erreurs réelles de l'app pointent sur /_next/static/... ou sur le
 * domaine du site, et ne matchent jamais ces schemes.
 */
export function isThirdPartyEvent(event: MinimalEvent): boolean {
  const frames = (event.exception?.values ?? [])
    .flatMap(v => v?.stacktrace?.frames ?? [])
  return frames.some(f => !!f?.filename && THIRD_PARTY_FRAME.test(f.filename))
}
