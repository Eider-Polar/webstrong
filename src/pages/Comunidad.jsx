import React, { useState, useEffect } from 'react';
import useCommunication from '../hooks/useCommunication';
import {
  PageHeader,
  SearchFilterBar,
  EmptyState,
  LoadingState
} from '../components';
import {
  HiSpeakerphone,
  HiCalendar,
  HiOutlineShare,
  HiCheckCircle,
  HiClock,
  HiLocationMarker,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

const NEWS_CATEGORIES = ['Todas', 'Novedades', 'Horarios', 'Equipamiento', 'Nutrición'];

const Comunidad = () => {
  const { announcements, events, fetchAnnouncements, fetchEvents, loading } = useCommunication();
  const [activeTab, setActiveTab] = useState('news'); // 'news' | 'events'
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNews, setExpandedNews] = useState({});
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('registered_events');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
  }, [fetchAnnouncements, fetchEvents]);

  const toggleExpand = (id) => {
    setExpandedNews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRegisterEvent = (eventId) => {
    const next = { ...registeredEvents, [eventId]: !registeredEvents[eventId] };
    setRegisteredEvents(next);
    localStorage.setItem('registered_events', JSON.stringify(next));
  };

  const shareNewsWhatsApp = (item) => {
    const msg = `📢 *COMUNICADO STRONG GYM* 🏋️‍♂️\n━━━━━━━━━━━━━━━━━━━━\n📌 *${item.title}*\n📅 Fecha: ${item.date || 'Reciente'}\n\n${item.content || item.summary || ''}\n━━━━━━━━━━━━━━━━━━━━\n💪 _STRONG GYM - Fitness Center_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const shareEventWhatsApp = (item) => {
    const dateStr = `${item.day} de ${item.month}`;
    const msg = `🏆 *EVENTO EN STRONG GYM* 🏋️‍♂️\n━━━━━━━━━━━━━━━━━━━━\n📌 *${item.title}*\n📅 Fecha: ${dateStr} - ${item.time || ''}\n📍 Lugar: ${item.location || 'STRONG GYM'}\n\n${item.description || ''}\n━━━━━━━━━━━━━━━━━━━━\n💪 ¡Acompáñanos en STRONG GYM!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredAnnouncements = (announcements || []).filter((a) => {
    const matchesCat = selectedCategory === 'Todas' || a.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQ = !q || a.title?.toLowerCase().includes(q) || a.content?.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const filteredEvents = (events || []).filter((e) => {
    const q = searchQuery.trim().toLowerCase();
    return !q || e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8">
      {/* 1. Header con PageHeader */}
      <PageHeader
        title="Comunidad & Eventos STRONG GYM"
        subtitle="Mantente enterado de competencias, cambios de horario, festivos y comunicados del gimnasio."
        badge="Área de Socios"
        badgeIcon={HiSpeakerphone}
        badgeColor="indigo"
        actions={
          <div className="bg-white/10 backdrop-blur-xs p-1 rounded-2xl border border-white/20 flex items-center gap-1 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`flex-1 md:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HiSpeakerphone className="w-4 h-4" />
              <span>Avisos ({announcements?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className={`flex-1 md:flex-initial px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <HiCalendar className="w-4 h-4" />
              <span>Eventos ({events?.length || 0})</span>
            </button>
          </div>
        }
      />

      {/* 2. Barra de Búsqueda y Categorías con SearchFilterBar */}
      {activeTab === 'news' ? (
        <SearchFilterBar
          categories={NEWS_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Buscar en comunicados..."
        />
      ) : (
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Buscar evento o torneo..."
        />
      )}

      {/* 3. Contenido según Tab */}
      {loading ? (
        <LoadingState message="Cargando publicaciones del gimnasio..." color="indigo" />
      ) : activeTab === 'news' ? (
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <EmptyState
              icon="📢"
              title="No hay comunicados disponibles"
              description="No hay noticias en esta categoría o que coincidan con la búsqueda."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAnnouncements.map((item) => {
                const isExpanded = !!expandedNews[item.id];
                const contentText = item.content || item.summary || '';
                const isLong = contentText.length > 200;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {item.image_url ? (
                        <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100 shadow-inner">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {item.category || 'General'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.date || 'Reciente'}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 mb-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {isExpanded || !isLong
                          ? contentText
                          : `${contentText.slice(0, 200)}...`}
                      </p>

                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Ver menos' : 'Leer completo'}</span>
                          {isExpanded ? (
                            <HiChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <HiChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-bold">
                        Staff STRONG GYM
                      </span>
                      <button
                        type="button"
                        onClick={() => shareNewsWhatsApp(item)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Compartir comunicado en WhatsApp"
                      >
                        <FaWhatsapp className="w-3.5 h-3.5" />
                        <span>Compartir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <EmptyState
              icon="🏆"
              title="No hay eventos programados"
              description="Pronto anunciaremos torneos y actividades especiales en las instalaciones."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((ev) => {
                const isRegistered = !!registeredEvents[ev.id];

                return (
                  <div
                    key={ev.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {ev.image_url ? (
                        <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100 shadow-inner relative">
                          <img
                            src={ev.image_url}
                            alt={ev.title}
                            className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                            {ev.month} {ev.day}
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex flex-col items-center justify-center font-bold shadow-md shadow-purple-100 shrink-0">
                            <span className="text-[9px] uppercase tracking-wider opacity-80">
                              {ev.month || 'OCT'}
                            </span>
                            <span className="text-base font-black leading-none mt-0.5">
                              {ev.day || '15'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">
                              {ev.title}
                            </h4>
                            <span className="text-[10px] font-bold text-purple-700">
                              Evento Oficial
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {ev.description || 'Acompáñanos en este evento deportivo y demuestra tu fuerza.'}
                      </p>

                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        {ev.time && (
                          <div className="flex items-center gap-2">
                            <HiClock className="w-4 h-4 text-purple-600 shrink-0" />
                            <span>{ev.time}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <HiLocationMarker className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>{ev.location || 'STRONG GYM Principal'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRegisterEvent(ev.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isRegistered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                        }`}
                      >
                        {isRegistered && <HiCheckCircle className="w-4 h-4 text-emerald-700" />}
                        <span>{isRegistered ? 'Asistiré ✓' : 'Confirmar Asistencia'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => shareEventWhatsApp(ev)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                        title="Compartir por WhatsApp"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comunidad;
