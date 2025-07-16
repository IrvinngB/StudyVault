import { ApiClient } from '../api/client';

export interface GradeTypeData {
  name: string;
  description: string;
  id?: string;
  user_id?: string;
  created_at?: string;
}

export interface CreateGradeTypeRequest {
  name: string;
  description: string;
}

export interface UpdateGradeTypeRequest extends Partial<CreateGradeTypeRequest> {
    id: string
}

class GradeTypeService {
    private apiClient: ApiClient;

    constructor() {
        this.apiClient = ApiClient.getInstance();
    }

    /**
   * Crear una nuevo tipo de calificacion
   */

    async createGradeType (gradeTData : CreateGradeTypeRequest): Promise <GradeTypeData> {
        try{
            const response = await this.apiClient.post<GradeTypeData>('/grades_types/', gradeTData)
            return response;
        }catch (error) {
            console.error('❌ GradeService: Error al crear calificación:', error);
            throw new Error(`No se pudo crear la calificación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
   * Obtener todos los tipos de calificacion
   */
    async getAllGradeType(): Promise<GradeTypeData[]>{
        try{
            const response = await this.apiClient.get<GradeTypeData[]>('/grades_types/')
            return response;
        }catch(error){
            console.error('❌ GradeService: Error al obtener calificaciones:', error);
            throw new Error(`No se pudieron obtener las calificaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

     async getGradeTypeById(id: string): Promise<GradeTypeData> {
    try {
      const response = await this.apiClient.get<GradeTypeData>(`/grade_types/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener tipo de calificación:', error);
      throw new Error('No se pudo obtener el tipo de calificación');
    }
  }

  async updateGradeType(id: string, data: Partial<GradeTypeData>): Promise<GradeTypeData> {
    try {
      const response = await this.apiClient.put<GradeTypeData>(`/grade_types/${id}`, data);
      return response;
    } catch (error) {
      console.error('❌ Error al actualizar tipo de calificación:', error);
      throw new Error('No se pudo actualizar el tipo de calificación');
    }
  }

  async deleteGradeType(id: string): Promise<void> {
    try {
      await this.apiClient.delete(`/grade_types/${id}`);
    } catch (error) {
      console.error('❌ Error al eliminar tipo de calificación:', error);
      throw new Error('No se pudo eliminar el tipo de calificación');
    }
  }
}

    export const gradeTypeService = new GradeTypeService();
    export default gradeTypeService;

