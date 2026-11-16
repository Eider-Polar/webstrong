import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import clienteAxios from '../config/clienteAxios';
import { DEFAULT_LEGAL_CONFIG, buildLegalDocuments } from '../constants/legalTexts';
import { PageHeader } from '../components';
import { HiShieldCheck, HiCog } from 'react-icons/hi';

const LegalCenter = ({ onOpenCookies }) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('privacy');
  const [legalConfig, setLegalConfig] = useState(DEFAULT_LEGAL_CONFIG);
  const [documents, setDocuments] = useState(() => buildLegalDocuments(DEFAULT_LEGAL_CONFIG));
  const [auditLogs, setAuditLogs] = useState([]);
  const [myConsents, setMyConsents] = useState([]);

  useEffect(() => {
    clienteAxios
      .get('/legal/documents')
      .then(({ data: res }) => {
        if (res?.success && res?.data) {
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

    clienteAxios
      .get('/legal/my-consents')
      .then(({ data: res }) => {
        if (res?.success && Array.isArray(res.data)) {
          setMyConsents(res.data);
        }
      })
      .catch(() => {});

    if (isAdmin) {
      clienteAxios
        .get('/legal/audit-logs?limit=50')
        .then(({ data: res }) => {
          if (res?.success && res?.data?.rows) {
            setAuditLogs(res.data.rows);
          }
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const tabs = [
    { id: 'privacy', label: '🛡️ Política de Privacidad' },
    { id: 'terms', label: '📜 Términos y Condiciones' },
    { id: 'cookies', label: '🍪 Política de Cookies' },
    { id: 'notice', label: '⚖️ Aviso Legal' },
    ...(isAdmin ? [{ id: 'audit', label: '📋 Logs de Auditoría (Opt-in)' }] : [])
  ];

  const currentDoc = documents[activeTab] || documents.privacy;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centro Legal, Privacidad y Transparencia"
        subtitle={`Titular Legal: ${legalConfig.companyName} • NIT: ${legalConfig.nit} • Contacto Legal: ${legalConfig.email}`}
        badge="Habeas Data & Cumplimiento Legal"
        badgeIcon={HiShieldCheck}
        badgeColor="indigo"
        actions={
          onOpenCookies && (
            <button
              type="button"
              onClick={onOpenCookies}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <HiCog className="w-4 h-4" />
              <span>Preferencias de Cookies</span>
            </button>
          )
        }
      />

      {/* Selector de Documentos */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'audit' && isAdmin ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Registro de Auditoría Legal de Consentimientos (user_consent_logs)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Respaldo probatorio con fecha, hora exacta, versión aceptada y dirección IP de cada usuario.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400">
                  <th className="py-3 px-4">Usuario / Correo</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Tipo Consentimiento</th>
                  <th className="py-3 px-4">Versión</th>
                  <th className="py-3 px-4">IP</th>
                  <th className="py-3 px-4">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No hay registros de auditoría disponibles.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.user?.full_name || log.user_email || 'Visitante Web'}
                        {log.user_email && (
                          <span className="block text-[11px] font-normal text-slate-500">
                            {log.user_email}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{log.document_id || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          {log.consent_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        T&C {log.terms_version} / Priv {log.privacy_version}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{log.ip_address || 'Local'}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(log.accepted_at).toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900">{currentDoc.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Última actualización: {currentDoc.lastUpdated}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black">
              Versión Vigente {currentDoc.version}
            </span>
          </div>

          <div className="space-y-5">
            {(currentDoc.sections || []).map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="text-sm font-black text-indigo-950">{sec.heading}</h4>
                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>

          {myConsents.length > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <p className="font-black">✓ Tu constancia de aceptación legal registrada</p>
              <p className="mt-0.5">
                Aceptaste expresamente la versión <strong>{myConsents[0].terms_version}</strong> el{' '}
                <strong>{new Date(myConsents[0].accepted_at).toLocaleString('es-CO')}</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LegalCenter;
