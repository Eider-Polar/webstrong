import React from 'react';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  HiUserGroup,
  HiClipboardList,
  HiCreditCard,
  HiShoppingCart,
  HiLightningBolt,
  HiHeart,
  HiIdentification,
  HiArrowRight,
  HiArchive
} from 'react-icons/hi';

const Dashboard = () => {
  const { user, role, clients, workers } = useAuth();
  const currentRole = (role || user?.role || 'client').toLowerCase();

  // ----------------------------------------------------
  // VISTA PARA CLIENTES / SOCIOS
  // ----------------------------------------------------
  if (currentRole === 'client') {
    return (
      <div className="space-y-8">
        {/* Banner de Bienvenida con degradado vivo y texto blanco de alto contraste */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 p-8 md:p-10 text-white shadow-xl shadow-indigo-200">
          <div className="max-w-2xl relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white border border-white/30 uppercase tracking-widest backdrop-blur-xs">
              Área de Socios
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-3 text-white tracking-tight drop-shadow-xs">
              ¡Bienvenido, {user?.full_name || user?.name || 'Socio'}! 💪
            </h1>
            <p className="mt-2.5 text-indigo-100 text-sm md:text-base leading-relaxed">
              Mantén el enfoque en tus objetivos de entrenamiento. Aquí puedes revisar tu rutina asignada, tu tarjeta de acceso digital y tu avance de medidas.
            </p>
          </div>

          {/* Decoración geométrica sutil en el banner */}
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Cuadrícula de Acciones Rápidas (Tarjetas blancas con texto oscuro y botones nítidos) */}
        <div>
          <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight">
            Accesos Rápidos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Mi Rutina */}
            <Link
              to="/mi-rutina"
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                  <HiClipboardList className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Mi Rutina
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Revisa tus ejercicios programados y registra tu avance de series diario.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Ver rutina</span>
                <HiArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Card 2: Membresía & QR */}
            <Link
              to="/mi-membresia"
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-purple-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-xs">
                  <HiIdentification className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  Membresía & QR
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tu carnet digital y verificación de días restantes de suscripción.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                <span>Ver carnet</span>
                <HiArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Card 3: Ficha Médica */}
            <Link
              to="/mi-ficha-medica"
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-rose-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5 group-hover:scale-105 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-xs">
                  <HiHeart className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                  Ficha Médica
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Control de medidas corporales, peso, grasa y salud general.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-rose-600 group-hover:translate-x-1 transition-transform">
                <span>Ver ficha</span>
                <HiArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Card 4: Tienda del Gym */}
            <Link
              to="/tienda"
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                  <HiShoppingCart className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Tienda del Gym
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Explora suplementos, bebidas hidratantes y accesorios disponibles.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>Explorar tienda</span>
                <HiArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VISTA PARA ADMINISTRADORES Y ENTRENADORES (STAFF)
  // ----------------------------------------------------
  const activeClients = (clients || []).filter((c) => c.active !== false).length;

  return (
    <div className="space-y-8">
      {/* Top Banner Blanco con Detalles Índigo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
            {currentRole === 'admin' ? 'Panel de Administración' : 'Panel de Entrenador'}
          </span>
          <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Resumen General del Gimnasio
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Sesión iniciada como: <span className="text-slate-900 font-bold">{user?.full_name || user?.name || user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/socios"
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <span>+ Gestionar Socios</span>
          </Link>
          <Link
            to="/pos"
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all"
          >
            Punto de Venta
          </Link>
        </div>
      </div>

      {/* Fila de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Socios</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{clients?.length || 0}</p>
            <p className="text-xs text-emerald-600 mt-1 font-bold">
              {activeClients} activos
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <HiUserGroup className="w-6 h-6" />
          </div>
        </div>

        {currentRole === 'admin' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff / Entrenadores</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{workers?.length || 0}</p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">Equipo activo</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <HiLightningBolt className="w-6 h-6" />
            </div>
          </div>
        )}

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Membresías</p>
            <p className="text-base font-black text-slate-900 mt-1">Planes del Gym</p>
            <p className="text-xs text-indigo-600 mt-1 font-bold">Gestión de cuotas</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <HiCreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Punto de Venta</p>
            <p className="text-base font-black text-slate-900 mt-1">Caja Mostrador</p>
            <p className="text-xs text-emerald-600 mt-1 font-bold">Listo para ventas</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <HiShoppingCart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tarjetas de Acceso a Módulos para Staff */}
      <div className={`grid grid-cols-1 ${currentRole === 'admin' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
        <Link
          to="/socios"
          className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-400 hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
            <HiUserGroup className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
            Directorio de Socios
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Buscar socios, verificar estado de cuota, activar/desactivar y consultar fichas médicas.
          </p>
        </Link>

        <Link
          to="/rutinas"
          className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-400 hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
            <HiClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors">
            Asignación de Rutinas
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Diseñar programas semanales, grupos musculares, repeticiones y ejercicios personalizados.
          </p>
        </Link>

        <Link
          to="/pos"
          className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-400 hover:-translate-y-0.5 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
            <HiShoppingCart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
            Punto de Venta
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Cobrar bebidas, proteínas y suplementos rápidamente desde el mostrador.
          </p>
        </Link>

        {currentRole === 'admin' && (
          <Link
            to="/productos"
            className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-amber-400 hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-105 transition-transform">
              <HiArchive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
              Inventario & Productos
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Control de stock, precios COP, reabastecimiento y catálogo de artículos.
            </p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
