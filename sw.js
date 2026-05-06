const CACHE_NAME = 'tacx-v1';

// Instalación básica para cumplir requisitos de PWA
self.addEventListener('install', (e) => {
  console.log('Service Worker instalado');
});

self.addEventListener('fetch', (e) => {
  // Solo passthrough, necesario para que Chrome detecte PWA
  e.respondWith(fetch(e.request));
});