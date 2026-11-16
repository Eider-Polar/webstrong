import React, { useState, useEffect } from 'react';
import useCommunication from '../hooks/useCommunication';
import useAuth from '../hooks/useAuth';
import {
  Modal,
  ConfirmModal,
  PageHeader,
  EmptyState,
  LoadingState
} from '../components';
import {
  HiSpeakerphone,
  HiCalendar,
  HiPlus,
  HiTrash,
  HiClock,
  HiLocationMarker,
  HiPhotograph,
  HiX
} from 'react-icons/hi';
import { uploadImageToCloudinary } from '../services/cloudinary';
import { useAlerta } from '../hooks/useAlerta';

const Comunicacion = () => {
  const { isAdmin } = useAuth();
  const { mostrarAlerta } = useAlerta();
  const {
    announcements,
    events,
    fetchAnnouncements,
    fetchEvents,
    createAnnouncement,
    createEvent,
    deleteEvent,
    loading
  } = useCommunication();

  const [activeTab, setActiveTab] = useState('news'); // 'news' | 'events'
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form New Announcement
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsUploading, setNewsUploading] = useState(false);

  // Form New Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDatetime, setEventDatetime] = useState('');
  const [eventLocation, setEventLocation] = useState('STRONG GYM');
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [eventUploading, setEventUploading] = useState(false);

  // Confirm delete event
  const [deleteEventConfirm, setDeleteEventConfirm] = useState({ isOpen: false, eventId: null, eventTitle: '' });
  const [deletingEvent, setDeletingEvent] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    fetchEvents();
  }, [fetchAnnouncements, fetchEvents]);

  // Manejo de subida de imagen para noticia
  const handleNewsImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarAlerta('Por favor selecciona un archivo de imagen válido', true);
      return;
    }

    setNewsUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'noticias');
      if (url) {
        setNewsImageUrl(url);
        mostrarAlerta('Imagen cargada con éxito', false);
      }
    } catch (err) {
      console.error('Error al subir imagen de noticia:', err);
      mostrarAlerta('Error al subir la imagen a la nube', true);
    } finally {
      setNewsUploading(false);
    }
  };

  // Manejo de subida de imagen para evento
  const handleEventImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarAlerta('Por favor selecciona un archivo de imagen válido', true);
      return;
    }

    setEventUploading(true);
    try {
      const url = await uploadImageToCloudinary(file, 'eventos');
      if (url) {
        setEventImageUrl(url);
        mostrarAlerta('Imagen cargada con éxito', false);
      }
    } catch (err) {
      console.error('Error al subir imagen de evento:', err);
      mostrarAlerta('Error al subir la imagen a la nube', true);
    } finally {
      setEventUploading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    setActionLoading(true);
    try {
      await createAnnouncement({
        title: newsTitle.trim(),
        content: newsContent.trim(),
        image_url: newsImageUrl.trim() || null
      });
      setNewsTitle('');
      setNewsContent('');
      setNewsImageUrl('');
      setIsNewsModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    setActionLoading(true);
    try {
      await createEvent({
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        event_datetime: eventDatetime || new Date().toISOString(),
        date: eventDatetime,
        location: eventLocation.trim(),
        image_url: eventImageUrl.trim() || null
      });
      setEventTitle('');
      setEventDescription('');
      setEventDatetime('');
      setEventLocation('STRONG GYM');
      setEventImageUrl('');
      setIsEventModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEventSubmit = async () => {
    if (!deleteEventConfirm.eventId) return;
    setDeletingEvent(true);
    try {
      await deleteEvent(deleteEventConfirm.eventId);
      setDeleteEventConfirm({ isOpen: false, eventId: null, eventTitle: '' });
    } finally {
      setDeletingEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header con PageHeader */}
      <PageHeader
        title="Avisos y Eventos del Gym"
        subtitle="Publica anuncios importantes sobre mantenimiento, festivos o competiciones internas para todos los socios."
        badge="Comunicación Oficial"
        badgeIcon={HiSpeakerphone}
        badgeColor="indigo"
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => (activeTab === 'news' ? setIsNewsModalOpen(true) : setIsEventModalOpen(true))}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <HiPlus className="w-4 h-4" />
                <span>{activeTab === 'news' ? '+ Nuevo Comunicado' : '+ Nuevo Evento'}</span>
              </button>
            )}

            <div className="bg-white/10 backdrop-blur-xs p-1 rounded-xl border border-white/20 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('news')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'news'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Novedades ({announcements?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'events'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Eventos ({events?.length || 0})
              </button>
            </div>
          </div>
        }
      />

      {/* 2. Contenido según tab */}
      {loading ? (
        <LoadingState message="Cargando noticias y eventos..." color="indigo" />
      ) : activeTab === 'news' ? (
        /* ================= VISTA DE NOVEDADES ================= */
        <div className="space-y-4">
          {announcements && announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {item.image_url ? (
                      <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100 shadow-inner">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Aviso General
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.date || 'Fecha reciente'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.content || item.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-bold">
                    <span>Publicado por: {item.author || 'Administración'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📢"
              title="No hay comunicados publicados"
              description="Publica novedades para mantener a los socios informados sobre horarios o novedades."
            />
          )}
        </div>
      ) : (
        /* ================= VISTA DE EVENTOS ================= */
        <div className="space-y-4">
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {ev.image_url ? (
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-slate-100 border border-slate-100 shadow-inner relative">
                        <img
                          src={ev.image_url}
                          alt={ev.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                          {ev.month} {ev.day}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                          <span className="text-[10px] font-black uppercase">{ev.month || 'OCT'}</span>
                          <span className="text-sm font-black">{ev.day || '15'}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight">
                            {ev.title}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400">Evento Especial</span>
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setDeleteEventConfirm({ isOpen: true, eventId: ev.id, eventTitle: ev.title })}
                          className="text-slate-300 hover:text-rose-600 p-1"
                          title="Eliminar evento"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {ev.description || 'Sin descripción adicional para este evento.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    {ev.time && (
                      <div className="flex items-center gap-1.5">
                        <HiClock className="w-3.5 h-3.5 text-purple-600" />
                        <span>{ev.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <HiLocationMarker className="w-3.5 h-3.5 text-purple-600" />
                      <span>{ev.location || 'STRONG GYM'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🏆"
              title="No hay eventos programados"
              description="Crea torneos, clases especiales o seminarios para la comunidad de STRONG GYM."
            />
          )}
        </div>
      )}

      {/* 3. Modal: Nuevo Comunicado (Utiliza Modal reutilizable) */}
      <Modal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        maxWidth="lg"
        title="Publicar Comunicado Oficial"
        subtitle="Este mensaje aparecerá en el inicio de la app y panel de todos los socios."
        badge="Avisos y Novedades"
        badgeColor="indigo"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Título del Aviso *
            </label>
            <input
              type="text"
              placeholder="Ej. Horario especial por festivo"
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Contenido del Mensaje *
            </label>
            <textarea
              rows={4}
              placeholder="Escribe el mensaje detallado para los socios..."
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* Subir imagen para la noticia */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Imagen Ilustrativa (Opcional)
            </label>
            
            {newsImageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-40 bg-slate-50 group">
                <img
                  src={newsImageUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setNewsImageUrl('')}
                  className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-all cursor-pointer"
                  title="Eliminar imagen"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50/80 cursor-pointer transition-all">
                  <HiPhotograph className="w-8 h-8 text-indigo-500 mb-1" />
                  <span className="text-xs font-bold text-indigo-900">
                    {newsUploading ? 'Subiendo imagen a la nube...' : 'Subir imagen desde tu dispositivo'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP (Optimización automática)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewsImageFile}
                    disabled={newsUploading}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">o ingresa URL directa</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={newsImageUrl}
                  onChange={(e) => setNewsImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading || newsUploading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer transition-all"
            >
              {actionLoading ? 'Publicando...' : 'Publicar Aviso'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 4. Modal: Nuevo Evento (Utiliza Modal reutilizable) */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        maxWidth="lg"
        title="Crear Nuevo Evento"
        subtitle="Registra actividades para que los socios se inscriban o asistan."
        badge="Eventos & Torneos"
        badgeColor="purple"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Evento *
            </label>
            <input
              type="text"
              placeholder="Ej. Torneo de Press Banca"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Fecha y Hora
              </label>
              <input
                type="datetime-local"
                value={eventDatetime}
                onChange={(e) => setEventDatetime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ubicación
              </label>
              <input
                type="text"
                placeholder="STRONG GYM"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Descripción del Evento
            </label>
            <textarea
              rows={3}
              placeholder="Premios, requisitos o detalles del evento..."
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 transition-all resize-none"
            />
          </div>

          {/* Subir imagen para el evento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Foto o Afiche del Evento (Opcional)
            </label>
            
            {eventImageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-40 bg-slate-50 group">
                <img
                  src={eventImageUrl}
                  alt="Vista previa evento"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setEventImageUrl('')}
                  className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition-all cursor-pointer"
                  title="Eliminar imagen"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-2xl bg-purple-50/50 hover:bg-purple-50/80 cursor-pointer transition-all">
                  <HiPhotograph className="w-8 h-8 text-purple-500 mb-1" />
                  <span className="text-xs font-bold text-purple-900">
                    {eventUploading ? 'Subiendo imagen a la nube...' : 'Subir afiche o foto del evento'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP (Optimización automática)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEventImageFile}
                    disabled={eventUploading}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">o ingresa URL directa</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <input
                  type="url"
                  placeholder="https://ejemplo.com/evento.jpg"
                  value={eventImageUrl}
                  onChange={(e) => setEventImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading || eventUploading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-100 disabled:opacity-50 cursor-pointer transition-all"
            >
              {actionLoading ? 'Guardando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. Modal de Confirmación para Eliminar Evento */}
      <ConfirmModal
        isOpen={deleteEventConfirm.isOpen}
        onClose={() => setDeleteEventConfirm({ isOpen: false, eventId: null, eventTitle: '' })}
        onConfirm={handleDeleteEventSubmit}
        title="¿Eliminar evento?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${deleteEventConfirm.eventTitle}"?`}
        confirmText="Eliminar"
        type="danger"
        loading={deletingEvent}
      />
    </div>
  );
};

export default Comunicacion;
