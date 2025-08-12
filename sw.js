const CACHE_NAME = 'novashop-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Ajoutez d'autres ressources à mettre en cache si nécessaire
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Renvoie la réponse mise en cache si elle existe, sinon effectue la requête réseau
        return response || fetch(event.request);
      })
  );
});
