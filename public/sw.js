// Klassical Fulfillment HUB — Service Worker v2
const CACHE = 'kf-hub-v2'
const OFFLINE_URL = '/offline.html'

const PRECACHE = [
  '/',
  '/offline.html',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

// ── Install: pre-cache shell ─────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE))
  )
  self.skipWaiting()
})

// ── Activate: purge old caches ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch strategy ────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin
  if (url.origin !== location.origin) return

  // API routes — network only, return JSON error offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline', queued: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    return
  }

  // Static assets (_next/static, icons, fonts) — cache first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(woff2?|ttf|otf|png|jpg|jpeg|svg|gif|ico|webp|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE).then(c => c.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // HTML navigation — network first, cache fallback, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE).then(c => c.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match(OFFLINE_URL))
        )
    )
    return
  }

  // Default — stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
        }
        return response
      })
      return cached || networkFetch
    })
  )
})

// ── Background Sync ───────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'bg-sync') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_TRIGGERED' }))
      )
    )
  }
})

// ── Push notification handling (future) ──────────────────
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  self.registration.showNotification(data.title || 'Klassical HUB', {
    body: data.body || '',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    tag: data.tag || 'kf-notification',
    data: { url: data.url || '/dashboard' },
  })
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.openWindow(event.notification.data?.url || '/dashboard')
  )
})
