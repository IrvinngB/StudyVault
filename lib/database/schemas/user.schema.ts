// User Schema - StudyVault V1.0
// Información básica del usuario y configuraciones

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  
  // Configuraciones locales
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications_enabled: boolean;
    default_reminder_time: number; // minutos antes
    study_goal_hours_per_day: number;
    first_day_of_week: 0 | 1; // 0 = domingo, 1 = lunes
  };
}

// SQLite Schema
export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    avatar_url TEXT,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    notifications_enabled INTEGER DEFAULT 1,
    default_reminder_time INTEGER DEFAULT 15,
    study_goal_hours_per_day REAL DEFAULT 4.0,
    first_day_of_week INTEGER DEFAULT 1 CHECK (first_day_of_week IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

// Índices para optimización
export const CREATE_USERS_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
`;

// Trigger para actualizar updated_at automáticamente
export const CREATE_USERS_TRIGGERS = `
  CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
  AFTER UPDATE ON users
  FOR EACH ROW
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;
