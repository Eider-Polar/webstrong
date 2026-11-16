import { useContext } from 'react';
import { MedicalRecordContext } from '../context/MedicalRecordContext';

export const useMedicalRecord = () => {
  const context = useContext(MedicalRecordContext);
  if (!context) throw new Error('useMedicalRecord debe usarse dentro de MedicalRecordProvider');
  return context;
};

export default useMedicalRecord;
