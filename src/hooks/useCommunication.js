import { useContext } from 'react';
import { CommunicationContext } from '../context/CommunicationContext';

export const useCommunication = () => {
  const context = useContext(CommunicationContext);
  if (!context) throw new Error('useCommunication debe usarse dentro de CommunicationProvider');
  return context;
};

export default useCommunication;
