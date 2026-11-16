import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import { useNavigate } from 'react-router-dom';
import clienteAxios from '../config/clienteAxios';
import {
  PageHeader,
  SearchFilterBar,
  ConfirmModal,
  EmptyState,
  LoadingState,
  StatusBadge,
  UserAvatar
} from '../components';
import {
  HiUserGroup,
  HiClipboardList,
  HiHeart,
  HiShieldCheck,
  HiCreditCard
} from 'react-icons/hi';

const Socios = () => {
  const { clients, loading, isWorker, isAdmin, fetchClients } = useAuth();
  const { mostrarAlerta } = useAlerta();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'

  // Confirm modal para activar / desactivar socio
  const [confirmToggle, setConfirmToggle] = useState({
    isOpen: false,
    clientId: null,
    clientName: '',
    currentStatus: true
  });
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Si es Trabajador/Entrenador: SOLO puede ver socios con membresía activa
  const eligibleClients = (clients || []).filter((c) => {
    if (isWorker) {
      return c.active !== false;
    }
    return true;
  });

  const filteredClients = eligibleClients.filter((c) => {
    if (!isWorker) {
      if (filterStatus === 'active' && !c.active) return false;
      if (filterStatus === 'inactive' && c.active) return false;
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const name = (c.name || c.full_name || '').toLowerCase();
    const doc = (c.document_id || '').toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();

    return name.includes(q) || doc.includes(q) || email.includes(q) || phone.includes(q);
  });

  const handleToggleActiveSubmit = async () => {
    if (!isAdmin || !confirmToggle.clientId) return;
    setToggling(true);
    try {
      const newStatus = !confirmToggle.currentStatus;
      await clienteAxios.put(`/users/${confirmToggle.clientId}`, { is_active: newStatus });
      mostrarAlerta(`Socio ${newStatus ? 'activado' : 'desactivado'} con éxito`, false);
      setConfirmToggle({ isOpen: false, clientId: null, clientName: '', currentStatus: true });
      await fetchClients();
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al cambiar estado del socio';
      mostrarAlerta(msg, true);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header con componente universal */}
      <PageHeader
        title="Gestión de Socios STRONG GYM"
        subtitle={
          isWorker
            ? 'Vista de Entrenador: Acceso a socios activos para prescripción de rutinas y fichas antropométricas.'
            : 'Administra cuentas, membresías activas y expedientes de todos los socios del gimnasio.'
        }
        badge={isWorker ? 'Padrón de Alumnos Activos' : 'Directorio General'}
        badgeIcon={HiUserGroup}
        badgeColor={isWorker ? 'emerald' : 'indigo'}
      />

      {/* Banner Informativo si es Entrenador */}
      {isWorker && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-950 shadow-xs">
          <HiShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Filtro de seguridad:</strong> Como entrenador, tienes acceso exclusivo a los socios activos con derecho a entrenamiento y toma de medidas antropométricas.
          </span>
        </div>
      )}

      {/* 2. Barra de Búsqueda y Filtros con SearchFilterBar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre, documento o teléfono..."
        extraControls={
          isAdmin && (
            <div className="flex gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todos ({clients?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Activos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('inactive')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'inactive'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Inactivos
              </button>
            </div>
          )
        }
      />

      {/* 3. Tabla de Socios */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <LoadingState message="Cargando padrón de socios..." color="indigo" />
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No se encontraron socios"
            description="No hay socios que coincidan con la búsqueda o el filtro seleccionado."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4">Socio</th>
                  <th className="px-5 py-4">DNI / Documento</th>
                  <th className="px-5 py-4">Teléfono</th>
                  <th className="px-5 py-4">Membresía</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones de Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((c) => {
                  const isActive = c.active !== false;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Socio Avatar + Nombre */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={c.name || c.full_name}
                            role="client"
                            size="md"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{c.name || c.full_name}</div>
                            <div className="text-[11px] text-slate-400">{c.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600">
                        {c.document_id || 'Sin documento'}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        {c.phone || 'Sin registrar'}
                      </td>

                      {/* Membresía info */}
                      <td className="px-5 py-4 text-xs">
                        <div>
                          <span className="font-bold text-slate-800">
                            {c.subscription?.plan?.name || (isActive ? 'Plan Activo' : 'Sin Plan')}
                          </span>
                          {c.expiration_date && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Vence: {c.expiration_date}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Estado con StatusBadge */}
                      <td className="px-5 py-4 text-xs">
                        <StatusBadge status={isActive ? 'ACTIVE' : 'inactivo'} />
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botón Membresía / Renovar */}
                          <button
                            type="button"
                            onClick={() => navigate(`/membresias?clientId=${c.id}&tab=clients`)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Asignar o renovar membresía"
                          >
                            <HiCreditCard className="w-3.5 h-3.5" />
                            <span>Membresía</span>
                          </button>

                          {/* Botón Asignar Rutina */}
                          <button
                            type="button"
                            onClick={() => navigate(`/rutinas?clientId=${c.id}&tab=view`)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Ver o editar rutina"
                          >
                            <HiClipboardList className="w-3.5 h-3.5" />
                            <span>Rutina</span>
                          </button>

                          {/* Botón Ficha Antropométrica */}
                          <button
                            type="button"
                            onClick={() => navigate(`/rutinas?clientId=${c.id}&tab=anthropometric`)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="Ver y registrar ficha médica y medidas"
                          >
                            <HiHeart className="w-3.5 h-3.5" />
                            <span>Ficha Antropométrica</span>
                          </button>

                          {/* Botón Activar / Desactivar (Solo Admin con ConfirmModal) */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmToggle({
                                  isOpen: true,
                                  clientId: c.id,
                                  clientName: c.name || c.full_name || 'el socio',
                                  currentStatus: isActive
                                })
                              }
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                                isActive
                                  ? 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isActive ? 'Desactivar' : 'Activar'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. ConfirmModal para Activar / Desactivar Socio */}
      <ConfirmModal
        isOpen={confirmToggle.isOpen}
        onClose={() => setConfirmToggle({ isOpen: false, clientId: null, clientName: '', currentStatus: true })}
        onConfirm={handleToggleActiveSubmit}
        title={confirmToggle.currentStatus ? '¿Desactivar acceso al socio?' : '¿Activar socio?'}
        message={
          confirmToggle.currentStatus
            ? `¿Deseas revocar el acceso a "${confirmToggle.clientName}"? No podrá ingresar al gimnasio ni registrar entrenamientos.`
            : `¿Deseas reactivar el acceso de "${confirmToggle.clientName}" en la plataforma?`
        }
        confirmText={confirmToggle.currentStatus ? 'Desactivar' : 'Activar'}
        type={confirmToggle.currentStatus ? 'danger' : 'success'}
        loading={toggling}
      />
    </div>
  );
};

export default Socios;
