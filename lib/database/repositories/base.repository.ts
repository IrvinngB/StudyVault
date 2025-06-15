// Base Repository Interface - StudyVault V1.0
// Common interface and types for all repositories

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface QueryOptions {
  pagination?: PaginationOptions;
  sort?: SortOptions;
  filters?: FilterOptions;
}

// Base repository interface that all repositories will implement
export interface BaseRepository<T extends BaseEntity> {
  // CRUD operations
  create(entity: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T>;
  getById(id: string): Promise<T | null>;
  getAll(options?: QueryOptions): Promise<T[]>;
  update(id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T>;
  delete(id: string): Promise<void>;
  
  // Utility methods
  exists(id: string): Promise<boolean>;
  count(filters?: FilterOptions): Promise<number>;
}

// Generic search interface
export interface SearchableRepository<T> {
  search(query: string, options?: QueryOptions): Promise<T[]>;
}

// Batch operations interface
export interface BatchRepository<T> {
  createBatch(entities: Omit<T, 'id' | 'created_at' | 'updated_at'>[]): Promise<T[]>;
  updateBatch(updates: { id: string; data: Partial<T> }[]): Promise<T[]>;
  deleteBatch(ids: string[]): Promise<void>;
}

// Repository error types
export class RepositoryError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, 'NOT_FOUND');
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class DatabaseError extends RepositoryError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', originalError);
  }
}
