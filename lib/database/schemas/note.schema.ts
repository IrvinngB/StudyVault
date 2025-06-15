// Note Schema - StudyVault V1.0
// Notas, apuntes y contenido de estudio

export interface Note {
  id: string;
  user_id: string;
  course_id?: string; // opcional, puede ser nota personal
  title: string;
  content: string; // texto principal (markdown)
  excerpt?: string; // resumen automático de los primeros caracteres
  
  // Organización
  tags: string; // JSON array de strings
  category?: string; // carpeta o categoría
  is_favorite: boolean;
  is_archived: boolean;
  
  // Metadata
  content_type: 'text' | 'markdown' | 'rich_text';
  word_count?: number;
  reading_time?: number; // minutos estimados de lectura
  
  // Vinculaciones
  linked_tasks: string; // JSON array de task IDs
  linked_events: string; // JSON array de calendar event IDs
  
  created_at: string;
  updated_at: string;
  last_viewed_at?: string;
}

// Attachments separados para mejor gestión
export interface NoteAttachment {
  id: string;
  note_id: string;
  filename: string;
  file_path: string; // ruta local del archivo
  file_size: number; // bytes
  mime_type: string;
  is_image: boolean;
  created_at: string;
}

// SQLite Schema - Notes
export const CREATE_NOTES_TABLE = `
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    course_id TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT,
    
    tags TEXT DEFAULT '[]', -- JSON array
    category TEXT,
    is_favorite INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    
    content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'rich_text')),
    word_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    
    linked_tasks TEXT DEFAULT '[]', -- JSON array
    linked_events TEXT DEFAULT '[]', -- JSON array
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_viewed_at DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE SET NULL
  );
`;

// SQLite Schema - Note Attachments
export const CREATE_NOTE_ATTACHMENTS_TABLE = `
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
`;

// Índices para optimización
export const CREATE_NOTES_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id);
  CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
  CREATE INDEX IF NOT EXISTS idx_notes_favorite ON notes(is_favorite);
  CREATE INDEX IF NOT EXISTS idx_notes_archived ON notes(is_archived);
  CREATE INDEX IF NOT EXISTS idx_notes_user_active ON notes(user_id, is_archived);
  CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);
  CREATE INDEX IF NOT EXISTS idx_notes_last_viewed ON notes(last_viewed_at);
  
  -- Full-text search index para búsqueda en contenido
  CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
    title, content, tags, category,
    content='notes',
    content_rowid='rowid'
  );
  
  -- Índices para attachments
  CREATE INDEX IF NOT EXISTS idx_attachments_note_id ON note_attachments(note_id);
  CREATE INDEX IF NOT EXISTS idx_attachments_is_image ON note_attachments(is_image);
`;

// Triggers
export const CREATE_NOTES_TRIGGERS = `
  CREATE TRIGGER IF NOT EXISTS update_notes_timestamp 
  AFTER UPDATE ON notes
  FOR EACH ROW
  BEGIN
    UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
  
  -- Trigger para actualizar word_count automáticamente
  CREATE TRIGGER IF NOT EXISTS update_notes_word_count
  AFTER UPDATE OF content ON notes
  FOR EACH ROW
  BEGIN
    UPDATE notes SET 
      word_count = (LENGTH(NEW.content) - LENGTH(REPLACE(NEW.content, ' ', '')) + 1),
      reading_time = CAST((LENGTH(NEW.content) - LENGTH(REPLACE(NEW.content, ' ', '')) + 1) / 200.0 AS INTEGER)
    WHERE id = NEW.id;
  END;
  
  -- Triggers para FTS
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
`;
