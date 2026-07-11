const CACHE_NAME = 'kittenos-v3'; // Increased the version to clear the old broken cache

const ASSETS = [
'./', // Leave the root with a dot; this is necessary for proper Service Worker binding
'index.html',
'library/eruda.js',
'library/lightning-fs.min.js',
'apps/files.html',
'apps/gallery.html',
'apps/camera.html',
'apps/browser.html',
'apps/calculator.html',
'apps/list.html',
'apps/cat_maps.html', // Renamed (removed space and apostrophe)
'apps/search.html',
'apps/weather.html'
];

 // Install Service Worker
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then(async (cache) => {
console.log('SW: Starting caching system files...');

// Cache files one by one, so that one missing file doesn't crash the entire system
for (const url of ASSETS) {
try {
await cache.add(url);
console.log(`SW: Successfully cached -> ${url}`);
} catch (err) {
console.error(`SW: CRITICAL caching ERROR for file: ${url}`, err);
// Installation will continue even if this specific file wasn't found
}
}
}).then(() =>  self.skipWaiting())
);
});

// Activate and clear the old cache
self.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cache) => {
if (cache !== CACHE_NAME) {
console.log('SW: Deleted old KittenOS cache:', cache);
return caches.delete(cache);
}
})
);
}).then(() => self.clients.claim())
);
});

 // Request interception (Cache-First strategy for instant offline use)
self.addEventListener('fetch', (event) => {
// Process only GET requests (extensions, form submissions, etc. are ignored)
if (event.request.method !== 'GET') return;

event.respondWith(
caches.match(event.request).then((cachedResponse) => {
// 1. If the file is found in the cache, serve it IMMEDIATELY (works perfectly offline)
if (cachedResponse) {
return cachedResponse;
}

// 2. If the file is not in the cache, try to download it from the network
return fetch(event.request)
.then((networkResponse) => {
// Check that the network response is valid
if (!networkResponse ||  networkResponse.status !== 200 || networkResponse.type !== 'basic') {
return networkResponse;
}

// Dynamically cache new resources if they appear during processing
const responseToCache = networkResponse.clone();
caches.open(CACHE_NAME).then((cache) => {
cache.put(event.request, responseToCache);
});

return networkResponse;
})
.catch((err) => {
console.error('SW: File not found in cache or on the network:', event.request.url, err);
// You can serve a custom offline page here, if needed.
});
})
);
});
