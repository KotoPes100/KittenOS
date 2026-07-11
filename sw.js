const CACHE_NAME = 'kittentos-v1';

 const ASSETS = [
   './',
   'index.html',
   'library/eruda.js',
   'library/lightning-fs.min.js',
   'apps/files.html',
   'apps/gallery.html',
   'apps/camera.html',
   'apps/browser.html',
   'apps/calculator.html',
   'apps/list.html',
   'apps/cat_maps.html',
   'apps/search.html',
   'apps/weather.html'
 ];

// Service Worker installation 
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Old cache deleted:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
