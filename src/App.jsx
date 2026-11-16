import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppProviders from './context/AppProviders';

// Layouts
import GuestLayout from './layouts/GuestLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LegalCenter from './pages/LegalCenter';
import CookieConsentBanner from './components/legal/CookieConsentBanner';

// Admin / Worker Pages
import Socios from './pages/Socios';
import Rutinas from './pages/Rutinas';
import Ejercicios from './pages/Ejercicios';
import Membresias from './pages/Membresias';
import Pos from './pages/Pos';
import Productos from './pages/Productos';
import Entrenadores from './pages/Entrenadores';
import Comunicacion from './pages/Comunicacion';

// Client Pages
import MiRutina from './pages/MiRutina';
import MiMembresia from './pages/MiMembresia';
import MiFichaMedica from './pages/MiFichaMedica';
import Tienda from './pages/Tienda';
import Comunidad from './pages/Comunidad';

// 404 Page
const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-100">
    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 font-black text-2xl">
      404
    </div>
    <h1 className="text-2xl font-black text-white">Página no encontrada</h1>
    <p className="mt-2 text-slate-400 text-sm max-w-sm">
      La dirección a la que intentas acceder no existe o fue movida.
    </p>
    <a
      href="/"
      className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-sm text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
    >
      Volver al Inicio
    </a>
  </div>
);

function App() {
  const [forceOpenCookies, setForceOpenCookies] = useState(false);

  return (
    <React.StrictMode>
      <AppProviders>
        <BrowserRouter>
          <Routes>
            {/* Rutas Públicas (Auth) */}
            <Route element={<GuestLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/verify-email" element={<Login />} />
              <Route path="/reset-password" element={<Login />} />
            </Route>

            {/* Ruta Principal: Muestra LandingPage a visitantes y el Dashboard/Módulos a usuarios autenticados */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="panel" element={<Dashboard />} />
              <Route path="inicio" element={<LandingPage embedded={true} onOpenCookies={() => setForceOpenCookies(true)} />} />
              <Route path="legal" element={<LegalCenter onOpenCookies={() => setForceOpenCookies(true)} />} />

              {/* Módulos de Admin y Entrenador */}
              <Route path="socios" element={<Socios />} />
              <Route path="rutinas" element={<Rutinas />} />
              <Route path="ejercicios" element={<Ejercicios />} />
              <Route path="membresias" element={<Membresias />} />
              <Route path="pos" element={<Pos />} />
              <Route path="productos" element={<Productos />} />
              <Route path="entrenadores" element={<Entrenadores />} />
              <Route path="trabajadores" element={<Entrenadores />} />
              <Route path="comunicacion" element={<Comunicacion />} />

              {/* Módulos de Socio (Cliente) */}
              <Route path="mi-rutina" element={<MiRutina />} />
              <Route path="mi-membresia" element={<MiMembresia />} />
              <Route path="mi-ficha-medica" element={<MiFichaMedica />} />
              <Route path="tienda" element={<Tienda />} />
              <Route path="comunidad" element={<Comunidad />} />
            </Route>

            {/* Redirección y 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Banner Global de Consentimiento de Cookies */}
          <CookieConsentBanner
            forceOpen={forceOpenCookies}
            onCloseForce={() => setForceOpenCookies(false)}
          />
        </BrowserRouter>
      </AppProviders>
    </React.StrictMode>
  );
}

export default App;
