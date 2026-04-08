// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] SW registered:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              if (confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
                newWorker.postMessage({ action: 'skipWaiting' });
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error('[PWA] SW registration failed:', error);
      });
    
    // Listen for messages from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.action === 'skipWaiting') {
        window.location.reload();
      }
    });
  });
}

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('[PWA] App is online');
  document.body.classList.remove('offline');
});

window.addEventListener('offline', () => {
  console.log('[PWA] App is offline');
  document.body.classList.add('offline');
  
  // Show offline notification
  if ('Notification' in navigator && Notification.permission === 'granted') {
    new Notification('WinDoor Pro', {
      body: 'Modo offline activado. Los cambios se sincronizarán cuando estés en línea.',
      icon: '/icons/icon-192x192.png'
    });
  }
});

// Request notification permission
if ('Notification' in navigator) {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('[PWA] Notification permission granted');
    }
  });
}

// Add to home screen prompt handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Store the event for later use
  deferredPrompt = e;
  console.log('[PWA] Install prompt ready');
  
  // You can show a custom install button here
  const installButton = document.getElementById('pwa-install-btn');
  if (installButton) {
    installButton.style.display = 'block';
    installButton.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install');
      } else {
        console.log('[PWA] User dismissed install');
      }
      deferredPrompt = null;
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App was installed');
  deferredPrompt = null;
  
  // Hide install button
  const installButton = document.getElementById('pwa-install-btn');
  if (installButton) {
    installButton.style.display = 'none';
  }
});
