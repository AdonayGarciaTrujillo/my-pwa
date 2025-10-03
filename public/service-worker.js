// public/service-worker.js

const CACHE_NAME = 'mi-pwa-cache-v4'; // Incrementamos la versión a v4
const urlsToCache = [
  '/',
  '/index.html',
  
  // --- Archivos que volvemos a añadir ---
  '/manifest.json',
  '/vite.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // ------------------------------------

  // Archivos esenciales de la compilación (ajusta los nombres si cambian)
  '/assets/index-D4tBbv_8.js',
  '/assets/index-D8b4DHJx.css'
];

// El resto del archivo puede quedar igual que en la versión simplificada...

self.addEventListener('install', (event) => {
  console.log('[SW] Evento: install v4');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Abriendo caché y guardando App Shell COMPLETA');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] ¡App Shell COMPLETA cacheada exitosamente!');
        return self.skipWaiting(); 
      })
      .catch(err => {
        console.error('[SW] Falló el cacheo completo:', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Evento: activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[SW] Borrando caché vieja: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});