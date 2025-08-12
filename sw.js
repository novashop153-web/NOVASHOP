// Configuration du Service Worker
const APP_PREFIX = 'novashop';
const VERSION = 'v4';
const CACHE_NAME = `${APP_PREFIX}-${VERSION}`;
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache lors de l'installation
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  'https://i.ibb.co/0X8Yz2H/logo.png',
  // Ajoutez d'autres ressources statiques importantes ici
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log(`[Service Worker ${VERSION}] Installation en cours...`);
  
  // Mise en cache des ressources essentielles
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log(`[Service Worker] Mise en cache de ${URLS_TO_CACHE.length} ressources`);
        return cache.addAll(URLS_TO_CACHE)
          .then(() => {
            console.log('[Service Worker] Toutes les ressources ont été mises en cache');
          })
          .catch(error => {
            console.error('[Service Worker] Erreur lors de la mise en cache:', error);
            throw error;
          });
      })
      .then(() => {
        // Forcer le Service Worker à devenir actif immédiatement
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log(`[Service Worker ${VERSION}] Activation en cours...`);
  
  // Nettoyage des anciens caches
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Supprimer les caches qui ne correspondent pas à la version actuelle
              return cacheName.startsWith(APP_PREFIX) && !cacheName.includes(VERSION);
            })
            .map(cacheName => {
              console.log(`[Service Worker] Suppression de l'ancien cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        // Prendre le contrôle de tous les clients (onglets) immédiatement
        return self.clients.claim();
      })
      .then(() => {
        console.log(`[Service Worker ${VERSION}] Activé et prêt à gérer les requêtes`);
      })
  );
});

// Stratégie de mise en cache : Cache with Network Fallback + Stale-While-Revalidate
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;
  
  // Ignorer les requêtes vers des domaines externes (sauf si nécessaire)
  if (!url.origin.startsWith(self.location.origin) && 
      !url.href.includes('i.ibb.co')) {
    return;
  }
  
  // Gestion des requêtes de navigation (pages HTML) - Network First, fallback au cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          // Si la réponse est valide, la mettre en cache et la renvoyer
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // En cas d'échec, essayer de récupérer depuis le cache
          return caches.match('/')
            .then(cachedResponse => {
              return cachedResponse || caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }
  
  // Pour les autres ressources (CSS, JS, images, etc.) - Cache First, puis réseau
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Toujours faire une requête réseau pour mettre à jour le cache
        const fetchPromise = fetch(request)
          .then(networkResponse => {
            // Mettre à jour le cache avec la nouvelle réponse
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => {
            // En cas d'erreur réseau, on continue avec la réponse en cache si elle existe
            console.warn(`[Service Worker] Impossible de récupérer ${request.url}`);
          });
        
        // Renvoyer la réponse en cache immédiatement si elle existe, sinon attendre la réponse réseau
        return cachedResponse || fetchPromise;
      })
  );
});

// Gestion des messages du client (par exemple, pour forcer la mise à jour)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Autres types de messages peuvent être gérés ici
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }
});

// Gestion de la synchronisation en arrière-plan
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    console.log('[Service Worker] Synchronisation en arrière-plan déclenchée');
    // Implémentez la logique de synchronisation ici
  }
});

// Gestion des notifications push
self.addEventListener('push', event => {
  const title = 'Nouvelle notification';
  const options = {
    body: event.data.text(),
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Gérer l'action du clic sur la notification
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});
