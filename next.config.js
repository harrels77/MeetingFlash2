/** @type {import('next').NextConfig} */
const nextConfig = {
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
module.exports = nextConfig
