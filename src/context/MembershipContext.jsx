import React, { createContext, useState, useCallback } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useAlerta } from '../hooks/useAlerta';

export const MembershipContext = createContext();

export const MembershipProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { mostrarAlerta } = useAlerta();

  const fetchPlans = useCallback(async (onlyAvailable = true) => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get(`/memberships/plans?available=${onlyAvailable}`);
      if (res.success && res.data) {
        const normalized = (res.data || []).map(p => ({
          ...p,
          price: parseFloat(p.price_cop || 0),
          durationDays: p.duration_days,
          features: Array.isArray(p.benefits) ? p.benefits : [],
          badge: p.promo_badge
        }));
        setPlans(normalized);
      }
    } catch (err) {
      console.error('Error al cargar planes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPlan = async (planData) => {
    try {
      const payload = {
        name: planData.name,
        price_cop: parseFloat(planData.price),
        duration_days: parseInt(planData.durationDays || 30),
        benefits: planData.features || [],
        promo_badge: planData.badge || null,
        is_available: true
      };

      const { data: res } = await clienteAxios.post('/memberships/plans', payload);
      if (res.success) {
        mostrarAlerta('Plan de membresía creado exitosamente', false);
        await fetchPlans();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al crear plan';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const deletePlan = async (planId) => {
    try {
      const { data: res } = await clienteAxios.delete(`/memberships/plans/${planId}`);
      if (res.success) {
        mostrarAlerta('Plan eliminado correctamente', false);
        await fetchPlans();
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al eliminar plan';
      mostrarAlerta(msg, true);
    }
  };

  const [subscriptions, setSubscriptions] = useState([]);

  const fetchSubscriptions = useCallback(async (status = null) => {
    setLoading(true);
    try {
      const url = status ? `/memberships/subscriptions?status=${status}` : '/memberships/subscriptions';
      const { data: res } = await clienteAxios.get(url);
      if (res.success && res.data) {
        setSubscriptions(res.data.rows || []);
      }
    } catch (err) {
      console.error('Error al cargar suscripciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscriptionStatus = async (id, statusData) => {
    try {
      const { data: res } = await clienteAxios.patch(`/memberships/subscriptions/${id}/status`, statusData);
      if (res.success) {
        mostrarAlerta('Estado de membresía actualizado', false);
        await fetchSubscriptions();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al actualizar suscripción';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const fetchMySubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get('/memberships/my-subscriptions');
      if (res.success && res.data) {
        setMySubscriptions(res.data.rows || []);
      }
    } catch (err) {
      console.error('Error al cargar mis suscripciones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkClientAccess = async (identifier) => {
    try {
      const { data: res } = await clienteAxios.get(`/memberships/access/${identifier}`);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al validar acceso';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const assignSubscription = async (clientId, planId, startDate = null) => {
    try {
      const { data: res } = await clienteAxios.post('/memberships/subscriptions', {
        client_id: parseInt(clientId),
        plan_id: parseInt(planId),
        start_date: startDate || new Date().toISOString().split('T')[0]
      });
      if (res.success) {
        mostrarAlerta('Membresía asignada exitosamente al socio', false);
        await fetchSubscriptions();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al asignar membresía';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  return (
    <MembershipContext.Provider
      value={{
        plans,
        subscriptions,
        mySubscriptions,
        loading,
        fetchPlans,
        fetchSubscriptions,
        addPlan,
        deletePlan,
        fetchMySubscriptions,
        checkClientAccess,
        assignSubscription,
        updateSubscriptionStatus
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
};
