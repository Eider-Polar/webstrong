import { useContext } from 'react';
import { AlertaContext } from '../context/AlertaContext';

export const useAlerta = () => {
  const context = useContext(AlertaContext);
  if (!context) {
    throw new Error('useAlerta debe usarse dentro de un AlertaProvider');
  }
  return context;
};

export default useAlerta;
