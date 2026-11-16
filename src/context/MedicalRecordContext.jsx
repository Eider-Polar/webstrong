import React, { createContext, useState, useCallback } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useAlerta } from '../hooks/useAlerta';

export const MedicalRecordContext = createContext();

export const MedicalRecordProvider = ({ children }) => {
  const [myRecord, setMyRecord] = useState(null);
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { mostrarAlerta } = useAlerta();

  const fetchMyRecord = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get('/medical-records/clinical/my-record');
      if (res.success && res.data) {
        const d = res.data;
        const normalized = {
          ...d,
          enfermedades: d.enfermedades || d.illnesses || 'Ninguna',
          cirugias: d.cirugias || d.surgeries || 'Ninguna',
          lesiones: d.lesiones || d.injuries || 'Ninguna',
          medicamentos: d.medicamentos || d.prescribed_meds || 'Ninguno',
          observaciones: d.observaciones || d.emergency_notes || '',
          contactoEmergencia: d.contactoEmergencia || d.emergency_contact_name || '',
          telefonoEmergencia: d.telefonoEmergencia || d.emergency_contact_phone || '',
          tipoSangre: d.tipoSangre || d.blood_type || ''
        };
        setMyRecord(normalized);
        return normalized;
      }
    } catch (err) {
      if (err.response?.status !== 404) console.error(err);
      setMyRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get('/medical-records/evaluations/my-evaluations');
      if (res.success) setMyEvaluations(res.data.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvaluation = async (evaluationData) => {
    try {
      const { data: res } = await clienteAxios.post('/medical-records/evaluations', evaluationData);
      if (res.success) {
        mostrarAlerta('Evaluación antropométrica registrada', false);
        await fetchMyEvaluations();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al registrar evaluación';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  return (
    <MedicalRecordContext.Provider
      value={{
        myRecord,
        myEvaluations,
        loading,
        fetchMyRecord,
        fetchMyEvaluations,
        createEvaluation
      }}
    >
      {children}
    </MedicalRecordContext.Provider>
  );
};
