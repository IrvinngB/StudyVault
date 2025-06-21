import { ApiClient } from '../api/client';

export interface ClassData {
  id?: string;
  name: string;
  code?: string;
  instructor?: string;
  color: string;
  credits?: number;
  semester?: string;
  description?: string;
  syllabus_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CreateClassRequest {
  name: string;
  code?: string;
  instructor?: string;
  color?: string;
  credits?: number;
  semester?: string;
  description?: string;
  syllabus_url?: string;
  is_active?: boolean;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {
  id: string;
}

class ClassService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Crear una nueva clase - usando endpoint correcto con slash final
   */  async createClass(classData: CreateClassRequest): Promise<ClassData> {
    try {
      // Preparar datos exactamente como lo espera el API
      const dataToSend = {
        name: classData.name,
        ...(classData.code && { code: classData.code }),
        ...(classData.instructor && { instructor: classData.instructor }),
        ...(classData.color && { color: classData.color }),
        ...(classData.credits && { credits: classData.credits }),
        ...(classData.semester && { semester: classData.semester }),
        ...(classData.description && { description: classData.description }),        ...(classData.syllabus_url && { syllabus_url: classData.syllabus_url }),
        is_active: classData.is_active ?? true
      };

      // Usar endpoint correcto con slash final
      const response = await this.apiClient.post<ClassData>('/classes/', dataToSend);

      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al crear clase:', error);
      throw new Error(`No se pudo crear la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener todas las clases del usuario
   */  async getAllClasses(): Promise<ClassData[]> {
    try {
      const response = await this.apiClient.get<ClassData[]>('/classes/');
      
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al obtener clases:', error);
      throw new Error(`No se pudieron obtener las clases: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener una clase por ID
   */
  async getClassById(classId: string): Promise<ClassData> {    try {
      const response = await this.apiClient.get<ClassData>(`/classes/${classId}`);
      
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al obtener clase:', error);
      throw new Error(`No se pudo obtener la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar una clase
   */  async updateClass(classData: UpdateClassRequest): Promise<ClassData> {
    try {
      const { id, ...updateData } = classData;
      const response = await this.apiClient.put<ClassData>(`/classes/${id}`, updateData);
      
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al actualizar clase:', error);
      throw new Error(`No se pudo actualizar la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar una clase
   */  async deleteClass(classId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/classes/${classId}`);
      
    } catch (error) {
      console.error('❌ ClassService: Error al eliminar clase:', error);
      throw new Error(`No se pudo eliminar la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Exportar una instancia singleton
export const classService = new ClassService();
export default classService;