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
  is_active: boolean;
  is_synced?: boolean;
  needs_sync?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface CreateClassRequest {
  name: string;
  code?: string;
  instructor?: string;
  color: string;
  credits?: number;
  semester?: string;
  description?: string;
  is_active: boolean;
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
   * Crear una nueva clase
   */
  async createClass(classData: CreateClassRequest): Promise<ClassData> {
    try {
      console.log('📚 ClassService: Creando clase:', classData);
      
      const response = await this.apiClient.post<ClassData>('/classes', {
        ...classData,
        is_active: classData.is_active ?? true
      });

      console.log('✅ ClassService: Clase creada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al crear clase:', error);
      throw new Error(`No se pudo crear la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener todas las clases del usuario
   */
  async getAllClasses(): Promise<ClassData[]> {
    try {
      console.log('📚 ClassService: Obteniendo todas las clases');
      
      const response = await this.apiClient.get<ClassData[]>('/classes');
      
      console.log('✅ ClassService: Clases obtenidas exitosamente:', response.length);
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al obtener clases:', error);
      throw new Error(`No se pudieron obtener las clases: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener una clase por ID
   */
  async getClassById(classId: string): Promise<ClassData> {
    try {
      console.log('📚 ClassService: Obteniendo clase por ID:', classId);
      
      const response = await this.apiClient.get<ClassData>(`/classes/${classId}`);
      
      console.log('✅ ClassService: Clase obtenida exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al obtener clase:', error);
      throw new Error(`No se pudo obtener la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar una clase
   */
  async updateClass(classData: UpdateClassRequest): Promise<ClassData> {
    try {
      console.log('📚 ClassService: Actualizando clase:', classData);
      
      const { id, ...updateData } = classData;
      const response = await this.apiClient.put<ClassData>(`/classes/${id}`, updateData);
      
      console.log('✅ ClassService: Clase actualizada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al actualizar clase:', error);
      throw new Error(`No se pudo actualizar la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar una clase
   */
  async deleteClass(classId: string): Promise<void> {
    try {
      console.log('📚 ClassService: Eliminando clase:', classId);
      
      await this.apiClient.delete(`/classes/${classId}`);
      
      console.log('✅ ClassService: Clase eliminada exitosamente');
    } catch (error) {
      console.error('❌ ClassService: Error al eliminar clase:', error);
      throw new Error(`No se pudo eliminar la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener clases activas del semestre actual
   */
  async getActiveClasses(semester?: string): Promise<ClassData[]> {
    try {
      console.log('📚 ClassService: Obteniendo clases activas del semestre:', semester);
      
      const params = semester ? `?semester=${semester}&is_active=true` : '?is_active=true';
      const response = await this.apiClient.get<ClassData[]>(`/classes${params}`);
      
      console.log('✅ ClassService: Clases activas obtenidas exitosamente:', response.length);
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error al obtener clases activas:', error);
      throw new Error(`No se pudieron obtener las clases activas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Buscar clases por nombre o código
   */
  async searchClasses(query: string): Promise<ClassData[]> {
    try {
      console.log('📚 ClassService: Buscando clases:', query);
      
      const response = await this.apiClient.get<ClassData[]>(`/classes/search?q=${encodeURIComponent(query)}`);
      
      console.log('✅ ClassService: Búsqueda completada:', response.length);
      return response;
    } catch (error) {
      console.error('❌ ClassService: Error en la búsqueda:', error);
      throw new Error(`No se pudo realizar la búsqueda: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Exportar una instancia singleton
export const classService = new ClassService();
export default classService;