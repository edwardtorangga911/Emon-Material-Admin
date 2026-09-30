/**
 * Emon Material Admin - Service Worker
 * Offline-first Cache-First Strategy
 */

// Bump this on every release. The fetch handler is cache-first, so a stale name
// means returning visitors keep running the previous build indefinitely.
const CACHE_NAME = 'emon-material-admin-v3.9';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './ecommerce.html',
  './analytics.html',
  './reports.html',
  './chat.html',
  './calendar.html',
  './taskboard.html',
  './pos.html',
  './products.html',
  './orders.html',
  './customers.html',
  './pricing.html',
  './profile.html',
  './timeline.html',
  './notifications.html',
  './data-import.html',
  './blank.html',
  './lockscreen.html',
  './forgot-password.html',
  './widgets.html',
  './components.html',
  './settings.html',
  './login.html',
  './register.html',
  './invoice-print.html',
  './404.html',
  './500.html',
  './manifest.json',
  './assets/css/emon-theme.css',
  './assets/css/emon-components.css',
  './assets/css/emon-material.min.css',
  './assets/fonts/fonts.css',
  './assets/js/tailwind.js',
  // Runs in <head> before paint — without it the page flashes the wrong theme.
  './assets/js/emon-theme-init.js',
  './assets/js/emon-theme.js',
  './assets/js/emon-charts.js',
  // Injects the sidebar, header, command palette and quick-action modal.
  // Omitting this left the offline build with no application chrome at all.
  './assets/js/emon-shell.js',
  './assets/js/emon-app.js',
  './assets/js/emon-anim.js',
  './assets/js/emon-api.js',
  './assets/js/emon-form.js',
  './assets/js/emon-i18n.js',
  './assets/images/emon-logo.svg',
  './assets/images/emon-icon.svg',
  './assets/images/avatars/user-admin.svg',
  './assets/images/avatars/user-1.svg',
  './assets/images/avatars/user-2.svg',
  './assets/images/avatars/user-3.svg',
  './assets/images/avatars/user-4.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Cache addAll partial failure, proceeding:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Cache-First strategy)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cache immediately, fetch fresh copy in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* Offline */});

        return cachedResponse;
      }

      // Network fallback
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback for HTML navigation
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
