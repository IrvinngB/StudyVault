import { ApiClient } from "@/database/api/client"
import type { Notification, NotificationCreate, NotificationUpdate } from "@/database/models/notificationTypes"

export class NotificationService {
  private static instance: NotificationService
  private apiClient: ApiClient

  private constructor() {
    this.apiClient = ApiClient.getInstance()
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  /**
   * Crear una nueva notificación en el backend
   */
  async createNotification(data: NotificationCreate): Promise<Notification | null> {
    try {
      console.log("📤 Creating notification via API:", data)
      const response = await this.apiClient.post<Notification>("/notifications/", data)
      console.log("✅ Notification created successfully:", response.id)
      return response
    } catch (error) {
      console.error("❌ Failed to create notification:", error)
      return null
    }
  }

  /**
   * Obtener todas las notificaciones del usuario
   */
  async getNotifications(isRead?: boolean, limit: number = 50): Promise<Notification[]> {
    try {
      const params = new URLSearchParams()
      if (isRead !== undefined) params.append("is_read", isRead.toString())
      params.append("limit", limit.toString())
      
      const url = `/notifications/${params.toString() ? `?${params.toString()}` : ""}`
      const response = await this.apiClient.get<Notification[]>(url)
      return response
    } catch (error) {
      console.error("❌ Failed to get notifications:", error)
      return []
    }
  }

  /**
   * Obtener una notificación específica
   */
  async getNotification(id: string): Promise<Notification | null> {
    try {
      const response = await this.apiClient.get<Notification>(`/notifications/${id}`)
      return response
    } catch (error) {
      console.error("❌ Failed to get notification:", error)
      return null
    }
  }

  /**
   * Actualizar una notificación
   */
  async updateNotification(id: string, data: NotificationUpdate): Promise<Notification | null> {
    try {
      const response = await this.apiClient.put<Notification>(`/notifications/${id}`, data)
      return response
    } catch (error) {
      console.error("❌ Failed to update notification:", error)
      return null
    }
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      await this.apiClient.post<any>(`/notifications/${id}/mark-read`)
      return true
    } catch (error) {
      console.error("❌ Failed to mark notification as read:", error)
      return false
    }
  }

  /**
   * Eliminar una notificación
   */
  async deleteNotification(id: string): Promise<boolean> {
    try {
      await this.apiClient.delete(`/notifications/${id}`)
      return true
    } catch (error) {
      console.error("❌ Failed to delete notification:", error)
      return false
    }
  }

  /**
   * Crear notificación para recordatorio de evento
   */
  async createEventReminderNotification({
    title,
    message,
    scheduledFor,
    eventType = "calendar"
  }: {
    title: string
    message: string
    scheduledFor: Date
    eventType?: string
  }): Promise<Notification | null> {
    const notificationData: NotificationCreate = {
      title,
      message,
      scheduled_for: scheduledFor.toISOString(),
      type: eventType,
    }

    return this.createNotification(notificationData)
  }
}
