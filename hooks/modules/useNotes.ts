import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotFoundError, QueryOptions } from '../../lib/database/repositories/base.repository';
import { Note, NoteAttachment } from '../../lib/database/schemas/note.schema';
import { useAuth } from '../../lib/hooks/useAuth';

/**
 * Hook for managing notes and note attachments
 */
export type NoteFormData = Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>;
export type NoteAttachmentFormData = Omit<NoteAttachment, 'id' | 'created_at' | 'note_id'>;

// Using a placeholder for NoteRepository until it's implemented
class NoteRepository {
  async getAll(options?: QueryOptions): Promise<Note[]> {
    // Placeholder
    return [];
  }

  async getById(id: string): Promise<Note | null> {
    // Placeholder
    return null;
  }

  async create(noteData: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    // Placeholder
    return {} as Note;
  }

  async update(id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<Note> {
    // Placeholder
    return {} as Note;
  }

  async delete(id: string): Promise<void> {
    // Placeholder
  }

  async getNotesByCourse(userId: string, courseId: string): Promise<Note[]> {
    // Placeholder
    return [];
  }

  async getFavoriteNotes(userId: string): Promise<Note[]> {
    // Placeholder
    return [];
  }

  async getRecentlyViewedNotes(userId: string, limit: number = 10): Promise<Note[]> {
    // Placeholder
    return [];
  }

  async addAttachment(attachment: Omit<NoteAttachment, 'id' | 'created_at'>): Promise<NoteAttachment> {
    // Placeholder
    return {} as NoteAttachment;
  }

  async getAttachments(noteId: string): Promise<NoteAttachment[]> {
    // Placeholder
    return [];
  }

  async removeAttachment(attachmentId: string): Promise<void> {
    // Placeholder
  }

  async searchNotes(userId: string, query: string): Promise<Note[]> {
    // Placeholder
    return [];
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNoteAttachments, setSelectedNoteAttachments] = useState<NoteAttachment[]>([]);
  
  const { user } = useAuth();
  const noteRepo = useMemo(() => new NoteRepository(), []);

  // Fetch all notes for the current user
  const fetchNotes = useCallback(async (options?: QueryOptions) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = { user_id: user.id, ...options?.filters };
      const allNotes = await noteRepo.getAll({ 
        ...options,
        filters,
        sort: options?.sort || { field: 'updated_at', direction: 'DESC' }
      });
      
      setNotes(allNotes);
      return allNotes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching notes');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, noteRepo]);

  // Fetch favorite notes
  const fetchFavoriteNotes = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      const favNotes = await noteRepo.getFavoriteNotes(user.id);
      setFavoriteNotes(favNotes);
      return favNotes;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching favorite notes');
      return [];
    }
  }, [user?.id, noteRepo]);

  // Fetch recently viewed notes
  const fetchRecentNotes = useCallback(async (limit: number = 10) => {
    if (!user?.id) return [];
    
    try {
      const recent = await noteRepo.getRecentlyViewedNotes(user.id, limit);
      setRecentNotes(recent);
      return recent;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching recent notes');
      return [];
    }
  }, [user?.id, noteRepo]);
  
  // Fetch notes by course
  const fetchNotesByCourse = useCallback(async (courseId: string) => {
    if (!user?.id) return [];
    
    try {
      return await noteRepo.getNotesByCourse(user.id, courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching notes by course');
      return [];
    }
  }, [user?.id, noteRepo]);
  
  // Create a new note
  const createNote = useCallback(async (noteData: NoteFormData) => {
    if (!user?.id) return null;
    
    setError(null);
    
    try {
      const newNote = await noteRepo.create({
        ...noteData,
        user_id: user.id,
        is_favorite: noteData.is_favorite || false,
        is_archived: noteData.is_archived || false,
        tags: noteData.tags || '[]',
        linked_tasks: noteData.linked_tasks || '[]',
        linked_events: noteData.linked_events || '[]',
      });
      
      // Update the notes list
      setNotes(prev => [newNote, ...prev]);
      
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating note');
      return null;
    }
  }, [user?.id, noteRepo]);
  
  // Update an existing note
  const updateNote = useCallback(async (noteId: string, updates: Partial<NoteFormData>) => {
    setError(null);
    
    try {
      const updatedNote = await noteRepo.update(noteId, updates);
      
      // Update the notes list
      setNotes(prev => 
        prev.map(note => note.id === noteId ? updatedNote : note)
      );
      
      // Update favorite notes if applicable
      if ('is_favorite' in updates) {
        setFavoriteNotes(prev => {
          if (updates.is_favorite) {
            // Add to favorites if not already there
            if (!prev.find(note => note.id === noteId)) {
              return [...prev, updatedNote];
            }
          } else {
            // Remove from favorites
            return prev.filter(note => note.id !== noteId);
          }
          return prev;
        });
      }
      
      // Update selected note if it's the one being edited
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNote);
      }
      
      return updatedNote;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Note not found: ${noteId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error updating note');
      }
      return null;
    }
  }, [selectedNote, noteRepo]);
  
  // Delete a note
  const deleteNote = useCallback(async (noteId: string) => {
    setError(null);
    
    try {
      await noteRepo.delete(noteId);
      
      // Remove from all lists
      setNotes(prev => prev.filter(note => note.id !== noteId));
      setFavoriteNotes(prev => prev.filter(note => note.id !== noteId));
      setRecentNotes(prev => prev.filter(note => note.id !== noteId));
      
      // Clear selected note if it was the deleted one
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setSelectedNoteAttachments([]);
      }
      
      return true;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Note not found: ${noteId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error deleting note');
      }
      return false;
    }
  }, [selectedNote, noteRepo]);
  
  // Toggle favorite status
  const toggleFavorite = useCallback(async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return false;
    
    return updateNote(noteId, { is_favorite: !note.is_favorite });
  }, [notes, updateNote]);
  
  // Toggle archive status
  const toggleArchive = useCallback(async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return false;
    
    return updateNote(noteId, { is_archived: !note.is_archived });
  }, [notes, updateNote]);
  
  // Get a note by ID
  const getNoteById = useCallback(async (noteId: string) => {
    setError(null);
    
    try {
      const note = await noteRepo.getById(noteId);
      return note;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error getting note: ${noteId}`);
      return null;
    }
  }, [noteRepo]);
  
  // Select a note (sets the selectedNote state and fetches its attachments)
  const selectNote = useCallback(async (noteId: string | null) => {
    if (noteId === null) {
      setSelectedNote(null);
      setSelectedNoteAttachments([]);
      return null;
    }
    
    try {
      const note = await getNoteById(noteId);
      setSelectedNote(note);
      
      if (note) {
        // Mark as viewed and fetch attachments
        await updateNote(noteId, { last_viewed_at: new Date().toISOString() });
        const attachments = await noteRepo.getAttachments(noteId);
        setSelectedNoteAttachments(attachments);
      }
      
      return note;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error selecting note: ${noteId}`);
      return null;
    }
  }, [getNoteById, updateNote, noteRepo]);
  
  // Add attachment to a note
  const addAttachment = useCallback(async (noteId: string, attachmentData: NoteAttachmentFormData) => {
    setError(null);
    
    try {
      const attachment = await noteRepo.addAttachment({
        ...attachmentData,
        note_id: noteId
      });
      
      // Update selected note attachments if applicable
      if (selectedNote?.id === noteId) {
        setSelectedNoteAttachments(prev => [...prev, attachment]);
      }
      
      return attachment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding attachment');
      return null;
    }
  }, [selectedNote, noteRepo]);
  
  // Remove attachment from a note
  const removeAttachment = useCallback(async (attachmentId: string) => {
    setError(null);
    
    try {
      await noteRepo.removeAttachment(attachmentId);
      
      // Update selected note attachments
      setSelectedNoteAttachments(prev => prev.filter(a => a.id !== attachmentId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error removing attachment');
      return false;
    }
  }, [noteRepo]);
  
  // Search for notes
  const searchNotes = useCallback(async (query: string) => {
    if (!user?.id || !query) return [];
    
    try {
      return await noteRepo.searchNotes(user.id, query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching notes');
      return [];
    }
  }, [user?.id, noteRepo]);
  
  // Load notes on initial render and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotes();
      fetchFavoriteNotes();
      fetchRecentNotes();
    }
  }, [user?.id, fetchNotes, fetchFavoriteNotes, fetchRecentNotes]);
  
  return {
    // Data
    notes,
    favoriteNotes,
    recentNotes,
    selectedNote,
    selectedNoteAttachments,
    loading,
    error,
    
    // Actions
    fetchNotes,
    fetchFavoriteNotes,
    fetchRecentNotes,
    fetchNotesByCourse,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    toggleArchive,
    getNoteById,
    selectNote,
    addAttachment,
    removeAttachment,
    searchNotes
  };
}
