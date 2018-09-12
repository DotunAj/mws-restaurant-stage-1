const currentCacheName = 'restaurant-static-1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(currentCacheName).then(cache => {
      cache.addAll([
        './',
        './restaurant',
        './css/styles.css',
        './data/restaurants.json',
        './js/dbhelper.js',
        './js/restaurant_info.js',
        './js/main.js',
        './img',
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('restaurant-static-') && cacheName !== currentCacheName)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
