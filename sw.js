self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('restaurant-static-1')
        .then((cache) => {
            cache.addAll([
                './',
                './restaurant',
                './css/styles.css',
                './data/restaurants.json',
                './js/dbhelper.js',
                './js/restaurant_info.js',
                './js/main.js',
                './img'

            ]);
        })
    )
})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request, {ignoreSearch: true}).then((response) => {
            return response || fetch(event.request)
        })
    )
})