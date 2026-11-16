import React, { createContext, useState, useCallback, useEffect } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useAlerta } from '../hooks/useAlerta';

export const DAY_MAP_EN_TO_ES = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado'
};

export const DAY_MAP_ES_TO_EN = {
  Lunes: 'MONDAY',
  Martes: 'TUESDAY',
  'Miércoles': 'WEDNESDAY',
  Miercoles: 'WEDNESDAY',
  Jueves: 'THURSDAY',
  Viernes: 'FRIDAY',
  'Sábado': 'SATURDAY',
  Sabado: 'SATURDAY'
};

const DAY_MAP = DAY_MAP_EN_TO_ES;

export const normalizeRoutine = (rawTemplate) => {
  if (!rawTemplate) return null;
  const result = {
    id: rawTemplate.id,
    client_id: rawTemplate.client_id,
    title: rawTemplate.title || 'Plan Semanal',
    trainer: rawTemplate.trainer,
    is_active: rawTemplate.is_active,
    created_at: rawTemplate.created_at,
    updated_at: rawTemplate.updated_at,
    rawTemplate,
    Lunes: { muscleGroups: 'Descanso', exercises: [] },
    Martes: { muscleGroups: 'Descanso', exercises: [] },
    Miércoles: { muscleGroups: 'Descanso', exercises: [] },
    Jueves: { muscleGroups: 'Descanso', exercises: [] },
    Viernes: { muscleGroups: 'Descanso', exercises: [] },
    Sábado: { muscleGroups: 'Descanso', exercises: [] }
  };

  const daysList = rawTemplate.days || [];
  daysList.forEach(d => {
    const rawName = (d.day_name || '').toString().toUpperCase();
    const spanishDay = DAY_MAP_EN_TO_ES[rawName] || d.day_name;
    const exercises = (d.dayExercises || []).map(de => {
      let rawMethod = (de.method || '').toString().trim();
      let method = rawMethod;
      let customNote = '';
      if (rawMethod.includes(' | ')) {
        const parts = rawMethod.split(' | ');
        method = parts[0] ? parts[0].trim() : '';
        customNote = parts.slice(1).join(' | ').trim();
      }
      return {
        id: de.id,
        routine_day_exercise_id: de.id,
        exercise_id: de.exercise_id,
        name: de.exercise?.name || 'Ejercicio',
        muscleGroup: de.exercise?.muscleGroup?.name || '',
        sets: de.sets || 3,
        reps: de.reps || '10-12',
        repsValue: de.reps || '10-12',
        type: 'standard',
        method: method || 'Normal',
        customNote: customNote,
        day: spanishDay,
        image: de.exercise?.image_url,
        description: de.exercise?.description
      };
    });

    if (result[spanishDay]) {
      result[spanishDay] = {
        muscleGroups: d.target_muscle_groups || 'General',
        exercises
      };
    }
  });

  return result;
};

export const RoutineContext = createContext();

export const RoutineProvider = ({ children }) => {
  const [myRoutine, setMyRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [dailyLogs, setDailyLogs] = useState({});
  const [loading, setLoading] = useState(false);
  const { mostrarAlerta } = useAlerta();

  const fetchMyRoutine = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get('/routines/my-routine');
      if (res.success && res.data) {
        const normalized = normalizeRoutine(res.data);
        setMyRoutine(normalized);
        return normalized;
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Error cargando rutina:', err);
      }
      setMyRoutine(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientRoutine = useCallback(async (clientId) => {
    try {
      const { data: res } = await clienteAxios.get(`/routines/client/${clientId}`);
      if (res.success && res.data) {
        return normalizeRoutine(res.data);
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  const fetchExercises = useCallback(async (muscleGroupId = null) => {
    try {
      const url = muscleGroupId ? `/routines/exercises?muscle_group_id=${muscleGroupId}` : '/routines/exercises';
      const { data: res } = await clienteAxios.get(url);
      if (res.success) setExercises(res.data || []);
    } catch (err) {
      console.error('Error al cargar ejercicios:', err);
    }
  }, []);

  const fetchMuscleGroups = useCallback(async () => {
    try {
      const { data: res } = await clienteAxios.get('/routines/muscle-groups');
      if (res.success) setMuscleGroups(res.data || []);
    } catch (err) {
      console.error('Error al cargar grupos musculares:', err);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
    fetchMuscleGroups();
  }, [fetchExercises, fetchMuscleGroups]);

  const fetchDailyLogs = useCallback(async (date = null, clientId = null) => {
    try {
      const query = date ? `?date=${date}` : '';
      const url = clientId ? `/routines/daily-logs/${clientId}${query}` : `/routines/daily-logs${query}`;
      const { data: res } = await clienteAxios.get(url);
      if (res.success && Array.isArray(res.data)) {
        const logMap = {};
        res.data.forEach(item => {
          if (item.routine_day_exercise_id) {
            logMap[item.routine_day_exercise_id] = Boolean(item.completed);
          }
        });
        setDailyLogs(logMap);
        return logMap;
      }
      return {};
    } catch (err) {
      console.error(err);
      return {};
    }
  }, []);

  const createExercise = async (exerciseData) => {
    try {
      const { data: res } = await clienteAxios.post('/routines/exercises', exerciseData);
      if (res.success) {
        mostrarAlerta('Ejercicio creado exitosamente', false);
        await fetchExercises();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al crear ejercicio';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const updateExercise = async (id, exerciseData) => {
    try {
      const { data: res } = await clienteAxios.put(`/routines/exercises/${id}`, exerciseData);
      if (res.success) {
        mostrarAlerta('Ejercicio actualizado', false);
        await fetchExercises();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al actualizar ejercicio';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const deleteExercise = async (id) => {
    try {
      const { data: res } = await clienteAxios.delete(`/routines/exercises/${id}`);
      if (res.success) {
        mostrarAlerta('Ejercicio eliminado', false);
        await fetchExercises();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al eliminar ejercicio';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const createMuscleGroup = async (name) => {
    try {
      const { data: res } = await clienteAxios.post('/routines/muscle-groups', { name });
      if (res.success) {
        mostrarAlerta(`Grupo muscular "${name}" creado`, false);
        await fetchMuscleGroups();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al crear grupo muscular';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const toggleExerciseLog = async (routineDayExerciseId, completed = true, date = null, clientId = null) => {
    try {
      const payload = {
        routine_day_exercise_id: routineDayExerciseId,
        completed,
        completed_date: date
      };
      if (clientId) payload.client_id = clientId;

      const { data: res } = await clienteAxios.post('/routines/check-log', payload);
      if (res.success) {
        setDailyLogs(prev => ({
          ...(prev || {}),
          [routineDayExerciseId]: completed
        }));
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al actualizar checklist';
      mostrarAlerta(msg, true);
    }
  };

  const createWeeklyPlan = useCallback(async (routinePayload) => {
    try {
      const { data: res } = await clienteAxios.post('/routines/weekly-plan', routinePayload);
      if (res.success) {
        mostrarAlerta('Plan semanal asignado exitosamente', false);
        try {
          await fetchMyRoutine();
        } catch (_) {}
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al crear rutina';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  }, [fetchMyRoutine, mostrarAlerta]);

  return (
    <RoutineContext.Provider
      value={{
        myRoutine,
        exercises,
        muscleGroups,
        dailyLogs,
        loading,
        fetchMyRoutine,
        fetchExercises,
        fetchMuscleGroups,
        fetchDailyLogs,
        createExercise,
        updateExercise,
        deleteExercise,
        createMuscleGroup,
        toggleExerciseLog,
        createWeeklyPlan,
        fetchClientRoutine,
        normalizeRoutine,
        DAY_MAP_EN_TO_ES,
        DAY_MAP_ES_TO_EN
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
};
