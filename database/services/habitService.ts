import { database } from "../sqlite/database"
import { syncManager } from "../sync/syncManager"
import type { Habit, HabitLog } from "../models/types"
import { v4 as uuidv4 } from "uuid"

export class HabitService {
  private static instance: HabitService

  private constructor() {}

  public static getInstance(): HabitService {
    if (!HabitService.instance) {
      HabitService.instance = new HabitService()
    }
    return HabitService.instance
  }

  // Habit methods
  public async getAllHabits(): Promise<Habit[]> {
    const habits = await database.selectQuery("SELECT * FROM habits_cache ORDER BY created_at DESC")
    return this.parseHabits(habits)
  }

  public async getHabitById(id: string): Promise<Habit | null> {
    const habit = await database.selectFirstQuery("SELECT * FROM habits_cache WHERE id = ?", [id])
    return habit ? this.parseHabit(habit) : null
  }

  public async getActiveHabits(): Promise<Habit[]> {
    const habits = await database.selectQuery("SELECT * FROM habits_cache WHERE is_active = 1 ORDER BY created_at DESC")
    return this.parseHabits(habits)
  }

  public async createHabit(
    habitData: Omit<Habit, "id" | "created_at" | "updated_at" | "is_synced" | "needs_sync">,
  ): Promise<Habit> {
    const id = uuidv4()
    const now = new Date().toISOString()

    const newHabit: Habit = {
      id,
      ...habitData,
      created_at: now,
      updated_at: now,
      is_synced: false,
      needs_sync: true,
    }

    await database.executeQuery(
      `INSERT INTO habits_cache 
       (id, name, description, target_frequency, color, icon, is_active,
        created_at, is_synced, needs_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newHabit.id,
        newHabit.name,
        newHabit.description,
        newHabit.target_frequency,
        newHabit.color,
        newHabit.icon,
        newHabit.is_active ? 1 : 0,
        newHabit.created_at,
        newHabit.is_synced ? 1 : 0,
        newHabit.needs_sync ? 1 : 0,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("habits_cache", id, "INSERT", newHabit)

    return newHabit
  }

  public async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | null> {
    const existingHabit = await this.getHabitById(id)
    if (!existingHabit) return null

    const updatedHabit = {
      ...existingHabit,
      ...updates,
      updated_at: new Date().toISOString(),
      needs_sync: true,
      is_synced: false,
    }

    await database.executeQuery(
      `UPDATE habits_cache SET 
       name = ?, description = ?, target_frequency = ?, color = ?, icon = ?,
       is_active = ?, updated_at = ?, needs_sync = ?, is_synced = ?
       WHERE id = ?`,
      [
        updatedHabit.name,
        updatedHabit.description,
        updatedHabit.target_frequency,
        updatedHabit.color,
        updatedHabit.icon,
        updatedHabit.is_active ? 1 : 0,
        updatedHabit.updated_at,
        updatedHabit.needs_sync ? 1 : 0,
        updatedHabit.is_synced ? 1 : 0,
        id,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("habits_cache", id, "UPDATE", updatedHabit)

    return updatedHabit
  }

  public async deleteHabit(id: string): Promise<boolean> {
    const result = await database.executeQuery("DELETE FROM habits_cache WHERE id = ?", [id])

    if (result.changes > 0) {
      // Also delete related logs
      await database.executeQuery("DELETE FROM habit_logs_cache WHERE habit_id = ?", [id])

      // Add to sync queue
      await syncManager.addToSyncQueue("habits_cache", id, "DELETE")
      return true
    }

    return false
  }

  // Habit Log methods
  public async getHabitLogs(habitId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    let query = "SELECT * FROM habit_logs_cache WHERE habit_id = ?"
    const params: any[] = [habitId]

    if (startDate) {
      query += " AND completed_date >= ?"
      params.push(startDate)
    }

    if (endDate) {
      query += " AND completed_date <= ?"
      params.push(endDate)
    }

    query += " ORDER BY completed_date DESC"

    const logs = await database.selectQuery(query, params)
    return this.parseHabitLogs(logs)
  }

  public async getHabitLogByDate(habitId: string, date: string): Promise<HabitLog | null> {
    const log = await database.selectFirstQuery(
      "SELECT * FROM habit_logs_cache WHERE habit_id = ? AND completed_date = ?",
      [habitId, date],
    )
    return log ? this.parseHabitLog(log) : null
  }

  public async createHabitLog(
    logData: Omit<HabitLog, "id" | "created_at" | "is_synced" | "needs_sync">,
  ): Promise<HabitLog> {
    const id = uuidv4()
    const now = new Date().toISOString()

    const newLog: HabitLog = {
      id,
      ...logData,
      created_at: now,
      is_synced: false,
      needs_sync: true,
    }

    await database.executeQuery(
      `INSERT INTO habit_logs_cache 
       (id, habit_id, completed_date, notes, mood_rating, created_at, is_synced, needs_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newLog.id,
        newLog.habit_id,
        newLog.completed_date,
        newLog.notes,
        newLog.mood_rating,
        newLog.created_at,
        newLog.is_synced ? 1 : 0,
        newLog.needs_sync ? 1 : 0,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("habit_logs_cache", id, "INSERT", newLog)

    return newLog
  }

  public async updateHabitLog(id: string, updates: Partial<HabitLog>): Promise<HabitLog | null> {
    const existingLog = await database.selectFirstQuery("SELECT * FROM habit_logs_cache WHERE id = ?", [id])

    if (!existingLog) return null

    const updatedLog = {
      ...this.parseHabitLog(existingLog),
      ...updates,
      needs_sync: true,
      is_synced: false,
    }

    await database.executeQuery(
      `UPDATE habit_logs_cache SET 
       notes = ?, mood_rating = ?, needs_sync = ?, is_synced = ?
       WHERE id = ?`,
      [updatedLog.notes, updatedLog.mood_rating, updatedLog.needs_sync ? 1 : 0, updatedLog.is_synced ? 1 : 0, id],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("habit_logs_cache", id, "UPDATE", updatedLog)

    return updatedLog
  }

  public async deleteHabitLog(id: string): Promise<boolean> {
    const result = await database.executeQuery("DELETE FROM habit_logs_cache WHERE id = ?", [id])

    if (result.changes > 0) {
      // Add to sync queue
      await syncManager.addToSyncQueue("habit_logs_cache", id, "DELETE")
      return true
    }

    return false
  }

  public async toggleHabitCompletion(
    habitId: string,
    date: string,
    notes?: string,
    moodRating?: number,
  ): Promise<HabitLog | null> {
    const existingLog = await this.getHabitLogByDate(habitId, date)

    if (existingLog) {
      // Remove the log (toggle off)
      await this.deleteHabitLog(existingLog.id)
      return null
    } else {
      // Create new log (toggle on)
      return await this.createHabitLog({
        habit_id: habitId,
        completed_date: date,
        notes,
        mood_rating: moodRating,
      })
    }
  }

  public async getHabitStreak(habitId: string): Promise<number> {
    const logs = await database.selectQuery(
      `SELECT completed_date FROM habit_logs_cache 
       WHERE habit_id = ? 
       ORDER BY completed_date DESC`,
      [habitId],
    )

    if (logs.length === 0) return 0

    let streak = 0
    const today = new Date()

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].completed_date)
      const expectedDate = new Date(today)
      expectedDate.setDate(today.getDate() - i)

      // Check if the log date matches the expected consecutive date
      if (logDate.toDateString() === expectedDate.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  public async getHabitCompletionRate(habitId: string, days = 30): Promise<number> {
    const endDate = new Date().toISOString().split("T")[0]
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    const logs = await this.getHabitLogs(habitId, startDate, endDate)
    return Math.round((logs.length / days) * 100)
  }

  public async getHabitsWithStats(): Promise<(Habit & { streak: number; completionRate: number })[]> {
    const habits = await this.getActiveHabits()

    const habitsWithStats = await Promise.all(
      habits.map(async (habit) => {
        const streak = await this.getHabitStreak(habit.id)
        const completionRate = await this.getHabitCompletionRate(habit.id)

        return {
          ...habit,
          streak,
          completionRate,
        }
      }),
    )

    return habitsWithStats
  }

  private parseHabit(habit: any): Habit {
    return {
      ...habit,
      is_active: Boolean(habit.is_active),
      is_synced: Boolean(habit.is_synced),
      needs_sync: Boolean(habit.needs_sync),
    }
  }

  private parseHabits(habits: any[]): Habit[] {
    return habits.map((habit) => this.parseHabit(habit))
  }

  private parseHabitLog(log: any): HabitLog {
    return {
      ...log,
      is_synced: Boolean(log.is_synced),
      needs_sync: Boolean(log.needs_sync),
    }
  }

  private parseHabitLogs(logs: any[]): HabitLog[] {
    return logs.map((log) => this.parseHabitLog(log))
  }
}

// Export singleton instance
export const habitService = HabitService.getInstance()
