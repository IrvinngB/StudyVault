// @/database/services/gradeService.ts
import { ApiClient } from '../api/client'

export interface GradeData {
  id: string
  user_id: string
  class_id: string
  category_id: string
  title: string
  description?: string
  score: number
  max_score: number
  calendar_event_id?: string
  event_type?: string
  graded_at?: string
  created_at: string
  updated_at?: string
  value?: number
}

export interface CreateGradeRequest {
  class_id: string
  category_id: string
  title: string
  description?: string
  score: number
  max_score: number
  calendar_event_id?: string
  event_type?: string
  graded_at?: string
  value?: number // 1=activa/incompleta, 0=completada
}

export interface UpdateGradeRequest extends Partial<CreateGradeRequest> {}

class GradesService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = ApiClient.getInstance()
  }

  /**
   * Crear nueva calificación
   */
  async createGrade(gradeData: CreateGradeRequest): Promise<GradeData> {
    try {
      // Siempre enviar value: 1 si no está definido
      const valueToSend = gradeData.value !== undefined && gradeData.value !== null ? gradeData.value : 1;
      const payload = {
        class_id: gradeData.class_id,
        category_id: gradeData.category_id,
        ...(gradeData.title && { title: gradeData.title }),
        ...(gradeData.description && { description: gradeData.description }),
        ...(gradeData.score !== undefined && { score: gradeData.score }),
        ...(gradeData.max_score !== undefined && { max_score: gradeData.max_score }),
        ...(gradeData.calendar_event_id && { calendar_event_id: gradeData.calendar_event_id }),
        ...(gradeData.event_type && { event_type: gradeData.event_type }),
        ...(gradeData.graded_at && { graded_at: gradeData.graded_at }),
        value: valueToSend,
      }

      console.log('🟡 GradesService: Enviando payload de creación', payload)

      const response = await this.apiClient.post<GradeData>('/grades/', payload)

      console.log('✅ GradesService: Calificación creada', response)
      return response
    } catch (error) {
      console.error('❌ GradesService: Error al crear calificación', error)
      throw new Error(
        `No se pudo crear la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  /**
   * Obtener todas las calificaciones (por clase opcional)
   */
  async getGrades(classId?: string): Promise<GradeData[]> {
    try {
      const endpoint = classId ? `/grades/?class_id=${classId}` : '/grades/'
      console.log('🟡 GradesService: Obteniendo calificaciones desde', endpoint)

      const response = await this.apiClient.get<GradeData[]>(endpoint)

      console.log('✅ GradesService: Calificaciones recibidas', response.length)
      return response
    } catch (error) {
      console.error('❌ GradesService: Error al obtener calificaciones', error)
      throw new Error(
        `No se pudieron obtener las calificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  /**
   * Obtener una calificación por ID
   */
  async getGrade(id: string): Promise<GradeData> {
    try {
      console.log('🟡 GradesService: Buscando calificación', id)

      const response = await this.apiClient.get<GradeData>(`/grades/${id}`)

      console.log('✅ GradesService: Calificación recibida', response)
      return response
    } catch (error) {
      console.error('❌ GradesService: Error al obtener calificación', error)
      throw new Error(
        `No se pudo obtener la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  /**
   * Actualizar completamente una calificación (PUT)
   */
  async updateGrade(id: string, updateData: UpdateGradeRequest): Promise<GradeData> {
    try {
      const payload: Partial<GradeData> = {}

      if (updateData.title !== undefined) payload.title = updateData.title
      if (updateData.description !== undefined) payload.description = updateData.description
      if (updateData.score !== undefined) payload.score = updateData.score
      if (updateData.max_score !== undefined) payload.max_score = updateData.max_score
      if (updateData.calendar_event_id !== undefined) payload.calendar_event_id = updateData.calendar_event_id
      if (updateData.event_type !== undefined) payload.event_type = updateData.event_type
      if (updateData.graded_at !== undefined) payload.graded_at = updateData.graded_at

      console.log('🟡 GradesService: Payload de actualización', payload)

      const response = await this.apiClient.put<GradeData>(`/grades/${id}`, payload)

      console.log('✅ GradesService: Calificación actualizada', response)
      return response
    } catch (error) {
      console.error('❌ GradesService: Error al actualizar calificación', error)
      throw new Error(
        `No se pudo actualizar la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  /**
   * Actualizar parcialmente una calificación (PATCH)
   */
  /**
 * Actualizar parcialmente una calificación (PATCH)
 */
  async patchGrade(id: string, data: Partial<UpdateGradeRequest>): Promise<GradeData> {
    try {
      const payload: Partial<GradeData> = {}

      if (data.title !== undefined) payload.title = data.title
      if (data.description !== undefined) payload.description = data.description
      if (data.score !== undefined) payload.score = data.score
      if (data.max_score !== undefined) payload.max_score = data.max_score
      if (data.calendar_event_id !== undefined) payload.calendar_event_id = data.calendar_event_id
      if (data.event_type !== undefined) payload.event_type = data.event_type
      if (data.graded_at !== undefined) payload.graded_at = data.graded_at
      if (data.class_id !== undefined) payload.class_id = data.class_id
      if (data.category_id !== undefined) payload.category_id = data.category_id

      console.log('🟡 GradesService: PATCH de calificación', { id, payload })

      const response = await this.apiClient.patch<GradeData>(`/grades/${id}`, payload)

      console.log('✅ GradesService: Calificación actualizada (PATCH)', response)
      return response
    } catch (error) {
      console.error('❌ GradesService: Error al hacer PATCH', error)
      throw new Error(
        `No se pudo aplicar la actualización parcial: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      )
    }
  }


  /**
   * Eliminar una calificación
   */
  async deleteGrade(id: string): Promise<void> {
    try {
      console.log('🟡 GradesService: Eliminando calificación', id)

      await this.apiClient.delete(`/grades/${id}`)

      console.log('✅ GradesService: Calificación eliminada')
    } catch (error) {
      console.error('❌ GradesService: Error al eliminar calificación', error)
      throw new Error(
        `No se pudo eliminar la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }
}

export const gradesService = new GradesService()
