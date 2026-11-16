import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar Service Worker para PWA (Instalable como acceso directo)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('✅ Service Worker PWA Tiendas activo:', reg.scope))
      .catch((err) => console.warn('⚠️ Error al registrar Service Worker PWA:', err));
  });
}
