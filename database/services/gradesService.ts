import { ApiClient } from '../api/client';

export interface GradeData {
  id?: string;
  user_id?: string;
  class_id: string;
  grade_type_id: string;
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
  grade_type_id: string;
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
  async createGrade(gradeData: CreateGradeRequest): Promise<GradeData> {
    try {
      const response = await this.apiClient.post<GradeData>('/grades/', gradeData);
      return response;
    } catch (error) {
      console.error('❌ GradeService: Error al crear calificación:', error);
      throw new Error(`No se pudo crear la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener todas las calificaciones
   */
  async getAllGrades(): Promise<GradeData[]> {
    try {
      const response = await this.apiClient.get<GradeData[]>('/grades/');
      return response;
    } catch (error) {
      console.error('❌ GradeService: Error al obtener calificaciones:', error);
      throw new Error(`No se pudieron obtener las calificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener una calificación por ID
   */
  async getGradeById(gradeId: string): Promise<GradeData> {
    try {
      const response = await this.apiClient.get<GradeData>(`/grades/${gradeId}`);
      return response;
    } catch (error) {
      console.error('❌ GradeService: Error al obtener calificación:', error);
      throw new Error(`No se pudo obtener la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar una calificación
   */
  async updateGrade(gradeId: string, gradeData: Partial<GradeData>): Promise<GradeData> {
    try {
      const payload: Partial<GradeData> = { ...gradeData };
      const response = await this.apiClient.put<GradeData>(`/grades/${gradeId}`, payload);
      return response;
    } catch (error) {
      console.error('❌ GradeService: Error al actualizar calificación:', error);
      throw new Error(`No se pudo actualizar la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar una calificación
   */
  async deleteGrade(gradeId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/grades/${gradeId}`);
    } catch (error) {
      console.error('❌ GradeService: Error al eliminar calificación:', error);
      throw new Error(`No se pudo eliminar la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Exportar una instancia singleton
export const gradeService = new GradeService();
export default gradeService;
