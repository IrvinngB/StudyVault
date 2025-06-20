import { database } from "../sqlite/database"
import { syncManager } from "../sync/syncManager"
import type { CalendarEvent } from "../models/types"
import { v4 as uuidv4 } from "uuid"

export class CalendarService {
  private static instance: CalendarService

  private constructor() {}

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService()
    }
    return CalendarService.instance
  }

  public async getAllEvents(): Promise<CalendarEvent[]> {
    const events = await database.selectQuery("SELECT * FROM calendar_events_cache ORDER BY start_datetime ASC")
    return this.parseEvents(events)
  }

  public async getEventById(id: string): Promise<CalendarEvent | null> {
    const event = await database.selectFirstQuery("SELECT * FROM calendar_events_cache WHERE id = ?", [id])
    return event ? this.parseEvent(event) : null
  }

  public async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const events = await database.selectQuery(
      `SELECT * FROM calendar_events_cache 
       WHERE start_datetime >= ? AND start_datetime <= ?
       ORDER BY start_datetime ASC`,
      [startDate, endDate],
    )
    return this.parseEvents(events)
  }

  public async getEventsByClass(classId: string): Promise<CalendarEvent[]> {
    const events = await database.selectQuery(
      "SELECT * FROM calendar_events_cache WHERE class_id = ? ORDER BY start_datetime ASC",
      [classId],
    )
    return this.parseEvents(events)
  }

  public async getEventsByType(eventType: string): Promise<CalendarEvent[]> {
    const events = await database.selectQuery(
      "SELECT * FROM calendar_events_cache WHERE event_type = ? ORDER BY start_datetime ASC",
      [eventType],
    )
    return this.parseEvents(events)
  }

  public async getUpcomingEvents(days = 7): Promise<CalendarEvent[]> {
    const now = new Date().toISOString()
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

    const events = await database.selectQuery(
      `SELECT * FROM calendar_events_cache 
       WHERE start_datetime BETWEEN ? AND ?
       ORDER BY start_datetime ASC`,
      [now, futureDate],
    )
    return this.parseEvents(events)
  }

  public async getTodayEvents(): Promise<CalendarEvent[]> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    return this.getEventsByDateRange(startOfDay, endOfDay)
  }

  public async createEvent(
    eventData: Omit<CalendarEvent, "id" | "created_at" | "updated_at" | "is_synced" | "needs_sync">,
  ): Promise<CalendarEvent> {
    const id = uuidv4()
    const now = new Date().toISOString()

    const newEvent: CalendarEvent = {
      id,
      ...eventData,
      created_at: now,
      updated_at: now,
      is_synced: false,
      needs_sync: true,
    }

    await database.executeQuery(
      `INSERT INTO calendar_events_cache 
       (id, class_id, title, description, start_datetime, end_datetime,
        event_type, is_recurring, recurrence_pattern, location, reminder_minutes,
        google_calendar_id, created_at, updated_at, is_synced, needs_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newEvent.id,
        newEvent.class_id,
        newEvent.title,
        newEvent.description,
        newEvent.start_datetime,
        newEvent.end_datetime,
        newEvent.event_type,
        newEvent.is_recurring ? 1 : 0,
        JSON.stringify(newEvent.recurrence_pattern),
        newEvent.location,
        newEvent.reminder_minutes,
        newEvent.google_calendar_id,
        newEvent.created_at,
        newEvent.updated_at,
        newEvent.is_synced ? 1 : 0,
        newEvent.needs_sync ? 1 : 0,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("calendar_events_cache", id, "INSERT", newEvent)

    return newEvent
  }

  public async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const existingEvent = await this.getEventById(id)
    if (!existingEvent) return null

    const updatedEvent = {
      ...existingEvent,
      ...updates,
      updated_at: new Date().toISOString(),
      needs_sync: true,
      is_synced: false,
    }

    await database.executeQuery(
      `UPDATE calendar_events_cache SET 
       class_id = ?, title = ?, description = ?, start_datetime = ?, end_datetime = ?,
       event_type = ?, is_recurring = ?, recurrence_pattern = ?, location = ?, 
       reminder_minutes = ?, google_calendar_id = ?, updated_at = ?, 
       needs_sync = ?, is_synced = ?
       WHERE id = ?`,
      [
        updatedEvent.class_id,
        updatedEvent.title,
        updatedEvent.description,
        updatedEvent.start_datetime,
        updatedEvent.end_datetime,
        updatedEvent.event_type,
        updatedEvent.is_recurring ? 1 : 0,
        JSON.stringify(updatedEvent.recurrence_pattern),
        updatedEvent.location,
        updatedEvent.reminder_minutes,
        updatedEvent.google_calendar_id,
        updatedEvent.updated_at,
        updatedEvent.needs_sync ? 1 : 0,
        updatedEvent.is_synced ? 1 : 0,
        id,
      ],
    )

    // Add to sync queue
    await syncManager.addToSyncQueue("calendar_events_cache", id, "UPDATE", updatedEvent)

    return updatedEvent
  }

  public async deleteEvent(id: string): Promise<boolean> {
    const result = await database.executeQuery("DELETE FROM calendar_events_cache WHERE id = ?", [id])

    if (result.changes > 0) {
      // Add to sync queue
      await syncManager.addToSyncQueue("calendar_events_cache", id, "DELETE")
      return true
    }

    return false
  }

  public async searchEvents(query: string): Promise<CalendarEvent[]> {
    const events = await database.selectQuery(
      `SELECT * FROM calendar_events_cache 
       WHERE title LIKE ? OR description LIKE ? OR location LIKE ?
       ORDER BY start_datetime ASC`,
      [`%${query}%`, `%${query}%`, `%${query}%`],
    )
    return this.parseEvents(events)
  }

  public async getEventStats(): Promise<{
    total: number
    upcoming: number
    today: number
    recurring: number
  }> {
    const now = new Date().toISOString()
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    const [totalResult, upcomingResult, todayResult, recurringResult] = await Promise.all([
      database.selectFirstQuery("SELECT COUNT(*) as count FROM calendar_events_cache"),
      database.selectFirstQuery("SELECT COUNT(*) as count FROM calendar_events_cache WHERE start_datetime > ?", [now]),
      database.selectFirstQuery(
        "SELECT COUNT(*) as count FROM calendar_events_cache WHERE start_datetime >= ? AND start_datetime < ?",
        [startOfDay, endOfDay],
      ),
      database.selectFirstQuery("SELECT COUNT(*) as count FROM calendar_events_cache WHERE is_recurring = 1"),
    ])

    return {
      total: totalResult?.count || 0,
      upcoming: upcomingResult?.count || 0,
      today: todayResult?.count || 0,
      recurring: recurringResult?.count || 0,
    }
  }

  private parseEvent(event: any): CalendarEvent {
    return {
      ...event,
      recurrence_pattern: event.recurrence_pattern ? JSON.parse(event.recurrence_pattern) : {},
      external_calendar_sync: event.external_calendar_sync ? JSON.parse(event.external_calendar_sync) : {},
      is_recurring: Boolean(event.is_recurring),
      is_synced: Boolean(event.is_synced),
      needs_sync: Boolean(event.needs_sync),
    }
  }

  private parseEvents(events: any[]): CalendarEvent[] {
    return events.map((event) => this.parseEvent(event))
  }
}

// Export singleton instance
export const calendarService = CalendarService.getInstance()
