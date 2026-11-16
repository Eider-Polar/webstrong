import React, { useState, useEffect } from 'react';
import useMedicalRecord from '../hooks/useMedicalRecord';
import useAuth from '../hooks/useAuth';
import useAlerta from '../hooks/useAlerta';
import clienteAxios from '../config/clienteAxios';
import { PageHeader, LoadingState, EmptyState } from '../components';
import {
  HiHeart,
  HiShieldCheck,
  HiPencilAlt,
  HiCheckCircle,
  HiX,
  HiTrendingUp,
  HiSparkles
} from 'react-icons/hi';

const MiFichaMedica = () => {
  const { user } = useAuth();
  const { myRecord, myEvaluations, loading, fetchMyRecord, fetchMyEvaluations } =
    useMedicalRecord();
  const { mostrarAlerta } = useAlerta();

  const [activeTab, setActiveTab] = useState('measurements'); // 'measurements' | 'health' | 'history'
  const [isEditingHealth, setIsEditingHealth] = useState(false);
  const [savingHealth, setSavingHealth] = useState(false);

  // Form de Ficha Médica del Cliente
  const [enfermedades, setEnfermedades] = useState('');
  const [cirugias, setCirugias] = useState('');
  const [lesiones, setLesiones] = useState('');
  const [medicamentos, setMedicamentos] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [contactoEmergencia, setContactoEmergencia] = useState('');
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('');

  useEffect(() => {
    fetchMyRecord();
    fetchMyEvaluations();
  }, [fetchMyRecord, fetchMyEvaluations]);

  useEffect(() => {
    if (myRecord) {
      setEnfermedades(myRecord.enfermedades || myRecord.illnesses || 'Ninguna');
      setCirugias(myRecord.cirugias || myRecord.surgeries || 'Ninguna');
      setLesiones(myRecord.lesiones || myRecord.injuries || 'Ninguna');
      setMedicamentos(myRecord.medicamentos || myRecord.prescribed_meds || 'Ninguno');
      setObservaciones(myRecord.observaciones || myRecord.emergency_notes || '');
      setContactoEmergencia(myRecord.contactoEmergencia || myRecord.emergency_contact_name || '');
      setTelefonoEmergencia(myRecord.telefonoEmergencia || myRecord.emergency_contact_phone || '');
    }
  }, [myRecord]);

  const handleSaveHealth = async (e) => {
    e.preventDefault();
    setSavingHealth(true);
    try {
      const payload = {
        illnesses: enfermedades.trim() || 'Ninguna',
        surgeries: cirugias.trim() || 'Ninguna',
        injuries: lesiones.trim() || 'Ninguna',
        prescribed_meds: medicamentos.trim() || 'Ninguno',
        emergency_contact_name: contactoEmergencia.trim() || null,
        emergency_contact_phone: telefonoEmergencia.trim() || null,
        emergency_notes: observaciones.trim() || null
      };

      const { data: res } = await clienteAxios.post('/medical-records/clinical/my-record', payload);
      if (res.success) {
        mostrarAlerta('Ficha médica actualizada correctamente', false);
        setIsEditingHealth(false);
        await fetchMyRecord();
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al actualizar ficha médica';
      mostrarAlerta(msg, true);
    } finally {
      setSavingHealth(false);
    }
  };

  // Última evaluación registrada
  const latestEvaluation = myEvaluations && myEvaluations.length > 0 ? myEvaluations[0] : null;

  // Cálculo de IMC
  const heightM =
    latestEvaluation?.height_cm && parseFloat(latestEvaluation.height_cm) > 0
      ? parseFloat(latestEvaluation.height_cm) / 100
      : 0;
  const bmi =
    latestEvaluation?.weight_kg && heightM > 0
      ? (parseFloat(latestEvaluation.weight_kg) / (heightM * heightM)).toFixed(1)
      : null;

  const getBmiBadge = (val) => {
    const num = parseFloat(val);
    if (!num) return null;
    if (num < 18.5) return { label: 'Bajo peso', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (num <= 24.9) return { label: 'Peso saludable', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (num <= 29.9) return { label: 'Sobrepeso', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    return { label: 'Obesidad', color: 'bg-rose-100 text-rose-800 border-rose-200' };
  };

  const bmiBadge = getBmiBadge(bmi);

  const measurementCards = [
    { label: 'Peso Corporal', value: latestEvaluation?.weight_kg, unit: 'kg', icon: '⚖️' },
    { label: 'Estatura', value: latestEvaluation?.height_cm, unit: 'cm', icon: '📏' },
    { label: 'Hombros', value: latestEvaluation?.shoulders_cm, unit: 'cm', icon: '📐' },
    { label: 'Pectoral / Pecho', value: latestEvaluation?.chest_cm, unit: 'cm', icon: '🫁' },
    { label: 'Cintura', value: latestEvaluation?.waist_cm, unit: 'cm', icon: '🎯' },
    { label: 'Cadera', value: latestEvaluation?.hip_cm, unit: 'cm', icon: '✨' },
    { label: 'Glúteo', value: latestEvaluation?.glutes_cm, unit: 'cm', icon: '🍑' },
    { label: 'Muslo Superior', value: latestEvaluation?.right_thigh_cm, unit: 'cm', icon: '🦵' },
    { label: 'Muslo Medio', value: latestEvaluation?.left_thigh_cm, unit: 'cm', icon: '🍗' },
    { label: 'Pantorrilla', value: latestEvaluation?.right_calf_cm, unit: 'cm', icon: '🏃' },
    { label: 'Brazo', value: latestEvaluation?.right_arm_cm, unit: 'cm', icon: '💪' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        badge="Expediente Físico y Salud"
        title="Mi Ficha Antropométrica y Médica"
        subtitle="Revisa la evolución de tus medidas corporales, Índice de Masa Corporal y antecedentes médicos."
        actions={
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('measurements')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'measurements'
                  ? 'bg-white text-rose-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📏 Medidas Actuales
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'health'
                  ? 'bg-white text-sky-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏥 Ficha Médica
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-indigo-700 shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Historial ({myEvaluations?.length || 0})
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState message="Cargando expediente médico..." color="rose" />
      ) : activeTab === 'measurements' ? (
        /* ================= PESTAÑA 1: MEDIDAS ACTUALES ================= */
        <div className="space-y-6">
          {/* Banner de Resumen Antropométrico */}
          {latestEvaluation ? (
            <div className="bg-gradient-to-r from-rose-50 via-purple-50 to-indigo-50 border border-rose-100/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-rose-200">
                  🏃
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase text-rose-600 tracking-wider">
                    Última Medición Registrada
                  </p>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {new Date(latestEvaluation.evaluation_date || latestEvaluation.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tomada por tu entrenador en STRONG GYM
                  </p>
                </div>
              </div>

              {bmi && (
                <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Índice de Masa Corporal</span>
                    <p className="text-2xl font-black text-slate-900">IMC {bmi}</p>
                  </div>
                  {bmiBadge && (
                    <span className={`px-3 py-1 rounded-full text-xs font-black border ${bmiBadge.color}`}>
                      {bmiBadge.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mx-auto mb-3">
                📏
              </div>
              <h4 className="text-lg font-black text-slate-900">¡Aún no tienes mediciones registradas!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Acércate a cualquiera de nuestros entrenadores en el gimnasio para que realicen tu evaluación antropométrica inicial y lleves el control de tu evolución corporal.
              </p>
            </div>
          )}

          {/* Grid de Medidas (11 puntos) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {measurementCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-rose-200 transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">{card.label}</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900">
                      {card.value ? card.value : '--'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{card.unit}</span>
                  </div>
                </div>
                <span className="text-2xl opacity-80">{card.icon}</span>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'health' ? (
        /* ================= PESTAÑA 2: FICHA MÉDICA Y SALUD ================= */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
                Antecedentes de Salud
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                Ficha Médica y Recomendaciones
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mantén tus datos médicos actualizados para que nuestros entrenadores adapten tu rutina con seguridad.
              </p>
            </div>

            {!isEditingHealth && (
              <button
                onClick={() => setIsEditingHealth(true)}
                className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HiPencilAlt className="w-4 h-4" />
                <span>Editar Ficha</span>
              </button>
            )}
          </div>

          {!isEditingHealth ? (
            /* Vista de solo lectura */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-400">
                  Enfermedades o Condiciones Médicas
                </span>
                <p className="text-sm font-bold text-slate-900">{enfermedades || 'Ninguna'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-400">
                  Operaciones o Cirugías Previas
                </span>
                <p className="text-sm font-bold text-slate-900">{cirugias || 'Ninguna'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                <span className="text-[11px] font-black uppercase text-amber-700">
                  ⚠️ Lesiones o Dolores Reportados
                </span>
                <p className="text-sm font-bold text-slate-900">{lesiones || 'Ninguna'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-400">
                  Medicamentos Actuales
                </span>
                <p className="text-sm font-bold text-slate-900">{medicamentos || 'Ninguno'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <span className="text-[11px] font-black uppercase text-indigo-700">
                  Contacto de Emergencia
                </span>
                <p className="text-sm font-bold text-slate-900">{contactoEmergencia || 'No registrado'}</p>
                <p className="text-xs font-medium text-indigo-600">{telefonoEmergencia || 'Sin teléfono'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-black uppercase text-slate-400">
                  Observaciones o Notas Adicionales
                </span>
                <p className="text-sm font-medium text-slate-700">{observaciones || 'Sin observaciones'}</p>
              </div>
            </div>
          ) : (
            /* Formulario de Edición */
            <form onSubmit={handleSaveHealth} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enfermedades o Condiciones
                  </label>
                  <input
                    type="text"
                    value={enfermedades}
                    onChange={(e) => setEnfermedades(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    placeholder="ej. Asma, Hipertensión, Ninguna..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Operaciones o Cirugías
                  </label>
                  <input
                    type="text"
                    value={cirugias}
                    onChange={(e) => setCirugias(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    placeholder="ej. Meniscos rodilla (2022), Ninguna..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lesiones o Dolores Articulares
                  </label>
                  <input
                    type="text"
                    value={lesiones}
                    onChange={(e) => setLesiones(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    placeholder="ej. Molestia hombro izquierdo, Ninguna..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medicamentos Actuales
                  </label>
                  <input
                    type="text"
                    value={medicamentos}
                    onChange={(e) => setMedicamentos(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    placeholder="ej. Inhalador salbutamol, Ninguno..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contacto de Emergencia
                  </label>
                  <input
                    type="text"
                    value={contactoEmergencia}
                    onChange={(e) => setContactoEmergencia(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    placeholder="Nombre familiar / tutor"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono de Emergencia
                  </label>
                  <input
                    type="tel"
                    value={telefonoEmergencia}
                    onChange={(e) => setTelefonoEmergencia(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500"
                    placeholder="ej. +57 300 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones Clínicas Adicionales
                </label>
                <textarea
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-sky-500 resize-none"
                  placeholder="Notas de salud que tu entrenador debe tener en cuenta al entrenar..."
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={savingHealth}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  {savingHealth ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditingHealth(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ================= PESTAÑA 3: HISTORIAL DE EVALUACIONES ================= */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Historial Antropométrico</h3>
              <p className="text-xs text-slate-400">Tus evaluaciones registradas en STRONG GYM</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black">
              {myEvaluations?.length || 0} mediciones
            </span>
          </div>

          <div className="space-y-3">
            {!myEvaluations || myEvaluations.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <p className="text-xs font-bold text-slate-500">Sin historial de mediciones</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cuando tu entrenador registre tu primera evaluación, verás aquí tu progreso a través del tiempo.
                </p>
              </div>
            ) : (
              myEvaluations.map((ev, idx) => {
                const hM = parseFloat(ev.height_cm) > 0 ? parseFloat(ev.height_cm) / 100 : 0;
                const bmiVal =
                  hM > 0 && parseFloat(ev.weight_kg) > 0
                    ? (parseFloat(ev.weight_kg) / (hM * hM)).toFixed(1)
                    : null;
                const badge = getBmiBadge(bmiVal);

                return (
                  <div
                    key={ev.id || idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-900 text-sm">
                        📅 {ev.evaluation_date || new Date(ev.created_at).toLocaleDateString('es-CO')}
                      </span>
                      <div className="flex items-center gap-2">
                        {badge && (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                            IMC {bmiVal} - {badge.label}
                          </span>
                        )}
                        <span className="text-rose-600 font-black text-sm">{ev.weight_kg} kg</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 text-xs text-slate-700 pt-2 border-t border-slate-200/60">
                      {ev.height_cm && <div>Altura: <strong>{ev.height_cm} cm</strong></div>}
                      {ev.shoulders_cm && <div>Hombros: <strong>{ev.shoulders_cm} cm</strong></div>}
                      {ev.chest_cm && <div>Pectoral: <strong>{ev.chest_cm} cm</strong></div>}
                      {ev.waist_cm && <div>Cintura: <strong>{ev.waist_cm} cm</strong></div>}
                      {ev.hip_cm && <div>Cadera: <strong>{ev.hip_cm} cm</strong></div>}
                      {ev.glutes_cm && <div>Glúteo: <strong>{ev.glutes_cm} cm</strong></div>}
                      {ev.right_thigh_cm && <div>Muslo Sup: <strong>{ev.right_thigh_cm} cm</strong></div>}
                      {ev.left_thigh_cm && <div>Muslo Med: <strong>{ev.left_thigh_cm} cm</strong></div>}
                      {ev.right_calf_cm && <div>Pantorrilla: <strong>{ev.right_calf_cm} cm</strong></div>}
                      {ev.right_arm_cm && <div>Brazo: <strong>{ev.right_arm_cm} cm</strong></div>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiFichaMedica;
