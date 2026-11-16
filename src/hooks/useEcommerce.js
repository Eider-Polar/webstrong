import { useContext } from 'react';
import { EcommerceContext } from '../context/EcommerceContext';

export const useEcommerce = () => {
  const context = useContext(EcommerceContext);
  if (!context) throw new Error('useEcommerce debe usarse dentro de EcommerceProvider');
  return context;
};

export default useEcommerce;
