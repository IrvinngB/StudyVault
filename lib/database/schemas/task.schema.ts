// Task Schema - StudyVault V1.0
// Tareas, evaluaciones y asignaciones

export interface Task {
  id: string;
  user_id: string;
  course_id?: string; // opcional, puede ser tarea personal
  title: string;
  description?: string;
  type: 'assignment' | 'exam' | 'quiz' | 'project' | 'homework' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  
  // Fechas importantes
  due_date?: string; // fecha límite
  reminder_date?: string; // fecha de recordatorio
  completed_date?: string; // cuándo se completó
  
  // Evaluación
  max_grade?: number; // nota máxima posible
  obtained_grade?: number; // nota obtenida
  weight?: number; // peso en la nota final (0-1)
  
  // Organización
  tags: string; // JSON array de strings
  estimated_hours?: number; // tiempo estimado
  actual_hours?: number; // tiempo real dedicado
  
  created_at: string;
  updated_at: string;
}

// SQLite Schema
export const CREATE_TASKS_TABLE = `
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
    
    tags TEXT DEFAULT '[]', -- JSON array
    estimated_hours REAL,
    actual_hours REAL,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL
  );
`;

// Índices para optimización
export const CREATE_TASKS_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON tasks(course_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
  CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON tasks(user_id, due_date);
`;

// Trigger para updated_at
export const CREATE_TASKS_TRIGGERS = `
  CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
  AFTER UPDATE ON tasks
  FOR EACH ROW
  BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
  
  -- Trigger para marcar completed_date automáticamente
  CREATE TRIGGER IF NOT EXISTS set_task_completed_date
  AFTER UPDATE OF status ON tasks
  FOR EACH ROW
  WHEN NEW.status = 'completed' AND OLD.status != 'completed'
  BEGIN
    UPDATE tasks SET completed_date = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`;
