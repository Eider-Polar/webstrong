import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useMembership from '../hooks/useMembership';
import useAlerta from '../hooks/useAlerta';
import {
  Modal,
  ConfirmModal,
  PageHeader,
  StatusBadge,
  UserAvatar
} from '../components';
import {
  HiCreditCard,
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiSearch,
  HiUserGroup,
  HiCalendar,
  HiClock,
  HiBadgeCheck,
  HiShieldCheck,
  HiExclamation,
  HiX,
  HiSparkles,
  HiQrcode,
  HiFilter,
  HiCheck,
  HiRefresh
} from 'react-icons/hi';

const Membresias = () => {
  const { clients, fetchClients, isAdmin, isWorker } = useAuth();
  const {
    plans,
    subscriptions,
    loading,
    fetchPlans,
    fetchSubscriptions,
    addPlan,
    deletePlan,
    assignSubscription,
    updateSubscriptionStatus,
    checkClientAccess
  } = useMembership();
  const { mostrarAlerta } = useAlerta();

  const [searchParams] = useSearchParams();

  // Tabs principales: 'plans' (Catálogo de Planes) | 'clients' (Control de Vencimientos) | 'access' (Validador de Acceso)
  const [activeTab, setActiveTab] = useState('plans');

  // --- Estados para Crear Nuevo Plan (Solo ADMIN) ---
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDays, setPlanDays] = useState('30');
  const [planBadge, setPlanBadge] = useState('Popular');
  const [planBenefits, setPlanBenefits] = useState([
    'Acceso ilimitado a instalaciones',
    'Uso de máquinas y peso libre',
    'Evaluación antropométrica periódica'
  ]);
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [savingPlan, setSavingPlan] = useState(false);

  // --- Estados para Asignar Membresía a Socio (ADMIN y WORKER) ---
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignClientId, setAssignClientId] = useState('');
  const [assignPlanId, setAssignPlanId] = useState('');
  const [assignStartDate, setAssignStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignSearchQuery, setAssignSearchQuery] = useState('');
  const [assigning, setAssigning] = useState(false);

  // --- Filtros para Control de Socios ---
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientFilterStatus, setClientFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'WARNING' | 'EXPIRED'

  // --- Estados para Validador de Acceso en Portería / Torniquete ---
  const [accessQuery, setAccessQuery] = useState('');
  const [accessResult, setAccessResult] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(false);

  useEffect(() => {
    fetchPlans(false); // Cargar todos los planes
    fetchSubscriptions();
    fetchClients();
  }, [fetchPlans, fetchSubscriptions, fetchClients]);

  // Si viene con parámetros de consulta en la URL (ej: /membresias?clientId=123&tab=clients)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const clientParam = searchParams.get('clientId');

    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (clientParam) {
      setAssignClientId(clientParam);
      setIsAssignModalOpen(true);
      if (!tabParam) {
        setActiveTab('clients');
      }
    }
  }, [searchParams]);

  // Agregar beneficio a la lista al crear plan
  const handleAddBenefit = () => {
    if (!newBenefitInput.trim()) return;
    setPlanBenefits([...planBenefits, newBenefitInput.trim()]);
    setNewBenefitInput('');
  };

  const handleRemoveBenefit = (idx) => {
    setPlanBenefits(planBenefits.filter((_, i) => i !== idx));
  };

  // Crear Plan de Membresía (Solo Administrador)
  const handleCreatePlanSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      mostrarAlerta('Solo el administrador puede crear planes', true);
      return;
    }
    if (!planName.trim() || !planPrice || !planDays) {
      mostrarAlerta('Ingresa nombre, precio y días de duración', true);
      return;
    }

    setSavingPlan(true);
    try {
      await addPlan({
        name: planName.trim(),
        price: parseFloat(planPrice),
        durationDays: parseInt(planDays),
        features: planBenefits,
        badge: planBadge.trim() || null
      });
      setIsCreatePlanOpen(false);
      setPlanName('');
      setPlanPrice('');
      setPlanDays('30');
      setPlanBadge('Popular');
    } catch (err) {
      // Error manejado en context
    } finally {
      setSavingPlan(false);
    }
  };

  // Eliminar Plan (Solo Administrador con ConfirmModal)
  const [deletePlanConfirm, setDeletePlanConfirm] = useState({ isOpen: false, planId: null, planName: '' });
  const [deletingPlan, setDeletingPlan] = useState(false);

  const handleDeletePlanConfirmed = async () => {
    if (!isAdmin || !deletePlanConfirm.planId) return;
    setDeletingPlan(true);
    try {
      await deletePlan(deletePlanConfirm.planId);
      setDeletePlanConfirm({ isOpen: false, planId: null, planName: '' });
    } finally {
      setDeletingPlan(false);
    }
  };

  // Asignar Membresía a Socio
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignClientId || !assignPlanId) {
      mostrarAlerta('Selecciona al socio y el plan de membresía', true);
      return;
    }

    setAssigning(true);
    try {
      await assignSubscription(assignClientId, assignPlanId, assignStartDate);
      await fetchClients();
      setIsAssignModalOpen(false);
      setAssignClientId('');
      setAssignPlanId('');
    } catch (err) {
      // Manejado en context
    } finally {
      setAssigning(false);
    }
  };

  // Abrir modal de asignación preseleccionando socio
  const handleOpenAssignForClient = (clientId) => {
    setAssignClientId(clientId);
    if (plans.length > 0) setAssignPlanId(plans[0].id.toString());
    setIsAssignModalOpen(true);
  };

  // Validador de Acceso (Torniquete)
  const handleCheckAccess = async (e) => {
    e?.preventDefault();
    if (!accessQuery.trim()) {
      mostrarAlerta('Ingresa Cédula/DNI o ID del socio', true);
      return;
    }

    setCheckingAccess(true);
    setAccessResult(null);
    try {
      const res = await checkClientAccess(accessQuery.trim());
      setAccessResult(res);
    } catch (err) {
      setAccessResult({
        access_granted: false,
        reason: 'Cliente no encontrado o error en el sistema'
      });
    } finally {
      setCheckingAccess(false);
    }
  };

  // Pausar o Reactivar acceso de una suscripción
  const handleToggleSubscriptionAccess = async (subId, currentAllowed) => {
    try {
      await updateSubscriptionStatus(subId, {
        access_allowed: !currentAllowed
      });
      await fetchSubscriptions();
    } catch (err) {
      // Manejado
    }
  };

  // Filtrado de socios para la lista de vencimientos
  const filteredClients = (clients || []).filter((client) => {
    // 1. Filtro de búsqueda por texto
    const q = clientSearchQuery.trim().toLowerCase();
    const nameMatch = (client.name || '').toLowerCase().includes(q);
    const docMatch = String(client.document_id || '').toLowerCase().includes(q);
    const idMatch = String(client.id || '').includes(q);
    if (q && !nameMatch && !docMatch && !idMatch) return false;

    // 2. Filtro por estado
    const daysLeft = client.daysRemaining;
    const isWarning = client.active && daysLeft !== null && daysLeft <= 5 && daysLeft >= 0;
    const isExpired = !client.active || (daysLeft !== null && daysLeft < 0);
    const isActive = client.active && (daysLeft === null || daysLeft > 5);

    if (clientFilterStatus === 'ACTIVE') return isActive;
    if (clientFilterStatus === 'WARNING') return isWarning;
    if (clientFilterStatus === 'EXPIRED') return isExpired;

    return true;
  });

  // Socios filtrados para el modal de asignación
  const modalFilteredClients = (clients || []).filter((c) => {
    if (!assignSearchQuery.trim()) return true;
    const q = assignSearchQuery.toLowerCase().trim();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      String(c.document_id || '').toLowerCase().includes(q) ||
      String(c.id || '').includes(q)
    );
  });

  const selectedClientObj = (clients || []).find((c) => c.id.toString() === assignClientId.toString());
  const selectedPlanObj = plans.find((p) => p.id.toString() === assignPlanId.toString());

  return (
    <div className="space-y-6">
      {/* Header Principal con PageHeader universal */}
      <PageHeader
        title="Planes y Membresías STRONG GYM"
        subtitle="Administra tarifas, asigna vigencias a los socios y valida el acceso en recepción."
        badge="Suscripciones & Control de Acceso"
        badgeIcon={HiCreditCard}
        badgeColor="indigo"
        actions={
          <div className="bg-white/10 backdrop-blur-xs p-1 rounded-2xl border border-white/20 flex items-center gap-1 w-full md:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'plans'
                  ? 'bg-white text-slate-900 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HiCreditCard className="w-4 h-4" />
              <span>Tarifario ({plans.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-white text-slate-900 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HiUserGroup className="w-4 h-4" />
              <span>Vencimientos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('access')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'access'
                  ? 'bg-white text-slate-900 shadow-sm font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HiQrcode className="w-4 h-4" />
              <span>Torniquete</span>
            </button>
          </div>
        }
      />

      {/* ================= TAB 1: CATÁLOGO DE PLANES Y PRECIOS ================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Barra de Acciones */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-black text-slate-900">Planes Activos en el Gimnasio</h3>
              <p className="text-xs text-slate-500">
                Planes que los socios pueden contratar para acceder a STRONG GYM.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <HiUserGroup className="w-4 h-4" />
                <span>Asignar Plan a Socio</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setIsCreatePlanOpen(true)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>Crear Nuevo Plan</span>
                </button>
              )}
            </div>
          </div>

          {/* Grid de Planes */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-xs">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs font-bold text-slate-500">Cargando planes de membresía...</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-3">
                💳
              </div>
              <h4 className="text-base font-black text-slate-900">No hay planes creados</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {isAdmin
                  ? 'Haz clic en "Crear Nuevo Plan" para definir tus primeras tarifas (ej. Día, Mes, Trimestre).'
                  : 'El administrador aún no ha configurado planes de membresía en el sistema.'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsCreatePlanOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>Crear Primer Plan</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
                >
                  {/* Badge promocional */}
                  {plan.badge && (
                    <span className="absolute top-5 right-5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                      ★ {plan.badge}
                    </span>
                  )}

                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                      Vigencia {plan.durationDays} {plan.durationDays === 1 ? 'día' : 'días'}
                    </span>
                    <h4 className="text-xl font-black text-slate-900 mt-0.5">{plan.name}</h4>

                    <div className="my-4 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        ${plan.price?.toLocaleString('es-CO')}
                      </span>
                      <span className="text-xs font-bold text-slate-400">COP</span>
                    </div>

                    {/* Beneficios */}
                    <div className="space-y-2 py-3 border-t border-slate-100 text-xs text-slate-600">
                      {(plan.features || []).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <HiCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones de la tarjeta */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => {
                        setAssignPlanId(plan.id.toString());
                        setIsAssignModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      Asignar a Socio
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setDeletePlanConfirm({ isOpen: true, planId: plan.id, planName: plan.name })}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar este plan"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: CONTROL DE SOCIOS Y VENCIMIENTOS ================= */}
      {activeTab === 'clients' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">Estado de Membresías de Socios</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisa quién está al día, quién está próximo a vencer (≤ 5 días) y quién requiere renovación.
              </p>
            </div>

            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm w-full md:w-auto justify-center"
            >
              <HiPlus className="w-4 h-4" />
              <span>Asignar / Renovar Membresía</span>
            </button>
          </div>

          {/* Filtros y Buscador */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1 relative">
              <HiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar socio por nombre, cédula/DNI o ID..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'ACTIVE', label: 'Activos' },
                { id: 'WARNING', label: '⚠️ Por Vencer' },
                { id: 'EXPIRED', label: '🔴 Vencidos' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setClientFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    clientFilterStatus === f.id
                      ? 'bg-white text-slate-900 shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Socios */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Socio</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Plan Asignado</th>
                  <th className="py-3 px-4">Fecha Vencimiento</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No se encontraron socios que coincidan con la búsqueda o filtro.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const daysLeft = client.daysRemaining;
                    const hasExpiration = Boolean(client.expirationDate);
                    const isWarning = client.active && daysLeft !== null && daysLeft <= 5 && daysLeft >= 0;
                    const isExpired = !client.active || (daysLeft !== null && daysLeft < 0);

                    return (
                      <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-black text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar name={client.name} role="client" size="xs" />
                            <span>{client.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {client.document_id || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-indigo-700">
                          {client.planName || 'Sin Plan Activo'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {hasExpiration ? (
                            <div>
                              <span>{client.expirationDate}</span>
                              {daysLeft !== null && (
                                <span className="block text-[10px] text-slate-400">
                                  {daysLeft > 0
                                    ? `(Quedan ${daysLeft} días)`
                                    : daysLeft === 0
                                    ? '(¡Vence hoy!)'
                                    : `(Venció hace ${Math.abs(daysLeft)} días)`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No registrada</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isWarning ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                              ⚠️ Vence en {daysLeft} días
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                              ✕ Vencida / Inactiva
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Vigente
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenAssignForClient(client.id.toString())}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Renovar / Asignar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TORNIQUETE / VALIDADOR DE ACCESO ================= */}
      {activeTab === 'access' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Formulario de Búsqueda de Acceso (5 cols) */}
          <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div>
              <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                Recepción & Control de Acceso
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                Validar Acceso de Socio
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa la cédula/DNI o el ID del socio para verificar si su membresía está vigente y autorizada.
              </p>
            </div>

            <form onSubmit={handleCheckAccess} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cédula / DNI o ID del Socio
                </label>
                <div className="relative">
                  <HiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ej. 1098765432 ó 5"
                    value={accessQuery}
                    onChange={(e) => setAccessQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={checkingAccess}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {checkingAccess ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <HiShieldCheck className="w-5 h-5" />
                    <span>Verificar Acceso</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resultado de Acceso Visual (7 cols) */}
          <div className="md:col-span-7">
            {!accessResult ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-3">
                  🔍
                </div>
                <h4 className="text-base font-black text-slate-900">Listo para verificar acceso</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Escribe la identificación del socio en el formulario de la izquierda para obtener la respuesta visual del torniquete.
                </p>
              </div>
            ) : accessResult.access_granted ? (
              /* ACCESO AUTORIZADO (VERDE) */
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center text-3xl font-black shadow-md shadow-emerald-200">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                      ¡ACCESO AUTORIZADO!
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                      {accessResult.client?.name}
                    </h3>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      Cédula / DNI: {accessResult.client?.document_id} • ID #{accessResult.client?.id}
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 p-5 rounded-2xl border border-emerald-200 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">Plan Activo:</span>
                    <strong className="text-slate-900 text-sm">
                      {accessResult.subscription?.plan?.name || 'Plan Activo'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Válido hasta:</span>
                    <strong className="text-emerald-700 text-sm">
                      {accessResult.subscription?.end_date}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              /* ACCESO DENEGADO (ROJO) */
              <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-8 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-rose-600 text-white flex items-center justify-center text-3xl font-black shadow-md shadow-rose-200">
                    ✕
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-rose-800 tracking-wider">
                      ACCESO DENEGADO
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                      {accessResult.client ? accessResult.client.name : 'No autorizado'}
                    </h3>
                    <p className="text-xs text-rose-700 font-semibold mt-0.5">
                      Motivo: {accessResult.reason}
                    </p>
                  </div>
                </div>

                {accessResult.client && (
                  <button
                    onClick={() => handleOpenAssignForClient(accessResult.client.id.toString())}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Renovar Membresía Ahora
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREAR PLAN (SOLO ADMIN) ================= */}
      <Modal
        isOpen={isCreatePlanOpen}
        onClose={() => setIsCreatePlanOpen(false)}
        maxWidth="lg"
        title="Crear Nuevo Plan de Membresía"
        subtitle="Configura nombre, precio en COP, duración en días y beneficios incluidos."
        badge="Administración de Tarifas"
        badgeColor="indigo"
      >
        <form onSubmit={handleCreatePlanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Plan *
            </label>
            <input
              type="text"
              placeholder="ej. Mensualidad Estándar, Trimestre Gold, Día Libre..."
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Precio (COP) *
              </label>
              <input
                type="number"
                placeholder="80000"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Duración (Días) *
              </label>
              <input
                type="number"
                placeholder="30"
                value={planDays}
                onChange={(e) => setPlanDays(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Badge Promocional (Opcional)
            </label>
            <input
              type="text"
              placeholder="ej. Más Popular, Recomendado, Promo Estudiantes..."
              value={planBadge}
              onChange={(e) => setPlanBadge(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          {/* Beneficios */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Beneficios Incluidos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="ej. Acceso a zona húmeda..."
                value={newBenefitInput}
                onChange={(e) => setNewBenefitInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Agregar
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {planBenefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="text-slate-700">✓ {b}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatePlanOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={savingPlan}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {savingPlan ? 'Guardando...' : 'Crear Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: ASIGNAR MEMBRESÍA A SOCIO ================= */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        maxWidth="lg"
        title="Asignar Plan a Socio"
        subtitle="Selecciona al socio y el plan de membresía a activar en el sistema."
        badge="Venta / Asignación en Recepción"
        badgeColor="purple"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              1. Seleccionar Socio *
            </label>
            <input
              type="text"
              placeholder="Filtrar socio por nombre o cédula..."
              value={assignSearchQuery}
              onChange={(e) => setAssignSearchQuery(e.target.value)}
              className="w-full px-3 py-2 mb-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600"
            />

            <select
              value={assignClientId}
              onChange={(e) => setAssignClientId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600"
            >
              <option value="">-- Elige un socio ({modalFilteredClients.length} disponibles) --</option>
              {modalFilteredClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (CC: {c.document_id || 'N/A'}) - ID #{c.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              2. Plan de Membresía *
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {plans.map((p) => {
                const isSelected = assignPlanId === p.id.toString();
                return (
                  <div
                    key={p.id}
                    onClick={() => setAssignPlanId(p.id.toString())}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <p className="text-xs font-black truncate">{p.name}</p>
                    <p
                      className={`text-sm font-black mt-1 ${
                        isSelected ? 'text-white' : 'text-emerald-600'
                      }`}
                    >
                      ${p.price?.toLocaleString('es-CO')}
                    </p>
                    <p
                      className={`text-[10px] font-bold ${
                        isSelected ? 'text-purple-100' : 'text-slate-400'
                      }`}
                    >
                      {p.durationDays} días
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              3. Fecha de Inicio
            </label>
            <input
              type="date"
              value={assignStartDate}
              onChange={(e) => setAssignStartDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600"
            />
          </div>

          {selectedClientObj && selectedPlanObj && (
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900">
              <p className="font-bold">Resumen de Asignación:</p>
              <p className="mt-0.5">
                Se activará el plan <strong>{selectedPlanObj.name}</strong> (${selectedPlanObj.price?.toLocaleString()} COP) a <strong>{selectedClientObj.name}</strong> por <strong>{selectedPlanObj.durationDays} días</strong>.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={assigning || !assignClientId || !assignPlanId}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {assigning ? 'Asignando...' : 'Confirmar y Activar Membresía'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= CONFIRM MODAL: ELIMINAR PLAN ================= */}
      <ConfirmModal
        isOpen={deletePlanConfirm.isOpen}
        onClose={() => setDeletePlanConfirm({ isOpen: false, planId: null, planName: '' })}
        onConfirm={handleDeletePlanConfirmed}
        title="¿Eliminar plan de membresía?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${deletePlanConfirm.planName}" del catálogo de tarifas?`}
        confirmText="Eliminar"
        type="danger"
        loading={deletingPlan}
      />
    </div>
  );
};

export default Membresias;
