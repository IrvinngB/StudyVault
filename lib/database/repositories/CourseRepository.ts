// Course Repository - StudyVault V1.0
// CRUD operations for courses

import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../index';
import { Course } from '../schemas/course.schema';
import { BaseRepository, DatabaseError, NotFoundError, QueryOptions } from './base.repository';

export class CourseRepository implements BaseRepository<Course> {
  private get db(): SQLite.SQLiteDatabase {
    return getDatabase();
  }

  async create(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> {
    try {
      const id = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await this.db.runAsync(
        `INSERT INTO courses (
          id, user_id, name, code, description, color, credits, semester, 
          professor, location, is_active, grade_scale, target_grade, 
          current_grade, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          courseData.user_id,
          courseData.name,
          courseData.code || null,
          courseData.description || null,
          courseData.color,
          courseData.credits || null,
          courseData.semester,
          courseData.professor || null,
          courseData.location || null,
          courseData.is_active ? 1 : 0,
          courseData.grade_scale,
          courseData.target_grade || null,
          courseData.current_grade || null,
          now,
          now
        ]
      );

      return this.getById(id) as Promise<Course>;
    } catch (error) {
      throw new DatabaseError('Failed to create course', error as Error);
    }
  }

  async getById(id: string): Promise<Course | null> {
    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM courses WHERE id = ?',
        [id]
      );

      if (!result) return null;
      return this.mapRowToCourse(result);
    } catch (error) {
      throw new DatabaseError('Failed to get course by id', error as Error);
    }
  }

  async getAll(options?: QueryOptions): Promise<Course[]> {
    try {
      let query = 'SELECT * FROM courses';
      const params: any[] = [];

      // Apply filters
      if (options?.filters) {
        const whereConditions: string[] = [];
        
        if (options.filters.user_id) {
          whereConditions.push('user_id = ?');
          params.push(options.filters.user_id);
        }
        
        if (options.filters.is_active !== undefined) {
          whereConditions.push('is_active = ?');
          params.push(options.filters.is_active ? 1 : 0);
        }
        
        if (options.filters.semester) {
          whereConditions.push('semester = ?');
          params.push(options.filters.semester);
        }

        if (whereConditions.length > 0) {
          query += ' WHERE ' + whereConditions.join(' AND ');
        }
      }

      // Apply sorting
      if (options?.sort) {
        query += ` ORDER BY ${options.sort.field} ${options.sort.direction}`;
      } else {
        query += ' ORDER BY created_at DESC';
      }

      // Apply pagination
      if (options?.pagination) {
        if (options.pagination.limit) {
          query += ` LIMIT ${options.pagination.limit}`;
        }
        if (options.pagination.offset) {
          query += ` OFFSET ${options.pagination.offset}`;
        }
      }

      const results = await this.db.getAllAsync<any>(query, params);
      return results.map(row => this.mapRowToCourse(row));
    } catch (error) {
      throw new DatabaseError('Failed to get courses', error as Error);
    }
  }

  async update(id: string, updates: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>): Promise<Course> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new NotFoundError('Course', id);
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      // Build dynamic update query
      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          updateFields.push(`${key} = ?`);
          updateValues.push((updates as any)[key]);
        }
      });

      if (updateFields.length === 0) {
        return existing;
      }

      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(id);

      await this.db.runAsync(
        `UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return this.getById(id) as Promise<Course>;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to update course', error as Error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.db.runAsync('DELETE FROM courses WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new NotFoundError('Course', id);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to delete course', error as Error);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM courses WHERE id = ?',
        [id]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check course existence', error as Error);
    }
  }

  async count(filters?: any): Promise<number> {
    try {
      let query = 'SELECT COUNT(*) as count FROM courses';
      const params: any[] = [];

      if (filters?.user_id) {
        query += ' WHERE user_id = ?';
        params.push(filters.user_id);
      }

      const result = await this.db.getFirstAsync<{ count: number }>(query, params);
      return result?.count || 0;
    } catch (error) {
      throw new DatabaseError('Failed to count courses', error as Error);
    }
  }

  // Course-specific methods
  async getByUserId(userId: string, onlyActive: boolean = true): Promise<Course[]> {
    const filters: any = { user_id: userId };
    if (onlyActive) {
      filters.is_active = true;
    }
    return this.getAll({ filters });
  }

  async getBySemester(userId: string, semester: string): Promise<Course[]> {
    return this.getAll({ 
      filters: { user_id: userId, semester },
      sort: { field: 'name', direction: 'ASC' }
    });
  }

  async updateGrade(courseId: string, currentGrade: number): Promise<Course> {
    return this.update(courseId, { current_grade: currentGrade });
  }

  async getActiveCourses(userId: string): Promise<Course[]> {
    return this.getByUserId(userId, true);
  }

  async archiveCourse(courseId: string): Promise<Course> {
    return this.update(courseId, { is_active: false });
  }

  async activateCourse(courseId: string): Promise<Course> {
    return this.update(courseId, { is_active: true });
  }

  private mapRowToCourse(row: any): Course {
    return {
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      code: row.code,
      description: row.description,
      color: row.color,
      credits: row.credits,
      semester: row.semester,
      professor: row.professor,
      location: row.location,
      is_active: Boolean(row.is_active),
      grade_scale: row.grade_scale,
      target_grade: row.target_grade,
      current_grade: row.current_grade,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
