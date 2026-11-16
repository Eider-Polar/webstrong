import { useContext } from 'react';
import { MembershipContext } from '../context/MembershipContext';

export const useMembership = () => {
  const context = useContext(MembershipContext);
  if (!context) throw new Error('useMembership debe usarse dentro de MembershipProvider');
  return context;
};

export default useMembership;
