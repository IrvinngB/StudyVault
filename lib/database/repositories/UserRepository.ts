// User Repository - StudyVault V1.0
// CRUD operations for users

import * as SQLite from 'expo-sqlite';
import { getDatabase } from '../index';
import { User } from '../schemas/user.schema';
import { BaseRepository, DatabaseError, NotFoundError } from './base.repository';

export class UserRepository implements BaseRepository<User> {
  private get db(): SQLite.SQLiteDatabase {
    return getDatabase();
  }  async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    try {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      await this.db.runAsync(
        `INSERT INTO users (
          id, name, email, avatar_url, theme, notifications_enabled, 
          default_reminder_time, study_goal_hours_per_day, first_day_of_week,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userData.name,
          userData.email || null,
          userData.avatar_url || null,
          userData.preferences?.theme || 'system',
          userData.preferences?.notifications_enabled ? 1 : 0,
          userData.preferences?.default_reminder_time || 15,
          userData.preferences?.study_goal_hours_per_day || 4.0,
          userData.preferences?.first_day_of_week || 1,
          now,
          now
        ]
      );

      const createdUser = await this.getById(id);
      if (!createdUser) {
        throw new Error('User was created but could not be retrieved');
      }
      return createdUser;
    } catch (error) {
      throw new DatabaseError('Failed to create user', error as Error);
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return this.mapRowToUser(result);
    } catch (error) {
      throw new DatabaseError('Failed to get user by id', error as Error);
    }
  }

  async getAll(): Promise<User[]> {
    try {
      const results = await this.db.getAllAsync<any>(
        'SELECT * FROM users ORDER BY created_at DESC'
      );

      return results.map(row => this.mapRowToUser(row));
    } catch (error) {
      throw new DatabaseError('Failed to get all users', error as Error);
    }
  }

  async update(id: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        throw new NotFoundError('User', id);
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(updates.name);
      }

      if (updates.email !== undefined) {
        updateFields.push('email = ?');
        updateValues.push(updates.email);
      }

      if (updates.avatar_url !== undefined) {
        updateFields.push('avatar_url = ?');
        updateValues.push(updates.avatar_url);
      }

      if (updates.preferences) {
        if (updates.preferences.theme !== undefined) {
          updateFields.push('theme = ?');
          updateValues.push(updates.preferences.theme);
        }
        if (updates.preferences.notifications_enabled !== undefined) {
          updateFields.push('notifications_enabled = ?');
          updateValues.push(updates.preferences.notifications_enabled ? 1 : 0);
        }
        if (updates.preferences.default_reminder_time !== undefined) {
          updateFields.push('default_reminder_time = ?');
          updateValues.push(updates.preferences.default_reminder_time);
        }
        if (updates.preferences.study_goal_hours_per_day !== undefined) {
          updateFields.push('study_goal_hours_per_day = ?');
          updateValues.push(updates.preferences.study_goal_hours_per_day);
        }
        if (updates.preferences.first_day_of_week !== undefined) {
          updateFields.push('first_day_of_week = ?');
          updateValues.push(updates.preferences.first_day_of_week);
        }
      }

      if (updateFields.length === 0) {
        return existing;
      }

      updateFields.push('updated_at = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(id);

      await this.db.runAsync(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return this.getById(id) as Promise<User>;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to update user', error as Error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.db.runAsync('DELETE FROM users WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new NotFoundError('User', id);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError('Failed to delete user', error as Error);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM users WHERE id = ?',
        [id]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      throw new DatabaseError('Failed to check user existence', error as Error);
    }
  }

  async count(): Promise<number> {
    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM users'
      );
      return result?.count || 0;
    } catch (error) {
      throw new DatabaseError('Failed to count users', error as Error);
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.getFirstAsync<any>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (!result) return null;
      return this.mapRowToUser(result);
    } catch (error) {
      throw new DatabaseError('Failed to get user by email', error as Error);
    }
  }

  private mapRowToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar_url: row.avatar_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      preferences: {
        theme: row.theme,
        notifications_enabled: Boolean(row.notifications_enabled),
        default_reminder_time: row.default_reminder_time,
        study_goal_hours_per_day: row.study_goal_hours_per_day,
        first_day_of_week: row.first_day_of_week,
      },
    };
  }
}
