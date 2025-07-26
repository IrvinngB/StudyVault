import { ApiClient } from '../api/client'
import type {
    CalendarEvent,
    CalendarEventFilters,
    CreateCalendarEventRequest,
    EventType,
    UpdateCalendarEventRequest
} from '../models/calendarTypes'
import type {
    ApiResponse
} from '../models/types'

export class CalendarService {
  private apiClient = ApiClient.getInstance()

  /**
   * Obtener eventos del calendario con filtros opcionales
   */
  async getEvents(filters?: CalendarEventFilters): Promise<ApiResponse<CalendarEvent[]>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters?.start_date) queryParams.append('start_date', filters.start_date)
      if (filters?.end_date) queryParams.append('end_date', filters.end_date)
      if (filters?.event_type) queryParams.append('event_type', filters.event_type)
      if (filters?.class_id) queryParams.append('class_id', filters.class_id)

      const url = `/calendar${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const data = await this.apiClient.get<CalendarEvent[]>(url)
      
      return {
        success: true,
        data: data
      }
    } catch (error: any) {
      console.error('Error fetching calendar events:', error)
      return {
        success: false,
        error: error.message || 'Error al obtener eventos del calendario'
      }
    }
  }

  /**
   * Obtener un evento específico por ID
   */
  async getEvent(eventId: string): Promise<ApiResponse<CalendarEvent>> {
    try {
      const data = await this.apiClient.get<CalendarEvent>(`/calendar/${eventId}`)
      
      return {
        success: true,
        data: data
      }
    } catch (error: any) {
      console.error('Error fetching calendar event:', error)
      return {
        success: false,
        error: error.message || 'Error al obtener el evento'
      }
    }
  }

  /**
   * Crear un nuevo evento en el calendario
   */
  async createEvent(eventData: CreateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> {
    try {
      const data = await this.apiClient.post<CalendarEvent>('/calendar', eventData)
      
      return {
        success: true,
        data: data
      }
    } catch (error: any) {
      console.error('Error creating calendar event:', error)
      return {
        success: false,
        error: error.message || 'Error al crear el evento'
      }
    }
  }

  /**
   * Actualizar un evento existente (actualización completa)
   */
  async updateEvent(eventId: string, eventData: UpdateCalendarEventRequest): Promise<ApiResponse<CalendarEvent>> {
    try {
      const data = await this.apiClient.put<CalendarEvent>(`/calendar/${eventId}`, eventData)
      
      return {
        success: true,
        data: data
      }
    } catch (error: any) {
      console.error('Error updating calendar event:', error)
      return {
        success: false,
        error: error.message || 'Error al actualizar el evento'
      }
    }
  }

  /**
   * Actualizar parcialmente un evento existente
   */
  async patchEvent(eventId: string, eventData: Partial<UpdateCalendarEventRequest>): Promise<ApiResponse<CalendarEvent>> {
    try {
      const data = await this.apiClient.patch<CalendarEvent>(`/calendar/${eventId}`, eventData)
      
      return {
        success: true,
        data: data
      }
    } catch (error: any) {
      console.error('Error patching calendar event:', error)
      return {
        success: false,
        error: error.message || 'Error al actualizar el evento'
      }
    }
  }

  /**
   * Eliminar un evento del calendario
   */
  async deleteEvent(eventId: string): Promise<ApiResponse<void>> {
    try {
      await this.apiClient.delete(`/calendar/${eventId}`)
      
      return {
        success: true
      }
    } catch (error: any) {
      console.error('Error deleting calendar event:', error)
      return {
        success: false,
        error: error.message || 'Error al eliminar el evento'
      }
    }
  }

  /**
   * Obtener eventos para un día específico
   */
  async getEventsForDay(date: string): Promise<ApiResponse<CalendarEvent[]>> {
    return this.getEvents({
      start_date: date,
      end_date: date
    })
  }

  /**
   * Obtener eventos para un rango de fechas
   */
  async getEventsForDateRange(startDate: string, endDate: string): Promise<ApiResponse<CalendarEvent[]>> {
    return this.getEvents({
      start_date: startDate,
      end_date: endDate
    })
  }

  /**
   * Obtener eventos por tipo
   */
  async getEventsByType(eventType: EventType): Promise<ApiResponse<CalendarEvent[]>> {
    return this.getEvents({
      event_type: eventType
    })
  }

  /**
   * Obtener eventos de una clase específica
   */
  async getEventsForClass(classId: string): Promise<ApiResponse<CalendarEvent[]>> {
    return this.getEvents({
      class_id: classId
    })
  }
}

// Export singleton instance
export const calendarService = new CalendarService()
