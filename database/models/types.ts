// TypeScript types for the database models

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  timezone: string
  subscription_tier: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  user_id?: string
  name: string
  code?: string
  instructor?: string
  color: string
  credits?: number
  semester?: string
  description?: string
  syllabus_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  last_sync?: string
}

export interface Task {
  id: string
  user_id?: string
  class_id?: string
  title: string
  description?: string
  due_date?: string
  priority: number
  status: "pending" | "in_progress" | "completed"
  estimated_duration?: number
  actual_duration?: number
  completion_percentage: number
  tags: string[]
  device_created?: string
  created_at: string
  updated_at: string
  completed_at?: string
  is_synced: boolean
  needs_sync: boolean
}

export interface CalendarEvent {
  id: string
  user_id?: string
  class_id?: string
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  event_type: string
  is_recurring: boolean
  recurrence_pattern: Record<string, any>
  location?: string
  reminder_minutes: number
  google_calendar_id?: string
  external_calendar_sync: Record<string, any>
  created_at: string
  updated_at: string
  is_synced: boolean
  needs_sync: boolean
}

export interface Habit {
  id: string
  user_id?: string
  name: string
  description?: string
  target_frequency: number
  color: string
  icon?: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
  is_synced: boolean
  needs_sync: boolean
}

export interface HabitLog {
  id: string
  user_id?: string
  habit_id: string
  completed_date: string
  notes?: string
  mood_rating?: number
  device_logged?: string
  created_at: string
  is_synced: boolean
  needs_sync: boolean
}

export interface LocalNote {
  id: number
  class_id?: string
  title: string
  content?: string
  content_html?: string
  attachments_paths: string[]
  created_at: string
  updated_at: string
  is_favorite: boolean
  word_count: number
}

export interface LocalFile {
  id: number
  class_id?: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  mime_type: string
  tags: string[]
  created_at: string
  last_accessed: string
  is_encrypted: boolean
}

export interface LocalStudySession {
  id: number
  class_id?: string
  task_id?: string
  start_time: string
  end_time: string
  duration_minutes: number
  session_type: string
  productivity_rating?: number
  notes?: string
  created_at: string
}

export interface SyncQueueItem {
  id: number
  table_name: string
  record_id: string
  action: "INSERT" | "UPDATE" | "DELETE"
  data: string
  created_at: string
  retry_count: number
  last_error?: string
  status: "pending" | "processing" | "completed" | "failed"
}

export interface SyncStatus {
  table_name: string
  last_sync?: string
  last_pull?: string
  pending_push_count: number
  last_error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
  user: UserProfile
}
