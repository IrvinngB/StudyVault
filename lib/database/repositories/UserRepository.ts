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
          id, name, email, password_hash, last_login, avatar_url, 
          preferences, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userData.name,
          userData.email,
          userData.password_hash,
          null,
          userData.avatar_url || null,
          JSON.stringify(userData.preferences || {
            theme: 'system',
            notifications_enabled: true,
            default_reminder_time: 15,
            study_goal_hours_per_day: 4,
            first_day_of_week: 1
          }),
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
      }      if (updates.password_hash !== undefined) {
        updateFields.push('password_hash = ?');
        updateValues.push(updates.password_hash);
      }

      if (updates.last_login !== undefined) {
        updateFields.push('last_login = ?');
        updateValues.push(updates.last_login);
      }

      if (updates.preferences) {
        // Actualizar el objeto preferences completo
        const currentPrefs = existing.preferences || {
          theme: 'system',
          notifications_enabled: true,
          default_reminder_time: 15,
          study_goal_hours_per_day: 4,
          first_day_of_week: 1
        };
        
        const updatedPrefs = { 
          ...currentPrefs,
          ...updates.preferences
        };
        
        updateFields.push('preferences = ?');
        updateValues.push(JSON.stringify(updatedPrefs));
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
    let preferences;    try {
      preferences = row.preferences ? JSON.parse(row.preferences) : {
        theme: 'system',
        notifications_enabled: true,
        default_reminder_time: 15,
        study_goal_hours_per_day: 4,
        first_day_of_week: 1
      };
    } catch (_) {
      // Fallback en caso de error de parsing
      preferences = {
        theme: 'system',
        notifications_enabled: true,
        default_reminder_time: 15,
        study_goal_hours_per_day: 4,
        first_day_of_week: 1
      };
    }
    
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password_hash: row.password_hash,
      last_login: row.last_login,
      avatar_url: row.avatar_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
      preferences,
    };
  }
}
