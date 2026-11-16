import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';

export const GuestLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const { alerta } = useAlerta();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">Cargando Strong Gym...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative gradient accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-100 rounded-full blur-3xl pointer-events-none"></div>

      {/* Global Alert Notification */}
      {alerta.visible && (
        <div
          className={`fixed top-5 z-50 px-6 py-3 rounded-2xl shadow-xl text-sm font-bold border flex items-center gap-3 transition-all ${
            alerta.error
              ? 'bg-rose-50 border-rose-300 text-rose-800'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          <span>{alerta.error ? '⚠️' : '✅'}</span>
          <span>{alerta.msg}</span>
        </div>
      )}

      {/* Content Container */}
      <div className="w-full max-w-md z-10">
        <Outlet />
      </div>
    </div>
  );
};

export default GuestLayout;
