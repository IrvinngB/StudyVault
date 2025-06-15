-- StudyVault V1.0 - Initial Database Setup
-- This migration creates all the basic tables for the application

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create schema version table first
CREATE TABLE IF NOT EXISTS schema_versions (
  version INTEGER PRIMARY KEY,
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  description TEXT NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  last_login DATETIME,
  avatar_url TEXT,
  preferences TEXT NOT NULL DEFAULT '{"theme":"system","notifications_enabled":true,"default_reminder_time":15,"study_goal_hours_per_day":4,"first_day_of_week":1}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  credits REAL,
  semester TEXT NOT NULL,
  professor TEXT,
  location TEXT,
  is_active INTEGER DEFAULT 1,
  grade_scale TEXT DEFAULT 'percentage' CHECK (grade_scale IN ('percentage', 'gpa', 'letter')),
  target_grade REAL,
  current_grade REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'homework' CHECK (type IN ('assignment', 'exam', 'quiz', 'project', 'homework', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  
  due_date DATETIME,
  reminder_date DATETIME,
  completed_date DATETIME,
  
  max_grade REAL,
  obtained_grade REAL,
  weight REAL CHECK (weight >= 0 AND weight <= 1),
  
  tags TEXT DEFAULT '[]',
  estimated_hours REAL,
  actual_hours REAL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  
  tags TEXT DEFAULT '[]',
  category TEXT,
  is_favorite INTEGER DEFAULT 0,
  is_archived INTEGER DEFAULT 0,
  
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'rich_text')),
  word_count INTEGER DEFAULT 0,
  reading_time INTEGER DEFAULT 0,
  
  linked_tasks TEXT DEFAULT '[]',
  linked_events TEXT DEFAULT '[]',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_viewed_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL
);

-- Note attachments table
CREATE TABLE IF NOT EXISTS note_attachments (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  is_image INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  
  type TEXT DEFAULT 'other' CHECK (type IN ('class', 'exam', 'meeting', 'study_session', 'deadline', 'other')),
  
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  all_day INTEGER DEFAULT 0,
  timezone TEXT DEFAULT 'UTC',
  
  is_recurring INTEGER DEFAULT 0,
  recurrence_rule TEXT,
  recurrence_end_date DATETIME,
  parent_event_id TEXT,
  
  reminder_minutes INTEGER DEFAULT 15,
  has_notification INTEGER DEFAULT 1,
  
  color TEXT,
  tags TEXT DEFAULT '[]',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL,
  FOREIGN KEY (parent_event_id) REFERENCES calendar_events (id) ON DELETE CASCADE
);

-- Class schedules table (template for recurring class events)
CREATE TABLE IF NOT EXISTS class_schedules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  UNIQUE(course_id, day_of_week, start_time)
);

-- Create all indexes
-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_user_active ON courses(user_id, is_active);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON tasks(course_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON tasks(user_id, due_date);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_notes_archived ON notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_user_active ON notes(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_notes_last_viewed ON notes(last_viewed_at);
CREATE INDEX IF NOT EXISTS idx_notes_word_count ON notes(word_count);

-- Note attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON note_attachments(note_id);
CREATE INDEX IF NOT EXISTS idx_attachments_is_image ON note_attachments(is_image);

-- Calendar events indexes
CREATE INDEX IF NOT EXISTS idx_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_course_id ON calendar_events(course_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON calendar_events(end_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON calendar_events(type);
CREATE INDEX IF NOT EXISTS idx_events_recurring ON calendar_events(is_recurring);
CREATE INDEX IF NOT EXISTS idx_events_user_date_range ON calendar_events(user_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_notification ON calendar_events(has_notification, start_date);

-- Class schedules indexes
CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON class_schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON class_schedules(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_schedules_active ON class_schedules(is_active);

-- Full-text search for notes
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  title, content, tags, category,
  content='notes',
  content_rowid='rowid'
);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_courses_timestamp 
AFTER UPDATE ON courses
FOR EACH ROW
BEGIN
  UPDATE courses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
  UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
AFTER UPDATE ON notes
FOR EACH ROW
BEGIN
  UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_calendar_events_timestamp 
AFTER UPDATE ON calendar_events
FOR EACH ROW
BEGIN
  UPDATE calendar_events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to automatically set completed_date when task is completed
CREATE TRIGGER IF NOT EXISTS set_task_completed_date
AFTER UPDATE OF status ON tasks
FOR EACH ROW
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
  UPDATE tasks SET completed_date = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to automatically update word_count and reading_time for notes
CREATE TRIGGER IF NOT EXISTS update_notes_word_count
AFTER UPDATE OF content ON notes
FOR EACH ROW
BEGIN
  UPDATE notes SET 
    word_count = (LENGTH(NEW.content) - LENGTH(REPLACE(NEW.content, ' ', '')) + 1),
    reading_time = CAST((LENGTH(NEW.content) - LENGTH(REPLACE(NEW.content, ' ', '')) + 1) / 200.0 AS INTEGER)
  WHERE id = NEW.id;
END;

-- FTS triggers for notes
CREATE TRIGGER IF NOT EXISTS notes_fts_insert 
AFTER INSERT ON notes
BEGIN
  INSERT INTO notes_fts(rowid, title, content, tags, category) 
  VALUES (new.rowid, new.title, new.content, new.tags, new.category);
END;

CREATE TRIGGER IF NOT EXISTS notes_fts_delete 
AFTER DELETE ON notes
BEGIN
  DELETE FROM notes_fts WHERE rowid = old.rowid;
END;

CREATE TRIGGER IF NOT EXISTS notes_fts_update 
AFTER UPDATE ON notes
BEGIN
  DELETE FROM notes_fts WHERE rowid = old.rowid;
  INSERT INTO notes_fts(rowid, title, content, tags, category) 
  VALUES (new.rowid, new.title, new.content, new.tags, new.category);
END;

-- Date validation triggers
CREATE TRIGGER IF NOT EXISTS validate_event_dates
BEFORE INSERT ON calendar_events
FOR EACH ROW
WHEN NEW.end_date <= NEW.start_date AND NEW.all_day = 0
BEGIN
  SELECT RAISE(ABORT, 'End date must be after start date');
END;

CREATE TRIGGER IF NOT EXISTS validate_event_dates_update
BEFORE UPDATE ON calendar_events
FOR EACH ROW
WHEN NEW.end_date <= NEW.start_date AND NEW.all_day = 0
BEGIN
  SELECT RAISE(ABORT, 'End date must be after start date');
END;

-- Insert initial schema version
INSERT OR IGNORE INTO schema_versions (version, description) 
VALUES (1, 'Initial database setup with all core tables');
