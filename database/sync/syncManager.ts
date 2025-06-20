import { database } from "../sqlite/database"
import { apiClient } from "../api/client"
import type { SyncStatus } from "../models/types"
import * as Device from "expo-device"
import AsyncStorage from "@react-native-async-storage/async-storage"

export class SyncManager {
  private static instance: SyncManager
  private deviceId = ""
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null

  private constructor() {}

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager()
    }
    return SyncManager.instance
  }

  public async initialize(): Promise<void> {
    // Generate or retrieve device ID
    let deviceId = await AsyncStorage.getItem("device_id")
    if (!deviceId) {
      deviceId = `${Device.osName}_${Device.modelName}_${Date.now()}`
      await AsyncStorage.setItem("device_id", deviceId)
    }
    this.deviceId = deviceId

    // Start periodic sync (every 5 minutes)
    this.startPeriodicSync()
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(
      async () => {
        if (apiClient.isAuthenticated()) {
          await this.performSync()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes
  }

  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  public async performSync(): Promise<boolean> {
    if (this.isSyncing) {
      console.log("Sync already in progress")
      return false
    }

    this.isSyncing = true
    console.log("Starting sync process...")

    try {
      // Step 1: Push local changes to server
      await this.pushLocalChanges()

      // Step 2: Pull updates from server
      await this.pullServerUpdates()

      console.log("Sync completed successfully")
      return true
    } catch (error) {
      console.error("Sync failed:", error)
      return false
    } finally {
      this.isSyncing = false
    }
  }

  private async pushLocalChanges(): Promise<void> {
    const tables = ["tasks_cache", "calendar_events_cache", "habits_cache", "habit_logs_cache"]

    for (const table of tables) {
      try {
        // Get records that need sync
        const records = await database.selectQuery(`SELECT * FROM ${table} WHERE needs_sync = 1 AND is_synced = 0`)

        if (records.length === 0) continue

        // Convert SQLite records to API format
        const apiRecords = records.map((record) => {
          const { is_synced, needs_sync, last_sync, ...apiRecord } = record

          // Parse JSON fields
          if (record.tags && typeof record.tags === "string") {
            apiRecord.tags = JSON.parse(record.tags)
          }
          if (record.recurrence_pattern && typeof record.recurrence_pattern === "string") {
            apiRecord.recurrence_pattern = JSON.parse(record.recurrence_pattern)
          }

          return apiRecord
        })

        // Push to server
        const tableName = table.replace("_cache", "")
        const response = await apiClient.pushData(tableName, apiRecords, this.deviceId)

        if (response.success) {
          // Mark records as synced
          const recordIds = records.map((r) => r.id)
          await database.executeQuery(
            `UPDATE ${table} SET is_synced = 1, needs_sync = 0 WHERE id IN (${recordIds.map(() => "?").join(",")})`,
            recordIds,
          )

          console.log(`Pushed ${records.length} records from ${table}`)
        } else {
          console.error(`Failed to push ${table}:`, response.error)
        }
      } catch (error) {
        console.error(`Error pushing ${table}:`, error)
      }
    }
  }

  private async pullServerUpdates(): Promise<void> {
    try {
      // Get last sync timestamps
      const syncStatuses = await database.selectQuery("SELECT * FROM sync_status")
      const lastSyncMap = new Map(syncStatuses.map((s) => [s.table_name, s.last_sync]))

      const syncRequest = {
        device_id: this.deviceId,
        last_sync: lastSyncMap.get("global") || null,
        tables: ["classes", "tasks", "calendar_events", "habits", "habit_logs"],
      }

      const response = await apiClient.pullData(syncRequest)

      if (response.success && response.data) {
        await database.transaction(async (db) => {
          // Update classes cache
          if (response.data.classes) {
            for (const classItem of response.data.classes) {
              await db.runAsync(
                `INSERT OR REPLACE INTO classes_cache 
                 (id, name, code, instructor, color, credits, semester, is_active, last_sync)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  classItem.id,
                  classItem.name,
                  classItem.code,
                  classItem.instructor,
                  classItem.color,
                  classItem.credits,
                  classItem.semester,
                  classItem.is_active ? 1 : 0,
                  new Date().toISOString(),
                ],
              )
            }
          }

          // Update tasks cache
          if (response.data.tasks) {
            for (const task of response.data.tasks) {
              await db.runAsync(
                `INSERT OR REPLACE INTO tasks_cache 
                 (id, class_id, title, description, due_date, priority, status, 
                  estimated_duration, actual_duration, completion_percentage, tags,
                  created_at, updated_at, completed_at, is_synced, needs_sync)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
                [
                  task.id,
                  task.class_id,
                  task.title,
                  task.description,
                  task.due_date,
                  task.priority,
                  task.status,
                  task.estimated_duration,
                  task.actual_duration,
                  task.completion_percentage,
                  JSON.stringify(task.tags || []),
                  task.created_at,
                  task.updated_at,
                  task.completed_at,
                ],
              )
            }
          }

          // Update calendar events cache
          if (response.data.calendar_events) {
            for (const event of response.data.calendar_events) {
              await db.runAsync(
                `INSERT OR REPLACE INTO calendar_events_cache 
                 (id, class_id, title, description, start_datetime, end_datetime,
                  event_type, is_recurring, recurrence_pattern, location, reminder_minutes,
                  google_calendar_id, created_at, updated_at, is_synced, needs_sync)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
                [
                  event.id,
                  event.class_id,
                  event.title,
                  event.description,
                  event.start_datetime,
                  event.end_datetime,
                  event.event_type,
                  event.is_recurring ? 1 : 0,
                  JSON.stringify(event.recurrence_pattern || {}),
                  event.location,
                  event.reminder_minutes,
                  event.google_calendar_id,
                  event.created_at,
                  event.updated_at,
                ],
              )
            }
          }

          // Update habits cache
          if (response.data.habits) {
            for (const habit of response.data.habits) {
              await db.runAsync(
                `INSERT OR REPLACE INTO habits_cache 
                 (id, name, description, target_frequency, color, icon, is_active,
                  created_at, is_synced, needs_sync)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
                [
                  habit.id,
                  habit.name,
                  habit.description,
                  habit.target_frequency,
                  habit.color,
                  habit.icon,
                  habit.is_active ? 1 : 0,
                  habit.created_at,
                ],
              )
            }
          }

          // Update habit logs cache
          if (response.data.habit_logs) {
            for (const log of response.data.habit_logs) {
              await db.runAsync(
                `INSERT OR REPLACE INTO habit_logs_cache 
                 (id, habit_id, completed_date, notes, mood_rating, created_at, is_synced, needs_sync)
                 VALUES (?, ?, ?, ?, ?, ?, 1, 0)`,
                [log.id, log.habit_id, log.completed_date, log.notes, log.mood_rating, log.created_at],
              )
            }
          }

          // Update sync status
          await db.runAsync(
            `INSERT OR REPLACE INTO sync_status (table_name, last_sync, last_pull)
             VALUES ('global', ?, ?)`,
            [response.data.last_sync, new Date().toISOString()],
          )
        })

        console.log("Successfully pulled server updates")
      }
    } catch (error) {
      console.error("Error pulling server updates:", error)
    }
  }

  public async addToSyncQueue(
    tableName: string,
    recordId: string,
    action: "INSERT" | "UPDATE" | "DELETE",
    data?: any,
  ): Promise<void> {
    await database.executeQuery(
      `INSERT INTO sync_queue (table_name, record_id, action, data)
       VALUES (?, ?, ?, ?)`,
      [tableName, recordId, action, data ? JSON.stringify(data) : null],
    )

    // Mark record as needing sync
    if (action !== "DELETE") {
      await database.executeQuery(`UPDATE ${tableName} SET needs_sync = 1, is_synced = 0 WHERE id = ?`, [recordId])
    }
  }

  public async getSyncStatus(): Promise<SyncStatus[]> {
    return await database.selectQuery("SELECT * FROM sync_status")
  }

  public async forcePullFromServer(): Promise<boolean> {
    try {
      // Clear last sync timestamps to force full sync
      await database.executeQuery("DELETE FROM sync_status")
      return await this.performSync()
    } catch (error) {
      console.error("Force pull failed:", error)
      return false
    }
  }

  public getDeviceId(): string {
    return this.deviceId
  }

  public isSyncInProgress(): boolean {
    return this.isSyncing
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance()
