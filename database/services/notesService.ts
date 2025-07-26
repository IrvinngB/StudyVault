import { ApiClient } from '../api/client';

export interface NoteData {
  id: string;
  user_id?: string;
  class_id?: string;
  title: string;
  content: string;
  ai_summary?: string;
  lesson_date?: string;
  tags: string[];
  local_files_path: string;
  attachments: AttachmentData[];
  is_favorite: boolean;
  last_edited?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttachmentData {
  filename: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  size: number;
  local_path: string;
  mime_type?: string;
  thumbnail_path?: string;
}

export interface CreateNoteRequest {
  class_id?: string;
  title: string;
  content: string;
  ai_summary?: string;
  lesson_date?: string;
  tags?: string[];
  local_files_path?: string;
  attachments?: AttachmentData[];
  is_favorite?: boolean;
}

export interface UpdateNoteRequest extends Partial<CreateNoteRequest> {
  id: string;
}

export interface NoteVersionData {
  id?: string;
  user_id?: string;
  note_id: string;
  content: string;
  ai_summary?: string;
  version_number: number;
  change_description?: string;
  device_created?: string;
  created_at?: string;
}

export interface CreateNoteVersionRequest {
  content: string;
  ai_summary?: string;
  change_description?: string;
  device_created?: string;
}

export interface NotesSearchParams {
  class_id?: string;
  lesson_date?: string;
  is_favorite?: boolean;
  tags?: string[];
}

export interface NotesDateRangeParams {
  start_date: string;
  end_date: string;
  class_id?: string;
}

class NotesService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = ApiClient.getInstance();
  }

  /**
   * Crear una nueva nota
   */
  async createNote(noteData: CreateNoteRequest): Promise<NoteData> {
    try {
      const dataToSend = {
        class_id: noteData.class_id,
        title: noteData.title,
        content: noteData.content,
        ...(noteData.ai_summary && { ai_summary: noteData.ai_summary }),
        ...(noteData.lesson_date && { lesson_date: noteData.lesson_date }),
        tags: noteData.tags || [],
        local_files_path: noteData.local_files_path || 'StudyFiles',
        attachments: noteData.attachments || [],
        is_favorite: noteData.is_favorite || false,
      };

      console.log('📝 NotesService: Creando nota:', dataToSend);
      
      const response = await this.apiClient.post<NoteData>('/notes/', dataToSend);
      
      console.log('✅ NotesService: Nota creada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al crear nota:', error);
      throw new Error(`No se pudo crear la nota: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener todas las notas del usuario con filtros opcionales
   */
  async getNotes(params?: NotesSearchParams): Promise<NoteData[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.class_id) queryParams.append('class_id', params.class_id);
      if (params?.lesson_date) queryParams.append('lesson_date', params.lesson_date);
      if (params?.is_favorite !== undefined) queryParams.append('is_favorite', params.is_favorite.toString());
      if (params?.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
      }

      const queryString = queryParams.toString();
      const url = queryString ? `/notes/?${queryString}` : '/notes/';
      
      console.log('📝 NotesService: Obteniendo notas:', url);
      
      const response = await this.apiClient.get<NoteData[]>(url);
      
      console.log('✅ NotesService: Notas obtenidas exitosamente:', response.length);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al obtener notas:', error);
      throw new Error(`No se pudieron obtener las notas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener una nota por ID
   */
  async getNoteById(noteId: string): Promise<NoteData> {
    try {
      console.log('📝 NotesService: Obteniendo nota por ID:', noteId);
      
      const response = await this.apiClient.get<NoteData>(`/notes/${noteId}`);
      
      console.log('✅ NotesService: Nota obtenida exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al obtener nota:', error);
      throw new Error(`No se pudo obtener la nota: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Actualizar una nota
   */
  async updateNote(noteData: UpdateNoteRequest): Promise<NoteData> {
    try {
      const { id, ...updateData } = noteData;
      
      console.log('📝 NotesService: Actualizando nota:', id, updateData);
      
      const response = await this.apiClient.put<NoteData>(`/notes/${id}`, updateData);
      
      console.log('✅ NotesService: Nota actualizada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al actualizar nota:', error);
      throw new Error(`No se pudo actualizar la nota: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Eliminar una nota
   */
  async deleteNote(noteId: string): Promise<{ message: string }> {
    try {
      console.log('📝 NotesService: Eliminando nota:', noteId);
      
      const response = await this.apiClient.delete<{ message: string }>(`/notes/${noteId}`);
      
      console.log('✅ NotesService: Nota eliminada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al eliminar nota:', error);
      throw new Error(`No se pudo eliminar la nota: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener versiones de una nota
   */
  async getNoteVersions(noteId: string, limit?: number): Promise<NoteVersionData[]> {
    try {
      const queryParams = limit ? `?limit=${limit}` : '';
      const url = `/notes/${noteId}/versions${queryParams}`;
      
      console.log('📝 NotesService: Obteniendo versiones de nota:', url);
      
      const response = await this.apiClient.get<NoteVersionData[]>(url);
      
      console.log('✅ NotesService: Versiones obtenidas exitosamente:', response.length);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al obtener versiones:', error);
      throw new Error(`No se pudieron obtener las versiones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Crear una nueva versión de nota (backup manual)
   */
  async createNoteVersion(noteId: string, versionData: CreateNoteVersionRequest): Promise<NoteVersionData> {
    try {
      console.log('📝 NotesService: Creando versión de nota:', noteId, versionData);
      
      const response = await this.apiClient.post<NoteVersionData>(`/notes/${noteId}/versions`, versionData);
      
      console.log('✅ NotesService: Versión creada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al crear versión:', error);
      throw new Error(`No se pudo crear la versión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener notas por clase
   */
  async getNotesByClass(classId: string): Promise<NoteData[]> {
    try {
      console.log('📝 NotesService: Obteniendo notas por clase:', classId);
      
      const response = await this.apiClient.get<NoteData[]>(`/notes/search/by-class/${classId}`);
      
      console.log('✅ NotesService: Notas por clase obtenidas exitosamente:', response.length);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al obtener notas por clase:', error);
      throw new Error(`No se pudieron obtener las notas de la clase: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener notas por rango de fechas
   */
  async getNotesByDateRange(params: NotesDateRangeParams): Promise<NoteData[]> {
    try {
      const queryParams = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
      });
      
      if (params.class_id) {
        queryParams.append('class_id', params.class_id);
      }
      
      const url = `/notes/search/by-date-range?${queryParams.toString()}`;
      
      console.log('📝 NotesService: Obteniendo notas por rango de fechas:', url);
      
      const response = await this.apiClient.get<NoteData[]>(url);
      
      console.log('✅ NotesService: Notas por fecha obtenidas exitosamente:', response.length);
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al obtener notas por fecha:', error);
      throw new Error(`No se pudieron obtener las notas por fecha: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Generar resumen de IA para una nota
   */
  async generateAISummary(noteId: string): Promise<{ message: string; ai_summary: string }> {
    try {
      console.log('📝 NotesService: Generando resumen de IA vía API Study:', noteId);
      // Llamar al endpoint de FastAPI que genera el resumen y actualiza la nota
      const response = await this.apiClient.post<{ message: string; ai_summary: string }>(`/notes/${noteId}/generate-summary`, {});
      if (!response || !response.ai_summary) {
        throw new Error('El backend no devolvió un resumen válido');
      }
      console.log('✅ NotesService: Resumen de IA generado y guardado exitosamente');
      return response;
    } catch (error) {
      console.error('❌ NotesService: Error al generar resumen de IA:', error);
      throw new Error(`No se pudo generar el resumen de IA: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Buscar notas por texto (búsqueda local en el cliente)
   */
  searchNotesLocally(notes: NoteData[], searchText: string): NoteData[] {
    if (!searchText.trim()) return notes;
    
    const lowercaseSearch = searchText.toLowerCase();
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowercaseSearch) ||
      note.content.toLowerCase().includes(lowercaseSearch) ||
      (note.ai_summary && note.ai_summary.toLowerCase().includes(lowercaseSearch)) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowercaseSearch))
    );
  }

  /**
   * Filtrar notas por favoritos
   */
  getFavoriteNotes(notes: NoteData[]): NoteData[] {
    return notes.filter(note => note.is_favorite);
  }

  /**
   * Obtener notas recientes (últimos 7 días)
   */
  getRecentNotes(notes: NoteData[], days: number = 7): NoteData[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return notes.filter(note => {
      if (!note.created_at) return false;
      const noteDate = new Date(note.created_at);
      return noteDate >= cutoffDate;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Agrupar notas por clase
   */
 groupNotesByClass(notes: NoteData[]): Record<string, NoteData[]> {
    return notes.reduce((groups, note) => {
      // Si class_id es undefined, usa una cadena por defecto para agruparlas.
      // Puedes elegir cualquier string que no choque con IDs reales.
      const classId = note.class_id || 'no-class'; // <--- CAMBIO CLAVE AQUÍ

      if (!groups[classId]) {
        groups[classId] = [];
      }
      groups[classId].push(note);
      return groups;
    }, {} as Record<string, NoteData[]>);
  }

  /**
   * Obtener estadísticas de notas
   */
  getNotesStats(notes: NoteData[]): {
    total: number;
    favorites: number;
    withAISummary: number;
    byClass: Record<string, number>;
    recentCount: number;
  } {
    const byClass = this.groupNotesByClass(notes);
    const byClassCount = Object.keys(byClass).reduce((acc, classId) => {
      acc[classId] = byClass[classId].length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: notes.length,
      favorites: notes.filter(n => n.is_favorite).length,
      withAISummary: notes.filter(n => n.ai_summary && n.ai_summary.trim().length > 0).length,
      byClass: byClassCount,
      recentCount: this.getRecentNotes(notes).length,
    };
  }
}

export const notesService = new NotesService();
export default notesService;
