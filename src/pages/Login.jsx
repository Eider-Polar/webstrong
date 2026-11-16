import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import LegalModal from '../components/legal/LegalModal';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import {
  HiMail,
  HiLockClosed,
  HiKey,
  HiShieldCheck,
  HiArrowLeft,
  HiRefresh,
  HiCheckCircle
} from 'react-icons/hi';

const Login = () => {
  const {
    login,
    register,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword
  } = useAuth();
  const { mostrarAlerta } = useAlerta();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Modos: 'login' | 'register' | 'verify' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  // Consentimiento Expreso (Opt-in desmarcado por defecto)
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('terms');
  const [acceptedVersions, setAcceptedVersions] = useState({ termsVersion: 'v1.0', privacyVersion: 'v1.0' });

  // Estados para verificación y recuperación con PIN de 6 dígitos
  const [pendingEmail, setPendingEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Detectar parámetros de URL (ej: /verify-email?code=123456&email=foo@bar.com)
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlEmail = searchParams.get('email');
    const urlCode = searchParams.get('code') || searchParams.get('token');

    if (urlEmail) {
      setEmail(urlEmail);
      setPendingEmail(urlEmail);
    }
    if (urlCode) {
      setVerificationCode(urlCode.replace(/\D/g, '').slice(0, 6));
    }

    if (urlMode === 'register') {
      setMode('register');
    } else if (urlMode === 'login') {
      setMode('login');
    } else if (location.pathname === '/verify-email' || urlMode === 'verify') {
      setMode('verify');
    } else if (location.pathname === '/reset-password' || urlMode === 'reset') {
      setMode('reset');
    }
  }, [searchParams, location.pathname]);

  // Manejo de inicio de sesión
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      mostrarAlerta('Por favor ingresa tu correo y contraseña', true);
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      // Si el backend indica que requiere verificación de correo
      if (res && !res.success && res.error) {
        const errLower = res.error.toLowerCase();
        if (
          errLower.includes('verificar') ||
          errLower.includes('código') ||
          errLower.includes('pin') ||
          errLower.includes('bandeja')
        ) {
          setPendingEmail(email.trim());
          setVerificationCode('');
          setMode('verify');
        }
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim() || !documentId.trim()) {
      mostrarAlerta('Completa todos los campos obligatorios (Nombre, Documento, Correo y Contraseña)', true);
      return;
    }

    if (!acceptedTerms) {
      mostrarAlerta('Debes leer y aceptar expresamente los Términos y Condiciones y la Política de Tratamiento de Datos', true);
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        document_id: documentId.trim(),
        accepted_terms: true,
        terms_version: acceptedVersions.termsVersion || 'v1.0',
        privacy_version: acceptedVersions.privacyVersion || 'v1.0'
      });

      if (res && res.success) {
        setPendingEmail(email.trim());
        setVerificationCode('');
        // Pasar inmediatamente al paso de verificación de 6 dígitos
        setMode('verify');
      }
    } catch (err) {
      console.error('Error al registrarse:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de verificación del código PIN de 5 dígitos (sin preguntar ni requerir correo)
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim();
    if (!cleanCode || (cleanCode.length !== 5 && cleanCode.length !== 6)) {
      mostrarAlerta('Por favor ingresa el código numérico de 5 dígitos', true);
      return;
    }

    setLoading(true);
    try {
      // Se envía únicamente el código sin requerir ni pedir correo
      const res = await verifyEmail(cleanCode);
      if (res && res.success) {
        mostrarAlerta('¡Cuenta activada y verificada exitosamente!', false);
      }
    } catch (err) {
      console.error('Error al verificar código PIN:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código PIN
  const handleResendCode = async () => {
    const targetEmail = (pendingEmail || email).trim();
    if (!targetEmail) {
      mostrarAlerta('Ingresa tu correo para reenviar el código', true);
      return;
    }

    setResending(true);
    try {
      const res = await resendVerificationCode(targetEmail);
      if (res && res.success) {
        mostrarAlerta(`Nuevo código PIN de 5 dígitos enviado a ${targetEmail}`, false);
      }
    } catch (err) {
      console.error('Error al reenviar código:', err);
    } finally {
      setResending(false);
    }
  };

  // Solicitar recuperación de contraseña
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      mostrarAlerta('Ingresa tu correo para recuperar contraseña', true);
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      if (res && res.success) {
        setPendingEmail(email.trim());
        setVerificationCode('');
        setMode('reset');
      }
    } catch (err) {
      console.error('Error al recuperar contraseña:', err);
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña con el código de 6 dígitos
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      mostrarAlerta('Ingresa el código numérico de 6 dígitos', true);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      mostrarAlerta('La nueva contraseña debe tener al menos 6 caracteres', true);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      mostrarAlerta('Las contraseñas no coinciden', true);
      return;
    }

    const targetEmail = (pendingEmail || email).trim();
    setLoading(true);
    try {
      const res = await resetPassword(cleanCode, newPassword, targetEmail);
      if (res && res.success) {
        mostrarAlerta('Contraseña cambiada con éxito. Ya puedes iniciar sesión.', false);
        setPassword('');
        setVerificationCode('');
        setMode('login');
      }
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl">
      {/* Enlace para volver a la Landing Page */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Volver a la Página de Inicio</span>
        </Link>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-7">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 mx-auto flex items-center justify-center shadow-md shadow-indigo-200 mb-4">
          <span className="text-3xl font-black text-white">S</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">STRONG GYM</h2>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">
          {mode === 'login' && 'Acceso al Sistema'}
          {mode === 'register' && 'Crear Nueva Cuenta'}
          {mode === 'verify' && 'Verificación de Correo'}
          {mode === 'forgot' && 'Recuperación de Contraseña'}
          {mode === 'reset' && 'Nueva Contraseña'}
        </p>
      </div>

      {/* Selector de pestañas para Login y Registro */}
      {(mode === 'login' || mode === 'register') && (
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Registrarse
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. MODO VERIFICACIÓN DE CÓDIGO PIN (5 DÍGITOS)       */}
      {/* ---------------------------------------------------- */}
      {mode === 'verify' && (
        <form onSubmit={handleVerifySubmit} className="space-y-5">
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
              <HiMail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-indigo-950">
              Verifica tu Cuenta
            </h3>
            <p className="text-xs text-indigo-700 mt-1">
              Ingresa el código numérico de 5 dígitos enviado a tu correo:
            </p>
            {(pendingEmail || email) && (
              <div className="mt-2 inline-block px-3 py-1 bg-white rounded-lg border border-indigo-200 text-xs font-bold text-indigo-900 font-mono">
                {pendingEmail || email}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 text-center uppercase tracking-wider mb-2">
              Código PIN de 5 Dígitos *
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={5}
              value={verificationCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 5);
                setVerificationCode(val);
              }}
              placeholder="00000"
              autoFocus
              required
              className="w-full py-3.5 text-center text-3xl font-mono font-black tracking-[0.35em] text-slate-900 bg-slate-50 border-2 border-indigo-300 focus:border-indigo-600 focus:bg-white rounded-2xl focus:outline-none transition-all shadow-inner"
            />
            <p className="text-[11px] text-slate-400 text-center mt-1.5">
              El código es válido durante 15 minutos
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || verificationCode.trim().length < 5}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <HiShieldCheck className="w-5 h-5" />
                <span>Confirmar y Activar Cuenta</span>
              </>
            )}
          </button>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <HiRefresh className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{resending ? 'Reenviando...' : '¿No recibiste el código? Reenviar PIN'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setVerificationCode('');
                setMode('login');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
            >
              ← Volver al inicio de sesión
            </button>
          </div>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MODO RESTABLECER CONTRASEÑA CON PIN (6 DÍGITOS)   */}
      {/* ---------------------------------------------------- */}
      {mode === 'reset' && (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-1.5 shadow-xs">
              <HiKey className="w-4 h-4" />
            </div>
            <p className="text-xs text-amber-900 font-medium">
              Ingresa el código de 6 dígitos enviado a <strong className="font-bold">{pendingEmail || email}</strong> y define tu nueva contraseña.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 text-center uppercase tracking-wider mb-1.5">
              Código de 6 Dígitos *
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(val);
              }}
              placeholder="000000"
              required
              className="w-full py-3 text-center text-2xl font-mono font-black tracking-[0.3em] text-slate-900 bg-slate-50 border-2 border-amber-300 focus:border-amber-500 focus:bg-white rounded-xl focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nueva Contraseña (mínimo 6 caracteres) *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirmar Nueva Contraseña *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || verificationCode.length !== 6 || !newPassword}
            className="w-full mt-2 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Guardar Nueva Contraseña'
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('login')}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-900 font-bold pt-2 cursor-pointer"
          >
            ← Cancelar y volver al inicio de sesión
          </button>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. MODO OLVIDÓ SU CONTRASEÑA                         */}
      {/* ---------------------------------------------------- */}
      {mode === 'forgot' && (
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              placeholder="usuario@stronggym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Te enviaremos un código numérico de 6 dígitos para restablecer tu contraseña.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Enviar Código de Recuperación'
            )}
          </button>

          <button
            type="button"
            onClick={() => setMode('login')}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-900 font-bold pt-2 cursor-pointer"
          >
            ← Volver al inicio de sesión
          </button>
        </form>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. MODO INICIAR SESIÓN Y REGISTRO                    */}
      {/* ---------------------------------------------------- */}
      {(mode === 'login' || mode === 'register') && (
        <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">DNI / Documento</label>
                  <input
                    type="text"
                    placeholder="12345678"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="3001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico *</label>
            <input
              type="email"
              placeholder="usuario@stronggym.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Contraseña *</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : mode === 'login' ? (
              'Entrar a Strong Gym'
            ) : (
              'Crear Cuenta'
            )}
          </button>

          {/* Enlace directo para usuarios que ya tienen un código PIN pendiente */}
          {mode === 'login' && (
            <div className="pt-3 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setPendingEmail(email.trim());
                  setMode('verify');
                }}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                ¿Ya te registraste y tienes un código PIN? <span className="text-indigo-600 underline">Activar cuenta</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Login;
