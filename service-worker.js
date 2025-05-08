if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js') // La ruta debe ser '/'
        .then(registration => {
          console.log('Service Worker registrado con scope:', registration.scope);
        }).catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }