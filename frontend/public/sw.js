const CACHE_NAME = 'roadsos-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/pwa-192x192.svg',
  '/manifest.webmanifest'
];

// Offline Triage Ruleset
const OFFLINE_TRIAGE_RULES = {
  questions: [
    { id: "conscious", text: "Are they conscious?" },
    { id: "breathing", text: "Are they breathing?" },
    { id: "bleeding", text: "Is there major bleeding?" }
  ],
  rules: [
    { if: { conscious: false, breathing: false }, then: "CRITICAL: Start CPR immediately. Push hard and fast in the center of the chest." },
    { if: { bleeding: true }, then: "Apply direct pressure to the wound with a clean cloth. Do not remove it if it gets soaked." },
    { if: { conscious: true, breathing: true }, then: "Stay with the person. Keep them warm and calm until help arrives." }
  ]
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache App Shell and Triage Rules
      cache.put('/api/offline-triage', new Response(JSON.stringify(OFFLINE_TRIAGE_RULES)));
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network First for API, otherwise Cache First for Assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
  } else {
    // External Assets (Map Tiles, Fonts) - Cache First
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
  }
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-incident-queue') {
    event.waitUntil(syncIncidents());
  }
});

async function syncIncidents() {
  // Logic to read from IndexedDB and POST to /api/sos/trigger
  console.log('Background Sync: Flushing offline incident queue...');
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'ROADSoS Update', body: 'Incident status has changed.' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: { url: '/chat' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
