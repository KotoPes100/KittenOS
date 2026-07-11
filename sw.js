const CACHE_NAME = 'kittentos-v4';

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

 // Installation: download everything to the cache
 self.addEventListener('install', (event) => {
   event.waitUntil(
     caches.open(CACHE_NAME).then((cache) => {
       console.log('SW: Caching files...');
       return cache.addAll(ASSETS);
     }).then(() => self.skipWaiting())
   );
 });

 // Activation: delete old cache
 self.addEventListener('activate', (event) => {
   event.waitUntil(
     caches.keys().then((cacheNames) => {
       return Promise.all(
         cacheNames.map((cache) => {
           if (cache !== CACHE_NAME) {
             return caches.delete(cache);
           }
         })
       );
     }).then(() => self.clients.claim())
   );
 });

 // Network-First: prioritize the network, use cache for offline access
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If the network responds, update the cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If the network is unavailable, try to find the file in the cache
        return caches.match(event.request);
      })
  );
});
