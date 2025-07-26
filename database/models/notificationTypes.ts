// Tipos para las notificaciones que coinciden con el backend
export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  scheduled_for: string // ISO string
  is_read: boolean
  created_at: string
  updated_at: string
}

export interface NotificationCreate {
  title: string
  message: string
  type: string
  scheduled_for: string // ISO string
  // user_id se asigna automáticamente en el backend
}

export interface NotificationUpdate {
  title?: string
  message?: string
  type?: string
  scheduled_for?: string
  is_read?: boolean
}

export type NotificationStatus = "pending" | "sent" | "failed"

export interface LocalNotificationData {
  userId: string
  title: string
  body: string
  date: Date | string
  minutosAntes?: number
  type?: string
}
