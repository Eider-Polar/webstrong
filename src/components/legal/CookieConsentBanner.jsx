import React, { useState, useEffect } from 'react';
import clienteAxios from '../../config/clienteAxios';
import LegalModal from './LegalModal';
import { applyCookiePreferences } from '../../utils/cookieManager';

const COOKIE_STORAGE_KEY = 'stronggym_cookie_consent_v1';

const CookieConsentBanner = ({ forceOpen = false, onCloseForce }) => {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [preferencesCookies, setPreferencesCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('cookies');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      } else {
        const parsed = JSON.parse(stored);
        setPreferencesCookies(Boolean(parsed.preferences));
        setAnalyticsCookies(Boolean(parsed.analytics));
        // Aplicar realmente en document.cookie según lo guardado
        applyCookiePreferences({
          decision: parsed.decision || 'CUSTOM',
          preferences: Boolean(parsed.preferences),
          analytics: Boolean(parsed.analytics)
        });
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setVisible(true);
      setShowConfig(true);
    }
  }, [forceOpen]);

  const saveDecision = (decisionType, prefs, analytics) => {
    const payload = {
      decision: decisionType,
      essential: true,
      preferences: prefs,
      analytics: analytics,
      version: 'v1.0',
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(payload));
      // Crear o borrar las cookies reales en document.cookie del navegador
      applyCookiePreferences({
        decision: decisionType,
        preferences: prefs,
        analytics: analytics
      });
    } catch (e) {
      console.warn(e);
    }

    clienteAxios
      .post('/legal/consent', {
        consent_type: 'COOKIES',
        accepted: decisionType !== 'REJECTED_NON_ESSENTIAL',
        terms_version: 'v1.0',
        privacy_version: 'v1.0',
        metadata: payload
      })
      .catch(() => {});

    setVisible(false);
    setShowConfig(false);
    if (onCloseForce) onCloseForce();
  };

  if (!visible) return null;

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
        <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl p-5 md:p-6 max-w-3xl w-full shadow-2xl pointer-events-auto space-y-4">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl shrink-0">🍪</span>
            <div className="space-y-1 text-xs leading-relaxed text-slate-300">
              <h4 className="text-sm font-black text-white">
                Aviso de Cookies y Privacidad
              </h4>
              <p>
                En <strong>STRONG GYM</strong> utilizamos cookies técnicas para mantener tu sesión activa y segura, además de cookies opcionales para recordar tus preferencias y medir el tráfico. Puedes aceptarlas todas, rechazar las no esenciales o configurarlas antes de continuar. Consulta nuestra{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLegalModalTab('cookies');
                    setLegalModalOpen(true);
                  }}
                  className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
                >
                  Política de Cookies
                </button>{' '}
                y el{' '}
                <button
                  type="button"
                  onClick={() => {
                    setLegalModalTab('notice');
                    setLegalModalOpen(true);
                  }}
                  className="text-sky-400 hover:text-sky-300 font-bold underline cursor-pointer"
                >
                  Aviso Legal
                </button>.
              </p>
            </div>
          </div>

          {showConfig && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-white">🔒 Cookies Técnicas y de Sesión (Obligatorias)</p>
                  <p className="text-[11px] text-slate-400">
                    Token JWT de sesión, seguridad y cookie <code className="text-sky-300">stronggym_consent</code>.
                  </p>
                </div>
                <input type="checkbox" checked readOnly disabled className="w-4 h-4 accent-indigo-500" />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-700/70">
                <div>
                  <p className="font-bold text-white">🎨 Cookies de Preferencias</p>
                  <p className="text-[11px] text-slate-400">
                    Activan las cookies <code className="text-sky-300">stronggym_pref_theme</code> y <code className="text-sky-300">stronggym_pref_currency</code>.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferencesCookies}
                  onChange={(e) => setPreferencesCookies(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-700/70">
                <div>
                  <p className="font-bold text-white">📊 Cookies Analíticas y de Tráfico</p>
                  <p className="text-[11px] text-slate-400">
                    Activan <code className="text-sky-300">stronggym_analytics_sid</code> y <code className="text-sky-300">stronggym_page_views</code>.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsCookies}
                  onChange={(e) => setAnalyticsCookies(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => saveDecision('REJECTED_NON_ESSENTIAL', false, false)}
              className="px-4 py-2 rounded-xl border border-slate-600 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Rechazar no esenciales
            </button>

            {!showConfig ? (
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Configurar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => saveDecision('CUSTOM', preferencesCookies, analyticsCookies)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Guardar selección
              </button>
            )}

            <button
              type="button"
              onClick={() => saveDecision('ALL_ACCEPTED', true, true)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>

      <LegalModal
        isOpen={legalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setLegalModalOpen(false)}
      />
    </>
  );
};

export default CookieConsentBanner;
