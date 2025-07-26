import type { Notification, NotificationCreate } from "@/database/models/notificationTypes"
import { NotificationService } from "@/database/services/notificationService"
import { useCallback, useEffect, useState } from "react"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const notificationService = NotificationService.getInstance()

  // Cargar notificaciones
  const loadNotifications = useCallback(async (isRead?: boolean, limit: number = 50) => {
    setLoading(true)
    setError(null)
    try {
      const result = await notificationService.getNotifications(isRead, limit)
      setNotifications(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading notifications")
    } finally {
      setLoading(false)
    }
  }, [notificationService])

  // Crear notificación
  const createNotification = useCallback(async (data: NotificationCreate): Promise<Notification | null> => {
    try {
      const result = await notificationService.createNotification(data)
      if (result) {
        // Actualizar la lista local
        setNotifications(prev => [result, ...prev])
      }
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating notification")
      return null
    }
  }, [notificationService])

  // Marcar como leída
  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await notificationService.markAsRead(id)
      if (success) {
        // Actualizar la lista local
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, is_read: true }
              : notification
          )
        )
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error marking notification as read")
      return false
    }
  }, [notificationService])

  // Eliminar notificación
  const deleteNotification = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await notificationService.deleteNotification(id)
      if (success) {
        // Actualizar la lista local
        setNotifications(prev => prev.filter(notification => notification.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting notification")
      return false
    }
  }, [notificationService])

  // Obtener conteo de no leídas
  const unreadCount = notifications.filter(n => !n.is_read).length

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    refresh: () => loadNotifications(),
  }
}
