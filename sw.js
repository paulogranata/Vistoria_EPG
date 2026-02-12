const CACHE_NAME = 'vistoria-v1.2.0';
const CACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Brush+Script+MT&family=Montserrat:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', (event) => {
    console.log('[SW v1.2] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(CACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW v1.2] Ativando...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME) {
                            console.log('[SW] Removendo cache antigo:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    if (event.request.url.includes('chrome-extension') || 
        event.request.url.includes('google-analytics')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => caches.match('./index.html'));
            })
    );
});

console.log('[SW v1.2] Carregado');
