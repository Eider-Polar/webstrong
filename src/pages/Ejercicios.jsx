import React, { useState, useEffect } from 'react';
import useRoutine from '../hooks/useRoutine';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import { uploadImageToCloudinary } from '../services/cloudinary';
import {
  Modal,
  ConfirmModal,
  PageHeader,
  EmptyState,
  LoadingState
} from '../components';
import {
  HiPlus,
  HiTrash,
  HiPencilAlt,
  HiSearch,
  HiLightningBolt,
  HiLockClosed,
  HiX,
  HiUpload,
  HiCheckCircle,
  HiEye,
  HiTag
} from 'react-icons/hi';

const Ejercicios = () => {
  const { isAdmin } = useAuth();
  const {
    exercises,
    muscleGroups,
    fetchExercises,
    fetchMuscleGroups,
    createExercise,
    updateExercise,
    deleteExercise,
    createMuscleGroup,
    loading
  } = useRoutine();
  const { mostrarAlerta } = useAlerta();

  // Filtros
  const [selectedMuscleGroupId, setSelectedMuscleGroupId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedDetailExercise, setSelectedDetailExercise] = useState(null);

  // Form Crear / Editar Ejercicio (1 Solo Modal unificado)
  const [editingId, setEditingId] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseGroupId, setExerciseGroupId] = useState('');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [exerciseImageUrl, setExerciseImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Nuevo Grupo Muscular
  const [newGroupName, setNewGroupName] = useState('');
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // Confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '' });
  const [deletingExercise, setDeletingExercise] = useState(false);

  useEffect(() => {
    fetchExercises();
    fetchMuscleGroups();
  }, [fetchExercises, fetchMuscleGroups]);

  // Subir imagen a Cloudinary
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarAlerta('Por favor selecciona un archivo de imagen válido', true);
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImageToCloudinary(file, 'exercises');
      if (uploadedUrl) {
        setExerciseImageUrl(uploadedUrl);
        mostrarAlerta('Imagen subida exitosamente a Cloudinary', false);
      }
    } catch (err) {
      mostrarAlerta(err.message || 'Error al subir imagen a Cloudinary', true);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setExerciseName('');
    setExerciseGroupId(muscleGroups[0]?.id ? muscleGroups[0].id.toString() : '');
    setExerciseDescription('');
    setExerciseImageUrl('');
    setIsExerciseModalOpen(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (ex) => {
    setEditingId(ex.id);
    setExerciseName(ex.name || '');
    setExerciseGroupId((ex.muscle_group_id || ex.muscleGroup?.id || '').toString());
    setExerciseDescription(ex.description || '');
    setExerciseImageUrl(ex.image_url || '');
    setIsExerciseModalOpen(true);
  };

  // Guardar Ejercicio (Crear o Editar en BD)
  const handleExerciseSubmit = async (e) => {
    e.preventDefault();
    if (!exerciseName.trim()) {
      mostrarAlerta('Ingresa el nombre del ejercicio', true);
      return;
    }
    if (!exerciseGroupId) {
      mostrarAlerta('Selecciona un grupo muscular de la base de datos', true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: exerciseName.trim(),
        muscle_group_id: parseInt(exerciseGroupId),
        description: exerciseDescription.trim() || null,
        image_url: exerciseImageUrl.trim() || null
      };

      if (editingId) {
        await updateExercise(editingId, payload);
      } else {
        await createExercise({ ...payload, is_custom: true });
      }

      setIsExerciseModalOpen(false);
      setEditingId(null);
      setExerciseName('');
      setExerciseDescription('');
      setExerciseImageUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar eliminación en BD
  const handleDeleteExerciseConfirmed = async () => {
    if (!deleteConfirm.id) return;
    setDeletingExercise(true);
    try {
      await deleteExercise(deleteConfirm.id);
      setDeleteConfirm({ isOpen: false, id: null, name: '' });
      if (selectedDetailExercise?.id === deleteConfirm.id) {
        setSelectedDetailExercise(null);
      }
    } catch (err) {
      // Error manejado en context
    } finally {
      setDeletingExercise(false);
    }
  };

  // Crear Nuevo Grupo Muscular en BD
  const handleCreateGroupSubmit = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      mostrarAlerta('Ingresa el nombre del grupo muscular', true);
      return;
    }

    setIsSubmittingGroup(true);
    try {
      const created = await createMuscleGroup(newGroupName.trim());
      if (created) {
        setNewGroupName('');
        setIsGroupModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // Filtrado reactivo de ejercicios
  const filteredExercises = exercises.filter((ex) => {
    if (selectedMuscleGroupId !== 'ALL') {
      const groupId = ex.muscle_group_id || ex.muscleGroup?.id;
      if (groupId?.toString() !== selectedMuscleGroupId.toString()) {
        return false;
      }
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const nameMatch = ex.name?.toLowerCase().includes(q);
    const groupMatch = (ex.muscleGroup?.name || ex.muscle_group || '').toLowerCase().includes(q);
    const descMatch = (ex.description || '').toLowerCase().includes(q);

    return nameMatch || groupMatch || descMatch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header con PageHeader */}
      <PageHeader
        title="Catálogo de Ejercicios STRONG GYM"
        subtitle="Gestiona los ejercicios y grupos musculares de la base de datos para la prescripción de rutinas."
        badge="Base de Datos Oficial"
        badgeIcon={HiLightningBolt}
        badgeColor="indigo"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <HiTag className="w-4 h-4 text-indigo-300" />
                  <span>+ Grupo Muscular</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>+ Nuevo Ejercicio</span>
                </button>
              </>
            ) : (
              <span className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <HiLockClosed className="w-4 h-4" />
                <span>Solo Administrador puede editar catálogo</span>
              </span>
            )}
          </div>
        }
      />

      {/* 2. Barra de Estadísticas y Filtros */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <HiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, técnica o grupo muscular..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <HiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              {exercises.length} en Base de Datos
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              {muscleGroups.length} Grupos Musculares
            </span>
          </div>
        </div>

        {/* Pestañas de Grupos Musculares */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => setSelectedMuscleGroupId('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedMuscleGroupId === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({exercises.length})
          </button>

          {muscleGroups.map((mg) => {
            const isSelected = selectedMuscleGroupId.toString() === mg.id.toString();
            const count = exercises.filter(
              (ex) => (ex.muscle_group_id || ex.muscleGroup?.id)?.toString() === mg.id.toString()
            ).length;

            return (
              <button
                key={mg.id}
                type="button"
                onClick={() => setSelectedMuscleGroupId(mg.id.toString())}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{mg.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Grid de Ejercicios */}
      {loading ? (
        <LoadingState message="Consultando ejercicios en base de datos..." color="indigo" />
      ) : filteredExercises.length === 0 ? (
        <EmptyState
          icon="🏋️‍♂️"
          title="No encontramos ejercicios en este grupo"
          description="Ajusta el filtro o agrega un nuevo ejercicio con el botón superior."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredExercises.map((ex) => {
            const groupName = ex.muscleGroup?.name || ex.muscle_group || 'General';

            return (
              <div
                key={ex.id}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    {ex.image_url ? (
                      <img
                        src={ex.image_url}
                        alt={ex.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50/50 text-indigo-400 text-4xl">
                        🏋️
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-xs text-indigo-700 shadow-sm border border-slate-100">
                        {groupName}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDetailExercise(ex)}
                        className="p-1.5 rounded-xl bg-white/90 text-slate-700 hover:text-indigo-600 hover:bg-white shadow-md transition-all cursor-pointer"
                        title="Ver detalles"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3
                      onClick={() => setSelectedDetailExercise(ex)}
                      className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {ex.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {ex.description || 'Ejercicio de acondicionamiento y fuerza muscular en STRONG GYM.'}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(ex)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <HiPencilAlt className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ isOpen: true, id: ex.id, name: ex.name })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Eliminar ejercicio de la base de datos"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal Unificado de Ejercicio (Crear / Editar con Modal reutilizable) */}
      <Modal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        maxWidth="lg"
        title={editingId ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio'}
        subtitle="Registra nombre, técnica y foto demostrativa en la base de datos de STRONG GYM."
        badge={editingId ? 'Modificar Ejercicio' : 'Catálogo de Ejercicios'}
        badgeColor="indigo"
      >
        <form onSubmit={handleExerciseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Ejercicio *
            </label>
            <input
              type="text"
              placeholder="Ej. Press de Banca Plano con Mancuernas"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Grupo Muscular (Base de Datos) *
            </label>
            <select
              value={exerciseGroupId}
              onChange={(e) => setExerciseGroupId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 cursor-pointer"
            >
              <option value="">-- Elige un Grupo Muscular --</option>
              {muscleGroups.map((mg) => (
                <option key={mg.id} value={mg.id}>
                  {mg.name} (ID: {mg.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Foto / Demostración del Ejercicio
            </label>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 text-xs font-bold cursor-pointer transition-colors">
                  <HiUpload className="w-4 h-4" />
                  <span>{isUploadingImage ? 'Subiendo a Cloudinary...' : 'Subir archivo de imagen'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="url"
                placeholder="O pega una URL directa (https://...)"
                value={exerciseImageUrl}
                onChange={(e) => setExerciseImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
              />

              {exerciseImageUrl && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 mt-2">
                  <img src={exerciseImageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setExerciseImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900"
                  >
                    <HiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Indicaciones Técnicas o Postura (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Instrucciones para la ejecución correcta del ejercicio..."
              value={exerciseDescription}
              onChange={(e) => setExerciseDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExerciseModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <HiCheckCircle className="w-4 h-4" />
                  <span>{editingId ? 'Guardar Cambios' : 'Guardar Ejercicio'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Modal Grupo Muscular con Modal reutilizable */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        maxWidth="sm"
        title="Nuevo Grupo Muscular"
        subtitle="Registra una nueva categoría anatómica en PostgreSQL."
        badge="Clasificación"
        badgeColor="indigo"
      >
        <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Grupo *
            </label>
            <input
              type="text"
              placeholder="Ej. Antebrazos, Core, Pantorrillas..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGroupModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmittingGroup}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isSubmittingGroup ? 'Guardando...' : 'Guardar en BD'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Modal Detalle de Ejercicio con Modal reutilizable */}
      <Modal
        isOpen={Boolean(selectedDetailExercise)}
        onClose={() => setSelectedDetailExercise(null)}
        maxWidth="md"
      >
        {selectedDetailExercise && (
          <div>
            {selectedDetailExercise.image_url ? (
              <img
                src={selectedDetailExercise.image_url}
                alt={selectedDetailExercise.name}
                className="w-full h-56 object-cover rounded-2xl mb-4 border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-full h-44 rounded-2xl mb-4 bg-indigo-50 text-indigo-600 flex items-center justify-center text-5xl border border-indigo-100">
                🏋️
              </div>
            )}

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {selectedDetailExercise.muscleGroup?.name || selectedDetailExercise.muscle_group || 'General'}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {selectedDetailExercise.name}
              </h3>
            </div>

            {selectedDetailExercise.description ? (
              <p className="text-xs text-slate-600 mt-4 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedDetailExercise.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic mt-3">
                Sin técnica o descripción registrada para este ejercicio.
              </p>
            )}

            <div className="flex gap-2 mt-6">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedDetailExercise;
                    setSelectedDetailExercise(null);
                    handleOpenEditModal(target);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HiPencilAlt className="w-4 h-4" />
                  <span>Editar Ejercicio</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedDetailExercise(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 7. ConfirmModal para Eliminar Ejercicio */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDeleteExerciseConfirmed}
        title="¿Eliminar ejercicio?"
        message={`¿Estás seguro de que deseas eliminar permanentemente el ejercicio "${deleteConfirm.name}" de la base de datos?`}
        confirmText="Eliminar"
        type="danger"
        loading={deletingExercise}
      />
    </div>
  );
};

export default Ejercicios;
