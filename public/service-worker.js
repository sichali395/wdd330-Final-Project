// ============================================
// SERVICE WORKER - OFFLINE CACHING
// Village Connect - WDD330 Final Project
// ============================================

const CACHE_NAME = 'village-connect-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/src/style.css',
    '/src/app.js',
    '/manifest.json',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Noto+Sans:wght@400;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
    console.log('🔄 Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('❌ Cache failed:', error);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Activated');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Strategy: Cache First, then Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then(fetchResponse => {
                        // Cache new requests for offline use
                        if (event.request.method === 'GET') {
                            const responseClone = fetchResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return fetchResponse;
                    });
            })
            .catch(error => {
                console.log('⚠️ Fetch failed, offline mode:', error);
                // You could return a custom offline page here
            })
    );
});

console.log('✅ Service Worker: Ready');