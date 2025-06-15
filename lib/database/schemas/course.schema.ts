// Course Schema - StudyVault V1.0
// Cursos y asignaturas del usuario

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code?: string; // código del curso (ej: "CS101")
  description?: string;
  color: string; // hex color para UI
  credits?: number;
  semester: string; // "2025-1", "2025-2", etc.
  professor?: string;
  location?: string; // aula o ubicación
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Configuraciones del curso
  grade_scale: 'percentage' | 'gpa' | 'letter'; // tipo de escala de notas
  target_grade?: number; // nota objetivo
  current_grade?: number; // nota actual calculada
}

// SQLite Schema
export const CREATE_COURSES_TABLE = `
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
`;

// Índices para optimización
export const CREATE_COURSES_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
  CREATE INDEX IF NOT EXISTS idx_courses_semester ON courses(semester);
  CREATE INDEX IF NOT EXISTS idx_courses_active ON courses(is_active);
  CREATE INDEX IF NOT EXISTS idx_courses_user_active ON courses(user_id, is_active);
`;

// Trigger para updated_at
export const CREATE_COURSES_TRIGGERS = `
  CREATE TRIGGER IF NOT EXISTS update_courses_timestamp 
  AFTER UPDATE ON courses
  FOR EACH ROW
  BEGIN
    UPDATE courses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;
