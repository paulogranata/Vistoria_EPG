/**
 * SERVICE WORKER - PWA VISTORIAS IMOBILIÁRIAS v2.0
 * Emilio Paulo Granata - CRECI 50.583
 * 
 * FUNCIONALIDADES:
 * - Cache offline de arquivos estáticos
 * - Cache de bibliotecas CDN
 * - Notificações push (Melhoria #12)
 * - Atualização automática
 */

const CACHE_NAME = 'vistorias-pwa-v2.0.0';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json',
    '/assets/logo-192.png',
    '/assets/logo-512.png'
];

// URLs de bibliotecas CDN para cache
const CDN_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
    'https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js',
    'https://cdn.jsdelivr.net/npm/idb@7/build/umd.js',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js',
    'https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// ============================================================
// INSTALAÇÃO DO SERVICE WORKER
// ============================================================

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando v2.0...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Fazendo cache dos arquivos...');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Cache criado com sucesso');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Erro ao criar cache:', error);
            })
    );
});

// ============================================================
// ATIVAÇÃO DO SERVICE WORKER
// ============================================================

self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Ativando v2.0...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cache) => {
                        if (cache !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Removendo cache antigo:', cache);
                            return caches.delete(cache);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Ativado com sucesso');
                return self.clients.claim();
            })
    );
});

// ============================================================
// INTERCEPTAÇÃO DE REQUESTS (ESTRATÉGIA CACHE-FIRST)
// ============================================================

self.addEventListener('fetch', (event) => {
    // Ignorar requests não-GET
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Se está em cache, retorna do cache
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Senão, busca da rede
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Se for CDN, faz cache
                        if (CDN_ASSETS.some(url => event.request.url.includes(url))) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.warn('⚠️ Service Worker: Offline, usando cache:', error);
                        // Retorna página offline se disponível
                        return caches.match('/index.html');
                    });
            })
    );
});

// ============================================================
// NOTIFICAÇÕES PUSH (Melhoria #12)
// ============================================================

self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notificação clicada:', event.notification.tag);
    
    event.notification.close();
    
    // Abrir ou focar na janela do app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Se já tem janela aberta, foca nela
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Senão, abre nova janela
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// ============================================================
// MENSAGENS DO APP (Comunicação bidirecional)
// ============================================================

self.addEventListener('message', (event) => {
    console.log('📨 Service Worker recebeu mensagem:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CHECK_PENDENCIAS') {
        verificarVistoriasPendentes();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        limparCache();
    }
});

// ============================================================
// VERIFICAÇÃO DE VISTORIAS PENDENTES (Melhoria #12)
// ============================================================

async function verificarVistoriasPendentes() {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['rascunhos'], 'readonly');
        const store = transaction.objectStore('rascunhos');
        const rascunhos = await getAllFromStore(store);
        
        const umDiaAtras = Date.now() - (24 * 60 * 60 * 1000);
        const pendentes = rascunhos.filter(r => r.timestamp < umDiaAtras);
        
        if (pendentes.length > 0) {
            await self.registration.showNotification('⚠️ Vistorias Pendentes', {
                body: `Você tem ${pendentes.length} vistoria(s) não finalizada(s) há mais de 24h`,
                icon: '/assets/logo-192.png',
                badge: '/assets/logo-192.png',
                tag: 'pendencias',
                requireInteraction: true,
                actions: [
                    { action: 'abrir', title: 'Abrir App' },
                    { action: 'dispensar', title: 'Lembrar Depois' }
                ],
                data: {
                    pendentes: pendentes.length,
                    timestamp: Date.now()
                }
            });
            
            console.log(`🔔 Notificação enviada: ${pendentes.length} vistorias pendentes`);
        } else {
            console.log('✅ Nenhuma vistoria pendente');
        }
    } catch (error) {
        console.error('❌ Erro ao verificar pendências:', error);
    }
}

// ============================================================
// HELPERS - IndexedDB
// ============================================================

function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('vistorias-db', 2);
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('rascunhos')) {
                db.createObjectStore('rascunhos', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('finalizadas')) {
                db.createObjectStore('finalizadas', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('fotos')) {
                db.createObjectStore('fotos', { keyPath: 'id' });
            }
        };
    });
}

function getAllFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// ============================================================
// LIMPEZA DE CACHE
// ============================================================

async function limparCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cache => caches.delete(cache))
        );
        console.log('🗑️ Cache limpo com sucesso');
    } catch (error) {
        console.error('❌ Erro ao limpar cache:', error);
    }
}

// ============================================================
// BACKGROUND SYNC (Futuro - v3.0)
// ============================================================

self.addEventListener('sync', (event) => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'sync-vistorias') {
        event.waitUntil(sincronizarVistorias());
    }
});

async function sincronizarVistorias() {
    // Placeholder para sincronização futura com servidor
    console.log('📡 Sincronização de vistorias (não implementado nesta versão)');
}

// ============================================================
// LOGS E MONITORAMENTO
// ============================================================

console.log(`
╔════════════════════════════════════════════════════════╗
║   SERVICE WORKER v2.0 - VISTORIAS IMOBILIÁRIAS         ║
║   © 2026 Emilio Paulo Granata - CRECI 50.583           ║
╚════════════════════════════════════════════════════════╝

✅ Cache offline ativo
✅ Notificações configuradas
✅ Pronto para uso offline
`);
