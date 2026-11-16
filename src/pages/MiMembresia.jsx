import React, { useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useMembership from '../hooks/useMembership';
import { PageHeader, UserAvatar } from '../components';
import {
  HiIdentification,
  HiCheckCircle,
  HiExclamation,
  HiCalendar,
  HiClock,
  HiCreditCard,
  HiSparkles
} from 'react-icons/hi';

const MiMembresia = () => {
  const { user } = useAuth();
  const { mySubscriptions, plans, fetchMySubscriptions, fetchPlans, loading } = useMembership();

  useEffect(() => {
    fetchMySubscriptions();
    fetchPlans(true);
  }, [fetchMySubscriptions, fetchPlans]);

  // Determine current active subscription
  const currentSub = mySubscriptions && mySubscriptions.length > 0 ? mySubscriptions[0] : null;

  // Calculate days remaining
  const daysRemaining = user?.days_remaining ?? (currentSub?.daysRemaining ?? null);
  const isSubActive = user?.active ?? (currentSub?.is_active ?? false);

  const getStatusInfo = () => {
    if (daysRemaining !== null && daysRemaining <= 0) {
      return {
        label: 'VENCIDA',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        barColor: 'bg-rose-500',
        msg: 'Tu suscripción ha finalizado. Acércate a recepción para renovar.'
      };
    }
    if (daysRemaining !== null && daysRemaining <= 3) {
      return {
        label: 'POR VENCER',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        barColor: 'bg-amber-500',
        msg: `¡Atención! Tu membresía vence en ${daysRemaining} día(s).`
      };
    }
    if (isSubActive) {
      return {
        label: 'ACTIVA',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        barColor: 'bg-emerald-500',
        msg: 'Acceso habilitado al gimnasio.'
      };
    }
    return {
      label: 'INACTIVA',
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      barColor: 'bg-slate-400',
      msg: 'No cuentas con una membresía activa.'
    };
  };

  const status = getStatusInfo();

  const handleRenewWhatsApp = (plan) => {
    const phone = '573001234567'; // WhatsApp de recepción Strong Gym
    const planName = plan?.name || 'Membresía Strong Gym';
    const msg = `Hola STRONG GYM 👋, soy ${user?.full_name || 'Socio'} (Doc: ${user?.document_id || ''}). Deseo renovar/adquirir el plan *${planName}*. ¿Cuáles son los medios de pago disponibles?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        badge="Control de Acceso"
        title="Mi Membresía & Carnet Digital"
        subtitle="Presenta tu código de socio al ingresar a las instalaciones de STRONG GYM."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CARNET DIGITAL DEL SOCIO (Columna Izquierda) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-7 shadow-2xl shadow-indigo-200 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

            {/* Top Bar Carnet */}
            <div className="flex justify-between items-center pb-6 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-base backdrop-blur-xs">
                  S
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-widest text-white uppercase">STRONG GYM</h3>
                  <p className="text-[9px] text-indigo-200 tracking-wider">MEMBER CARD</p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${status.bg}`}>
                {status.label}
              </span>
            </div>

            {/* User Info */}
            <div className="py-6 flex items-center gap-4">
              <UserAvatar
                name={user?.full_name || user?.name || 'Socio Strong'}
                role="client"
                size="xl"
                className="bg-white/20 text-white border-2 border-white/30 text-2xl font-black"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-black text-white truncate">
                  {user?.full_name || user?.name || 'Socio Strong'}
                </h4>
                <p className="text-xs text-indigo-200 mt-0.5">
                  Doc: <span className="font-mono font-bold text-white">{user?.document_id || 'N/A'}</span>
                </p>
                <p className="text-[11px] text-indigo-300 mt-0.5">
                  Tel: {user?.phone || 'Sin registrar'}
                </p>
              </div>
            </div>

            {/* Barcode / Identificador Digital */}
            <div className="bg-white rounded-2xl p-4 text-center text-slate-900 shadow-md">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Código de Acceso en Recepción
              </p>
              {/* Fake visual barcode stripes */}
              <div className="h-12 bg-slate-100 rounded-lg flex items-center justify-center gap-1.5 px-3 py-1 my-1">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full ${
                      i % 3 === 0 ? 'w-1 bg-slate-900' : i % 2 === 0 ? 'w-0.5 bg-slate-800' : 'w-1.5 bg-slate-900'
                    }`}
                  />
                ))}
              </div>
              <p className="font-mono font-black text-sm tracking-widest text-slate-900 mt-1">
                {user?.document_id || `SG-${user?.id || 'MEMBER'}`}
              </p>
            </div>

            {/* Days Left Countdown */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-indigo-200">Vigencia de Membresía</span>
                <span className="text-white">
                  {daysRemaining !== null ? `${daysRemaining} días restantes` : 'Sin cuota activa'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full ${status.barColor}`}
                  style={{
                    width: `${Math.min(100, Math.max(0, ((daysRemaining || 0) / 30) * 100))}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Notice Banner */}
          <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 ${status.bg}`}>
            <HiExclamation className="w-5 h-5 shrink-0" />
            <span>{status.msg}</span>
          </div>
        </div>

        {/* CATÁLOGO DE PLANES PARA RENOVAR (Columna Derecha) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HiSparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-black text-slate-900">
                Planes Disponibles para Renovación
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Escoge el plan ideal para tus objetivos y solicita tu renovación o activación directamente.
            </p>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold">
                Cargando planes de membresía...
              </div>
            ) : plans && plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between bg-slate-50/50"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-black text-slate-900 text-base">{p.name}</h4>
                        {p.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                            {p.badge}
                          </span>
                        )}
                      </div>

                      <div className="my-3">
                        <span className="text-2xl font-black text-indigo-600">
                          ${(p.price || 0).toLocaleString('es-CO')}
                        </span>
                        <span className="text-xs text-slate-500 font-bold ml-1">
                          / {p.durationDays || 30} días
                        </span>
                      </div>

                      {p.features && p.features.length > 0 && (
                        <ul className="space-y-1.5 my-3 text-xs text-slate-600">
                          {p.features.map((f, fi) => (
                            <li key={fi} className="flex items-center gap-2">
                              <HiCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRenewWhatsApp(p)}
                      className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Renovar este Plan</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500 font-medium">
                No hay planes listados en este momento. Consulta en la recepción de STRONG GYM.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiMembresia;
