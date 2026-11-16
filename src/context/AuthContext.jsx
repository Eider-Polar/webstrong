import React, { createContext, useState, useEffect, useCallback } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useAlerta } from '../hooks/useAlerta';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const { mostrarAlerta } = useAlerta();

  const normalizeClientData = (c) => {
    // Buscar la suscripción más reciente por fecha de vencimiento o creación
    const subs = [...(c.subscriptions || [])].sort((a, b) => {
      const dateA = new Date(a.end_date || a.created_at || 0).getTime();
      const dateB = new Date(b.end_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });
    const latestSub = subs.length > 0 ? subs[0] : null;
    
    let expirationFormatted = null;
    let daysRemaining = null;
    let isSubActive = false;

    if (latestSub && latestSub.end_date) {
      const endD = new Date(latestSub.end_date);
      const now = new Date();
      // Diferencia en días
      const diffTime = endD.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const day = endD.getDate().toString().padStart(2, '0');
      const month = (endD.getMonth() + 1).toString().padStart(2, '0');
      const year = endD.getFullYear();
      expirationFormatted = `${day}/${month}/${year}`;

      isSubActive = latestSub.status === 'ACTIVE' && daysRemaining >= 0 && latestSub.access_allowed !== false;
    } else if (latestSub) {
      isSubActive = latestSub.status === 'ACTIVE' && latestSub.access_allowed !== false;
    }

    return {
      id: c.id.toString(),
      name: c.full_name,
      email: c.email,
      phone: c.phone,
      document_id: c.document_id,
      avatar_url: c.avatar_url,
      active: isSubActive,
      role: c.role,
      planName: latestSub?.plan?.name || (isSubActive ? 'Plan General' : null),
      expirationDate: expirationFormatted,
      rawExpirationDate: latestSub?.end_date || null,
      startDate: latestSub?.start_date || null,
      daysRemaining: daysRemaining,
      subscriptionStatus: latestSub?.status || (isSubActive ? 'ACTIVE' : 'EXPIRED'),
      healthForm: c.medicalRecord ? {
        enfermedades: c.medicalRecord.enfermedades || c.medicalRecord.illnesses || 'Ninguna',
        cirugias: c.medicalRecord.cirugias || c.medicalRecord.surgeries || 'Ninguna',
        lesiones: c.medicalRecord.lesiones || c.medicalRecord.injuries || 'Ninguna',
        medicamentos: c.medicalRecord.medicamentos || c.medicalRecord.prescribed_meds || 'Ninguno',
        observaciones: c.medicalRecord.observaciones || c.medicalRecord.emergency_notes || '',
        contactoEmergencia: c.medicalRecord.contactoEmergencia || c.medicalRecord.emergency_contact_name || '',
        telefonoEmergencia: c.medicalRecord.telefonoEmergencia || c.medicalRecord.emergency_contact_phone || '',
        tipoSangre: c.medicalRecord.tipoSangre || c.medicalRecord.blood_type || '',
        ...c.medicalRecord
      } : {
        enfermedades: 'Ninguna',
        cirugias: 'Ninguna',
        lesiones: 'Ninguna',
        medicamentos: 'Ninguno',
        observaciones: ''
      },
      measurements: (c.evaluations && c.evaluations[0]) ? {
        peso: c.evaluations[0].weight_kg,
        altura: c.evaluations[0].height_cm,
        pecho: c.evaluations[0].chest_cm,
        cintura: c.evaluations[0].waist_cm,
        cadera: c.evaluations[0].hip_cm,
        brazo: c.evaluations[0].right_arm_cm,
        pierna: c.evaluations[0].right_thigh_cm,
        pantorrilla: c.evaluations[0].right_calf_cm,
        fecha: c.evaluations[0].evaluation_date
      } : null,
      routine: {}
    };
  };

  const fetchClients = useCallback(async () => {
    try {
      const { data: res } = await clienteAxios.get('/users?role=CLIENT');
      if (res.success && res.data) {
        const normalized = (res.data.rows || []).map(c => normalizeClientData(c));
        setClients(normalized);
      }
    } catch (err) {
      console.warn('Error al cargar lista de clientes:', err);
    }
  }, []);

  const fetchWorkers = useCallback(async () => {
    try {
      const { data: res } = await clienteAxios.get('/users?role=WORKER');
      if (res.success && res.data) {
        const normalized = (res.data.rows || []).map(w => ({
          id: w.id.toString(),
          name: w.full_name,
          email: w.email,
          phone: w.phone,
          document_id: w.document_id,
          avatar_url: w.avatar_url,
          active: w.is_active,
          role: w.role,
          created_at: w.created_at
        }));
        setWorkers(normalized);
      }
    } catch (err) {
      console.warn('Error al cargar lista de empleados:', err);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) return null;
      const { data: res } = await clienteAxios.get('/users/profile');
      if (res.success && res.data) {
        const userObj = res.data.role === 'CLIENT' ? normalizeClientData(res.data) : res.data;
        setUser(userObj);
        localStorage.setItem('user', JSON.stringify(userObj));
        return userObj;
      }
      return null;
    } catch (err) {
      console.warn('Error al verificar perfil de usuario:', err);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.error(e);
    }
    setToken(null);
    setUser(null);
    setClients([]);
    setWorkers([]);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          const userObj = await fetchProfile();
          if (userObj) {
            if (['ADMIN', 'WORKER'].includes(userObj.role)) {
              fetchClients();
            }
            if (userObj.role === 'ADMIN') {
              fetchWorkers();
            }
          } else {
            logout();
          }
        }
      } catch (err) {
        console.warn('Error al verificar sesión existente:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchProfile, fetchClients, fetchWorkers, logout]);

  const extractErrorMessage = (err) => {
    if (!err) return null;
    if (typeof err === 'string') return err;
    if (err.response?.data) {
      const data = err.response.data;
      if (data.msg) return data.msg;
      if (data.message) return data.message;
      if (data.error) return data.error;
    }
    return err.message || 'Error de conexión con el servidor';
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.post('/users/login', {
        email: email.trim(),
        password: password.trim()
      });

      if (res.success && res.data) {
        const { user: rawUser, token: jwtToken } = res.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);

        let finalUser = rawUser;
        if (rawUser.role === 'CLIENT') {
          try {
            const { data: profRes } = await clienteAxios.get('/users/profile', {
              headers: { Authorization: `Bearer ${jwtToken}` }
            });
            if (profRes.success && profRes.data) {
              finalUser = normalizeClientData(profRes.data);
            } else {
              finalUser = normalizeClientData(rawUser);
            }
          } catch {
            finalUser = normalizeClientData(rawUser);
          }
        }

        localStorage.setItem('user', JSON.stringify(finalUser));
        setUser(finalUser);
        mostrarAlerta(`¡Bienvenido, ${finalUser.full_name || finalUser.name}!`, false);

        if (['ADMIN', 'WORKER'].includes(rawUser.role)) {
          fetchClients();
        }
        if (rawUser.role === 'ADMIN') {
          fetchWorkers();
        }

        return { success: true, user: finalUser };
      } else {
        throw new Error(res.msg || 'No se pudo iniciar sesión.');
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.post('/users/register', userData);
      if (res.success && res.data) {
        const { user: newUser, token: jwtToken, requireVerification, message } = res.data;
        
        if (requireVerification) {
          mostrarAlerta(message || 'Te enviamos un código PIN de 6 dígitos a tu correo', false);
          return { success: true, requireVerification: true, email: newUser.email, user: newUser };
        }

        if (jwtToken) {
          localStorage.setItem('token', jwtToken);
          localStorage.setItem('user', JSON.stringify(newUser));
          setToken(jwtToken);
          setUser(newUser);
        }

        mostrarAlerta('Cuenta creada exitosamente', false);
        return { success: true, requireVerification: false, user: newUser };
      }
      throw new Error(res.msg || 'Error al registrar usuario.');
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (emailOrCode, maybeCode) => {
    setLoading(true);
    try {
      let email = null;
      let code = null;

      if (maybeCode !== undefined && maybeCode !== null) {
        email = emailOrCode;
        code = maybeCode;
      } else {
        code = emailOrCode;
      }

      const payload = {
        code: code ? code.toString().trim() : ''
      };
      if (email && email.trim()) {
        payload.email = email.trim().toLowerCase();
      }

      const { data: res } = await clienteAxios.post('/users/verify-email', payload);

      if (res.success && res.data) {
        const { user: verifiedUser, token: jwtToken, message } = res.data;
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        localStorage.removeItem('pending_verification_email');

        setToken(jwtToken);
        setUser(verifiedUser);
        mostrarAlerta(message || '¡Cuenta verificada con éxito!', false);
        return { success: true, user: verifiedUser, token: jwtToken };
      }
      throw new Error(res.msg || 'Código incorrecto');
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationCode = async (email) => {
    try {
      const { data: res } = await clienteAxios.post('/users/resend-code', {
        email: email.trim()
      });
      if (res.success) {
        mostrarAlerta(res.data?.message || 'Código reenviado a tu correo', false);
        return { success: true };
      }
      throw new Error(res.msg || 'No se pudo reenviar el código');
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.post('/users/forgot-password', {
        email: email.trim().toLowerCase()
      });
      if (res.success) {
        mostrarAlerta(res.data?.message || 'Código de recuperación enviado', false);
        return { success: true, message: res.data?.message };
      }
      throw new Error(res.msg || 'No se pudo solicitar la recuperación');
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (code, newPassword, email = null) => {
    setLoading(true);
    try {
      const payload = {
        code: code.toString().trim(),
        password: newPassword
      };
      if (email && email.trim()) {
        payload.email = email.trim().toLowerCase();
      }

      const { data: res } = await clienteAxios.post('/users/reset-password', payload);
      if (res.success) {
        mostrarAlerta(res.data?.message || 'Contraseña restablecida exitosamente', false);
        return { success: true, message: res.data?.message };
      }
      throw new Error(res.msg || 'No se pudo restablecer la contraseña');
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteMyAccount = async () => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.delete('/users/profile/delete-my-account');
      await logout();
      mostrarAlerta(res?.data?.message || 'Tu cuenta y datos han sido eliminados correctamente.', false);
      return { success: true };
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createWorker = async (workerData) => {
    try {
      const { data: res } = await clienteAxios.post('/users', {
        document_id: workerData.document_id.trim(),
        full_name: workerData.full_name.trim(),
        email: workerData.email.trim().toLowerCase(),
        password: workerData.password.trim(),
        phone: workerData.phone?.trim() || null,
        role: workerData.role || 'WORKER',
        is_active: true
      });
      if (res.success) {
        mostrarAlerta(`Empleado "${workerData.full_name}" registrado exitosamente`, false);
        await fetchWorkers();
        return res.data;
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      throw new Error(errorMsg);
    }
  };

  const deleteWorker = async (workerId) => {
    try {
      const { data: res } = await clienteAxios.delete(`/users/${workerId}`);
      if (res.success) {
        mostrarAlerta('Empleado eliminado del sistema', false);
        await fetchWorkers();
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      throw new Error(errorMsg);
    }
  };

  const toggleWorkerStatus = async (workerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await clienteAxios.put(`/users/${workerId}`, {
        is_active: newStatus
      });
      mostrarAlerta(`Empleado ${newStatus ? 'activado' : 'desactivado'} con éxito`, false);
      await fetchWorkers();
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      throw new Error(errorMsg);
    }
  };

  const updateWorker = async (workerId, workerData) => {
    try {
      const payload = {
        full_name: workerData.full_name?.trim(),
        document_id: workerData.document_id?.trim(),
        email: workerData.email?.trim().toLowerCase(),
        phone: workerData.phone ? workerData.phone.trim() : null,
        role: workerData.role || 'WORKER',
        is_active: workerData.is_active !== undefined ? workerData.is_active : true
      };
      if (workerData.password && workerData.password.trim()) {
        payload.password = workerData.password.trim();
      }

      const { data: res } = await clienteAxios.put(`/users/${workerId}`, payload);
      if (res.success) {
        mostrarAlerta(`Empleado "${workerData.full_name}" actualizado exitosamente`, false);
        await fetchWorkers();
        return res.data;
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      throw new Error(errorMsg);
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const { data: res } = await clienteAxios.put('/users/profile', updateData);
      if (res.success && res.data) {
        // Refrescar el perfil completo para no perder suscripciones ni datos normalizados
        const refreshedUser = await fetchProfile();
        mostrarAlerta('Perfil actualizado correctamente', false);
        return { success: true, user: refreshedUser || res.data };
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
      return { success: false, error: errorMsg };
    }
  };

  const updateAvatar = async (imageInput) => {
    try {
      const { uploadUserProfileAvatar } = await import('../services/cloudinary');
      const res = await uploadUserProfileAvatar(imageInput);
      if (res && res.avatar_url) {
        // Guardar avatar_url en la base de datos de PostgreSQL
        await clienteAxios.put('/users/profile', { avatar_url: res.avatar_url });
        await fetchProfile();
        mostrarAlerta('Foto de perfil actualizada exitosamente', false);
        return res.avatar_url;
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error);
      mostrarAlerta(errorMsg, true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: (user?.role || 'CLIENT').toLowerCase(),
        isAdmin: user?.role === 'ADMIN',
        isWorker: user?.role === 'WORKER',
        isClient: user?.role === 'CLIENT',
        clients,
        fetchClients,
        workers,
        fetchWorkers,
        createWorker,
        updateWorker,
        deleteWorker,
        toggleWorkerStatus,
        login,
        register,
        verifyEmail,
        resendVerificationCode,
        forgotPassword,
        resetPassword,
        deleteMyAccount,
        logout,
        fetchProfile,
        updateProfile,
        updateAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
