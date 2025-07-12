import { useState, useEffect, useCallback } from 'react';
import { notesService } from '../database/services/notesService';
import type { 
  NoteData, 
  CreateNoteRequest, 
  UpdateNoteRequest, 
  NotesSearchParams,
  NotesDateRangeParams,
  NoteVersionData,
  CreateNoteVersionRequest
} from '../database/services/notesService';

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

interface UseNoteVersionsResult {
  versions: NoteVersionData[];
  loading: boolean;
  error: string | null;
  refreshVersions: () => Promise<void>;
  createVersion: (versionData: CreateNoteVersionRequest) => Promise<NoteVersionData | null>;
}

export const useNotes = (initialParams?: NotesSearchParams): UseNotesResult => {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const notesData = await notesService.getNotes(initialParams);
      setNotes(notesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las notas');
      console.error('Error refreshing notes:', err);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  const createNote = useCallback(async (noteData: CreateNoteRequest): Promise<NoteData | null> => {
    try {
      setError(null);
      const newNote = await notesService.createNote(noteData);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la nota');
      console.error('Error creating note:', err);
      return null;
    }
  }, []);

  const updateNote = useCallback(async (noteData: UpdateNoteRequest): Promise<NoteData | null> => {
    try {
      setError(null);
      const updatedNote = await notesService.updateNote(noteData);
      setNotes(prev => 
        prev.map(note => 
          note.id === updatedNote.id ? updatedNote : note
        )
      );
      return updatedNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la nota');
      console.error('Error updating note:', err);
      return null;
    }
  }, []);

  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      setError(null);
      await notesService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la nota');
      console.error('Error deleting note:', err);
      return false;
    }
  }, []);

  const getNoteById = useCallback(async (noteId: string): Promise<NoteData | null> => {
    try {
      setError(null);
      return await notesService.getNoteById(noteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener la nota');
      console.error('Error getting note by id:', err);
      return null;
    }
  }, []);

  const searchNotes = useCallback((searchText: string): NoteData[] => {
    return notesService.searchNotesLocally(notes, searchText);
  }, [notes]);

  const filterNotes = useCallback(async (params: NotesSearchParams): Promise<NoteData[]> => {
    try {
      setError(null);
      return await notesService.getNotes(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al filtrar las notas');
      console.error('Error filtering notes:', err);
      return [];
    }
  }, []);

  const getNotesByClass = useCallback(async (classId: string): Promise<NoteData[]> => {
    try {
      setError(null);
      return await notesService.getNotesByClass(classId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener notas de la clase');
      console.error('Error getting notes by class:', err);
      return [];
    }
  }, []);

  const getNotesByDateRange = useCallback(async (params: NotesDateRangeParams): Promise<NoteData[]> => {
    try {
      setError(null);
      return await notesService.getNotesByDateRange(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener notas por fecha');
      console.error('Error getting notes by date range:', err);
      return [];
    }
  }, []);

  const generateAISummary = useCallback(async (noteId: string): Promise<string | null> => {
    try {
      setError(null);
      const response = await notesService.generateAISummary(noteId);
      
      // Actualizar la nota en el estado local
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
    }
  }, []);

  // Computed values
  const favoriteNotes = notesService.getFavoriteNotes(notes);
  const recentNotes = notesService.getRecentNotes(notes);
  const notesStats = notesService.getNotesStats(notes);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

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

export const useNoteVersions = (noteId: string): UseNoteVersionsResult => {
  const [versions, setVersions] = useState<NoteVersionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshVersions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
    try {
      setError(null);
      const newVersion = await notesService.createNoteVersion(noteId, versionData);
      setVersions(prev => [newVersion, ...prev]);
      return newVersion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la versión');
      console.error('Error creating version:', err);
      return null;
    }
  }, [noteId]);

  useEffect(() => {
    if (noteId) {
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

// Hook específico para notas de una clase
export const useClassNotes = (classId: string) => {
  return useNotes({ class_id: classId });
};

// Hook específico para notas favoritas
export const useFavoriteNotes = () => {
  return useNotes({ is_favorite: true });
};

// Hook para búsqueda de notas
export const useNotesSearch = () => {
  const [searchResults, setSearchResults] = useState<NoteData[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchNotes = useCallback(async (params: NotesSearchParams, searchText?: string) => {
    try {
      setSearchLoading(true);
      let results = await notesService.getNotes(params);
      
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
