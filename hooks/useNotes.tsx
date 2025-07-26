// src/hooks/useNotes.ts
import { useCallback, useEffect, useState } from 'react';
// Asegúrate de que la ruta a notesService sea correcta según tu estructura de proyecto
import type {
  CreateNoteRequest,
  CreateNoteVersionRequest,
  NoteData,
  NotesDateRangeParams,
  NotesSearchParams,
  NoteVersionData,
  UpdateNoteRequest
} from '../database/services/notesService'; // Importamos también los tipos desde notesService
import { notesService } from '../database/services/notesService';

/**
 * Define la interfaz de los resultados que el hook useNotes devuelve.
 * Esto ayuda a TypeScript a asegurar que estás usando las propiedades correctas.
 */
interface UseNotesResult {
  notes: NoteData[];
  loading: boolean;
  error: string | null;
  refreshNotes: () => Promise<void>;
  createNote: (noteData: CreateNoteRequest) => Promise<NoteData | null>;
  updateNote: (noteData: UpdateNoteRequest) => Promise<NoteData | null>;
  deleteNote: (noteId: string) => Promise<boolean>;
  getNoteById: (noteId: string) => Promise<NoteData | null>;
  searchNotes: (searchText: string) => NoteData[];
  filterNotes: (params: NotesSearchParams) => Promise<NoteData[]>;
  getNotesByClass: (classId: string) => Promise<NoteData[]>;
  getNotesByDateRange: (params: NotesDateRangeParams) => Promise<NoteData[]>;
  generateAISummary: (noteId: string) => Promise<string | null>;
  favoriteNotes: NoteData[];
  recentNotes: NoteData[];
  notesStats: {
    total: number;
    favorites: number;
    withAISummary: number;
    byClass: Record<string, number>;
    recentCount: number;
  };
}

/**
 * Define la interfaz de los resultados que el hook useNoteVersions devuelve.
 */
interface UseNoteVersionsResult {
  versions: NoteVersionData[];
  loading: boolean;
  error: string | null;
  refreshVersions: () => Promise<void>;
  createVersion: (versionData: CreateNoteVersionRequest) => Promise<NoteVersionData | null>;
}

/**
 * Hook principal para gestionar todas las operaciones y el estado de las notas.
 * @param initialParams Parámetros iniciales para filtrar las notas al cargarlas por primera vez.
 */
export const useNotes = (initialParams?: NotesSearchParams): UseNotesResult => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true); // Se inicia en true para indicar que carga datos al inicio
  const [error, setError] = useState<string | null>(null);

  // Función para cargar/refrescar las notas desde el servicio de notas
  // Envuelve en useCallback para optimización y estabilidad de las dependencias de useEffect
  const refreshNotes = useCallback(async () => {
    setLoading(true); // Activa el estado de carga al iniciar la operación
    setError(null); // Limpia cualquier error previo
    try {
      const notesData = await notesService.getNotes(initialParams); // Llama al servicio para obtener las notas
      setNotes(notesData); // Actualiza el estado local con las notas obtenidas
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las notas');
      console.error('Error refreshing notes:', err);
    } finally {
      setLoading(false); // Desactiva el estado de carga, independientemente del resultado
    }
  }, [initialParams]); // `initialParams` como dependencia: si cambia, `refreshNotes` se recrea y el `useEffect` se disparará

  // Función para crear una nueva nota
  const createNote = useCallback(async (noteData: CreateNoteRequest): Promise<NoteData | null> => {
    setLoading(true); 
    try {
      setError(null);
      const newNote = await notesService.createNote(noteData);
      setNotes(prev => [newNote, ...prev]); // Actualización optimista de la UI: añade la nueva nota al principio
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la nota');
      console.error('Error creating note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar una nota existente (¡Clave para el favorito!)
  const updateNote = useCallback(async (noteData: UpdateNoteRequest): Promise<NoteData | null> => {
    setLoading(true); 
    try {
      setError(null);
      const updatedNote = await notesService.updateNote(noteData); // Llama al servicio para persistir el cambio
      setNotes(prev => 
        prev.map(note => 
          note.id === updatedNote.id ? updatedNote : note // Actualiza la nota en el estado local
        )
      );
      return updatedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la nota');
      console.error('Error updating note:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // No depende de `notes` directamente aquí para evitar bucles, el `map` funciona con `prev`

  // Función para eliminar una nota
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    setLoading(true); 
    try {
      setError(null);
      await notesService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId)); // Elimina la nota del estado local
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la nota');
      console.error('Error deleting note:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener una nota por su ID
  const getNoteById = useCallback(async (noteId: string): Promise<NoteData | null> => {
    setLoading(true); 
    try {
      setError(null);
      return await notesService.getNoteById(noteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener la nota');
      console.error('Error getting note by id:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para buscar notas localmente (no es asíncrona, opera sobre el estado actual `notes`)
  const searchNotes = useCallback((searchText: string): NoteData[] => {
    return notesService.searchNotesLocally(notes, searchText);
  }, [notes]); // Depende de `notes` porque opera sobre su valor actual

  // Función para filtrar notas llamando al servicio (puede ser útil para filtros complejos del backend)
  const filterNotes = useCallback(async (params: NotesSearchParams): Promise<NoteData[]> => {
    setLoading(true); 
    try {
      setError(null);
      // Aquí podrías elegir si actualizar el estado `notes` global o solo devolver el resultado filtrado
      const filtered = await notesService.getNotes(params); 
      // Si quieres que este filtro actualice la lista principal: setNotes(filtered);
      return filtered;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar las notas');
      console.error('Error filtering notes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener notas por ID de clase
  const getNotesByClass = useCallback(async (classId: string): Promise<NoteData[]> => {
    setLoading(true); 
    try {
      setError(null);
      return await notesService.getNotesByClass(classId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener notas de la clase');
      console.error('Error getting notes by class:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener notas por rango de fechas
  const getNotesByDateRange = useCallback(async (params: NotesDateRangeParams): Promise<NoteData[]> => {
    setLoading(true); 
    try {
      setError(null);
      return await notesService.getNotesByDateRange(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener notas por fecha');
      console.error('Error getting notes by date range:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para generar resumen de IA para una nota
  const generateAISummary = useCallback(async (noteId: string): Promise<string | null> => {
    setLoading(true); 
    try {
      setError(null);
      const response = await notesService.generateAISummary(noteId);
      
      // Actualizar la nota en el estado local con el resumen generado
      setNotes(prev => 
        prev.map(note => 
          note.id === noteId 
            ? { ...note, ai_summary: response.ai_summary }
            : note
        )
      );
      
      return response.ai_summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar resumen de IA');
      console.error('Error generating AI summary:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Valores computados que se derivan del estado `notes`
  // Se recalculan automáticamente cada vez que `notes` cambia
  const favoriteNotes = notesService.getFavoriteNotes(notes);
  const recentNotes = notesService.getRecentNotes(notes);
  const notesStats = notesService.getNotesStats(notes);

  // Efecto para la carga inicial de las notas cuando el hook se monta
  // Se ejecuta una vez al inicio o cuando `refreshNotes` cambia (lo cual no debería ocurrir con useCallback estable)
  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  // Retorna el estado y las funciones para que los componentes puedan utilizarlos
  return {
    notes,
    loading,
    error,
    refreshNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    searchNotes,
    filterNotes,
    getNotesByClass,
    getNotesByDateRange,
    generateAISummary,
    favoriteNotes,
    recentNotes,
    notesStats,
  };
};

// --- Otros Hooks relacionados con Notas (Mantenerlos si los necesitas en tu app) ---

/**
 * Hook para gestionar las versiones de una nota específica.
 * @param noteId El ID de la nota cuyas versiones se quieren gestionar.
 */
export const useNoteVersions = (noteId: string): UseNoteVersionsResult => {
  const [versions, setVersions] = useState<NoteVersionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshVersions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const versionsData = await notesService.getNoteVersions(noteId);
      setVersions(versionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las versiones');
      console.error('Error refreshing versions:', err);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  const createVersion = useCallback(async (versionData: CreateNoteVersionRequest): Promise<NoteVersionData | null> => {
    setLoading(true);
    try {
      setError(null);
      const newVersion = await notesService.createNoteVersion(noteId, versionData);
      setVersions(prev => [newVersion, ...prev]);
      return newVersion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la versión');
      console.error('Error creating version:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  // Efecto para la carga inicial de las versiones cuando el hook se monta o noteId cambia
  useEffect(() => {
    if (noteId) { // Solo si noteId existe, para evitar llamadas a la API con un ID inválido
      refreshVersions();
    }
  }, [refreshVersions, noteId]);

  return {
    versions,
    loading,
    error,
    refreshVersions,
    createVersion,
  };
};

/**
 * Hook específico para obtener y gestionar notas de una clase en particular.
 * Simplemente utiliza el hook `useNotes` con un parámetro `class_id`.
 */
export const useClassNotes = (classId: string) => {
  return useNotes({ class_id: classId });
};

/**
 * Hook específico para obtener y gestionar solo las notas favoritas.
 * Simplemente utiliza el hook `useNotes` con el parámetro `is_favorite: true`.
 */
export const useFavoriteNotes = () => {
  return useNotes({ is_favorite: true });
};

/**
 * Hook para manejar la funcionalidad de búsqueda de notas.
 * Permite buscar tanto a nivel de API como localmente en los resultados.
 */
export const useNotesSearch = () => {
  const [searchResults, setSearchResults] = useState<NoteData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchNotes = useCallback(async (params: NotesSearchParams, searchText?: string) => {
    setSearchLoading(true);
    try {
      // Obtiene las notas de la API según los parámetros
      let results = await notesService.getNotes(params);
      
      // Si hay texto de búsqueda, filtra adicionalmente localmente
      if (searchText) {
        results = notesService.searchNotesLocally(results, searchText);
      }
      
      setSearchResults(results);
      return results;
    } catch (err) {
      console.error('Error searching notes:', err);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, []);

  return {
    searchResults,
    searchLoading,
    searchNotes,
  };
};
