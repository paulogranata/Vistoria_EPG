/* ========================================
   SERVICE WORKER - PWA OFFLINE-FIRST
   Vistoria Imobiliária - Cache Strategy
   ======================================== */

const CACHE_NAME = 'vistoria-v1.0.0';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cache aberto');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Assets em cache');
                return self.skipWaiting(); // Ativa imediatamente
            })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    
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
            .then(() => {
                console.log('[SW] Service Worker ativado');
                return self.clients.claim(); // Controla imediatamente
            })
    );
});

// Estratégia Cache-First com Network Fallback
self.addEventListener('fetch', (event) => {
    // Ignorar requisições não-GET
    if (event.request.method !== 'GET') return;
    
    // Ignorar chrome-extension e requisições externas específicas
    if (event.request.url.includes('chrome-extension') || 
        event.request.url.includes('google-analytics')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Retorna do cache
                    return cachedResponse;
                }
                
                // Busca na rede
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Armazena no cache se for bem-sucedido
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[SW] Erro de rede:', error);
                        
                        // Retornar página offline se disponível
                        return caches.match('/index.html');
                    });
            })
    );
});

// Sincronização em Background (quando voltar online)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    
    if (event.tag === 'sync-vistoria') {
        event.waitUntil(
            // TODO: Implementar sincronização de dados pendentes
            Promise.resolve()
        );
    }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
    console.log('[SW] Mensagem recebida:', event.data);
    
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => caches.delete(cache))
                );
            })
        );
    }
});

console.log('[SW] Service Worker carregado');
