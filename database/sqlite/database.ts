import * as SQLite from "expo-sqlite"

export class DatabaseManager {
  private static instance: DatabaseManager
  private db: SQLite.SQLiteDatabase | null = null
  private isInitialized = false

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.db = await SQLite.openDatabaseAsync("studyvault.db")
      await this.createTables()
      this.isInitialized = true
      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Failed to initialize database:", error)
      throw error
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    const tables = [
      // Cache tables (synced from Supabase)
      `CREATE TABLE IF NOT EXISTS classes_cache (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT,
        instructor TEXT,
        color TEXT DEFAULT '#3B82F6',
        credits INTEGER,
        semester TEXT,
        is_active BOOLEAN DEFAULT 1,
        last_sync DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS users_cache (
        id TEXT PRIMARY KEY,
        email TEXT,
        full_name TEXT,
        avatar_url TEXT,
        timezone TEXT DEFAULT 'America/Panama',
        last_sync DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Local-only tables
      `CREATE TABLE IF NOT EXISTS local_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id TEXT,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        mime_type TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_encrypted BOOLEAN DEFAULT 0,
        FOREIGN KEY (class_id) REFERENCES classes_cache(id)
      )`,

      `CREATE TABLE IF NOT EXISTS local_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id TEXT,
        title TEXT NOT NULL,
        content TEXT,
        content_html TEXT,
        attachments_paths TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_favorite BOOLEAN DEFAULT 0,
        word_count INTEGER DEFAULT 0,
        FOREIGN KEY (class_id) REFERENCES classes_cache(id)
      )`,

      `CREATE TABLE IF NOT EXISTS local_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS local_study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_id TEXT,
        task_id TEXT,
        start_time DATETIME,
        end_time DATETIME,
        duration_minutes INTEGER,
        session_type TEXT,
        productivity_rating INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes_cache(id),
        FOREIGN KEY (task_id) REFERENCES tasks_cache(id)
      )`,

      // Bidirectional sync tables
      `CREATE TABLE IF NOT EXISTS tasks_cache (
        id TEXT PRIMARY KEY,
        class_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        due_date DATETIME,
        priority INTEGER DEFAULT 2,
        status TEXT DEFAULT 'pending',
        estimated_duration INTEGER,
        actual_duration INTEGER,
        completion_percentage INTEGER DEFAULT 0,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        is_synced BOOLEAN DEFAULT 0,
        needs_sync BOOLEAN DEFAULT 1,
        FOREIGN KEY (class_id) REFERENCES classes_cache(id)
      )`,

      `CREATE TABLE IF NOT EXISTS calendar_events_cache (
        id TEXT PRIMARY KEY,
        class_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        start_datetime DATETIME NOT NULL,
        end_datetime DATETIME NOT NULL,
        event_type TEXT,
        is_recurring BOOLEAN DEFAULT 0,
        recurrence_pattern TEXT,
        location TEXT,
        reminder_minutes INTEGER DEFAULT 15,
        google_calendar_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_synced BOOLEAN DEFAULT 0,
        needs_sync BOOLEAN DEFAULT 1,
        FOREIGN KEY (class_id) REFERENCES classes_cache(id)
      )`,

      `CREATE TABLE IF NOT EXISTS habits_cache (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        target_frequency INTEGER,
        color TEXT DEFAULT '#10B981',
        icon TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_synced BOOLEAN DEFAULT 0,
        needs_sync BOOLEAN DEFAULT 1
      )`,

      `CREATE TABLE IF NOT EXISTS habit_logs_cache (
        id TEXT PRIMARY KEY,
        habit_id TEXT,
        completed_date DATE,
        notes TEXT,
        mood_rating INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_synced BOOLEAN DEFAULT 0,
        needs_sync BOOLEAN DEFAULT 1,
        FOREIGN KEY (habit_id) REFERENCES habits_cache(id)
      )`,

      // Sync control tables
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        status TEXT DEFAULT 'pending'
      )`,

      `CREATE TABLE IF NOT EXISTS sync_status (
        table_name TEXT PRIMARY KEY,
        last_sync DATETIME,
        last_pull DATETIME,
        pending_push_count INTEGER DEFAULT 0,
        last_error TEXT
      )`,
    ]

    for (const tableSQL of tables) {
      await this.db.execAsync(tableSQL)
    }

    // Create indexes for better performance
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_tasks_class_id ON tasks_cache(class_id)",
      "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks_cache(status)",
      "CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks_cache(due_date)",
      "CREATE INDEX IF NOT EXISTS idx_calendar_start_date ON calendar_events_cache(start_datetime)",
      "CREATE INDEX IF NOT EXISTS idx_files_class_id ON local_files(class_id)",
      "CREATE INDEX IF NOT EXISTS idx_notes_class_id ON local_notes(class_id)",
      "CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status)",
      "CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name)",
    ]

    for (const indexSQL of indexes) {
      await this.db.execAsync(indexSQL)
    }
  }

  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db || !this.isInitialized) {
      throw new Error("Database not initialized. Call initialize() first.")
    }
    return this.db
  }

  public async executeQuery(sql: string, params: any[] = []): Promise<SQLite.SQLiteRunResult> {
    const db = this.getDatabase()
    return await db.runAsync(sql, params)
  }

  public async selectQuery(sql: string, params: any[] = []): Promise<any[]> {
    const db = this.getDatabase()
    const result = await db.getAllAsync(sql, params)
    return result
  }

  public async selectFirstQuery(sql: string, params: any[] = []): Promise<any | null> {
    const db = this.getDatabase()
    const result = await db.getFirstAsync(sql, params)
    return result || null
  }

  public async transaction(callback: (db: SQLite.SQLiteDatabase) => Promise<void>): Promise<void> {
    const db = this.getDatabase()
    await db.withTransactionAsync(callback)
  }

  public async clearAllData(): Promise<void> {
    const db = this.getDatabase()
    const tables = [
      "classes_cache",
      "users_cache",
      "local_files",
      "local_notes",
      "local_settings",
      "local_study_sessions",
      "tasks_cache",
      "calendar_events_cache",
      "habits_cache",
      "habit_logs_cache",
      "sync_queue",
      "sync_status",
    ]

    await db.withTransactionAsync(async () => {
      for (const table of tables) {
        await db.runAsync(`DELETE FROM ${table}`)
      }
    })
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync()
      this.db = null
      this.isInitialized = false
    }
  }
}

// Export singleton instance
export const database = DatabaseManager.getInstance()
