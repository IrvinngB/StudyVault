import { database } from "../sqlite/database"
import { syncManager } from "../sync/syncManager"
import type { Task } from "../models/types"
import { v4 as uuidv4 } from "uuid"

export class TaskService {
  private static instance: TaskService

  private constructor() {}

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService()
    }
    return TaskService.instance
  }

  public async getAllTasks(): Promise<Task[]> {
    const tasks = await database.selectQuery("SELECT * FROM tasks_cache ORDER BY created_at DESC")
    return this.parseTasks(tasks)
  }

  public async getTaskById(id: string): Promise<Task | null> {
    const task = await database.selectFirstQuery("SELECT * FROM tasks_cache WHERE id = ?", [id])
    return task ? this.parseTask(task) : null
  }

  public async getTasksByClass(classId: string): Promise<Task[]> {
    const tasks = await database.selectQuery("SELECT * FROM tasks_cache WHERE class_id = ? ORDER BY due_date ASC", [
      classId,
    ])
    return this.parseTasks(tasks)
  }

  public async getTasksByStatus(status: string): Promise<Task[]> {
    const tasks = await database.selectQuery("SELECT * FROM tasks_cache WHERE status = ? ORDER BY due_date ASC", [
      status,
    ])
    return this.parseTasks(tasks)
  }

  public async getPendingTasks(): Promise<Task[]> {
    const tasks = await database.selectQuery(
      `SELECT * FROM tasks_cache 
       WHERE status IN ('pending', 'in_progress') 
       ORDER BY due_date ASC, priority DESC`,
    )
    return this.parseTasks(tasks)
  }

  public async getOverdueTasks(): Promise<Task[]> {
    const now = new Date().toISOString()
    const tasks = await database.selectQuery(
      `SELECT * FROM tasks_cache 
       WHERE status != 'completed' AND due_date < ? 
       ORDER BY due_date ASC`,
      [now],
    )
    return this.parseTasks(tasks)
  }

  public async getUpcomingTasks(days = 7): Promise<Task[]> {
    const now = new Date().toISOString()
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    const tasks = await database.selectQuery(
      `SELECT * FROM tasks_cache 
       WHERE status != 'completed' AND due_date BETWEEN ? AND ?
       ORDER BY due_date ASC`,
      [now, futureDate],
    )
    return this.parseTasks(tasks)
  }

  public async createTask(
    taskData: Omit<Task, "id" | "created_at" | "updated_at" | "is_synced" | "needs_sync">,
  ): Promise<Task> {
    const id = uuidv4()
    const now = new Date().toISOString()

    const newTask: Task = {
      id,
      ...taskData,
      created_at: now,
      updated_at: now,
      is_synced: false,
      needs_sync: true,
    }

    await database.executeQuery(
      `INSERT INTO tasks_cache 
       (id, class_id, title, description, due_date, priority, status, 
        estimated_duration, actual_duration, completion_percentage, tags,
        created_at, updated_at, completed_at, is_synced, needs_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTask.id,
        newTask.class_id,
        newTask.title,
        newTask.description,
        newTask.due_date,
        newTask.priority,
        newTask.status,
        newTask.estimated_duration,
        newTask.actual_duration,
        newTask.completion_percentage,
        JSON.stringify(newTask.tags),
        newTask.created_at,
        newTask.updated_at,
        newTask.completed_at,
        newTask.is_synced ? 1 : 0,
        newTask.needs_sync ? 1 : 0,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("tasks_cache", id, "INSERT", newTask)

    return newTask
  }

  public async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const existingTask = await this.getTaskById(id)
    if (!existingTask) return null

    const updatedTask = {
      ...existingTask,
      ...updates,
      updated_at: new Date().toISOString(),
      needs_sync: true,
      is_synced: false,
    }

    // If marking as completed, set completed_at
    if (updates.status === "completed" && !updates.completed_at) {
      updatedTask.completed_at = new Date().toISOString()
      updatedTask.completion_percentage = 100
    }

    await database.executeQuery(
      `UPDATE tasks_cache SET 
       class_id = ?, title = ?, description = ?, due_date = ?, priority = ?,
       status = ?, estimated_duration = ?, actual_duration = ?, completion_percentage = ?,
       tags = ?, updated_at = ?, completed_at = ?, needs_sync = ?, is_synced = ?
       WHERE id = ?`,
      [
        updatedTask.class_id,
        updatedTask.title,
        updatedTask.description,
        updatedTask.due_date,
        updatedTask.priority,
        updatedTask.status,
        updatedTask.estimated_duration,
        updatedTask.actual_duration,
        updatedTask.completion_percentage,
        JSON.stringify(updatedTask.tags),
        updatedTask.updated_at,
        updatedTask.completed_at,
        updatedTask.needs_sync ? 1 : 0,
        updatedTask.is_synced ? 1 : 0,
        id,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("tasks_cache", id, "UPDATE", updatedTask)

    return updatedTask
  }

  public async deleteTask(id: string): Promise<boolean> {
    const result = await database.executeQuery("DELETE FROM tasks_cache WHERE id = ?", [id])

    if (result.changes > 0) {
      // Add to sync queue
      await syncManager.addToSyncQueue("tasks_cache", id, "DELETE")
      return true
    }

    return false
  }

  public async completeTask(id: string): Promise<Task | null> {
    return this.updateTask(id, {
      status: "completed",
      completion_percentage: 100,
      completed_at: new Date().toISOString(),
    })
  }

  public async searchTasks(query: string): Promise<Task[]> {
    const tasks = await database.selectQuery(
      `SELECT * FROM tasks_cache 
       WHERE title LIKE ? OR description LIKE ?
       ORDER BY created_at DESC`,
      [`%${query}%`, `%${query}%`],
    )
    return this.parseTasks(tasks)
  }

  public async getTaskStats(): Promise<{
    total: number
    completed: number
    pending: number
    overdue: number
  }> {
    const now = new Date().toISOString()

    const [totalResult, completedResult, pendingResult, overdueResult] = await Promise.all([
      database.selectFirstQuery("SELECT COUNT(*) as count FROM tasks_cache"),
      database.selectFirstQuery('SELECT COUNT(*) as count FROM tasks_cache WHERE status = "completed"'),
      database.selectFirstQuery('SELECT COUNT(*) as count FROM tasks_cache WHERE status IN ("pending", "in_progress")'),
      database.selectFirstQuery(
        'SELECT COUNT(*) as count FROM tasks_cache WHERE status != "completed" AND due_date < ?',
        [now],
      ),
    ])

    return {
      total: totalResult?.count || 0,
      completed: completedResult?.count || 0,
      pending: pendingResult?.count || 0,
      overdue: overdueResult?.count || 0,
    }
  }

  private parseTask(task: any): Task {
    return {
      ...task,
      tags: task.tags ? JSON.parse(task.tags) : [],
      is_synced: Boolean(task.is_synced),
      needs_sync: Boolean(task.needs_sync),
    }
  }

  private parseTasks(tasks: any[]): Task[] {
    return tasks.map((task) => this.parseTask(task))
  }
}

// Export singleton instance
export const taskService = TaskService.getInstance()
