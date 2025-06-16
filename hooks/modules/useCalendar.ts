import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotFoundError, QueryOptions } from '../../lib/database/repositories/base.repository';
import { CalendarEvent } from '../../lib/database/schemas/calendar.schema';
import { useAuth } from '../../lib/hooks/useAuth';

/**
 * Hook for managing calendar events and schedules
 */
export type CalendarEventFormData = Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// Using a placeholder for CalendarRepository until it's implemented
class CalendarRepository {
  async getAll(options?: QueryOptions): Promise<CalendarEvent[]> {
    // Placeholder
    return [];
  }

  async getById(id: string): Promise<CalendarEvent | null> {
    // Placeholder
    return null;
  }

  async create(eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> {
    // Placeholder
    return {} as CalendarEvent;
  }

  async update(id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>>): Promise<CalendarEvent> {
    // Placeholder
    return {} as CalendarEvent;
  }

  async delete(id: string): Promise<void> {
    // Placeholder
  }

  async getEventsByCourse(userId: string, courseId: string): Promise<CalendarEvent[]> {
    // Placeholder
    return [];
  }

  async getEventsByDateRange(userId: string, startDate: string, endDate: string): Promise<CalendarEvent[]> {
    // Placeholder
    return [];
  }

  async getRecurringEvents(userId: string): Promise<CalendarEvent[]> {
    // Placeholder
    return [];
  }

  async getEventsByType(userId: string, type: CalendarEvent['type']): Promise<CalendarEvent[]> {
    // Placeholder
    return [];
  }

  async getUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
    // Placeholder
    return [];
  }

  async createRecurringEventInstances(parentEventId: string, range: { start: string, end: string }): Promise<CalendarEvent[]> {
    // Placeholder
    return [];
  }

  async deleteRecurringEventInstances(parentEventId: string): Promise<void> {
    // Placeholder
  }
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [classEvents, setClassEvents] = useState<CalendarEvent[]>([]);
  const [examEvents, setExamEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentDateRange, setCurrentDateRange] = useState<{ start: Date, end: Date }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  });
  
  const { user } = useAuth();
  const calendarRepo = useMemo(() => new CalendarRepository(), []);

  // Helper to filter events by type
  const filterEventsByType = useCallback((allEvents: CalendarEvent[], type: CalendarEvent['type']) => {
    return allEvents.filter(event => event.type === type);
  }, []);

  // Fetch all events for the current user
  const fetchEvents = useCallback(async (options?: QueryOptions) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = { user_id: user.id, ...options?.filters };
      const allEvents = await calendarRepo.getAll({ 
        ...options,
        filters,
        sort: options?.sort || { field: 'start_date', direction: 'ASC' }
      });
      
      setEvents(allEvents);
      
      // Also update type-based events
      setClassEvents(filterEventsByType(allEvents, 'class'));
      setExamEvents(filterEventsByType(allEvents, 'exam'));
      
      return allEvents;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, calendarRepo, filterEventsByType]);
  
  // Fetch events by date range
  const fetchEventsByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    if (!user?.id) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      
      const rangeEvents = await calendarRepo.getEventsByDateRange(user.id, start, end);
      
      // Update current date range
      setCurrentDateRange({ start: startDate, end: endDate });
      
      return rangeEvents;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events by date range');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, calendarRepo]);
  
  // Fetch events by course
  const fetchEventsByCourse = useCallback(async (courseId: string) => {
    if (!user?.id) return [];
    
    try {
      return await calendarRepo.getEventsByCourse(user.id, courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching events by course');
      return [];
    }
  }, [user?.id, calendarRepo]);
  
  // Fetch upcoming events
  const fetchUpcomingEvents = useCallback(async (days: number = 7) => {
    if (!user?.id) return [];
    
    try {
      const upcoming = await calendarRepo.getUpcomingEvents(user.id, days);
      setUpcomingEvents(upcoming);
      return upcoming;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching upcoming events');
      return [];
    }
  }, [user?.id, calendarRepo]);
  
  // Create a new event
  const createEvent = useCallback(async (eventData: CalendarEventFormData) => {
    if (!user?.id) return null;
    
    setError(null);
    
    try {
      const newEvent = await calendarRepo.create({
        ...eventData,
        user_id: user.id,
        tags: eventData.tags || '[]'
      });
      
      // Update the events list
      setEvents(prev => [...prev, newEvent]);
      
      // Update type-based lists
      if (newEvent.type === 'class') {
        setClassEvents(prev => [...prev, newEvent]);
      } else if (newEvent.type === 'exam') {
        setExamEvents(prev => [...prev, newEvent]);
      }
      
      // If it's recurring, create event instances
      if (newEvent.is_recurring && newEvent.recurrence_rule) {
        // Create instances within current date range
        const start = currentDateRange.start.toISOString();
        const end = currentDateRange.end.toISOString();
        await calendarRepo.createRecurringEventInstances(newEvent.id, { start, end });
        
        // Refresh events for the current date range to show new recurring instances
        fetchEventsByDateRange(currentDateRange.start, currentDateRange.end);
      }
      
      return newEvent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating event');
      return null;
    }
  }, [user?.id, calendarRepo, currentDateRange, fetchEventsByDateRange]);
  
  // Update an existing event
  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEventFormData>) => {
    setError(null);
    
    try {
      const updatedEvent = await calendarRepo.update(eventId, updates);
      
      // Update the events list
      setEvents(prev => 
        prev.map(event => event.id === eventId ? updatedEvent : event)
      );
      
      // Update type-based lists if type changed
      if ('type' in updates) {
        // Remove from all type lists first
        setClassEvents(prev => prev.filter(event => event.id !== eventId));
        setExamEvents(prev => prev.filter(event => event.id !== eventId));
        
        // Add to appropriate list
        if (updatedEvent.type === 'class') {
          setClassEvents(prev => [...prev, updatedEvent]);
        } else if (updatedEvent.type === 'exam') {
          setExamEvents(prev => [...prev, updatedEvent]);
        }
      }
      
      // If recurrence rule changed, regenerate instances
      if ('is_recurring' in updates || 'recurrence_rule' in updates) {
        if (updatedEvent.is_recurring && updatedEvent.recurrence_rule) {
          // Delete old instances first
          await calendarRepo.deleteRecurringEventInstances(eventId);
          
          // Create new instances within current date range
          const start = currentDateRange.start.toISOString();
          const end = currentDateRange.end.toISOString();
          await calendarRepo.createRecurringEventInstances(eventId, { start, end });
          
          // Refresh events for the current date range
          fetchEventsByDateRange(currentDateRange.start, currentDateRange.end);
        } else if (!updatedEvent.is_recurring) {
          // Delete instances if event is no longer recurring
          await calendarRepo.deleteRecurringEventInstances(eventId);
          
          // Refresh events
          fetchEventsByDateRange(currentDateRange.start, currentDateRange.end);
        }
      }
      
      // Update selected event if it's the one being edited
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(updatedEvent);
      }
      
      return updatedEvent;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Event not found: ${eventId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error updating event');
      }
      return null;
    }
  }, [selectedEvent, calendarRepo, currentDateRange, fetchEventsByDateRange]);
  
  // Delete an event
  const deleteEvent = useCallback(async (eventId: string, deleteRecurring: boolean = false) => {
    setError(null);
    
    try {
      const event = await calendarRepo.getById(eventId);
      
      // If it's a recurring event, handle instances
      if (event?.is_recurring && deleteRecurring) {
        await calendarRepo.deleteRecurringEventInstances(eventId);
      }
      
      await calendarRepo.delete(eventId);
      
      // Remove from all lists
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setClassEvents(prev => prev.filter(event => event.id !== eventId));
      setExamEvents(prev => prev.filter(event => event.id !== eventId));
      setUpcomingEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Clear selected event if it was the deleted one
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
      
      return true;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Event not found: ${eventId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error deleting event');
      }
      return false;
    }
  }, [selectedEvent, calendarRepo]);
  
  // Get an event by ID
  const getEventById = useCallback(async (eventId: string) => {
    setError(null);
    
    try {
      const event = await calendarRepo.getById(eventId);
      return event;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error getting event: ${eventId}`);
      return null;
    }
  }, [calendarRepo]);
  
  // Select an event (sets the selectedEvent state)
  const selectEvent = useCallback(async (eventId: string | null) => {
    if (eventId === null) {
      setSelectedEvent(null);
      return null;
    }
    
    const event = await getEventById(eventId);
    setSelectedEvent(event);
    return event;
  }, [getEventById]);
  
  // Change current view to show a specific date range
  const changeViewRange = useCallback(async (startDate: Date, endDate: Date) => {
    setCurrentDateRange({ start: startDate, end: endDate });
    return fetchEventsByDateRange(startDate, endDate);
  }, [fetchEventsByDateRange]);
  
  // Load events for the current date range when user changes
  useEffect(() => {
    if (user?.id) {
      fetchEventsByDateRange(currentDateRange.start, currentDateRange.end);
      fetchUpcomingEvents();
    }
  }, [user?.id, currentDateRange, fetchEventsByDateRange, fetchUpcomingEvents]);
  
  return {
    // Data
    events,
    classEvents,
    examEvents,
    upcomingEvents,
    selectedEvent,
    currentDateRange,
    loading,
    error,
    
    // Actions
    fetchEvents,
    fetchEventsByDateRange,
    fetchEventsByCourse,
    fetchUpcomingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    selectEvent,
    changeViewRange
  };
}
