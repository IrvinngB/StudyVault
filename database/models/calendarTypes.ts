/**
 * Tipos específicos para el sistema de calendario
 */

// Tipos de eventos disponibles
export type EventType = 
  | 'class' 
  | 'tarea' 
  | 'laboratorio' 
  | 'quiz' 
  | 'parcial' 
  | 'proyecto' 
  | 'examen_final' 
  | 'charla' 
  | 'dia_libre' 
  | 'recordatorio'

// Categorías principales de eventos
export type EventCategory = 'class' | 'grade_event' | 'general_event'

// Patrón de recurrencia
export interface RecurrencePattern {
  type: 'weekly' | 'daily' | 'monthly'
  interval: number // cada cuántos días/semanas/meses
  days_of_week?: number[] // para weekly: 0=domingo, 1=lunes, etc.
  end_date?: string // fecha límite para la recurrencia
  count?: number // número de ocurrencias
}

// Estructura principal del evento
export interface CalendarEvent {
  id: string
  user_id: string
  class_id?: string
  title: string
  description?: string
  start_datetime: string // ISO datetime string
  end_datetime: string // ISO datetime string
  location?: string // Para eventos generales
  classroom?: string // Para clases de cursos específicamente
  google_calendar_id?: string
  event_type: EventType
  event_category: EventCategory
  is_recurring: boolean
  recurrence_pattern?: RecurrencePattern
  reminder_minutes: number
  external_calendar_sync: Record<string, any>
  created_at: string
  updated_at: string
}

// Request para crear eventos
export interface CreateCalendarEventRequest {
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  class_id?: string
  location?: string // Para eventos generales
  classroom?: string // Para clases de cursos
  event_type: EventType
  event_category: EventCategory
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern
  reminder_minutes?: number
}

// Request para actualizar eventos
export interface UpdateCalendarEventRequest {
  title?: string
  description?: string
  start_datetime?: string
  end_datetime?: string
  class_id?: string
  location?: string
  classroom?: string
  event_type?: EventType
  event_category?: EventCategory
  is_recurring?: boolean
  recurrence_pattern?: RecurrencePattern
  reminder_minutes?: number
}

// Filtros para buscar eventos
export interface CalendarEventFilters {
  start_date?: string // YYYY-MM-DD
  end_date?: string // YYYY-MM-DD
  event_type?: EventType
  event_category?: EventCategory
  class_id?: string
}
