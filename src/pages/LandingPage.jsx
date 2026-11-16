import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useEcommerce from '../hooks/useEcommerce';
import usePos from '../hooks/usePos';
import useMembership from '../hooks/useMembership';
import useCommunication from '../hooks/useCommunication';
import LegalModal from '../components/legal/LegalModal';
import {
  HiLightningBolt,
  HiClipboardList,
  HiCreditCard,
  HiShoppingCart,
  HiSpeakerphone,
  HiCheck,
  HiClock,
  HiLocationMarker,
  HiShieldCheck,
  HiArrowRight,
  HiUserGroup,
  HiSparkles
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const DEFAULT_WHATSAPP = '573001234567';

const GYM_SERVICES = [
  {
    icon: '🏋️‍♂️',
    badge: 'Zona de Fuerza',
    title: 'Musculación & Peso Libre',
    description:
      'Maquinaria biomecánica profesional, jaulas de potencia, racks olímpicos, barras y mancuernas calibradas para todos los niveles.'
  },
  {
    icon: '📱',
    badge: 'Plataforma Digital',
    title: 'Rutinas Semanales en Línea',
    description:
      'Consulta tu plan de entrenamiento desde la web o el celular, organizado por días, grupos musculares, series y repeticiones.'
  },
  {
    icon: '📏',
    badge: 'Salud y Progreso',
    title: 'Control Antropométrico y Ficha Clínica',
    description:
      'Seguimiento periódico de peso, talla, porcentaje corporal, perímetros (pecho, cintura, brazo, pierna) y antecedentes médicos.'
  },
  {
    icon: '🔥',
    badge: 'Resistencia',
    title: 'Zona Cardio & Funcional HIIT',
    description:
      'Caminadoras de alto tráfico, elípticas, bicicletas de spinning y área funcional para sesiones metabólicas y pérdida de grasa.'
  },
  {
    icon: '🥤',
    badge: 'Nutrición en Recepción',
    title: 'Suplementos, Batidos y Bebidas',
    description:
      'Proteínas, creatina, pre-entrenos, aminoácidos, hidratantes y snacks saludables disponibles al instante en nuestro punto de venta.'
  },
  {
    icon: '🏆',
    badge: 'Comunidad Strong',
    title: 'Torneos, Eventos y Masterclass',
    description:
      'Participa en competencias internas de fuerza, retos de transformación, talleres de nutrición y entrenamientos grupales.'
  }
];

const FALLBACK_PLANS = [
  {
    id: 'plan-1',
    name: 'Plan Mensual Strong',
    price: 90000,
    durationDays: 30,
    badge: 'Más Popular',
    features: [
      'Acceso ilimitado a zona de musculación y cardio',
      'Rutina semanal personalizada en la plataforma',
      'Valoración antropométrica y ficha médica inicial',
      'Acceso a eventos y comunidad del gimnasio'
    ]
  },
  {
    id: 'plan-2',
    name: 'Plan Trimestral Pro',
    price: 240000,
    durationDays: 90,
    badge: 'Ahorra 11%',
    features: [
      '3 meses de acceso total a todas las zonas',
      'Actualización mensual de rutina de entrenamiento',
      '3 Controles de medidas y evolución corporal',
      'Prioridad en torneos y eventos especiales'
    ]
  },
  {
    id: 'plan-3',
    name: 'Plan Semestral Élite',
    price: 450000,
    durationDays: 180,
    badge: 'Mejor Valor',
    features: [
      '6 meses de entrenamiento continuo sin restricciones',
      'Planificación avanzada por objetivos (fuerza/hipertrofia)',
      'Seguimiento antropométrico completo',
      'Beneficios exclusivos en tienda y eventos'
    ]
  }
];

const FALLBACK_STORE_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'Camiseta Oversize Strong Gym',
    category: 'Ropa Hombre',
    price: 65000,
    sizes: 'S, M, L, XL',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
    description: 'Algodón premium transpirable de alto gramaje, corte deportivo.'
  },
  {
    id: 'demo-2',
    name: 'Conjunto Seamless Pro Mujer',
    category: 'Ropa Mujer',
    price: 115000,
    sizes: 'XS, S, M, L',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600',
    description: 'Alta compresión, cintura alta, ajuste anatómico y secado rápido.'
  },
  {
    id: 'demo-3',
    name: 'Straps de Levantamiento & Cinturón',
    category: 'Accesorios',
    price: 55000,
    sizes: 'Unitalla',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600',
    description: 'Agarre reforzado para peso muerto, dominadas y entrenamientos pesados.'
  },
  {
    id: 'demo-4',
    name: 'Shaker Oficial + Toalla Microfibra',
    category: 'Accesorios',
    price: 45000,
    sizes: 'Unitalla',
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600',
    description: 'Kit esencial de hidratación e higiene para tus sesiones en el gimnasio.'
  }
];

const LandingPage = ({ embedded = false, onOpenCookies }) => {
  const { isAuthenticated, user } = useAuth();
  const { products: storeProducts, fetchEcommerceProducts } = useEcommerce();
  const { products: posProducts, fetchProducts: fetchPosProducts } = usePos();
  const { plans: membershipPlans, fetchPlans } = useMembership();
  const { announcements, events, fetchAnnouncements, fetchEvents } = useCommunication();
  const navigate = useNavigate();

  const [selectedStoreCategory, setSelectedStoreCategory] = useState('Todos');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('terms');

  useEffect(() => {
    fetchEcommerceProducts({ published: true });
    fetchPosProducts(null, '', true);
    fetchPlans(true);
    fetchAnnouncements();
    fetchEvents();
  }, [fetchEcommerceProducts, fetchPosProducts, fetchPlans, fetchAnnouncements, fetchEvents]);

  const activePlans = membershipPlans && membershipPlans.length > 0 ? membershipPlans : FALLBACK_PLANS;
  const rawStore = storeProducts && storeProducts.length > 0 ? storeProducts : FALLBACK_STORE_PRODUCTS;
  const filteredStore = rawStore.filter((p) => {
    if (selectedStoreCategory === 'Todos') return true;
    return (p.category || '').toLowerCase() === selectedStoreCategory.toLowerCase();
  });

  const activePos = (posProducts || []).filter((p) => p.is_active !== false).slice(0, 8);

  const openWhatsApp = (text, customPhone = DEFAULT_WHATSAPP) => {
    const cleanPhone = (customPhone || DEFAULT_WHATSAPP).replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openLegal = (tab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${embedded ? 'rounded-3xl overflow-hidden' : ''}`}>
      {/* 1. NAVBAR SUPERIOR PÚBLICO (Se muestra cuando no está embebido en el Dashboard) */}
      {!embedded && (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <span className="text-2xl font-black text-white">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-wider text-slate-900 leading-none">
                  STRONG GYM
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 mt-1">
                  Fitness & Store
                </span>
              </div>
            </Link>

            {/* Enlaces de secciones */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => scrollToSection('servicios')}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Servicios
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('planes')}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Planes y Tarifas
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('tienda')}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Tienda & Ropa
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('suplementos')}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Suplementos
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('comunidad')}
                className="hover:text-indigo-600 transition-colors cursor-pointer"
              >
                Eventos y Avisos
              </button>
            </nav>

            {/* Botones de Acción / Login */}
            <div className="flex items-center gap-2.5">
              {isAuthenticated && user ? (
                <Link
                  to="/panel"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  <span>Ir a Mi Panel ({user.full_name || user.name || 'Socio'})</span>
                  <HiArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/login?mode=register"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5"
                  >
                    <span>Crear Cuenta</span>
                    <HiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 2. HERO PRINCIPAL */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 md:py-24 px-6">
        {/* Fondos decorativos */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold uppercase tracking-wider">
              <span>🔥 El Gimnasio más completo para tu transformación</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Entrena con Fuerza,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">
                Mide tu Progreso
              </span>{' '}
              y Supera tus Límites.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              En <strong>STRONG GYM</strong> combinamos equipamiento biomecánico profesional, seguimiento antropométrico, rutinas semanales digitales en tu celular o web, suplementación en mostrador y nuestra tienda oficial de ropa deportiva.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login?mode=register"
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
                  >
                    <span>🚀 Únete Ahora (Crear Cuenta)</span>
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all"
                  >
                    🔑 Ya soy Socio (Ingresar)
                  </Link>
                </>
              ) : (
                <Link
                  to="/panel"
                  className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <span>🏋️‍♂️ Ir a mi Panel de Entrenamiento</span>
                  <HiArrowRight className="w-4 h-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('tienda')}
                className="px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2"
              >
                <HiShoppingCart className="w-4 h-4" />
                <span>Ver Tienda y Productos</span>
              </button>
            </div>

            {/* Indicadores rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
              <div>
                <p className="text-2xl font-black text-indigo-400">100%</p>
                <p className="text-xs text-slate-400 font-semibold">Rutinas Digitales</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">PRO</p>
                <p className="text-xs text-slate-400 font-semibold">Zona Pesas y Cardio</p>
              </div>
              <div>
                <p className="text-2xl font-black text-sky-400">360°</p>
                <p className="text-xs text-slate-400 font-semibold">Control Antropométrico</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400">STORE</p>
                <p className="text-xs text-slate-400 font-semibold">Ropa & Suplementos</p>
              </div>
            </div>
          </div>

          {/* Imagen / Tarjeta Visual Derecha */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900"
                alt="Instalaciones STRONG GYM"
                className="w-full h-80 sm:h-96 object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent flex flex-col justify-end p-6">
                <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider w-fit mb-2">
                  Abierto Todos los Días
                </span>
                <h3 className="text-xl font-black text-white">
                  Instalaciones de Alto Rendimiento
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Entrenadores calificados, ambiente motivador y seguimiento real en cada sesión.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">
        {/* 3. SERVICIOS Y ZONAS DEL GIMNASIO */}
        <section id="servicios" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Experiencia Strong Gym
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Nuestros Servicios y Zonas de Entrenamiento
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Todo lo que necesitas para mejorar tu salud, fuerza y estética corporal en un mismo ecosistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GYM_SERVICES.map((srv, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl">
                      {srv.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{srv.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {srv.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. PLANES Y MEMBRESÍAS EN VIVO */}
        <section id="planes" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Membresías sin cláusulas de permanencia
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Planes y Tarifas de Entrenamiento
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Elige tu plan ideal, regístrate en segundos y activa tu acceso con código QR.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activePlans.map((plan, idx) => {
              const isHighlighted = idx === 0 || Boolean(plan.badge || plan.promo_badge);
              const price = typeof plan.price === 'number' ? plan.price : parseFloat(plan.price_cop || plan.price || 0);
              const days = plan.durationDays || plan.duration_days || 30;
              const features =
                Array.isArray(plan.features) && plan.features.length > 0
                  ? plan.features
                  : Array.isArray(plan.benefits) && plan.benefits.length > 0
                  ? plan.benefits
                  : [
                      'Acceso completo a máquinas y peso libre',
                      'Rutina digital personalizada',
                      'Seguimiento antropométrico'
                    ];

              return (
                <div
                  key={plan.id || idx}
                  className={`bg-white rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                    isHighlighted
                      ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-100'
                      : 'border border-slate-200 shadow-sm hover:border-indigo-300'
                  }`}
                >
                  {(plan.badge || plan.promo_badge) && (
                    <span className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                      ★ {plan.badge || plan.promo_badge}
                    </span>
                  )}

                  <div>
                    <span className="text-[11px] font-black uppercase text-indigo-600 tracking-wider">
                      Vigencia {days} días
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{plan.name}</h3>

                    <div className="my-5 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-slate-900">
                        ${price.toLocaleString('es-CO')}
                      </span>
                      <span className="text-xs font-bold text-slate-400">COP</span>
                    </div>

                    <div className="space-y-2.5 py-4 border-t border-slate-100 text-xs text-slate-600">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <HiCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex flex-col gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) {
                          navigate('/login?mode=register');
                        } else {
                          openWhatsApp(
                            `Hola STRONG GYM 👋, quiero activar el plan *${plan.name}* ($${price.toLocaleString('es-CO')} COP por ${days} días).`
                          );
                        }
                      }}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isHighlighted
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {!isAuthenticated ? '🚀 Comenzar con este Plan' : '💬 Solicitar Activación por WhatsApp'}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openWhatsApp(
                          `Hola STRONG GYM 👋, me gustaría recibir más información sobre el plan *${plan.name}* ($${price.toLocaleString('es-CO')} COP).`
                        )
                      }
                      className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FaWhatsapp className="w-3.5 h-3.5" />
                      <span>Preguntar por WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. TIENDA VIRTUAL: ROPA DEPORTIVA Y ACCESORIOS */}
        <section id="tienda" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
                Catálogo E-Commerce Oficial
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                🛍️ Tienda de Ropa Deportiva y Accesorios
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Prendas de alto rendimiento y accesorios oficiales de STRONG GYM. Pide en 1 clic por WhatsApp.
              </p>
            </div>

            {/* Filtro rápido por categoría */}
            <div className="flex flex-wrap gap-2">
              {['Todos', 'Ropa Hombre', 'Ropa Mujer', 'Accesorios'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedStoreCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStoreCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStore.slice(0, 8).map((prod) => {
              const price = typeof prod.price === 'number' ? prod.price : parseFloat(prod.price_cop || prod.price || 0);
              const img = prod.image || prod.image_url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600';

              return (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-52 bg-slate-100 overflow-hidden">
                      <img
                        src={img}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-white/95 text-slate-900 shadow-xs">
                        {prod.category || 'Tienda'}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="text-base font-black text-slate-900 line-clamp-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {prod.description || 'Prenda oficial de entrenamiento STRONG GYM.'}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 mt-2">
                        Tallas: <span className="text-slate-700">{prod.sizes || prod.available_sizes || 'Unitalla'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Precio</span>
                        <span className="text-lg font-black text-slate-900">
                          ${price.toLocaleString('es-CO')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openWhatsApp(
                            `Hola STRONG GYM 👋, estoy interesado/a en el producto *${prod.name}* (Tallas: ${prod.sizes || 'Unitalla'} - Precio: $${price.toLocaleString('es-CO')} COP). ¿Tienen disponibilidad?`,
                            prod.whatsapp_number
                          )
                        }
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        <span>Pedir</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. SUPLEMENTOS, BEBIDAS Y SNACKS EN MOSTRADOR (POS) */}
        {activePos.length > 0 && (
          <section id="suplementos" className="space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
                Disponibles en Recepción
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                🥤 Suplementos, Hidratación y Snacks en el Gym
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Adquiérelos directamente en nuestra recepción antes o después de tu entrenamiento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activePos.map((item) => {
                const price = typeof item.price === 'number' ? item.price : parseFloat(item.price_cop || 0);
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                        {item.category?.toLowerCase().includes('bebida') ? '⚡' : item.category?.toLowerCase().includes('suplemento') ? '💪' : '🍫'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                        <span className="text-[10px] font-bold text-emerald-600">
                          {item.stock > 0 ? `En stock (${item.stock} uds)` : 'En recepción'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-900 shrink-0">
                      ${price.toLocaleString('es-CO')}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. COMUNIDAD: EVENTOS Y NOTICIAS DEL GIMNASIO */}
        <section id="comunidad" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-purple-600">
              Comunidad Activa
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              📅 Próximos Eventos y Comunicados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Entérate de las actividades, torneos, masterclass y novedades de STRONG GYM.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Eventos */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🏆 Agenda de Eventos y Actividades</span>
              </h3>

              {(!events || events.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Próximamente publicaremos nuevos torneos y masterclass.
                </p>
              ) : (
                <div className="space-y-3">
                  {events.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shrink-0 font-black">
                        <span className="text-[9px] uppercase opacity-80">{ev.month || 'GYM'}</span>
                        <span className="text-sm leading-none mt-0.5">{ev.day || '★'}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-slate-900">{ev.title}</h4>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{ev.description}</p>
                        <p className="text-[11px] font-bold text-indigo-600 mt-1">
                          📍 {ev.location || 'STRONG GYM'} {ev.time ? `• 🕒 ${ev.time}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Noticias / Avisos */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xs">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>📢 Últimos Avisos y Novedades</span>
              </h3>

              {(!announcements || announcements.length === 0) ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No hay comunicados recientes por el momento.
                </p>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
                          {ann.category || 'Novedad'}
                        </span>
                        <span className="text-[11px] text-slate-400">{ann.date}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{ann.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {ann.content || ann.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 8. HORARIOS Y UBICACIÓN */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 md:p-10 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">
              Horarios de Atención
            </span>
            <h3 className="text-2xl font-black">🕒 Entrena en tu Horario Ideal</h3>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
              <li>• <strong>Lunes a Viernes:</strong> 5:00 AM – 10:00 PM</li>
              <li>• <strong>Sábados:</strong> 6:00 AM – 6:00 PM</li>
              <li>• <strong>Domingos y Festivos:</strong> 7:00 AM – 1:00 PM</li>
            </ul>
          </div>

          <div className="space-y-4 md:text-right">
            <h4 className="text-xl font-black">¿Listo para dar el primer paso?</h4>
            <p className="text-xs text-slate-300">
              Escríbenos por WhatsApp o crea tu cuenta en línea para activar tu membresía y recibir tu rutina.
            </p>
            <div className="flex flex-wrap md:justify-end gap-3">
              <button
                type="button"
                onClick={() => openWhatsApp('Hola STRONG GYM 👋, quiero recibir información sobre inscripciones y planes.')}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Contactar por WhatsApp</span>
              </button>
              {!isAuthenticated && (
                <Link
                  to="/login?mode=register"
                  className="px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs"
                >
                  Registrarme Ahora
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 9. FOOTER LEGAL */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-black text-slate-900">
              STRONG GYM S.A.S. • NIT 901.000.000-1
            </p>
            <p className="text-[11px] mt-0.5">
              Cumplimiento Ley 1581 de 2012 (Habeas Data) • Todos los derechos reservados.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-bold text-indigo-600">
            <button
              type="button"
              onClick={() => openLegal('privacy')}
              className="hover:underline cursor-pointer"
            >
              Política de Privacidad
            </button>
            <button
              type="button"
              onClick={() => openLegal('terms')}
              className="hover:underline cursor-pointer"
            >
              Términos y Condiciones
            </button>
            <button
              type="button"
              onClick={() => openLegal('cookies')}
              className="hover:underline cursor-pointer"
            >
              Política de Cookies
            </button>
            <button
              type="button"
              onClick={() => openLegal('notice')}
              className="hover:underline cursor-pointer"
            >
              Aviso Legal
            </button>
            {onOpenCookies && (
              <button
                type="button"
                onClick={onOpenCookies}
                className="hover:underline cursor-pointer text-slate-600"
              >
                Configurar Cookies
              </button>
            )}
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setLegalModalOpen(false)}
        onOpenCookieSettings={onOpenCookies}
      />
    </div>
  );
};

export default LandingPage;
