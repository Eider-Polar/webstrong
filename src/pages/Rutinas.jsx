import React, { useState, useEffect } from 'react';
import useRoutine from '../hooks/useRoutine';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import { useSearchParams } from 'react-router-dom';
import clienteAxios from '../config/clienteAxios';
import { Modal, PageHeader } from '../components';
import {
  HiUser,
  HiClipboardList,
  HiHeart,
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiCalendar,
  HiClock,
  HiArrowRight,
  HiPencilAlt,
  HiPrinter,
  HiEye,
  HiInformationCircle,
  HiSparkles,
  HiFilter,
  HiX,
  HiDocumentText,
  HiShieldCheck
} from 'react-icons/hi';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const SPANISH_TO_ENGLISH_DAYS = {
  Lunes: 'MONDAY',
  Martes: 'TUESDAY',
  'Miércoles': 'WEDNESDAY',
  Miercoles: 'WEDNESDAY',
  Jueves: 'THURSDAY',
  Viernes: 'FRIDAY',
  'Sábado': 'SATURDAY',
  Sabado: 'SATURDAY'
};

const Rutinas = () => {
  const [searchParams] = useSearchParams();
  const initialClientId = searchParams.get('clientId') || '';
  const initialTab = searchParams.get('tab') || 'view';

  const { clients, isWorker, isAdmin, fetchClients } = useAuth();
  const {
    exercises,
    muscleGroups,
    fetchExercises,
    fetchMuscleGroups,
    createWeeklyPlan,
    fetchClientRoutine
  } = useRoutine();
  const { mostrarAlerta } = useAlerta();

  // Tabs: 'view' (Ver Rutina Actual) | 'designer' (Diseñar / Editar - Solo Administrador) | 'anthropometric' (Ficha Antropométrica)
  const normalizedInitialTab =
    (initialTab === 'routine' || initialTab === 'designer') && !isAdmin
      ? 'view'
      : initialTab === 'routine'
      ? 'designer'
      : initialTab === 'isometrics'
      ? 'anthropometric'
      : initialTab;
  const [activeTab, setActiveTab] = useState(normalizedInitialTab);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [activeDay, setActiveDay] = useState('Lunes');

  // Subtab dentro de Ficha Antropométrica: 'measurements' (Medidas Corporales) | 'health' (Ficha Médica y Salud)
  const [anthroSubTab, setAnthroSubTab] = useState('measurements');

  // Estado de la Rutina Asignada en BD
  const [clientRoutine, setClientRoutine] = useState(null);
  const [loadingRoutine, setLoadingRoutine] = useState(false);
  const [routineTitle, setRoutineTitle] = useState('');
  const [selectedExerciseModal, setSelectedExerciseModal] = useState(null);

  // Filtro de categoría en diseñador
  const [filterMuscleGroupId, setFilterMuscleGroupId] = useState('ALL');

  // Plan Semanal en Memoria (para el Diseñador)
  const [weeklyPlan, setWeeklyPlan] = useState({
    Lunes: { muscleGroups: 'Pecho y Tríceps', exercises: [] },
    Martes: { muscleGroups: 'Espalda y Bíceps', exercises: [] },
    Miércoles: { muscleGroups: 'Pierna Completa', exercises: [] },
    Jueves: { muscleGroups: 'Hombro y Trapecio', exercises: [] },
    Viernes: { muscleGroups: 'Brazo y Abdomen', exercises: [] },
    Sábado: { muscleGroups: 'Cardio y Funcional', exercises: [] }
  });

  // Form para agregar ejercicio al día
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseSets, setExerciseSets] = useState('4');
  const [exerciseReps, setExerciseReps] = useState('10-12');
  const [exerciseMethod, setExerciseMethod] = useState('Pirámide');
  const [exerciseNote, setExerciseNote] = useState('');
  const [savingRoutine, setSavingRoutine] = useState(false);

  // --- Form Ficha Antropométrica (Campos exactos de /APP y BD) ---
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [shouldersCm, setShouldersCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [hipCm, setHipCm] = useState('');
  const [glutesCm, setGlutesCm] = useState('');
  const [thighRightCm, setThighRightCm] = useState(''); // Muslo Superior
  const [thighLeftCm, setThighLeftCm] = useState('');   // Muslo Medio
  const [calfCm, setCalfCm] = useState('');             // Pantorrilla
  const [armCm, setArmCm] = useState('');               // Brazo
  const [savingAnthro, setSavingAnthro] = useState(false);
  const [clientEvaluations, setClientEvaluations] = useState([]);

  // --- Form Ficha Médica y de Salud (client_medical_records) ---
  const [illnesses, setIllnesses] = useState('Ninguna');
  const [surgeries, setSurgeries] = useState('Ninguna');
  const [injuries, setInjuries] = useState('Ninguna');
  const [prescribedMeds, setPrescribedMeds] = useState('Ninguno');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [savingMedical, setSavingMedical] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchExercises();
    fetchMuscleGroups();
  }, [fetchClients, fetchExercises, fetchMuscleGroups]);

  // Si cambia el cliente o la pestaña en URL
  useEffect(() => {
    if (initialClientId) setSelectedClientId(initialClientId);
    if (initialTab) {
      if ((initialTab === 'routine' || initialTab === 'designer') && !isAdmin) {
        setActiveTab('view');
      } else if (initialTab === 'routine') {
        setActiveTab('designer');
      } else if (initialTab === 'isometrics') {
        setActiveTab('anthropometric');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialClientId, initialTab, isAdmin]);

  // Si un entrenador / trabajador está en la pestaña diseñador, redirigir a vista
  useEffect(() => {
    if (!isAdmin && activeTab === 'designer') {
      setActiveTab('view');
    }
  }, [isAdmin, activeTab]);

  // Cargar rutina, evaluaciones antropométricas e historia médica del cliente seleccionado
  useEffect(() => {
    if (!selectedClientId) {
      setClientRoutine(null);
      setClientEvaluations([]);
      // Reset campos
      setWeightKg('');
      setHeightCm('');
      setShouldersCm('');
      setChestCm('');
      setWaistCm('');
      setHipCm('');
      setGlutesCm('');
      setThighRightCm('');
      setThighLeftCm('');
      setCalfCm('');
      setArmCm('');
      setIllnesses('Ninguna');
      setSurgeries('Ninguna');
      setInjuries('Ninguna');
      setPrescribedMeds('Ninguno');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setEmergencyNotes('');
      return;
    }

    const loadData = async () => {
      setLoadingRoutine(true);
      try {
        // 1. Cargar rutina
        const routine = await fetchClientRoutine(selectedClientId);
        if (routine) {
          setClientRoutine(routine);
          setRoutineTitle(routine.title || `Plan Semanal - ${selectedClient?.name || 'Socio'}`);

          // Cargar datos en el plan de memoria para permitir edición inmediata
          const plan = {};
          DAYS.forEach((day) => {
            plan[day] = {
              muscleGroups: routine[day]?.muscleGroups || 'Descanso',
              exercises: (routine[day]?.exercises || []).map((ex) => ({
                id: ex.id || `${Date.now()}_${Math.random()}`,
                exercise_id: ex.exercise_id,
                name: ex.name,
                sets: ex.sets || 3,
                reps: ex.reps || ex.repsValue || '10-12',
                method: ex.method || 'Normal',
                customNote: ex.customNote || '',
                image: ex.image,
                description: ex.description,
                muscleGroup: ex.muscleGroup || ''
              }))
            };
          });
          setWeeklyPlan(plan);
        } else {
          setClientRoutine(null);
          // Si no tiene rutina, inicializar plantilla limpia
          setWeeklyPlan({
            Lunes: { muscleGroups: 'Pecho y Tríceps', exercises: [] },
            Martes: { muscleGroups: 'Espalda y Bíceps', exercises: [] },
            Miércoles: { muscleGroups: 'Pierna Completa', exercises: [] },
            Jueves: { muscleGroups: 'Hombro y Trapecio', exercises: [] },
            Viernes: { muscleGroups: 'Brazo y Abdomen', exercises: [] },
            Sábado: { muscleGroups: 'Cardio y Funcional', exercises: [] }
          });
        }

        // 2. Cargar evaluaciones antropométricas
        const { data: res } = await clienteAxios.get(
          `/medical-records/evaluations/client/${selectedClientId}`
        );
        if (res.success && res.data) {
          const rows = res.data.rows || [];
          setClientEvaluations(rows);
          if (rows.length > 0) {
            const latest = rows[0];
            setWeightKg(latest.weight_kg?.toString() || '');
            setHeightCm(latest.height_cm?.toString() || '');
            setShouldersCm(latest.shoulders_cm?.toString() || '');
            setChestCm(latest.chest_cm?.toString() || '');
            setWaistCm(latest.waist_cm?.toString() || '');
            setHipCm(latest.hip_cm?.toString() || '');
            setGlutesCm(latest.glutes_cm?.toString() || '');
            setThighRightCm(latest.right_thigh_cm?.toString() || '');
            setThighLeftCm(latest.left_thigh_cm?.toString() || '');
            setCalfCm(latest.right_calf_cm?.toString() || '');
            setArmCm(latest.right_arm_cm?.toString() || '');
          }
        }

        // 3. Cargar ficha médica clínica
        try {
          const { data: medRes } = await clienteAxios.get(
            `/medical-records/clinical/${selectedClientId}`
          );
          if (medRes.success && medRes.data) {
            const m = medRes.data;
            setIllnesses(m.illnesses || m.enfermedades || 'Ninguna');
            setSurgeries(m.surgeries || m.cirugias || 'Ninguna');
            setInjuries(m.injuries || m.lesiones || 'Ninguna');
            setPrescribedMeds(m.prescribed_meds || m.medicamentos || 'Ninguno');
            setEmergencyContactName(m.emergency_contact_name || '');
            setEmergencyContactPhone(m.emergency_contact_phone || '');
            setEmergencyNotes(m.emergency_notes || '');
          }
        } catch (mErr) {
          setIllnesses('Ninguna');
          setSurgeries('Ninguna');
          setInjuries('Ninguna');
          setPrescribedMeds('Ninguno');
          setEmergencyContactName('');
          setEmergencyContactPhone('');
          setEmergencyNotes('');
        }
      } catch (err) {
        setClientRoutine(null);
        setClientEvaluations([]);
      } finally {
        setLoadingRoutine(false);
      }
    };

    loadData();
  }, [selectedClientId]);

  // Permiso para crear y editar rutinas: Únicamente el Super Administrador
  const canEditRoutine = isAdmin;

  // Socios disponibles para gestionar rutina (todos los socios registrados)
  const availableClients = clients || [];

  const selectedClient = (clients || []).find((c) => c.id.toString() === selectedClientId);

  // --- MÉTODOS PARA RUTINAS ---
  const handleMuscleGroupChange = (day, value) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], muscleGroups: value }
    }));
  };

  const handleAddExerciseToDay = (e) => {
    e.preventDefault();
    if (!selectedExerciseId) {
      mostrarAlerta('Selecciona un ejercicio del catálogo', true);
      return;
    }

    const exObj = exercises.find((ex) => ex.id.toString() === selectedExerciseId.toString());
    if (!exObj) {
      mostrarAlerta('Por favor selecciona un ejercicio válido del catálogo', true);
      return;
    }

    const newEx = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      exercise_id: exObj.id,
      name: exObj.name,
      sets: parseInt(exerciseSets || '3'),
      reps: (exerciseReps || '10-12').toString().trim(),
      method: exerciseMethod || 'Normal',
      customNote: (exerciseNote || '').trim(),
      image: exObj.image_url,
      description: exObj.description,
      muscleGroup: exObj.muscleGroup?.name || ''
    };

    setWeeklyPlan((prev) => {
      const currentDay = prev[activeDay] || { muscleGroups: 'General', exercises: [] };
      return {
        ...prev,
        [activeDay]: {
          ...currentDay,
          exercises: [...(currentDay.exercises || []), newEx]
        }
      };
    });

    // Reset campos
    setSelectedExerciseId('');
    setExerciseNote('');
    mostrarAlerta(`Ejercicio "${exObj.name}" agregado al ${activeDay}`, false);
  };

  const handleRemoveExerciseFromDay = (day, exId) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        exercises: (prev[day]?.exercises || []).filter((ex) => ex.id !== exId && ex.routine_day_exercise_id !== exId)
      }
    }));
  };

  const handleClearRoutine = () => {
    if (window.confirm('¿Seguro que deseas limpiar la rutina en pantalla para empezar desde cero?')) {
      setWeeklyPlan({
        Lunes: { muscleGroups: 'Pecho y Tríceps', exercises: [] },
        Martes: { muscleGroups: 'Espalda y Bíceps', exercises: [] },
        Miércoles: { muscleGroups: 'Pierna Completa', exercises: [] },
        Jueves: { muscleGroups: 'Hombro y Trapecio', exercises: [] },
        Viernes: { muscleGroups: 'Brazo y Abdomen', exercises: [] },
        Sábado: { muscleGroups: 'Cardio y Funcional', exercises: [] }
      });
      mostrarAlerta('Formulario de rutina reiniciado', false);
    }
  };

  const handleSaveFullWeeklyRoutine = async () => {
    if (!selectedClientId) {
      mostrarAlerta('Por favor selecciona el socio al que asignarás la rutina', true);
      return;
    }

    // Validar que se haya agregado al menos un ejercicio en la semana
    const totalWeeklyExercisesCount = Object.values(weeklyPlan).reduce(
      (acc, day) => acc + (day.exercises?.length || 0),
      0
    );
    if (totalWeeklyExercisesCount === 0) {
      mostrarAlerta(
        'Debes agregar al menos un ejercicio al plan semanal antes de guardar (recuerda presionar "+ Agregar al [Día]")',
        true
      );
      return;
    }

    setSavingRoutine(true);
    try {
      const payload = {
        client_id: parseInt(selectedClientId),
        title: routineTitle.trim() || `Plan Semanal - ${selectedClient?.name || 'Socio'}`,
        days: Object.keys(weeklyPlan).map((day) => ({
          day_name: SPANISH_TO_ENGLISH_DAYS[day] || day.toUpperCase(),
          target_muscle_groups: weeklyPlan[day].muscleGroups,
          exercises: (weeklyPlan[day].exercises || []).map((ex) => {
            const methodBase = (ex.method || 'Normal').trim();
            const note = (ex.customNote || '').trim();
            let finalMethod = methodBase;
            if (note && !methodBase.includes(note)) {
              finalMethod = `${methodBase} | ${note}`;
            }
            return {
              exercise_id: ex.exercise_id,
              sets: parseInt(ex.sets || 3),
              reps: (ex.reps || '10-12').toString().trim(),
              method: finalMethod
            };
          })
        }))
      };

      await createWeeklyPlan(payload);
      mostrarAlerta('¡Rutina semanal guardada y asignada al socio con éxito!', false);

      // Recargar la rutina y cambiar a la pestaña de visualización
      const updated = await fetchClientRoutine(selectedClientId);
      if (updated) {
        setClientRoutine(updated);
      }
      setActiveTab('view');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRoutine(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- MÉTODOS PARA FICHA ANTROPOMÉTRICA Y MÉDICA ---
  const handleSaveAnthropometric = async (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      mostrarAlerta('Selecciona el socio para registrar la ficha antropométrica', true);
      return;
    }
    if (!weightKg || !heightCm) {
      mostrarAlerta('Peso y Altura son campos obligatorios', true);
      return;
    }

    setSavingAnthro(true);
    try {
      const payload = {
        client_id: parseInt(selectedClientId),
        evaluation_date: new Date().toISOString().split('T')[0],
        weight_kg: parseFloat(weightKg),
        height_cm: parseFloat(heightCm),
        shoulders_cm: shouldersCm ? parseFloat(shouldersCm) : null,
        chest_cm: chestCm ? parseFloat(chestCm) : null,
        waist_cm: waistCm ? parseFloat(waistCm) : null,
        hip_cm: hipCm ? parseFloat(hipCm) : null,
        glutes_cm: glutesCm ? parseFloat(glutesCm) : null,
        right_thigh_cm: thighRightCm ? parseFloat(thighRightCm) : null,
        left_thigh_cm: thighLeftCm ? parseFloat(thighLeftCm) : null,
        right_calf_cm: calfCm ? parseFloat(calfCm) : null,
        right_arm_cm: armCm ? parseFloat(armCm) : null
      };

      const { data: res } = await clienteAxios.post('/medical-records/evaluations', payload);
      if (res.success) {
        mostrarAlerta('Evaluación antropométrica registrada correctamente', false);
        // Refrescar historial de evaluaciones
        const { data: refRes } = await clienteAxios.get(
          `/medical-records/evaluations/client/${selectedClientId}`
        );
        if (refRes.success && refRes.data) {
          setClientEvaluations(refRes.data.rows || []);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al guardar evaluación antropométrica';
      mostrarAlerta(msg, true);
    } finally {
      setSavingAnthro(false);
    }
  };

  const handleSaveMedicalRecord = async (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      mostrarAlerta('Selecciona un socio para actualizar su ficha médica', true);
      return;
    }

    setSavingMedical(true);
    try {
      const payload = {
        illnesses: illnesses.trim() || 'Ninguna',
        surgeries: surgeries.trim() || 'Ninguna',
        injuries: injuries.trim() || 'Ninguna',
        prescribed_meds: prescribedMeds.trim() || 'Ninguno',
        emergency_contact_name: emergencyContactName.trim() || null,
        emergency_contact_phone: emergencyContactPhone.trim() || null,
        emergency_notes: emergencyNotes.trim() || null
      };

      const { data: res } = await clienteAxios.put(
        `/medical-records/clinical/${selectedClientId}`,
        payload
      );
      if (res.success) {
        mostrarAlerta('Ficha médica y de salud guardada exitosamente', false);
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al guardar ficha médica';
      mostrarAlerta(msg, true);
    } finally {
      setSavingMedical(false);
    }
  };

  // Cálculo de IMC en tiempo real
  const currentHeightM = parseFloat(heightCm) > 0 ? parseFloat(heightCm) / 100 : 0;
  const currentBmi =
    parseFloat(weightKg) > 0 && currentHeightM > 0
      ? (parseFloat(weightKg) / (currentHeightM * currentHeightM)).toFixed(1)
      : null;

  const getBmiBadge = (bmiValue) => {
    const val = parseFloat(bmiValue);
    if (!val) return null;
    if (val < 18.5) return { label: 'Bajo peso', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (val <= 24.9) return { label: 'Peso saludable', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (val <= 29.9) return { label: 'Sobrepeso', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Obesidad', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  };

  // Filtro de ejercicios por grupo muscular
  const filteredExercises = exercises.filter((ex) => {
    if (filterMuscleGroupId === 'ALL') return true;
    return ex.muscle_group_id?.toString() === filterMuscleGroupId.toString();
  });

  // Conteo total de ejercicios en la semana
  const totalWeeklyExercises = DAYS.reduce((acc, d) => {
    const list = clientRoutine ? clientRoutine[d]?.exercises : weeklyPlan[d]?.exercises;
    return acc + (list?.length || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        badge="Entrenamiento & Biometría"
        title="Gestión y Visualización de Rutinas"
        subtitle={
          isAdmin
            ? "Diseña y asigna planes de entrenamiento personalizados y registra el progreso antropométrico de los socios."
            : "Visualiza las rutinas asignadas a tus alumnos y registra sus fichas antropométricas y médicas."
        }
        actions={
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 w-full md:w-auto">
            {/* Tab 1: Ver Rutina Actual */}
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'view'
                  ? 'bg-white text-indigo-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HiEye className="w-4 h-4" />
              <span>Ver Rutina</span>
              {clientRoutine && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>

            {/* Tab 2: Diseñar / Editar (Solo Administrador) */}
            {canEditRoutine && (
              <button
                onClick={() => setActiveTab('designer')}
                className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'designer'
                    ? 'bg-white text-indigo-700 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HiPencilAlt className="w-4 h-4" />
                <span>{clientRoutine ? 'Editar Rutina' : 'Crear Rutina'}</span>
              </button>
            )}

            {/* Tab 3: Ficha Antropométrica & Médica */}
            <button
              onClick={() => setActiveTab('anthropometric')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'anthropometric' || activeTab === 'isometrics'
                  ? 'bg-white text-rose-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HiHeart className="w-4 h-4 text-rose-500" />
              <span>Ficha Antropométrica</span>
            </button>
          </div>
        }
      />

      {/* Selector de Socio Obligatorio */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <HiUser className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">
              {selectedClient ? (
                <span>
                  Socio: <strong className="text-indigo-600">{selectedClient.name}</strong>
                </span>
              ) : (
                'Selecciona un Socio'
              )}
            </h4>
            <p className="text-xs text-slate-500">
              {isWorker
                ? 'Entrenador: Selecciona un socio activo para consultar o ajustar su rutina.'
                : 'Selecciona al socio para ver su rutina activa, modificar ejercicios o registrar medidas.'}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 cursor-pointer shadow-xs"
          >
            <option value="">-- Elige un Socio del Gimnasio --</option>
            {availableClients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.full_name} ({c.document_id || 'Sin doc'}) - {c.active ? 'Activo' : 'Inactivo'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenido Principal según Estado */}
      {!selectedClientId ? (
        /* Estado sin socio seleccionado */
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xs">
            🏋️
          </div>
          <h3 className="text-lg font-black text-slate-900">
            {activeTab === 'designer'
              ? 'Selecciona a qué socio le diseñarás la rutina'
              : 'Selecciona un socio para comenzar'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            {activeTab === 'designer'
              ? 'Elige un socio de la lista para cargar su plan o comenzar a diseñar su nueva rutina semanal.'
              : 'Elige a un socio para visualizar su rutina semanal asignada, editar ejercicios o registrar su ficha antropométrica.'}
          </p>

          <div className="mt-6 max-w-sm mx-auto">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-3 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200 rounded-2xl text-xs font-bold text-indigo-900 focus:outline-none focus:bg-white focus:border-indigo-600 cursor-pointer shadow-xs transition-all"
            >
              <option value="">-- Elige un Socio del Gimnasio --</option>
              {availableClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.full_name} ({c.document_id || 'Sin doc'}) - {c.active ? 'Activo' : 'Inactivo'}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : loadingRoutine ? (
        /* Spinner de carga */
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-black text-slate-600">Cargando datos de la rutina del socio...</p>
        </div>
      ) : activeTab === 'view' ? (
        /* ================= TAB 1: VISUALIZAR RUTINA ACTUAL ================= */
        <div className="space-y-6">
          {/* Header de la Rutina Asignada */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg border border-indigo-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {clientRoutine?.is_active ? 'Rutina Semanal Activa' : 'Plan en Sistema'}
                </span>
                {clientRoutine?.trainer?.full_name && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-indigo-200">
                    Entrenador: {clientRoutine.trainer.full_name}
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                {clientRoutine?.title || `Plan Semanal - ${selectedClient?.name || 'Socio'}`}
              </h2>
              <p className="text-xs text-indigo-200/80 mt-1">
                Socio: <strong className="text-white">{selectedClient?.name}</strong> • Documento:{' '}
                {selectedClient?.document_id || 'Sin documento'} • Total:{' '}
                <strong className="text-indigo-300">{totalWeeklyExercises} ejercicios programados</strong>
              </p>
            </div>

            {/* Acciones directas */}
            <div className="flex flex-wrap items-center gap-2">
              {canEditRoutine && (
                <button
                  onClick={() => setActiveTab('designer')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <HiPencilAlt className="w-4 h-4" />
                  <span>Editar Rutina</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
              >
                <HiPrinter className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {!clientRoutine ? (
            /* Estado: Socio sin rutina activa */
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3">
                📋
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {selectedClient?.name} aún no tiene una rutina activa asignada
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Este alumno no cuenta con ejercicios programados.
              </p>
              {canEditRoutine ? (
                <button
                  onClick={() => setActiveTab('designer')}
                  className="mt-5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>Diseñar Primera Rutina para este Socio</span>
                </button>
              ) : (
                <div className="mt-5 flex flex-col items-center gap-3">
                  <span className="inline-block text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                    Solo la administración del gimnasio puede diseñar y asignar rutinas a los socios.
                  </span>
                  <button
                    onClick={() => setActiveTab('anthropometric')}
                    className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <HiHeart className="w-4 h-4" />
                    <span>Llenar Ficha Antropométrica de este Socio</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Barra de Selección de Días */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
                {DAYS.map((day) => {
                  const isActive = activeDay === day;
                  const dayData = clientRoutine[day];
                  const exCount = dayData?.exercises?.length || 0;
                  const isRest = exCount === 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`flex-1 min-w-[110px] py-3 px-3 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-100'
                          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{day}</span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : isRest
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {isRest ? 'Descanso' : `${exCount} ejerc.`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Banner de Enfoque del Día */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-indigo-200">
                    {activeDay.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                      Enfoque del {activeDay}
                    </p>
                    <h3 className="text-lg font-black text-slate-900">
                      💪 {clientRoutine[activeDay]?.muscleGroups || 'Descanso'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-100 shadow-2xs">
                    {(clientRoutine[activeDay]?.exercises || []).length}{' '}
                    {(clientRoutine[activeDay]?.exercises || []).length === 1 ? 'ejercicio' : 'ejercicios'}
                  </span>
                  {canEditRoutine && (
                    <button
                      onClick={() => setActiveTab('designer')}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <HiPencilAlt className="w-3.5 h-3.5" />
                      <span>Modificar este día</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de Ejercicios del Día */}
              {(clientRoutine[activeDay]?.exercises || []).length === 0 ? (
                /* Día de Descanso */
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl mx-auto mb-3">
                    🧘‍♂️
                  </div>
                  <h4 className="text-base font-black text-slate-900">Día de Descanso Programado</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    No hay ejercicios registrados para el {activeDay}. El socio tiene este día para recuperación muscular o cardio libre.
                  </p>
                  {canEditRoutine && (
                    <button
                      onClick={() => setActiveTab('designer')}
                      className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <HiPlus className="w-4 h-4" />
                      <span>Agregar ejercicios al {activeDay}</span>
                    </button>
                  )}
                </div>
              ) : (
                /* Grid de Ejercicios del Día */
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clientRoutine[activeDay].exercises.map((ex, idx) => {
                      return (
                        <div
                          key={ex.id || idx}
                          className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                          <div className="flex gap-4">
                            {/* Miniatura */}
                            {ex.image ? (
                              <img
                                src={ex.image}
                                alt={ex.name}
                                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0 cursor-pointer group-hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedExerciseModal(ex)}
                              />
                            ) : (
                              <div
                                onClick={() => setSelectedExerciseModal(ex)}
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
                                    className="text-sm font-black text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                                    onClick={() => setSelectedExerciseModal(ex)}
                                  >
                                    {ex.name}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-2">
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
                                <p className="text-xs text-indigo-700 mt-2 font-medium bg-indigo-50/60 p-2 rounded-xl border border-indigo-100/70">
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

                  {canEditRoutine && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('designer')}
                        className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/80 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <HiPlus className="w-4 h-4" />
                        <span>+ Agregar más ejercicios al {activeDay}</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Matriz Semanal Completa (Resumen de todos los días de un vistazo) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Resumen Semanal Completo
                    </h4>
                    <p className="text-xs text-slate-500">
                      Todos los días de entrenamiento configurados para {selectedClient?.name}.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                    Lunes a Sábado
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DAYS.map((day) => {
                    const dayObj = clientRoutine[day];
                    const count = dayObj?.exercises?.length || 0;

                    return (
                      <div
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          activeDay === day
                            ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-black text-xs text-slate-900">{day}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              count > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {count > 0 ? `${count} ejercicios` : 'Descanso'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">
                          {dayObj?.muscleGroups || 'Sin grupo'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      ) : activeTab === 'designer' && canEditRoutine ? (
        /* ================= TAB 2: DISEÑAR / EDITAR RUTINA ================= */
        <div className="space-y-6">
          {/* Banner de Modo Diseñador */}
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                {clientRoutine ? 'Modo Edición' : 'Nuevo Plan'}
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {clientRoutine
                  ? `Editando Rutina de ${selectedClient?.name}`
                  : `Diseñando Rutina para ${selectedClient?.name}`}
              </h3>
              <p className="text-xs text-slate-500">
                Agrega ejercicios a cada día de la semana y guarda el plan para que el socio lo consulte en su app o web.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearRoutine}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Limpiar todo
              </button>
              {clientRoutine && (
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Volver a ver rutina
                </button>
              )}
            </div>
          </div>

          {/* Título de la Rutina */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Título o Nombre de la Rutina *
            </label>
            <input
              type="text"
              placeholder="Ej. Rutina Hipertrofia 4 Días Pro, Plan Acondicionamiento..."
              value={routineTitle}
              onChange={(e) => setRoutineTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          {/* Selector de Días de la Semana */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
            {DAYS.map((day) => {
              const isActive = activeDay === day;
              const exCount = weeklyPlan[day]?.exercises?.length || 0;

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
                  <span>{day}</span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {exCount} ejerc.
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Formulario agregar ejercicio (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Configurar {activeDay}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">Agregar Ejercicio</h3>
              </div>

              {/* Grupo Muscular del Día */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enfoque / Grupos Musculares del {activeDay}
                </label>
                <input
                  type="text"
                  placeholder="Ej. Pecho, Hombro y Tríceps"
                  value={weeklyPlan[activeDay]?.muscleGroups || ''}
                  onChange={(e) => handleMuscleGroupChange(activeDay, e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>

              <form onSubmit={handleAddExerciseToDay} className="space-y-4 pt-2 border-t border-slate-100">
                {/* Filtro rápido por grupo muscular en catálogo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Filtrar Catálogo</label>
                    <span className="text-[10px] text-slate-400">
                      {filteredExercises.length} ejercicios disponibles
                    </span>
                  </div>
                  <select
                    value={filterMuscleGroupId}
                    onChange={(e) => setFilterMuscleGroupId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-600"
                  >
                    <option value="ALL">Todos los grupos musculares</option>
                    {muscleGroups.map((mg) => (
                      <option key={mg.id} value={mg.id}>
                        {mg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Ejercicio */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seleccionar Ejercicio *
                  </label>
                  <select
                    value={selectedExerciseId}
                    onChange={(e) => setSelectedExerciseId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  >
                    <option value="">-- Buscar en catálogo --</option>
                    {filteredExercises.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.muscleGroup?.name || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Series y Repeticiones */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Series *</label>
                    <input
                      type="number"
                      value={exerciseSets}
                      onChange={(e) => setExerciseSets(e.target.value)}
                      required
                      min="1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Repeticiones *</label>
                    <input
                      type="text"
                      placeholder="10-12 / Drop Set"
                      value={exerciseReps}
                      onChange={(e) => setExerciseReps(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Técnica / Método */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Técnica / Método</label>
                  <select
                    value={exerciseMethod}
                    onChange={(e) => setExerciseMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Pirámide">Pirámide Ascendente</option>
                    <option value="Drop Set">Drop Set (Descendente)</option>
                    <option value="Super Serie">Super Serie</option>
                    <option value="Fallo Muscular">Fallo Muscular</option>
                  </select>
                </div>

                {/* Indicaciones Opcionales */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Indicaciones del Entrenador (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Pausa de 2 seg en contracción"
                    value={exerciseNote}
                    onChange={(e) => setExerciseNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <HiPlus className="w-4 h-4" />
                  <span>+ Agregar al {activeDay}</span>
                </button>
              </form>
            </div>

            {/* Columna Derecha: Lista de ejercicios del día y botón Guardar Todo (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      Ejercicios Programados para el {activeDay}
                    </h4>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5">
                      Enfoque: {weeklyPlan[activeDay]?.muscleGroups || 'Sin definir'}
                    </p>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                    {weeklyPlan[activeDay]?.exercises?.length || 0} agregados
                  </span>
                </div>

                <div className="space-y-3 my-4">
                  {(weeklyPlan[activeDay]?.exercises || []).length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <p className="text-xs font-bold text-slate-500">No hay ejercicios para el {activeDay}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Usa el formulario para agregar ejercicios.</p>
                    </div>
                  ) : (
                    weeklyPlan[activeDay].exercises.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-black text-slate-900 truncate">{item.name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-indigo-700">
                              {item.sets} Sets × {item.reps}
                            </span>
                            {item.method && (
                              <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                                {item.method}
                              </span>
                            )}
                          </div>
                          {item.customNote && (
                            <p className="text-xs text-indigo-600 mt-1">✍️ {item.customNote}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveExerciseFromDay(activeDay, item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Quitar ejercicio"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Botón Guardar Rutina Completa */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={savingRoutine}
                  onClick={handleSaveFullWeeklyRoutine}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {savingRoutine ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5" />
                      <span>Guardar Rutina Semanal para {selectedClient?.name || 'Socio'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= TAB 3: FICHA ANTROPOMÉTRICA Y MÉDICA ================= */
        <div className="space-y-6">
          {/* Sub-Navegación Interna */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setAnthroSubTab('measurements')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                anthroSubTab === 'measurements'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>📏 Medidas Antropométricas Corporales</span>
            </button>

            <button
              type="button"
              onClick={() => setAnthroSubTab('health')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                anthroSubTab === 'health'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-100'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <HiShieldCheck className="w-4 h-4" />
              <span>🏥 Ficha Médica y de Salud</span>
            </button>
          </div>

          {anthroSubTab === 'measurements' ? (
            /* --- SUBTAB 1: MEDIDAS ANTROPOMÉTRICAS --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Formulario de Medidas (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black uppercase text-rose-600 tracking-wider">
                      Ficha Antropométrica
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      Registro de Medidas Corporales
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Monitorea periódicamente las 11 medidas corporales e Índice de Masa Corporal del socio.
                    </p>
                  </div>

                  {/* Tarjeta de IMC en tiempo real */}
                  {currentBmi && (
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-3 shrink-0">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">IMC Calculado</p>
                        <p className="text-lg font-black text-slate-900">{currentBmi}</p>
                      </div>
                      {getBmiBadge(currentBmi) && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            getBmiBadge(currentBmi).color
                          }`}
                        >
                          {getBmiBadge(currentBmi).label}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveAnthropometric} className="space-y-5">
                  {/* Peso y Altura */}
                  <div className="grid grid-cols-2 gap-4 bg-rose-50/40 p-4 rounded-2xl border border-rose-100/70">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Peso (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="ej. 75.5"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Altura (cm) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="ej. 175"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Perímetros Corporales (9 puntos) */}
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-2">
                      Perímetros Corporales (Centímetros)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Hombros (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 110"
                          value={shouldersCm}
                          onChange={(e) => setShouldersCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Pectoral / Pecho (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 98"
                          value={chestCm}
                          onChange={(e) => setChestCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Cintura (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 80"
                          value={waistCm}
                          onChange={(e) => setWaistCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Cadera (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 92"
                          value={hipCm}
                          onChange={(e) => setHipCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Glúteo (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 98"
                          value={glutesCm}
                          onChange={(e) => setGlutesCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Muslo Sup. (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 56"
                          value={thighRightCm}
                          onChange={(e) => setThighRightCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Muslo Medio (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 52"
                          value={thighLeftCm}
                          onChange={(e) => setThighLeftCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Pantorrilla (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 36"
                          value={calfCm}
                          onChange={(e) => setCalfCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Brazo (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 34"
                          value={armCm}
                          onChange={(e) => setArmCm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={savingAnthro}
                    className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-100 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {savingAnthro ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <HiHeart className="w-4 h-4" />
                        <span>Guardar Medidas Antropométricas</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Historial de Evaluaciones del Socio (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h4 className="text-base font-black text-slate-900">Historial Antropométrico</h4>
                    <p className="text-xs text-slate-400 font-semibold">{selectedClient?.name || 'Socio'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-black">
                    {clientEvaluations.length} mediciones
                  </span>
                </div>

                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {clientEvaluations.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                      <p className="text-xs font-bold text-slate-500">Sin mediciones previas</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Registra la primera medición para iniciar la evolución corporal del socio.
                      </p>
                    </div>
                  ) : (
                    clientEvaluations.map((ev, idx) => {
                      const hM = parseFloat(ev.height_cm) > 0 ? parseFloat(ev.height_cm) / 100 : 0;
                      const bmiVal =
                        hM > 0 && parseFloat(ev.weight_kg) > 0
                          ? (parseFloat(ev.weight_kg) / (hM * hM)).toFixed(1)
                          : null;
                      const badge = getBmiBadge(bmiVal);

                      return (
                        <div
                          key={ev.id || idx}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                        >
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-900">
                              📅 {ev.evaluation_date || new Date(ev.created_at).toLocaleDateString('es-CO')}
                            </span>
                            <div className="flex items-center gap-2">
                              {badge && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                                  IMC {bmiVal}
                                </span>
                              )}
                              <span className="text-rose-600 font-black">{ev.weight_kg} kg</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200/60">
                            {ev.height_cm && <div>Altura: <strong>{ev.height_cm} cm</strong></div>}
                            {ev.shoulders_cm && <div>Hombros: <strong>{ev.shoulders_cm} cm</strong></div>}
                            {ev.chest_cm && <div>Pectoral: <strong>{ev.chest_cm} cm</strong></div>}
                            {ev.waist_cm && <div>Cintura: <strong>{ev.waist_cm} cm</strong></div>}
                            {ev.hip_cm && <div>Cadera: <strong>{ev.hip_cm} cm</strong></div>}
                            {ev.glutes_cm && <div>Glúteo: <strong>{ev.glutes_cm} cm</strong></div>}
                            {ev.right_thigh_cm && <div>Muslo Sup: <strong>{ev.right_thigh_cm} cm</strong></div>}
                            {ev.left_thigh_cm && <div>Muslo Med: <strong>{ev.left_thigh_cm} cm</strong></div>}
                            {ev.right_calf_cm && <div>Pantorrilla: <strong>{ev.right_calf_cm} cm</strong></div>}
                            {ev.right_arm_cm && <div>Brazo: <strong>{ev.right_arm_cm} cm</strong></div>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- SUBTAB 2: FICHA MÉDICA Y DE SALUD (client_medical_records) --- */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Formulario Clínico (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="mb-6">
                  <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
                    Historial Clínico
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    Ficha Médica y de Salud
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Información médica clave para prevenir accidentes y adaptar los ejercicios de forma segura.
                  </p>
                </div>

                <form onSubmit={handleSaveMedicalRecord} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Enfermedades o Condiciones Médicas
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Hipertensión, Asma, Diabetes, Ninguna..."
                      value={illnesses}
                      onChange={(e) => setIllnesses(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Operaciones o Cirugías Previas
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Meniscos rodilla derecha (2022), Ninguna..."
                      value={surgeries}
                      onChange={(e) => setSurgeries(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lesiones o Dolores Físicos
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Molestia en hombro al presionar, Lumbalgia recurrente, Ninguna..."
                      value={injuries}
                      onChange={(e) => setInjuries(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Medicamentos Actuales
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Salbutamol previo a ejercicio intenso, Losartán, Ninguno..."
                      value={prescribedMeds}
                      onChange={(e) => setPrescribedMeds(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contacto de Emergencia
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre de familiar o tutor"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono de Emergencia
                      </label>
                      <input
                        type="tel"
                        placeholder="ej. +57 300 123 4567"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Observaciones Médicas o Recomendaciones Clínicas
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Indicaciones para el entrenador sobre esfuerzos, ejercicios prohibidos o recomendaciones médicas..."
                      value={emergencyNotes}
                      onChange={(e) => setEmergencyNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingMedical}
                    className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-100 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {savingMedical ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <HiShieldCheck className="w-4 h-4" />
                        <span>Guardar Ficha Médica y de Salud</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Panel de Advertencias Médicas para el Entrenador (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h4 className="text-base font-black text-slate-900">Resumen Clínico para Entrenamiento</h4>
                  <p className="text-xs text-slate-400 font-semibold">{selectedClient?.name || 'Socio'}</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                      ⚠️ Lesiones y Dolores Reportados
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {injuries && injuries !== 'Ninguna'
                        ? injuries
                        : 'El socio no ha reportado lesiones articulares ni musculares.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      🏥 Condiciones y Cirugías
                    </span>
                    <p className="text-xs font-medium text-slate-700 mt-1">
                      <strong>Condiciones:</strong> {illnesses || 'Ninguna'}
                    </p>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">
                      <strong>Cirugías:</strong> {surgeries || 'Ninguna'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                      💊 Medicamentos Actuales
                    </span>
                    <p className="text-xs font-medium text-slate-700 mt-1">
                      {prescribedMeds || 'Ninguno'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                      📞 Contacto en Caso de Emergencia
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {emergencyContactName || 'No registrado'}
                    </p>
                    <p className="text-xs font-medium text-indigo-600 mt-0.5">
                      {emergencyContactPhone || 'Sin teléfono registrado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detalle de Ejercicio */}
      <Modal
        isOpen={Boolean(selectedExerciseModal)}
        onClose={() => setSelectedExerciseModal(null)}
        title={selectedExerciseModal?.name || 'Detalle del Ejercicio'}
        subtitle={selectedExerciseModal?.muscleGroup || 'Técnica y parámetros de ejecución'}
        badge={selectedExerciseModal?.muscleGroup}
        size="md"
      >
        {selectedExerciseModal && (
          <div className="space-y-4">
            {selectedExerciseModal.image ? (
              <img
                src={selectedExerciseModal.image}
                alt={selectedExerciseModal.name}
                className="w-full h-56 object-cover rounded-2xl border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="w-full h-44 rounded-2xl bg-slate-100 flex flex-col items-center justify-center gap-2 border border-slate-200 text-slate-400 font-bold text-xs">
                <span className="text-4xl">🏋️</span>
                <span className="text-[11px] text-slate-500">Sin imagen registrada</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-black border border-indigo-100">
                {selectedExerciseModal.sets} Series × {selectedExerciseModal.reps || selectedExerciseModal.repsValue || '10-12'}
              </span>
              {selectedExerciseModal.method && (
                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold">
                  {selectedExerciseModal.method}
                </span>
              )}
            </div>

            {selectedExerciseModal.description && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {selectedExerciseModal.description}
              </p>
            )}

            {selectedExerciseModal.customNote && (
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-800">
                ✍️ Indicación: {selectedExerciseModal.customNote}
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedExerciseModal(null)}
              className="w-full mt-2 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-md"
            >
              Cerrar Detalle
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Rutinas;
