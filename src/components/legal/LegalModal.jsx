import React, { useState, useEffect } from 'react';
import { HiX, HiShieldCheck, HiDocumentText, HiCog } from 'react-icons/hi';
import clienteAxios from '../../config/clienteAxios';
import { DEFAULT_LEGAL_CONFIG, buildLegalDocuments } from '../../constants/legalTexts';

const LegalModal = ({
  isOpen,
  initialTab = 'terms',
  onClose,
  onAcceptTermsAndPrivacy,
  onOpenCookieSettings
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [legalConfig, setLegalConfig] = useState(DEFAULT_LEGAL_CONFIG);
  const [documents, setDocuments] = useState(() => buildLegalDocuments(DEFAULT_LEGAL_CONFIG));

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    let mounted = true;
    if (isOpen) {
      clienteAxios
        .get('/legal/documents')
        .then(({ data: res }) => {
          if (mounted && res?.success && res?.data) {
            if (res.data.config) setLegalConfig(res.data.config);
            if (res.data.documents) {
              setDocuments({
                ...buildLegalDocuments(res.data.config || DEFAULT_LEGAL_CONFIG),
                ...res.data.documents
              });
            }
          }
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDoc = documents[activeTab] || documents.terms;

  const tabs = [
    { id: 'privacy', label: '🛡️ Política de Privacidad' },
    { id: 'terms', label: '📜 Términos y Condiciones' },
    { id: 'cookies', label: '🍪 Política de Cookies' },
    { id: 'notice', label: '⚖️ Aviso Legal' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
              {legalConfig.companyName} • NIT {legalConfig.nit}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">
              {currentDoc.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs leading-relaxed flex-1">
          <div className="px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 font-semibold flex items-center justify-between">
            <span>📅 Última actualización: {currentDoc.lastUpdated}</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black">
              Versión {currentDoc.version}
            </span>
          </div>

          {(currentDoc.sections || []).map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-900">{sec.heading}</h4>
              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {sec.body}
              </p>
            </div>
          ))}

          {activeTab === 'cookies' && onOpenCookieSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCookieSettings();
              }}
              className="mt-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <HiCog className="w-4 h-4 text-indigo-600" />
              <span>Configurar mis Preferencias de Cookies</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          {onAcceptTermsAndPrivacy ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  onAcceptTermsAndPrivacy({
                    termsVersion: legalConfig.termsVersion || 'v1.0',
                    privacyVersion: legalConfig.privacyVersion || 'v1.0'
                  });
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer"
              >
                <HiShieldCheck className="w-4 h-4" />
                <span>He leído y acepto los Términos y la Política de Datos</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
