import React, { useState } from 'react';
import { Link, Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import { UserAvatar } from '../components';
import LandingPage from '../pages/LandingPage';

import {
  HiHome,
  HiUserGroup,
  HiClipboardList,
  HiLightningBolt,
  HiCreditCard,
  HiShoppingCart,
  HiTag,
  HiUsers,
  HiSpeakerphone,
  HiHeart,
  HiIdentification,
  HiLogout,
  HiMenu,
  HiX,
  HiSparkles,
  HiShieldCheck,
  HiGlobeAlt
} from 'react-icons/hi';

const DashboardLayout = () => {
  const { user, role, logout, isAuthenticated, loading } = useAuth();
  const { alerta } = useAlerta();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Cargando Strong Gym...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (location.pathname === '/' || location.pathname === '/inicio') {
      return <LandingPage />;
    }
    return <Navigate to="/login" replace />;
  }

  const currentRole = (role || user.role || 'client').toLowerCase();

  // Navigation items per role
  const allNavItems = [
    {
      name: 'Inicio / Servicios Gym',
      path: '/inicio',
      icon: HiGlobeAlt,
      allowedRoles: ['admin', 'worker', 'client']
    },
    // --- ADMIN & WORKER Navigation ---
    {
      name: 'Panel Principal',
      path: '/',
      icon: HiHome,
      allowedRoles: ['admin', 'worker']
    },
    {
      name: 'Gestión de Socios',
      path: '/socios',
      icon: HiUserGroup,
      allowedRoles: ['admin', 'worker']
    },
    {
      name: 'Rutinas',
      path: '/rutinas',
      icon: HiClipboardList,
      allowedRoles: ['admin', 'worker']
    },
    {
      name: 'Catálogo Ejercicios',
      path: '/ejercicios',
      icon: HiLightningBolt,
      allowedRoles: ['admin']
    },
    {
      name: 'Planes y Membresías',
      path: '/membresias',
      icon: HiCreditCard,
      allowedRoles: ['admin', 'worker']
    },
    {
      name: 'Punto de Venta (POS)',
      path: '/pos',
      icon: HiShoppingCart,
      allowedRoles: ['admin', 'worker']
    },
    {
      name: 'Inventario / Productos',
      path: '/productos',
      icon: HiTag,
      allowedRoles: ['admin']
    },
    {
      name: 'Trabajadores / Staff',
      path: '/entrenadores',
      icon: HiUsers,
      allowedRoles: ['admin']
    },
    {
      name: 'Avisos y Eventos',
      path: '/comunicacion',
      icon: HiSpeakerphone,
      allowedRoles: ['admin', 'worker']
    },
    {
      name: 'Tienda Virtual (E-commerce)',
      path: '/tienda',
      icon: HiSparkles,
      allowedRoles: ['admin', 'worker']
    },

    // --- CLIENT (SOCIO) Navigation ---
    {
      name: 'Mi Inicio',
      path: '/',
      icon: HiHome,
      allowedRoles: ['client']
    },
    {
      name: 'Mi Rutina',
      path: '/mi-rutina',
      icon: HiClipboardList,
      allowedRoles: ['client']
    },
    {
      name: 'Mi Membresía & QR',
      path: '/mi-membresia',
      icon: HiIdentification,
      allowedRoles: ['client']
    },
    {
      name: 'Ficha Médica',
      path: '/mi-ficha-medica',
      icon: HiHeart,
      allowedRoles: ['client']
    },
    {
      name: 'Tienda del Gym',
      path: '/tienda',
      icon: HiShoppingCart,
      allowedRoles: ['client']
    },
    {
      name: 'Comunidad & Eventos',
      path: '/comunidad',
      icon: HiSpeakerphone,
      allowedRoles: ['client']
    },
    {
      name: 'Legal & Privacidad',
      path: '/legal',
      icon: HiShieldCheck,
      allowedRoles: ['admin', 'worker', 'client']
    }
  ];

  const navItems = allNavItems.filter((item) => item.allowedRoles.includes(currentRole));

  const handleLogout = async () => {
    if (window.confirm('¿Deseas cerrar tu sesión?')) {
      await logout();
      navigate('/login');
    }
  };

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'admin':
        return { label: 'ADMINISTRADOR', bg: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'worker':
        return { label: 'ENTRENADOR / STAFF', bg: 'bg-sky-100 text-sky-800 border-sky-300' };
      default:
        return { label: 'SOCIO STRONG', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Toast Alert Notification */}
      {alerta.visible && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold border flex items-center gap-3 transition-all ${alerta.error
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}
        >
          <span className="text-lg">{alerta.error ? '⚠️' : '✅'}</span>
          <span>{alerta.msg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 h-screen z-50 flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
        >
          {/* Logo & Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <span className="text-xl font-black text-white">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-wider text-slate-900">STRONG GYM</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">Fitness Center</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile Mini Card */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <UserAvatar
              name={user?.full_name || user?.name || user?.email}
              role={currentRole}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.full_name || user?.name || 'Usuario'}
              </p>
              <span className={`inline-block px-2 py-0.5 mt-0.5 text-[10px] font-extrabold uppercase rounded-full border ${roleBadge.bg}`}>
                {roleBadge.label}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 translate-x-1'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100 hover:translate-x-1'
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                      }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200"
            >
              <HiLogout className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <HiMenu className="w-6 h-6" />
              </button>

              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {navItems.find((n) => n.path === location.pathname)?.name || 'STRONG GYM'}
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Plataforma de gestión y entrenamiento
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${roleBadge.bg}`}>
                {roleBadge.label}
              </span>
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-900">{user?.full_name || user?.name || user?.email}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              <UserAvatar
                name={user?.full_name || user?.name || user?.email}
                role={currentRole}
                size="sm"
              />
            </div>
          </header>

          {/* Main View Body */}
          <main className="flex-1 p-6 md:p-8 bg-slate-50 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
