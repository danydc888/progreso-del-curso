const CACHE_NAME = 'progreso-curso-v1';
const urlsToCache = [
  '/',
  '/Index.html',
  '/profiles.html',
  '/app.js',
  '/profiles.js',
  '/styles.css',
  '/profiles.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
