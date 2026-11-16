import React, { createContext, useState, useCallback } from 'react';
import clienteAxios from '../config/clienteAxios';
import { useAlerta } from '../hooks/useAlerta';

export const CommunicationContext = createContext();

export const CommunicationProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { mostrarAlerta } = useAlerta();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get('/communication/announcements');
      if (res.success && res.data) {
        const normalized = (res.data.rows || []).map(a => ({
          id: a.id.toString(),
          title: a.title,
          summary: a.content ? a.content.slice(0, 100) + '...' : '',
          content: a.content,
          image_url: a.image_url || null,
          date: new Date(a.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
          category: 'Novedades',
          icon: '📢',
          isFeatured: true
        }));
        setAnnouncements(normalized);
      }
    } catch (err) {
      console.error('Error al cargar anuncios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAnnouncement = async (announcementData) => {
    try {
      const { data: res } = await clienteAxios.post('/communication/announcements', {
        title: announcementData.title,
        content: announcementData.content,
        image_url: announcementData.image_url || null
      });
      if (res.success) {
        mostrarAlerta('Comunicado publicado exitosamente', false);
        await fetchAnnouncements();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al publicar comunicado';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const fetchEvents = useCallback(async (upcomingOnly = false) => {
    setLoading(true);
    try {
      const { data: res } = await clienteAxios.get(`/communication/events?upcoming=${upcomingOnly}`);
      if (res.success && res.data) {
        const normalized = (res.data.rows || []).map(e => {
          const dt = new Date(e.event_datetime);
          return {
            id: e.id.toString(),
            title: e.title,
            description: e.description,
            image_url: e.image_url || null,
            event_datetime: e.event_datetime,
            day: dt.getDate().toString(),
            month: dt.toLocaleString('es-ES', { month: 'short' }).toUpperCase(),
            time: dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            location: e.location || 'STRONG GYM',
            category: 'Evento',
            badgeColor: '#EF4444',
            isRegistered: false
          };
        });
        setEvents(normalized);
      }
    } catch (err) {
      console.error('Error al cargar eventos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (eventData) => {
    try {
      const { data: res } = await clienteAxios.post('/communication/events', {
        title: eventData.title,
        description: eventData.description,
        event_datetime: eventData.event_datetime || eventData.date || new Date().toISOString(),
        location: eventData.location || 'STRONG GYM',
        image_url: eventData.image_url || null
      });
      if (res.success) {
        mostrarAlerta('Evento registrado exitosamente', false);
        await fetchEvents();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al registrar evento';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const { data: res } = await clienteAxios.delete(`/communication/events/${id}`);
      if (res.success) {
        mostrarAlerta('Evento eliminado exitosamente', false);
        await fetchEvents();
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Error al eliminar evento';
      mostrarAlerta(msg, true);
      throw new Error(msg);
    }
  };

  return (
    <CommunicationContext.Provider
      value={{
        announcements,
        events,
        loading,
        fetchAnnouncements,
        createAnnouncement,
        fetchEvents,
        createEvent,
        deleteEvent
      }}
    >
      {children}
    </CommunicationContext.Provider>
  );
};
