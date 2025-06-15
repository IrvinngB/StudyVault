// Calendar Schema - StudyVault V1.0
// Eventos del calendario, horarios y recordatorios

export interface CalendarEvent {
  id: string;
  user_id: string;
  course_id?: string; // opcional, puede ser evento personal
  title: string;
  description?: string;
  location?: string;
  
  // Tipo de evento
  type: 'class' | 'exam' | 'meeting' | 'study_session' | 'deadline' | 'other';
  
  // Fechas y tiempo
  start_date: string; // ISO datetime
  end_date: string; // ISO datetime
  all_day: boolean;
  timezone?: string;
  
  // Recurrencia
  is_recurring: boolean;
  recurrence_rule?: string; // RRULE format para eventos recurrentes
  recurrence_end_date?: string;
  parent_event_id?: string; // para instancias de eventos recurrentes
  
  // Recordatorios
  reminder_minutes: number; // minutos antes del evento
  has_notification: boolean;
  
  // UI y organización
  color?: string; // override del color del curso
  tags: string; // JSON array
  
  created_at: string;
  updated_at: string;
}

// SQLite Schema
export const CREATE_CALENDAR_EVENTS_TABLE = `
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
    recurrence_rule TEXT, -- RRULE format
    recurrence_end_date DATETIME,
    parent_event_id TEXT,
    
    reminder_minutes INTEGER DEFAULT 15,
    has_notification INTEGER DEFAULT 1,
    
    color TEXT,
    tags TEXT DEFAULT '[]', -- JSON array
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL,
    FOREIGN KEY (parent_event_id) REFERENCES calendar_events (id) ON DELETE CASCADE
  );
`;

// Índices para optimización
export const CREATE_CALENDAR_EVENTS_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_events_user_id ON calendar_events(user_id);
  CREATE INDEX IF NOT EXISTS idx_events_course_id ON calendar_events(course_id);
  CREATE INDEX IF NOT EXISTS idx_events_start_date ON calendar_events(start_date);
  CREATE INDEX IF NOT EXISTS idx_events_end_date ON calendar_events(end_date);
  CREATE INDEX IF NOT EXISTS idx_events_type ON calendar_events(type);
  CREATE INDEX IF NOT EXISTS idx_events_recurring ON calendar_events(is_recurring);
  CREATE INDEX IF NOT EXISTS idx_events_parent ON calendar_events(parent_event_id);
  CREATE INDEX IF NOT EXISTS idx_events_user_date_range ON calendar_events(user_id, start_date, end_date);
  CREATE INDEX IF NOT EXISTS idx_events_notification ON calendar_events(has_notification, start_date);
`;

// Triggers
export const CREATE_CALENDAR_EVENTS_TRIGGERS = `
  CREATE TRIGGER IF NOT EXISTS update_calendar_events_timestamp 
  AFTER UPDATE ON calendar_events
  FOR EACH ROW
  BEGIN
    UPDATE calendar_events SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
  
  -- Validación: end_date debe ser después de start_date
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
`;

// Tabla auxiliar para horarios de clases (template para eventos recurrentes)
export interface ClassSchedule {
  id: string;
  course_id: string;
  day_of_week: number; // 0 = domingo, 1 = lunes, etc.
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  location?: string;
  is_active: boolean;
  created_at: string;
}

export const CREATE_CLASS_SCHEDULES_TABLE = `
  CREATE TABLE IF NOT EXISTS class_schedules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TEXT NOT NULL, -- HH:MM format
    end_time TEXT NOT NULL, -- HH:MM format
    location TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    UNIQUE(course_id, day_of_week, start_time) -- evitar horarios duplicados
  );
`;

export const CREATE_CLASS_SCHEDULES_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON class_schedules(course_id);
  CREATE INDEX IF NOT EXISTS idx_schedules_day_time ON class_schedules(day_of_week, start_time);
  CREATE INDEX IF NOT EXISTS idx_schedules_active ON class_schedules(is_active);
`;
