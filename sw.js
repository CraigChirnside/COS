// Service worker: the app shell is precached so the phone opens it with no
// network at all. Bump SHELL_CACHE whenever a shell file changes, or the old
// copy keeps being served.
const SHELL_CACHE = 'craig-os-shell-v1';
const FONT_CACHE = 'craig-os-fonts-v1';
const KEEP = [SHELL_CACHE, FONT_CACHE];

const SHELL = [
  './',
  './index.html',
  './app.js',
  './dom.js',
  './manifest.webmanifest',
  './_ds/industry-6d55b748-4611-464e-8643-d2c8d4557dd6/styles.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      // addAll is all-or-nothing, so one bad path would leave the app with no
      // offline copy at all. Cache individually and let stragglers fail.
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: stale-while-revalidate. If it never arrives the stylesheet
  // falls back to system-ui, so the app is usable either way.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.open(FONT_CACHE).then((c) => c.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      }))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Same origin: cache first, then network. A navigation that misses both
  // falls back to the cached shell so a deep link still opens offline.
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(SHELL_CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
