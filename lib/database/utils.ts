// Database Utils - StudyVault V1.0
// Utility functions for database operations

import { getDatabase } from './index';

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Convert boolean to SQLite integer
 */
export function boolToInt(value: boolean | undefined): number {
  return value ? 1 : 0;
}

/**
 * Convert SQLite integer to boolean
 */
export function intToBool(value: number | null | undefined): boolean {
  return Boolean(value);
}

/**
 * Parse JSON field safely
 */
export function parseJsonField<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Stringify JSON field safely
 */
export function stringifyJsonField<T>(value: T): string {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify([]);
  }
}

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validate required fields
 */
export function validateRequired(data: Record<string, any>, requiredFields: string[]): void {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Sanitize SQL LIKE query
 */
export function sanitizeLikeQuery(query: string): string {
  return query.replace(/[%_]/g, '\\$&');
}

/**
 * Build WHERE clause from filters
 */
export function buildWhereClause(
  filters: Record<string, any>,
  allowedFields: string[]
): { whereClause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (allowedFields.includes(key) && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle array values (IN clause)
        const placeholders = value.map(() => '?').join(', ');
        conditions.push(`${key} IN (${placeholders})`);
        params.push(...value);
      } else if (typeof value === 'string' && key.endsWith('_like')) {
        // Handle LIKE queries
        const field = key.replace('_like', '');
        conditions.push(`${field} LIKE ?`);
        params.push(`%${sanitizeLikeQuery(value)}%`);
      } else {
        // Handle exact matches
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }
  });

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

/**
 * Build ORDER BY clause
 */
export function buildOrderByClause(
  sortField?: string,
  sortDirection?: 'ASC' | 'DESC',
  allowedFields: string[] = [],
  defaultSort: string = 'created_at DESC'
): string {
  if (!sortField || !allowedFields.includes(sortField)) {
    return `ORDER BY ${defaultSort}`;
  }
  
  const direction = sortDirection === 'DESC' ? 'DESC' : 'ASC';
  return `ORDER BY ${sortField} ${direction}`;
}

/**
 * Build LIMIT and OFFSET clause
 */
export function buildPaginationClause(limit?: number, offset?: number): string {
  let clause = '';
  
  if (limit && limit > 0) {
    clause += ` LIMIT ${Math.min(limit, 1000)}`; // Max 1000 records
  }
  
  if (offset && offset > 0) {
    clause += ` OFFSET ${offset}`;
  }
  
  return clause;
}

/**
 * Execute query with error handling
 */
export async function executeQuery<T>(
  query: string,
  params: any[] = [],
  operation: string = 'query'
): Promise<T[]> {
  try {
    const db = getDatabase();
    const results = await db.getAllAsync<T>(query, params);
    return results;
  } catch (error) {
    console.error(`❌ Database ${operation} failed:`, error);
    console.error(`Query: ${query}`);
    console.error(`Params:`, params);
    throw error;
  }
}

/**
 * Execute single row query
 */
export async function executeQueryFirst<T>(
  query: string,
  params: any[] = [],
  operation: string = 'query'
): Promise<T | null> {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync<T>(query, params);
    return result || null;
  } catch (error) {
    console.error(`❌ Database ${operation} failed:`, error);
    console.error(`Query: ${query}`);
    console.error(`Params:`, params);
    throw error;
  }
}

/**
 * Execute write operation (INSERT, UPDATE, DELETE)
 */
export async function executeWrite(
  query: string,
  params: any[] = [],
  operation: string = 'write'
): Promise<{ changes: number; lastInsertRowId?: number }> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(query, params);
    return {
      changes: result.changes,
      lastInsertRowId: result.lastInsertRowId
    };
  } catch (error) {
    console.error(`❌ Database ${operation} failed:`, error);
    console.error(`Query: ${query}`);
    console.error(`Params:`, params);
    throw error;
  }
}

/**
 * Execute transaction
 */
export async function executeTransaction<T>(
  operations: (() => Promise<T>)[]
): Promise<T[]> {
  const db = getDatabase();
  const results: T[] = [];
  
  await db.withTransactionAsync(async () => {
    for (const operation of operations) {
      const result = await operation();
      results.push(result);
    }
  });
  
  return results;
}

/**
 * Count records with filters
 */
export async function countRecords(
  table: string,
  filters: Record<string, any> = {},
  allowedFields: string[] = []
): Promise<number> {
  const { whereClause, params } = buildWhereClause(filters, allowedFields);
  const query = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
  
  const result = await executeQueryFirst<{ count: number }>(query, params, 'count');
  return result?.count || 0;
}

/**
 * Check if record exists
 */
export async function recordExists(
  table: string,
  id: string,
  idField: string = 'id'
): Promise<boolean> {
  const query = `SELECT 1 FROM ${table} WHERE ${idField} = ? LIMIT 1`;
  const result = await executeQueryFirst(query, [id], 'exists check');
  return result !== null;
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  tables: { name: string; count: number }[];
  totalSize: number;
}> {
  try {
    const db = getDatabase();
    
    // Get all table names
    const tables = await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    );
    
    // Get count for each table
    const tableStats = await Promise.all(
      tables.map(async (table) => {
        const result = await db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${table.name}`
        );
        return {
          name: table.name,
          count: result?.count || 0
        };
      })
    );
    
    // Get database size (approximation)
    const sizeResult = await db.getFirstAsync<{ page_count: number; page_size: number }>(
      'PRAGMA page_count; PRAGMA page_size;'
    );
    
    const totalSize = (sizeResult?.page_count || 0) * (sizeResult?.page_size || 0);
    
    return {
      tables: tableStats,
      totalSize
    };
  } catch (error) {
    console.error('❌ Failed to get database stats:', error);
    return {
      tables: [],
      totalSize: 0
    };
  }
}
