const CACHE_NAME = 'novashop-cache-v2';
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache lors de l'installation
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://i.ibb.co/0X8Yz2H/logo.png',
  // Ajoutez d'autres ressources statiques importantes ici
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installation en cours...');
  
  // Mise en cache des ressources essentielles
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Mise en cache des ressources');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activation en cours...');
  
  // Nettoyage des anciens caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Stratégie de mise en cache : Cache First, puis réseau
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et les requêtes cross-origin non sécurisées
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin) ||
      !(event.request.url.startsWith('http') || event.request.url.startsWith('https'))) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Renvoyer la réponse en cache si elle existe
        if (cachedResponse) {
          console.log('[Service Worker] Ressource servie depuis le cache :', event.request.url);
          return cachedResponse;
        }

        // Sinon, effectuer la requête réseau
        return fetch(event.request)
          .then(response => {
            // Vérifier que la réponse est valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Mettre en cache la réponse pour les requêtes futures
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Erreur de récupération :', error);
            // Si la requête échoue et que nous avons une page d'accueil en cache, la renvoyer
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Gestion de l'installation de l'application
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
