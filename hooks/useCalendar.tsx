import type { CalendarEvent, CalendarEventFilters, CreateCalendarEventRequest, UpdateCalendarEventRequest } from '@/database/models/calendarTypes';
import { calendarService } from '@/database/services';
import { useCallback, useEffect, useState } from 'react';

// Hook para gestión de calendario - actualizado para usar calendarService
export interface UseCalendarReturn {
  // State
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchEvents: (filters?: CalendarEventFilters) => Promise<void>;
  fetchEventsForDay: (date: string) => Promise<void>;
  fetchEventsForDateRange: (startDate: string, endDate: string) => Promise<void>;
  createEvent: (eventData: CreateCalendarEventRequest) => Promise<CalendarEvent | null>;
  updateEvent: (eventId: string, eventData: UpdateCalendarEventRequest) => Promise<CalendarEvent | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  
  // Utility
  getEventsForDate: (date: string) => CalendarEvent[];
  clearError: () => void;
  refetch: () => Promise<void>;
}

export const useCalendar = (initialFilters?: CalendarEventFilters): UseCalendarReturn => {
  // Estado del calendario
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFilters, setLastFilters] = useState<CalendarEventFilters | undefined>(initialFilters);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchEvents = useCallback(async (filters?: CalendarEventFilters) => {
    setLoading(true);
    setError(null);
    setLastFilters(filters);
    
    console.log('🔄 Fetching events with filters:', filters);
    
    try {
      const response = await calendarService.getEvents(filters);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched', response.data.length, 'events');
        setEvents(response.data);
      } else {
        console.error('❌ Failed to fetch events:', response.error);
        setError(response.error || 'Error al cargar eventos');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al cargar eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventsForDay = useCallback(async (date: string) => {
    console.log('📅 Fetching events for day:', date);
    await fetchEvents({ start_date: date, end_date: date });
  }, [fetchEvents]);

  const fetchEventsForDateRange = useCallback(async (startDate: string, endDate: string) => {
    await fetchEvents({ start_date: startDate, end_date: endDate });
  }, [fetchEvents]);

  const createEvent = useCallback(async (eventData: CreateCalendarEventRequest): Promise<CalendarEvent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calendarService.createEvent(eventData);
      
      if (response.success && response.data) {
        // Add new event to the current list
        setEvents(prevEvents => [...prevEvents, response.data!]);
        
        // Schedule notification for the event using reminder_minutes
        if (eventData.reminder_minutes && eventData.reminder_minutes > 0) {
          try {
            // Import at the top of the file
            const { requestNotificationPermission, scheduleCalendarNotification, setupAndroidChannel } = await import('@/utils/notifications');
            
            // Setup Android notification channel
            await setupAndroidChannel();
            
            // Request permission if not already granted
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
              await scheduleCalendarNotification({
                title: `Recordatorio: ${eventData.title}`,
                body: eventData.description || 'Evento próximo a comenzar',
                date: eventData.start_datetime,
                minutosAntes: eventData.reminder_minutes
              });
              console.log(`📱 Notification scheduled for event ${eventData.title}, ${eventData.reminder_minutes} minutes before`);
            } else {
              console.warn('No permission granted for notifications');
            }
          } catch (notifError) {
            console.error('Error scheduling notification:', notifError);
            // Don't throw error, just log it. Event creation was successful
          }
        }
        
        return response.data;
      } else {
        setError(response.error || 'Error al crear evento');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al crear evento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, eventData: UpdateCalendarEventRequest): Promise<CalendarEvent | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calendarService.updateEvent(eventId, eventData);
      
      if (response.success && response.data) {
        // Update event in the current list
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId ? response.data! : event
          )
        );
        
        // Update notification for the event if reminder_minutes is set
        if (eventData.reminder_minutes !== undefined && eventData.reminder_minutes > 0 && eventData.start_datetime) {
          try {
            // Import at the top of the file
            const { requestNotificationPermission, scheduleCalendarNotification, setupAndroidChannel } = await import('@/utils/notifications');
            
            // Setup Android notification channel
            await setupAndroidChannel();
            
            // Request permission if not already granted
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
              await scheduleCalendarNotification({
                title: `Recordatorio: ${response.data.title}`,
                body: response.data.description || 'Evento próximo a comenzar',
                date: response.data.start_datetime,
                minutosAntes: eventData.reminder_minutes
              });
              console.log(`📱 Notification updated for event ${response.data.title}, ${eventData.reminder_minutes} minutes before`);
            } else {
              console.warn('No permission granted for notifications');
            }
          } catch (notifError) {
            console.error('Error updating notification:', notifError);
            // Don't throw error, just log it. Event update was successful
          }
        }
        
        return response.data;
      } else {
        setError(response.error || 'Error al actualizar evento');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al actualizar evento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calendarService.deleteEvent(eventId);
      
      if (response.success) {
        // Remove event from the current list
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        return true;
      } else {
        setError(response.error || 'Error al eliminar evento');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al eliminar evento');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper function to generate recurring event instances
  const generateRecurringInstances = useCallback((event: CalendarEvent, targetDate: string): CalendarEvent[] => {
    if (!event.is_recurring || !event.recurrence_pattern) {
      return [];
    }

    const pattern = event.recurrence_pattern;
    
    // Solo soportamos recurrencia semanal por ahora
    if (pattern.type !== 'weekly') {
      return [];
    }

    // Crear fechas usando solo la fecha, sin horas para evitar problemas de zona horaria
    const eventStartDate = new Date(event.start_datetime);
    const eventDateOnly = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
    const targetDateObj = new Date(targetDate + 'T00:00:00');
    const targetDateOnly = new Date(targetDateObj.getFullYear(), targetDateObj.getMonth(), targetDateObj.getDate());
    
    // Obtener día de la semana del evento original y del target
    const eventDayOfWeek = eventDateOnly.getDay();
    const targetDayOfWeek = targetDateOnly.getDay();
    
    console.log('🔄 Recurring check:', {
      eventTitle: event.title,
      eventStartDate: eventStartDate.toISOString(),
      eventDateOnly: eventDateOnly.toString(),
      eventDayOfWeek,
      targetDate,
      targetDateOnly: targetDateOnly.toString(),
      targetDayOfWeek,
      patternDaysOfWeek: pattern.days_of_week,
      eventDayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][eventDayOfWeek],
      targetDayName: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][targetDayOfWeek]
    });

    // Verificar si el día de la semana coincide con el patrón
    if (!pattern.days_of_week || !pattern.days_of_week.includes(targetDayOfWeek)) {
      return [];
    }

    // Calcular la diferencia en días desde el evento original
    const timeDiff = targetDateOnly.getTime() - eventDateOnly.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // Solo generar instancias futuras (o el mismo día si es el evento original)
    if (daysDiff < 0) {
      return [];
    }

    // Para eventos semanales, verificar que la diferencia sea múltiplo de 7 * interval
    const expectedWeekInterval = 7 * (pattern.interval || 1);
    if (daysDiff % expectedWeekInterval !== 0) {
      return [];
    }

    // Si es el mismo día que el evento original, no crear instancia duplicada
    if (daysDiff === 0) {
      return [];
    }

    // Calcular las nuevas fechas para esta instancia
    const instanceStartDate = new Date(targetDateOnly);
    const instanceEndDate = new Date(targetDateOnly);
    
    // Mantener la misma hora que el evento original
    const eventEndDate = new Date(event.end_datetime);
    instanceStartDate.setHours(eventStartDate.getHours(), eventStartDate.getMinutes(), eventStartDate.getSeconds());
    instanceEndDate.setHours(eventEndDate.getHours(), eventEndDate.getMinutes(), eventEndDate.getSeconds());

    console.log('✅ Creating recurring instance:', {
      originalDate: eventDateOnly.toString(),
      targetDate: targetDateOnly.toString(),
      daysDiff,
      weeksDiff: daysDiff / 7,
      instanceStart: instanceStartDate.toISOString(),
      instanceEnd: instanceEndDate.toISOString()
    });

    // Crear una instancia virtual del evento
    const recurringInstance: CalendarEvent = {
      ...event,
      id: `${event.id}_recurring_${targetDate}`, // ID único para esta instancia
      start_datetime: instanceStartDate.toISOString(),
      end_datetime: instanceEndDate.toISOString(),
      title: `${event.title}`, // Puedes agregar un indicador si quieres
    };

    return [recurringInstance];
  }, []);

  const getEventsForDate = useCallback((date: string): CalendarEvent[] => {
    // Obtener eventos regulares que coincidan con la fecha
    const regularEvents = events.filter(event => {
      // Convertir la fecha del evento a formato local y extraer solo la fecha
      const eventDate = new Date(event.start_datetime);
      const eventDateString = eventDate.getFullYear() + '-' + 
                             (eventDate.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                             eventDate.getDate().toString().padStart(2, '0');
      
      return eventDateString === date;
    });

    // Generar instancias de eventos recurrentes para esta fecha
    const recurringInstances: CalendarEvent[] = [];
    events.forEach(event => {
      if (event.is_recurring) {
        const instances = generateRecurringInstances(event, date);
        recurringInstances.push(...instances);
      }
    });

    // Combinar eventos regulares y recurrentes
    const allEvents = [...regularEvents, ...recurringInstances];
    
    // Eliminar duplicados (en caso de que un evento recurrente coincida con su fecha original)
    const uniqueEvents = allEvents.filter((event, index, self) => {
      // Si es una instancia recurrente, verificar que no haya un evento original en la misma fecha
      if (event.id.includes('_recurring_')) {
        const originalId = event.id.split('_recurring_')[0];
        const hasOriginalOnSameDate = regularEvents.some(orig => orig.id === originalId);
        return !hasOriginalOnSameDate;
      }
      return true;
    });
    
    // Solo loggear si hay cambios significativos
    if (uniqueEvents.length > 0 || events.length > 0) {
      console.log(`📅 Events for date ${date}:`, uniqueEvents.length, 'events found (', regularEvents.length, 'regular +', recurringInstances.length, 'recurring) out of', events.length, 'total events');
      if (uniqueEvents.length > 0) {
        console.log('Found events:', uniqueEvents.map(e => ({ 
          title: e.title, 
          start: e.start_datetime,
          isRecurring: e.id.includes('_recurring_')
        })));
      }
    }
    
    return uniqueEvents;
  }, [events, generateRecurringInstances]);

  const refetch = useCallback(async () => {
    await fetchEvents(lastFilters);
  }, [fetchEvents, lastFilters]);

  // Load initial data
  useEffect(() => {
    fetchEvents(initialFilters);
  }, [fetchEvents, initialFilters]);

  return {
    // State
    events,
    loading,
    error,
    
    // Actions
    fetchEvents,
    fetchEventsForDay,
    fetchEventsForDateRange,
    createEvent,
    updateEvent,
    deleteEvent,
    
    // Utility
    getEventsForDate,
    clearError,
    refetch,
  };
};
