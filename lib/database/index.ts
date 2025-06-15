// Database Configuration and Setup - StudyVault V1.0
// Main database initialization and management

import * as SQLite from 'expo-sqlite';

// Database configuration
export const DATABASE_CONFIG = {
  name: 'studyvault.db',
  version: 1, // Reset to version 1 as we only have one migration
  // Location will be handled by Expo SQLite automatically
};

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database connection
 */
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }
  try {
    // Open database connection
    db = await SQLite.openDatabaseAsync(DATABASE_CONFIG.name);
    
    // Run initial migration
    const { MigrationRunner } = await import('./migrations/migration.runner');
    const migrationRunner = new MigrationRunner();
    await migrationRunner.runMigrations();
    
    console.log('✅ StudyVault iniciado correctamente - Base de datos lista');
    
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/**
 * Get current schema version
 */
async function getCurrentSchemaVersion(): Promise<number> {
  if (!db) return 0;

  try {
    const result = await db.getFirstAsync<{ version: number }>(
      'SELECT MAX(version) as version FROM schema_versions'
    );
    return result?.version ?? 0;
  } catch {
    // Table doesn't exist, return 0
    return 0;
  }
}

/**
 * Reset database (for development/testing)
 */
export async function resetDatabase(): Promise<void> {
  if (!db) return;

  try {
    // Drop all tables
    await db.execAsync(`
      DROP TABLE IF EXISTS notes_fts;
      DROP TABLE IF EXISTS class_schedules;
      DROP TABLE IF EXISTS calendar_events;
      DROP TABLE IF EXISTS note_attachments;
      DROP TABLE IF EXISTS notes;
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS courses;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS schema_versions;
    `);
    
    // Re-run migrations using MigrationRunner
    const { MigrationRunner } = await import('./migrations/migration.runner');
    const migrationRunner = new MigrationRunner();
    await migrationRunner.runMigrations();
  } catch (error) {
    console.error('Database reset failed:', error);
    throw error;
  }
}

/**
 * Execute raw SQL query (for debugging)
 */
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    return await db.getAllAsync(query, params);
  } catch (error) {
    console.error('❌ Query execution failed:', error);
    throw error;
  }
}

/**
 * Database health check
 */
export async function healthCheck(): Promise<{
  isConnected: boolean;
  tablesCount: number;
  schemaVersion: number;
}> {
  try {
    if (!db) {
      return { isConnected: false, tablesCount: 0, schemaVersion: 0 };
    }

    // Count tables
    const tablesResult = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'"
    );
    const tablesCount = tablesResult?.count ?? 0;

    // Get schema version
    const schemaVersion = await getCurrentSchemaVersion();

    return {
      isConnected: true,
      tablesCount,
      schemaVersion
    };
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return { isConnected: false, tablesCount: 0, schemaVersion: 0 };
  }
}
