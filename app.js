/**
 * NOVASHOP - Application JavaScript
 * Gère la logique de l'application PWA
 */

// Configuration
const APP_NAME = 'NOVASHOP';
const CACHE_NAME = 'novashop-cache-v3';
const OFFLINE_URL = '/offline.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  'https://i.ibb.co/0X8Yz2H/logo.png',
  // Ajoutez d'autres ressources statiques ici
];

// Éléments du DOM
const installButton = document.getElementById('installBtn');
const loadingElement = document.getElementById('loading');

// Vérifier si le navigateur supporte les service workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
    checkInstallPrompt();
  });
}

// Enregistrer le Service Worker
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('service-worker.js');
    console.log('Service Worker enregistré avec succès:', registration);
    
    // Vérifier les mises à jour du Service Worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Nouveau Service Worker en cours d\'installation');
      
      newWorker.addEventListener('statechange', () => {
        console.log('État du Service Worker:', newWorker.state);
      });
    });
    
    // Vérifier si la page est contrôlée par un Service Worker
    if (navigator.serviceWorker.controller) {
      console.log('Page contrôlée par un Service Worker');
    } else {
      console.log('Page non contrôlée par un Service Worker');
    }
    
  } catch (error) {
    console.error('Échec de l\'enregistrement du Service Worker:', error);
  }
}

// Gérer l'installation de l'application
let deferredPrompt;

function checkInstallPrompt() {
  // Masquer le bouton d'installation par défaut
  if (installButton) {
    installButton.style.display = 'none';
    
    // Événement déclenché lorsque le navigateur souhaite afficher l'invite d'installation
    window.addEventListener('beforeinstallprompt', (e) => {
      // Empêcher le mini-infobar d'apparaître sur mobile
      e.preventDefault();
      
      // Stocker l'événement pour une utilisation ultérieure
      deferredPrompt = e;
      
      // Afficher le bouton d'installation
      if (installButton) {
        installButton.style.display = 'inline-block';
        
        // Gérer le clic sur le bouton d'installation
        installButton.addEventListener('click', installApp);
      }
      
      console.log('beforeinstallprompt event was fired');
    });
    
    // Détecter si l'application est installée
    window.addEventListener('appinstalled', (e) => {
      console.log('Application installée avec succès!', e);
      // Masquer le bouton d'installation
      if (installButton) {
        installButton.style.display = 'none';
      }
      // Rediriger vers la page d'accueil
      window.location.href = '/';
    });
  }
}

// Fonction pour installer l'application
async function installApp() {
  if (!deferredPrompt) return;
  
  // Afficher l'invite d'installation
  deferredPrompt.prompt();
  
  // Attendre que l'utilisateur réponde à l'invite
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Résultat de l'installation: ${outcome}`);
  
  // Réinitialiser la variable car elle ne peut être utilisée qu'une seule fois
  deferredPrompt = null;
  
  // Masquer le bouton d'installation
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Vérifier si l'application est en mode autonome (installée)
function isInStandaloneMode() {
  return (window.matchMedia('(display-mode: standalone)').matches) || 
         (window.navigator.standalone) || 
         document.referrer.includes('android-app://');
}

// Détecter le type d'appareil
function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Vérifier si c'est un appareil mobile
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Vérifier si c'est iOS
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  
  return { isMobile, isIOS };
}

// Initialiser l'application
function initApp() {
  const { isMobile, isIOS } = detectDevice();
  
  console.log(`Démarrage de ${APP_NAME} sur ${isMobile ? 'mobile' : 'desktop'}`);
  
  // Masquer l'écran de chargement une fois que tout est prêt
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  // Afficher un message de bienvenue personnalisé
  console.log(`Bienvenue sur ${APP_NAME}!`);
  
  // Vérifier la connexion
  checkConnection();
  
  // Ajouter un écouteur d'événements pour les changements de connexion
  window.addEventListener('online', checkConnection);
  window.addEventListener('offline', checkConnection);
}

// Vérifier l'état de la connexion
function checkConnection() {
  if (navigator.onLine) {
    console.log('Connecté à Internet');
  } else {
    console.warn('Hors ligne - Mode hors ligne activé');
    // Vous pouvez ajouter une logique pour le mode hors ligne ici
  }
}

// Démarrer l'application
window.addEventListener('load', () => {
  // Vérifier si l'application est déjà installée
  if (isInStandaloneMode()) {
    console.log('Application déjà installée');
    // Masquer le bouton d'installation
    if (installButton) {
      installButton.style.display = 'none';
    }
  }
  
  // Initialiser l'application
  initApp();
  
  // Rediriger après un court délai (pour démonstration)
  setTimeout(() => {
    // Ne rediriger que si nous ne sommes pas dans l'application installée
    if (!isInStandaloneMode()) {
      // window.location.href = 'https://www.mychariow.com/novashop';
    }
  }, 3000);
});

// Gérer les erreurs non capturées
window.addEventListener('error', (event) => {
  console.error('Erreur non capturée:', event.error || event.message || event);
  // Vous pouvez ajouter une logique de gestion des erreurs ici
});
