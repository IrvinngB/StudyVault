// Database Repository Index - StudyVault V1.0
// Central export point for all repositories

import { CourseRepository } from './CourseRepository';
import { UserRepository } from './UserRepository';

export { BaseRepository, BatchRepository, DatabaseError, NotFoundError, RepositoryError, SearchableRepository, ValidationError } from './base.repository';
export { CourseRepository } from './CourseRepository';
export { UserRepository } from './UserRepository';

// Re-export types
export type {
    BaseEntity, FilterOptions, PaginationOptions, QueryOptions, SortOptions
} from './base.repository';

// Repository factory for dependency injection
export class RepositoryFactory {
  private static _userRepository: UserRepository | null = null;
  private static _courseRepository: CourseRepository | null = null;

  static getUserRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository();
    }
    return this._userRepository;
  }

  static getCourseRepository(): CourseRepository {
    if (!this._courseRepository) {
      this._courseRepository = new CourseRepository();
    }
    return this._courseRepository;
  }

  // Clear all repositories (useful for testing)
  static clear(): void {
    this._userRepository = null;
    this._courseRepository = null;
  }
}
