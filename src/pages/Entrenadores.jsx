import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import {
  PageHeader,
  SearchFilterBar,
  ConfirmModal,
  Modal,
  EmptyState,
  LoadingState,
  StatusBadge,
  UserAvatar
} from '../components';
import {
  HiUsers,
  HiUserAdd,
  HiPencilAlt,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiMail,
  HiPhone,
  HiIdentification,
  HiShieldCheck,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiRefresh
} from 'react-icons/hi';

const Entrenadores = () => {
  const {
    workers,
    fetchWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
    toggleWorkerStatus,
    isAdmin,
    loading: authLoading
  } = useAuth();
  const { mostrarAlerta } = useAlerta();

  // Estados de búsqueda y filtrado
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'
  const [loading, setLoading] = useState(false);

  // Modal Crear Empleado
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    full_name: '',
    document_id: '',
    email: '',
    phone: '',
    password: '',
    role: 'WORKER'
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Modal Editar Empleado
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    document_id: '',
    email: '',
    phone: '',
    password: '',
    role: 'WORKER',
    is_active: true
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Confirmación Eliminar
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    workerId: null,
    workerName: ''
  });
  const [deleting, setDeleting] = useState(false);

  // Confirmación Alternar Estado
  const [toggleConfirm, setToggleConfirm] = useState({
    isOpen: false,
    workerId: null,
    workerName: '',
    currentStatus: true
  });
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchWorkers();
      setLoading(false);
    };
    load();
  }, [fetchWorkers]);

  // Filtrado de trabajadores
  const filteredWorkers = (workers || []).filter((w) => {
    // Filtro por estado
    const isActive = w.active !== false && w.is_active !== false;
    if (filterStatus === 'active' && !isActive) return false;
    if (filterStatus === 'inactive' && isActive) return false;

    // Filtro por búsqueda
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const name = (w.full_name || w.name || '').toLowerCase();
    const doc = (w.document_id || '').toLowerCase();
    const email = (w.email || '').toLowerCase();
    const phone = (w.phone || '').toLowerCase();

    return name.includes(q) || doc.includes(q) || email.includes(q) || phone.includes(q);
  });

  // Métricas
  const totalWorkers = workers?.length || 0;
  const activeWorkers = (workers || []).filter((w) => w.active !== false && w.is_active !== false).length;
  const inactiveWorkers = totalWorkers - activeWorkers;

  // Handlers para Crear
  const handleOpenCreateModal = () => {
    setCreateForm({
      full_name: '',
      document_id: '',
      email: '',
      phone: '',
      password: '',
      role: 'WORKER'
    });
    setShowCreatePassword(false);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.full_name.trim() || !createForm.document_id.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      mostrarAlerta('Por favor completa todos los campos requeridos (*)', true);
      return;
    }

    if (createForm.password.length < 4) {
      mostrarAlerta('La contraseña debe tener al menos 4 caracteres', true);
      return;
    }

    setSubmittingCreate(true);
    try {
      await createWorker(createForm);
      setIsCreateModalOpen(false);
    } catch (err) {
      // El mensaje ya es mostrado por createWorker
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Handlers para Editar
  const handleOpenEditModal = (worker) => {
    setEditingWorkerId(worker.id);
    setEditForm({
      full_name: worker.full_name || worker.name || '',
      document_id: worker.document_id || '',
      email: worker.email || '',
      phone: worker.phone || '',
      password: '',
      role: worker.role || 'WORKER',
      is_active: worker.active !== false && worker.is_active !== false
    });
    setShowEditPassword(false);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.full_name.trim() || !editForm.document_id.trim() || !editForm.email.trim()) {
      mostrarAlerta('Nombre, documento y correo son obligatorios', true);
      return;
    }

    if (editForm.password && editForm.password.length < 4) {
      mostrarAlerta('Si vas a cambiar la contraseña, debe tener al menos 4 caracteres', true);
      return;
    }

    setSubmittingEdit(true);
    try {
      await updateWorker(editingWorkerId, editForm);
      setIsEditModalOpen(false);
    } catch (err) {
      // El mensaje ya es emitido por updateWorker
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Handlers para Eliminar
  const handleDeleteClick = (worker) => {
    setDeleteConfirm({
      isOpen: true,
      workerId: worker.id,
      workerName: worker.full_name || worker.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.workerId) return;
    setDeleting(true);
    try {
      await deleteWorker(deleteConfirm.workerId);
      setDeleteConfirm({ isOpen: false, workerId: null, workerName: '' });
    } catch (err) {
      // Error manejado en deleteWorker
    } finally {
      setDeleting(false);
    }
  };

  // Handlers para Cambiar Estado Activo/Inactivo
  const handleToggleClick = (worker) => {
    const isCurrentlyActive = worker.active !== false && worker.is_active !== false;
    setToggleConfirm({
      isOpen: true,
      workerId: worker.id,
      workerName: worker.full_name || worker.name,
      currentStatus: isCurrentlyActive
    });
  };

  const handleToggleConfirm = async () => {
    if (!toggleConfirm.workerId) return;
    setToggling(true);
    try {
      await toggleWorkerStatus(toggleConfirm.workerId, toggleConfirm.currentStatus);
      setToggleConfirm({ isOpen: false, workerId: null, workerName: '', currentStatus: true });
    } catch (err) {
      // Error mostrado
    } finally {
      setToggling(false);
    }
  };

  if (!isAdmin) {
    return (
      <EmptyState
        title="Acceso Restringido"
        message="Solo el Administrador Principal del gimnasio tiene autorización para gestionar el equipo de trabajo y trabajadores."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Principal */}
      <PageHeader
        title="Gestión de Trabajadores y Entrenadores"
        subtitle="Administra el equipo de trabajo de STRONG GYM: crea cuentas para entrenadores, edita sus datos y gestiona sus accesos."
        badge="Administración de Personal"
        badgeIcon={HiUsers}
        badgeColor="indigo"
        actions={
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <HiUserAdd className="w-5 h-5" />
            <span>+ Registrar Nuevo Trabajador</span>
          </button>
        }
      />

      {/* 2. Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Total Empleados
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalWorkers}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Registrados en el sistema</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
            👥
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              Personal Activo
            </p>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{activeWorkers}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Con acceso habilitado</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Personal Inactivo
            </p>
            <h3 className="text-2xl font-black text-slate-700 mt-1">{inactiveWorkers}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Acceso suspendido</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center text-xl font-bold">
            ⏸️
          </div>
        </div>
      </div>

      {/* 3. Barra de Búsqueda y Filtros */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar trabajador por nombre, cédula, correo o teléfono..."
        extraControls={
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
              Todos ({totalWorkers})
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
              Activos ({activeWorkers})
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
              Inactivos ({inactiveWorkers})
            </button>
          </div>
        }
      />

      {/* 4. Tabla de Empleados / Entrenadores */}
      {loading ? (
        <LoadingState message="Cargando directorio de trabajadores..." />
      ) : filteredWorkers.length === 0 ? (
        <EmptyState
          title="No se encontraron trabajadores"
          message={
            searchQuery || filterStatus !== 'all'
              ? 'No hay registros que coincidan con los filtros aplicados. Intenta cambiar los términos de búsqueda.'
              : 'Aún no has registrado ningún trabajador en el sistema. Haz clic en el botón superior para agregar el primero.'
          }
          action={
            searchQuery || filterStatus !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Limpiar Filtros
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                + Registrar Primer Trabajador
              </button>
            )
          }
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-4 px-6">Trabajador / Entrenador</th>
                  <th className="py-4 px-6">Documento</th>
                  <th className="py-4 px-6">Contacto (Email / Tel)</th>
                  <th className="py-4 px-6">Rol</th>
                  <th className="py-4 px-6 text-center">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredWorkers.map((w) => {
                  const isActive = w.active !== false && w.is_active !== false;

                  return (
                    <tr
                      key={w.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Nombre y Avatar */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={w.full_name || w.name}
                            role="worker"
                            size="md"
                          />
                          <div>
                            <span className="font-black text-slate-900 block group-hover:text-indigo-600 transition-colors">
                              {w.full_name || w.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              ID Sistema: #{w.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Documento de Identidad */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px]">
                          {w.document_id || 'Sin doc'}
                        </span>
                      </td>

                      {/* Correo y Teléfono */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <HiMail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{w.email}</span>
                          </div>
                          {w.phone && (
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                              <HiPhone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{w.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80">
                          <HiShieldCheck className="w-3.5 h-3.5" />
                          <span>Entrenador / Staff</span>
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleClick(w)}
                          title={isActive ? 'Clic para suspender acceso' : 'Clic para habilitar acceso'}
                          className="cursor-pointer inline-block"
                        >
                          <StatusBadge
                            status={isActive ? 'ACTIVE' : 'INACTIVE'}
                            customLabel={isActive ? 'Activo' : 'Inactivo'}
                          />
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Editar */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(w)}
                            className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer shadow-2xs"
                            title="Editar datos del trabajador"
                          >
                            <HiPencilAlt className="w-4 h-4" />
                          </button>

                          {/* Botón Activar / Desactivar */}
                          <button
                            type="button"
                            onClick={() => handleToggleClick(w)}
                            className={`p-2 rounded-xl border border-transparent transition-all cursor-pointer shadow-2xs ${
                              isActive
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                            }`}
                            title={isActive ? 'Suspender acceso' : 'Habilitar acceso'}
                          >
                            {isActive ? (
                              <HiXCircle className="w-4 h-4" />
                            ) : (
                              <HiCheckCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Botón Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(w)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer shadow-2xs"
                            title="Eliminar trabajador del sistema"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTRAR NUEVO TRABAJADOR ================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Nuevo Trabajador / Entrenador"
        subtitle="Ingresa la información básica para dar de alta una cuenta de empleado en el gimnasio."
        badge="Alta de Personal"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={createForm.full_name}
              onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
            />
          </div>

          {/* Cédula y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Documento de Identidad (Cédula) *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1098765432"
                value={createForm.document_id}
                onChange={(e) => setCreateForm({ ...createForm, document_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono Celular
              </label>
              <input
                type="tel"
                placeholder="Ej. 300 123 4567"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo Electrónico (Login) *
            </label>
            <input
              type="email"
              required
              placeholder="entrenador@strongym.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
            />
          </div>

          {/* Contraseña Inicial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contraseña de Acceso *
            </label>
            <div className="relative">
              <input
                type={showCreatePassword ? 'text' : 'password'}
                required
                placeholder="Mínimo 4 caracteres"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCreatePassword(!showCreatePassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCreatePassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              El trabajador usará este correo y contraseña para ingresar a STRONG GYM.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              disabled={submittingCreate}
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submittingCreate}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-100 cursor-pointer transition-all flex items-center gap-1.5"
            >
              {submittingCreate ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-4 h-4" />
                  <span>Guardar Trabajador</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: EDITAR TRABAJADOR ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Datos del Trabajador"
        subtitle="Actualiza la información personal, datos de contacto o clave de acceso del empleado."
        badge="Edición de Personal"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={editForm.full_name}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
            />
          </div>

          {/* Cédula y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Documento de Identidad (Cédula) *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. 1098765432"
                value={editForm.document_id}
                onChange={(e) => setEditForm({ ...editForm, document_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teléfono Celular
              </label>
              <input
                type="tel"
                placeholder="Ej. 300 123 4567"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              placeholder="entrenador@strongym.com"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs"
            />
          </div>

          {/* Contraseña Nueva (Opcional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nueva Contraseña <span className="font-normal text-slate-400">(Opcional, dejar vacía si no se desea cambiar)</span>
            </label>
            <div className="relative">
              <input
                type={showEditPassword ? 'text' : 'password'}
                placeholder="Solo si deseas cambiar su contraseña"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs pr-10"
              />
              <button
                type="button"
                onClick={() => setShowEditPassword(!showEditPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showEditPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Estado Activo / Inactivo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Estado de Acceso en el Gimnasio
            </label>
            <select
              value={editForm.is_active ? 'ACTIVE' : 'INACTIVE'}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'ACTIVE' })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600 shadow-2xs cursor-pointer"
            >
              <option value="ACTIVE">Activo (Acceso Habilitado)</option>
              <option value="INACTIVE">Inactivo (Acceso Suspendido)</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              disabled={submittingEdit}
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submittingEdit}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-100 cursor-pointer transition-all flex items-center gap-1.5"
            >
              {submittingEdit ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-4 h-4" />
                  <span>Actualizar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: CONFIRMAR ELIMINACIÓN ================= */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, workerId: null, workerName: '' })}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este trabajador?"
        message={`Estás a punto de eliminar a "${deleteConfirm.workerName}" del sistema STRONG GYM. Si tiene ventas o registros históricos asociados, se suspenderá su acceso de manera segura para conservar la trazabilidad.`}
        confirmText="Sí, Eliminar Trabajador"
        cancelText="Cancelar"
        type="danger"
        isLoading={deleting}
      />

      {/* ================= MODAL: CONFIRMAR CAMBIO DE ESTADO ================= */}
      <ConfirmModal
        isOpen={toggleConfirm.isOpen}
        onClose={() => setToggleConfirm({ isOpen: false, workerId: null, workerName: '', currentStatus: true })}
        onConfirm={handleToggleConfirm}
        title={toggleConfirm.currentStatus ? '¿Suspender acceso al trabajador?' : '¿Habilitar acceso al trabajador?'}
        message={
          toggleConfirm.currentStatus
            ? `¿Deseas suspender el acceso de "${toggleConfirm.workerName}" al sistema? No podrá iniciar sesión hasta que sea reactivado.`
            : `¿Deseas activar nuevamente a "${toggleConfirm.workerName}" para que pueda iniciar sesión y gestionar rutinas en STRONG GYM?`
        }
        confirmText={toggleConfirm.currentStatus ? 'Suspender Acceso' : 'Activar Trabajador'}
        cancelText="Volver"
        type={toggleConfirm.currentStatus ? 'warning' : 'info'}
        isLoading={toggling}
      />
    </div>
  );
};

export default Entrenadores;
