import { database } from "../sqlite/database"
import { syncManager } from "../sync/syncManager"
import type { Class } from "../models/types"
import { v4 as uuidv4 } from "uuid"

export class ClassService {
  private static instance: ClassService

  private constructor() {}

  public static getInstance(): ClassService {
    if (!ClassService.instance) {
      ClassService.instance = new ClassService()
    }
    return ClassService.instance
  }

  public async getAllClasses(): Promise<Class[]> {
    const classes = await database.selectQuery("SELECT * FROM classes_cache ORDER BY name ASC")
    return classes
  }

  public async getClassById(id: string): Promise<Class | null> {
    const classItem = await database.selectFirstQuery("SELECT * FROM classes_cache WHERE id = ?", [id])
    return classItem
  }

  public async getActiveClasses(): Promise<Class[]> {
    const classes = await database.selectQuery("SELECT * FROM classes_cache WHERE is_active = 1 ORDER BY name ASC")
    return classes
  }

  public async createClass(classData: Omit<Class, "id" | "created_at" | "updated_at">): Promise<Class> {
    const id = uuidv4()
    const now = new Date().toISOString()

    const newClass: Class = {
      id,
      ...classData,
      created_at: now,
      updated_at: now,
      last_sync: now,
    }

    await database.executeQuery(
      `INSERT INTO classes_cache 
       (id, name, code, instructor, color, credits, semester, is_active, last_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newClass.id,
        newClass.name,
        newClass.code,
        newClass.instructor,
        newClass.color,
        newClass.credits,
        newClass.semester,
        newClass.is_active ? 1 : 0,
        newClass.last_sync,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("classes_cache", id, "INSERT", newClass)

    return newClass
  }

  public async updateClass(id: string, updates: Partial<Class>): Promise<Class | null> {
    const existingClass = await this.getClassById(id)
    if (!existingClass) return null

    const updatedClass = {
      ...existingClass,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    const updateFields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ")
    const updateValues = Object.values(updates)
    updateValues.push(updatedClass.updated_at, id)

    await database.executeQuery(`UPDATE classes_cache SET ${updateFields}, updated_at = ? WHERE id = ?`, updateValues)

    // Add to sync queue
    await syncManager.addToSyncQueue("classes_cache", id, "UPDATE", updatedClass)

    return updatedClass
  }

  public async deleteClass(id: string): Promise<boolean> {
    const result = await database.executeQuery("DELETE FROM classes_cache WHERE id = ?", [id])

    if (result.changes > 0) {
      // Add to sync queue
      await syncManager.addToSyncQueue("classes_cache", id, "DELETE")
      return true
    }

    return false
  }

  public async getClassesWithTaskCount(): Promise<(Class & { taskCount: number })[]> {
    const classes = await database.selectQuery(`
      SELECT c.*, COUNT(t.id) as taskCount
      FROM classes_cache c
      LEFT JOIN tasks_cache t ON c.id = t.class_id AND t.status != 'completed'
      GROUP BY c.id
      ORDER BY c.name ASC
    `)
    return classes
  }

  public async searchClasses(query: string): Promise<Class[]> {
    const classes = await database.selectQuery(
      `SELECT * FROM classes_cache 
       WHERE name LIKE ? OR code LIKE ? OR instructor LIKE ?
       ORDER BY name ASC`,
      [`%${query}%`, `%${query}%`, `%${query}%`],
    )
    return classes
  }
}

// Export singleton instance
export const classService = ClassService.getInstance()
