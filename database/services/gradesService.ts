import { ApiClient } from '../api/client';

export interface GradeData {
  id?: string;
  user_id?: string;
  class_id: string;
  name: string;
  description?: string;
  value: number;
  calendar_event_id?: string;
  event_type?: string;
  title?: string;
  score: number;
  weight?: number;
  max_score?: number;
  graded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateGradeRequest {
  class_id: string;
  name: string;
  description?: string;
  value: number;
  calendar_event_id?: string;
  event_type?: string;
  title?: string;
  score: number;
  weight?: number;
  max_score?: number;
  graded_at?: string;
}

export interface UpdateGradeRequest extends Partial<CreateGradeRequest> {
  id: string;
}

class GradeService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Crear una nueva calificación
   */
  async createGrade(payload: CreateGradeRequest): Promise<GradeData> {
    try {
      return await this.apiClient.post<GradeData>('/grades/', payload);
    } catch (error) {
      console.error('❌ GradeService: Error al crear calificación:', error);
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`No se pudo crear la calificación: ${msg}`);
    }
  }

  /**
   * Obtener todas las calificaciones
   */
  async getAllGrades(): Promise<GradeData[]> {
    try {
      return await this.apiClient.get<GradeData[]>('/grades/');
    } catch (error) {
      console.error('❌ GradeService: Error al obtener calificaciones:', error);
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`No se pudieron obtener las calificaciones: ${msg}`);
    }
  }

  /**
   * Obtener una calificación por ID
   */
  async getGradeById(id: string): Promise<GradeData> {
    try {
      return await this.apiClient.get<GradeData>(`/grades/${id}`);
    } catch (error) {
      console.error('❌ GradeService: Error al obtener calificación:', error);
      throw new Error('No se pudo obtener la calificación');
    }
  }

  /**
   * Actualizar una calificación
   */
  async updateGrade(id: string, data: Partial<CreateGradeRequest>): Promise<GradeData> {
    try {
      return await this.apiClient.put<GradeData>(`/grades/${id}`, data);
    } catch (error) {
      console.error('❌ GradeService: Error al actualizar calificación:', error);
      throw new Error('No se pudo actualizar la calificación');
    }
  }

  /**
   * Eliminar una calificación
   */
  async deleteGrade(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/grades/${id}`);
    } catch (error) {
      console.error('❌ GradeService: Error al eliminar calificación:', error);
      throw new Error('No se pudo eliminar la calificación');
    }
  }
}

// Singleton export
export const gradeService = new GradeService();
export default gradeService;
