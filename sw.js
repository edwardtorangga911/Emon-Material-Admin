/**
 * Emon Material Admin - Service Worker
 * Offline-first Cache-First Strategy
 */

// Bump this on every release. The fetch handler is cache-first, so a stale name
// means returning visitors keep running the previous build indefinitely.
const CACHE_NAME = 'emon-material-admin-v3.13';

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
  // The 37 woff2 files are what make the offline claim true. fonts.css and the
  // compiled stylesheet both reference them, but without these entries the
  // service worker cached the CSS that points at them while the font files
  // themselves were never stored — so an offline visitor got the correct
  // layout in the browser's fallback typeface.
  './assets/fonts/material-symbols-outlined-100700-1.woff2',
  './assets/fonts/inter-400-1.woff2',
  './assets/fonts/inter-400-2.woff2',
  './assets/fonts/inter-400-3.woff2',
  './assets/fonts/inter-400-4.woff2',
  './assets/fonts/inter-400-5.woff2',
  './assets/fonts/inter-400-6.woff2',
  './assets/fonts/inter-400-7.woff2',
  './assets/fonts/inter-500-8.woff2',
  './assets/fonts/inter-500-9.woff2',
  './assets/fonts/inter-500-10.woff2',
  './assets/fonts/inter-500-11.woff2',
  './assets/fonts/inter-500-12.woff2',
  './assets/fonts/inter-500-13.woff2',
  './assets/fonts/inter-500-14.woff2',
  './assets/fonts/inter-600-15.woff2',
  './assets/fonts/inter-600-16.woff2',
  './assets/fonts/inter-600-17.woff2',
  './assets/fonts/inter-600-18.woff2',
  './assets/fonts/inter-600-19.woff2',
  './assets/fonts/inter-600-20.woff2',
  './assets/fonts/inter-600-21.woff2',
  './assets/fonts/inter-700-22.woff2',
  './assets/fonts/inter-700-23.woff2',
  './assets/fonts/inter-700-24.woff2',
  './assets/fonts/inter-700-25.woff2',
  './assets/fonts/inter-700-26.woff2',
  './assets/fonts/inter-700-27.woff2',
  './assets/fonts/inter-700-28.woff2',
  './assets/fonts/plus-jakarta-sans-600-29.woff2',
  './assets/fonts/plus-jakarta-sans-600-30.woff2',
  './assets/fonts/plus-jakarta-sans-600-31.woff2',
  './assets/fonts/plus-jakarta-sans-600-32.woff2',
  './assets/fonts/plus-jakarta-sans-700-33.woff2',
  './assets/fonts/plus-jakarta-sans-700-34.woff2',
  './assets/fonts/plus-jakarta-sans-700-35.woff2',
  './assets/fonts/plus-jakarta-sans-700-36.woff2',
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
