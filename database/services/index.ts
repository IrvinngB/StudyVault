// Export all services
export { AuthService } from './authService';
export { calendarService } from './calendarService';
export { classService } from './courseService';
export { notesService } from './notesService';

// Export types
export type {
  ClassData,
  CreateClassRequest,
  UpdateClassRequest
} from './courseService';

export type {
  AttachmentData,
  CreateNoteRequest, CreateNoteVersionRequest, NoteData, NotesDateRangeParams, NotesSearchParams, NoteVersionData, UpdateNoteRequest
} from './notesService';

export type {
  ApiResponse, AuthSession,
  UserProfile
} from '../models/types';

// Calendar types
export type {
  CalendarEvent,
  CalendarEventFilters,
  CreateCalendarEventRequest, EventCategory, EventType, UpdateCalendarEventRequest
} from '../models/calendarTypes';

