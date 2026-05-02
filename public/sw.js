/* MeetingFlash service worker — minimal static-asset cache.
 * Strategy:
 *   - Static assets (images, manifest, favicons) → cache-first with background revalidate.
 *   - Everything else (API routes, pages) → network-only (the app needs fresh data).
 * Versioning: bump CACHE_NAME when shipping a breaking change to invalidate old caches.
 */
const CACHE_NAME = 'meetingflash-v1'
const STATIC_ASSETS = ['/manifest.json', '/favicon.png', '/favicon.svg', '/logo.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Skip API routes and auth callbacks — always go to network.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return
  // Cache-first for known static assets.
  const isStatic =
    STATIC_ASSETS.includes(url.pathname) ||
    /\.(png|jpg|jpeg|svg|webp|woff2?|ico)$/.test(url.pathname)
  if (!isStatic) return
  event.respondWith(
    caches.match(request).then((cached) => {
      const networked = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE_NAME).then((c) => c.put(request, copy)).catch(() => {})
          }
          return res
        })
        .catch(() => cached)
      return cached || networked
    })
  )
})
