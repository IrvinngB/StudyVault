// Export all services
export { AuthService } from './authService';
export { classService } from './courseService';
export { notesService } from './notesService';

// Export types
export type {
  ClassData,
  CreateClassRequest,
  UpdateClassRequest
} from './courseService';

export type {
  NoteData,
  AttachmentData,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteVersionData,
  CreateNoteVersionRequest,
  NotesSearchParams,
  NotesDateRangeParams
} from './notesService';

export type {
  AuthSession,
  UserProfile
} from '../models/types';
