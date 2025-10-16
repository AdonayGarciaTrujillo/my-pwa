// public/service-worker.js
importScripts('https://cdn.jsdelivr.net/npm/idb@7/build/umd.js');

const STATIC_CACHE = 'static-v12';
const DYNAMIC_CACHE = 'dynamic-v12';

// --- ¡PASO CRÍTICO! ---
// Actualiza estos nombres con los de tu carpeta 'dist/assets'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/logo.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/index-DsURrspt.js',  // <-- Actualiza este nombre
  '/assets/index-C1Fd6M-W.css' // <-- Actualiza este nombre
];

// --- FASE DE INSTALACIÓN ---
self.addEventListener('install', e => {
  const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL));
  e.waitUntil(Promise.all([cacheStatic, self.skipWaiting()]));
});

// --- FASE DE ACTIVACIÓN ---
self.addEventListener('activate', e => {
  const response = caches.keys().then(keys => {
    return Promise.all(keys.map(key => {
      if (!key.includes('v12')) {
        return caches.delete(key);
      }
    }));
  });
  e.waitUntil(response);
});

// --- ESTRATEGIAS DE CACHÉ EN EL EVENTO FETCH ---
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  let response;

  // Estrategia 1: Stale-While-Revalidate para CSS y JS
  if (e.request.url.match(/\.(css|js)$/)) {
    response = caches.open(DYNAMIC_CACHE).then(cache => {
      return cache.match(e.request).then(res => {
        const fetchPromise = fetch(e.request).then(newRes => {
          cache.put(e.request, newRes.clone());
          return newRes;
        });
        return res || fetchPromise; // Devuelve caché si existe, si no, espera a la red.
      });
    });
  }
  // Estrategia 2: Network-First para la API de prueba
  else if (e.request.url.includes('jsonplaceholder.typicode.com')) {
    response = fetch(e.request).then(res => {
      if (res) {
        return caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(e.request, res.clone());
          return res;
        });
      }
      return caches.match(e.request); // Fallback a la caché si la red falla
    }).catch(() => caches.match(e.request));
  }
  // Estrategia 3: Cache-First para el resto (App Shell, imágenes)
  else {
    response = caches.match(e.request);
  }

  e.respondWith(response.catch(() => {
    if (e.request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
  }));
});

// --- LÓGICA DE SINCRONIZACIÓN EN SEGUNDO PLANO (CON VERIFICACIÓN DE PERMISO) ---
const DB_NAME_SYNC = 'tareas-db';
const STORE_NAME_SYNC = 'tareas-store';

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tareas') {
    console.log('[SW] Evento SYNC recibido. Iniciando sincronización...');
    event.waitUntil(sincronizarTareas());
  }
});

async function sincronizarTareas() {
  console.log('[SW Sync] 1. Dentro de la función sincronizarTareas.');
  try {
    console.log('[SW Sync] 2. Intentando abrir la base de datos...');
    const db = await idb.openDB(DB_NAME_SYNC);
    console.log('[SW Sync] 3. Base de datos abierta con éxito.');
    
    console.log('[SW Sync] 4. Obteniendo tareas no sincronizadas...');
    const tareasNoSincronizadas = await db.getAllFromIndex(STORE_NAME_SYNC, 'sincronizado', 0);
    console.log(`[SW Sync] 5. Se encontraron ${tareasNoSincronizadas.length} tareas para sincronizar.`);

    if (!tareasNoSincronizadas || tareasNoSincronizadas.length === 0) {
      return;
    }
    
    console.log('[SW Sync] 6. Enviando tareas al servidor...');
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(tareasNoSincronizadas),
      headers: {'Content-Type': 'application/json'},
    });
    console.log('[SW Sync] 7. Petición fetch completada.');

    if (response.ok) {
      console.log('[SW Sync] 8. Tareas enviadas exitosamente. Actualizando IndexedDB...');
      const tx = db.transaction(STORE_NAME_SYNC, 'readwrite');
      await Promise.all(
        tareasNoSincronizadas.map(tarea => tx.store.put({ ...tarea, sincronizado: 1 }))
      );
      await tx.done;
      console.log('[SW Sync] 9. IndexedDB actualizado. Intentando mostrar notificación...');

      // ¡NUEVA VERIFICACIÓN! Solo mostramos la notificación si tenemos permiso.
      if (self.registration.showNotification) {
        const permission = await self.registration.pushManager.permissionState({ userVisibleOnly: true });
        if (permission === 'granted') {
          self.registration.showNotification('Tareas Sincronizadas', {
            body: 'Tus tareas pendientes han sido guardadas en el servidor.',
            icon: '/icons/icon-192x192.png'
          });
        } else {
          console.log('[SW Sync] No se tiene permiso para mostrar notificaciones.');
        }
      }
    } else {
      console.error('[SW Sync] El servidor respondió con un error, se reintentará más tarde.');
    }
  } catch (error) {
    console.error('[SW Sync] Ocurrió un error CRÍTICO durante la sincronización:', error);
    throw error;
  }
}

// --- LÓGICA DE NOTIFICACIONES PUSH (FINAL Y ROBUSTA) ---
self.addEventListener('push', e => {
  console.log('[SW] Evento Push recibido');
  let data;
  try {
    data = e.data ? e.data.json() : { title: 'Mi PWA', body: '¡Tienes una nueva notificación!' };
  } catch (error) {
    console.log('[SW] Notificación .');
    data = { title: 'Mi PWA', body: e.data.text() };
  }
  
  const title = data.title;
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  };

  e.waitUntil(self.registration.showNotification(title, options));
});
