import React, { useState, useEffect } from 'react';
import useRoutine from '../hooks/useRoutine';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { Modal, PageHeader } from '../components';
import {
  HiCheckCircle,
  HiOutlineCheckCircle,
  HiPrinter,
  HiCalendar,
  HiInformationCircle,
  HiSparkles,
  HiUser,
  HiX,
  HiArrowRight
} from 'react-icons/hi';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];



const MiRutina = () => {
  const { user, isAdmin, isWorker, clients, fetchClients } = useAuth();
  const {
    myRoutine,
    loading,
    fetchMyRoutine,
    fetchClientRoutine,
    toggleExerciseLog,
    dailyLogs,
    fetchDailyLogs
  } = useRoutine();

  // Para administradores y entrenadores que quieran previsualizar la rutina de un alumno
  const isStaff = isAdmin || isWorker;
  const [staffSelectedClientId, setStaffSelectedClientId] = useState('');
  const [staffClientRoutine, setStaffClientRoutine] = useState(null);
  const [loadingStaffRoutine, setLoadingStaffRoutine] = useState(false);

  // Detect today's day in Spanish
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const todayName = todayIndex >= 1 && todayIndex <= 6 ? DAYS[todayIndex - 1] : 'Lunes';

  const [activeDay, setActiveDay] = useState(todayName);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    if (isStaff) {
      fetchClients();
    } else {
      fetchMyRoutine();
      if (fetchDailyLogs) {
        fetchDailyLogs();
      }
    }
  }, [isStaff, fetchClients, fetchMyRoutine, fetchDailyLogs]);

  // Si el staff selecciona un socio específico para previsualizar
  useEffect(() => {
    if (!isStaff || !staffSelectedClientId) {
      setStaffClientRoutine(null);
      return;
    }

    const loadStaffSelected = async () => {
      setLoadingStaffRoutine(true);
      try {
        const r = await fetchClientRoutine(staffSelectedClientId);
        setStaffClientRoutine(r);
        if (fetchDailyLogs) {
          fetchDailyLogs(null, staffSelectedClientId);
        }
      } catch (err) {
        setStaffClientRoutine(null);
      } finally {
        setLoadingStaffRoutine(false);
      }
    };

    loadStaffSelected();
  }, [isStaff, staffSelectedClientId, fetchClientRoutine, fetchDailyLogs]);

  // Rutina a mostrar (si es staff y eligió socio, o la propia del alumno)
  const currentRoutine = isStaff ? staffClientRoutine : myRoutine;
  const isLoading = isStaff ? loadingStaffRoutine : loading;

  const routineForDay = currentRoutine && currentRoutine[activeDay] ? currentRoutine[activeDay] : null;
  const exercises = routineForDay?.exercises || [];
  const muscleGroups = routineForDay?.muscleGroups || 'Descanso';

  const staffSelectedClientObj = (clients || []).find(
    (c) => c.id.toString() === staffSelectedClientId.toString()
  );

  const displayedUser = isStaff
    ? staffSelectedClientObj
      ? { full_name: staffSelectedClientObj.name || staffSelectedClientObj.full_name }
      : null
    : user;

  const handlePrint = () => {
    window.print();
  };

  const handleToggleLog = async (ex) => {
    const isCompleted = dailyLogs && dailyLogs[ex.routine_day_exercise_id || ex.id];
    const targetClientId = isStaff ? staffSelectedClientId : null;
    await toggleExerciseLog(ex.routine_day_exercise_id || ex.id, !isCompleted, null, targetClientId);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Socio para Staff / Entrenadores */}
      {isStaff && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black">
              <HiUser className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                Modo Previsualización de Entrenador
              </span>
              <h4 className="text-sm font-black text-slate-900">
                Ver la rutina tal como la visualiza el socio
              </h4>
              <p className="text-xs text-slate-500">
                Selecciona cualquier alumno del gimnasio para consultar su rutina interactiva.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={staffSelectedClientId}
              onChange={(e) => setStaffSelectedClientId(e.target.value)}
              className="w-full sm:w-72 px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
            >
              <option value="">-- Elige un Socio --</option>
              {(clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.full_name} ({c.document_id || 'Sin doc'})
                </option>
              ))}
            </select>

            {staffSelectedClientId && (
              <Link
                to={`/rutinas?clientId=${staffSelectedClientId}&tab=designer`}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors whitespace-nowrap"
              >
                Editar
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        badge="Plan de Entrenamiento Personalizado"
        title={currentRoutine?.title || 'Mi Rutina Semanal'}
        subtitle={
          <span>
            Socio: <strong className="text-slate-800">{displayedUser?.full_name || displayedUser?.name || 'Socio'}</strong>
            {currentRoutine?.trainer?.full_name && (
              <span className="ml-2 font-medium text-indigo-600">
                • Entrenador: <strong className="font-bold">{currentRoutine.trainer.full_name}</strong>
              </span>
            )}
          </span>
        }
        actions={
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <HiPrinter className="w-4 h-4 text-slate-500" />
            <span>Imprimir Rutina</span>
          </button>
        }
      />

      {/* Days Selector */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto scrollbar-none">
        {DAYS.map((day) => {
          const isActive = activeDay === day;
          const isToday = todayName === day;
          const dayData = currentRoutine && currentRoutine[day];
          const count = dayData?.exercises?.length || 0;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 min-w-[105px] py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-100'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{day}</span>
                {isToday && (
                  <span
                    className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    Hoy
                  </span>
                )}
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : count > 0
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count > 0 ? `${count} ejerc.` : 'Descanso'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Muscle Group Badge */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-indigo-200">
            {activeDay.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enfoque del día
            </p>
            <h3 className="text-lg font-black text-slate-900">
              💪 {muscleGroups}
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-2xs">
          {exercises.length} {exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
      </div>

      {/* Exercises List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-500">Cargando ejercicios de tu rutina...</p>
        </div>
      ) : !currentRoutine ? (
        /* Caso: Sin rutina asignada en el sistema */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
            🏋️‍♂️
          </div>
          <h4 className="text-lg font-black text-slate-900">
            {isStaff
              ? 'Selecciona un socio arriba para ver su rutina'
              : '¡Aún no tienes una rutina activa asignada!'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
            {isStaff
              ? 'Elige a un alumno en el menú superior para inspeccionar sus ejercicios programados y checklist.'
              : 'Nuestro equipo de entrenadores está personalizando tu plan de entrenamiento. En breve podrás ver aquí tus ejercicios día a día y marcar tus series completadas.'}
          </p>

          {isStaff && staffSelectedClientId && (
            <Link
              to={`/rutinas?clientId=${staffSelectedClientId}&tab=designer`}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Diseñar rutina para este socio</span>
              <HiArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : exercises.length === 0 ? (
        /* Caso: Día de descanso */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-3">
            🧘‍♂️
          </div>
          <h4 className="text-base font-black text-slate-900">Día de Descanso o Recuperación</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            No tienes ejercicios programados para este día. Aprovecha para descansar, hidratarte o realizar actividad cardiovascular suave.
          </p>
        </div>
      ) : (
        /* Grid de Ejercicios del Día */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exercises.map((ex, idx) => {
            const isCompleted = !!(dailyLogs && dailyLogs[ex.routine_day_exercise_id || ex.id]);

            return (
              <div
                key={ex.id || idx}
                className={`bg-white border rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {ex.image ? (
                    <img
                      src={ex.image}
                      alt={ex.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedExercise(ex)}
                    />
                  ) : (
                    <div
                      onClick={() => setSelectedExercise(ex)}
                      className="w-20 h-20 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-2xl border border-slate-200 shrink-0 cursor-pointer hover:bg-slate-200 transition-colors"
                      title={ex.name}
                    >
                      <span>🏋️</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {ex.muscleGroup && (
                          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                            {ex.muscleGroup}
                          </span>
                        )}
                        <h4
                          onClick={() => setSelectedExercise(ex)}
                          className="text-base font-black text-slate-900 truncate cursor-pointer hover:text-indigo-600"
                        >
                          {ex.name}
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleLog(ex)}
                        className={`cursor-pointer transition-colors ${
                          isCompleted ? 'text-emerald-600' : 'text-slate-300 hover:text-indigo-600'
                        }`}
                        title={isCompleted ? 'Marcado como realizado' : 'Marcar como realizado'}
                      >
                        {isCompleted ? (
                          <HiCheckCircle className="w-7 h-7" />
                        ) : (
                          <HiOutlineCheckCircle className="w-7 h-7" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-100">
                        {ex.sets} Series × {ex.reps || ex.repsValue || '10-12'}
                      </span>
                      {ex.method && (
                        <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">
                          {ex.method}
                        </span>
                      )}
                    </div>

                    {ex.customNote && (
                      <p className="text-xs text-indigo-600 mt-2 font-medium bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/60">
                        ✍️ {ex.customNote}
                      </p>
                    )}
                  </div>
                </div>

                {ex.description && (
                  <p className="text-[11px] text-slate-400 mt-3 line-clamp-2">
                    {ex.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detalle de Ejercicio */}
      <Modal
        isOpen={Boolean(selectedExercise)}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name || 'Detalle del Ejercicio'}
        subtitle={selectedExercise?.muscleGroup || 'Técnica y parámetros de ejecución'}
        badge={selectedExercise?.muscleGroup}
        size="md"
      >
        {selectedExercise && (
          <div className="space-y-4">
            {selectedExercise.image ? (
              <img
                src={selectedExercise.image}
                alt={selectedExercise.name}
                className="w-full h-56 object-cover rounded-2xl border border-slate-200"
              />
            ) : (
              <div className="w-full h-44 rounded-2xl bg-slate-100 flex flex-col items-center justify-center gap-2 border border-slate-200 text-slate-400 font-bold text-xs">
                <span className="text-4xl">🏋️</span>
                <span className="text-[11px] text-slate-500">Sin imagen registrada</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black">
                {selectedExercise.sets} Series × {selectedExercise.reps || selectedExercise.repsValue}
              </span>
              {selectedExercise.method && (
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  {selectedExercise.method}
                </span>
              )}
            </div>

            {selectedExercise.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {selectedExercise.description}
              </p>
            )}

            {selectedExercise.customNote && (
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-800">
                ✍️ Indicación: {selectedExercise.customNote}
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedExercise(null)}
              className="w-full mt-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cerrar Detalle
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MiRutina;
