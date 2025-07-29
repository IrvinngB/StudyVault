import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

export async function requestNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync()
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync()
    return newStatus === "granted"
  }
  return true
}

// Función para guardar notificaciones usando el endpoint
async function saveNotificationToDatabase({
  userId,
  title,
  message,
  scheduledFor,
  type,
}: { userId: string; title: string; message: string; scheduledFor: Date; type: string }) {
  try {
    // Usar el nuevo servicio de notificaciones
    const { NotificationService } = await import("../database/services/notificationService")
    const notificationService = NotificationService.getInstance()

    const result = await notificationService.createEventReminderNotification({
      title,
      message,
      scheduledFor,
      eventType: type,
    })

    if (result) {
      console.log("✅ Notification saved via API:", result.id)
      return result
    } else {
      console.error("❌ Failed to save notification to database")
      return null
    }
  } catch (error) {
    console.error("❌ Failed to save notification via API:", error)
    // No lanzamos el error para evitar que falle la creación del evento
    // si falla la creación de la notificación
    return null
  }
}

// Programa una notificación local para un evento de calendario
// Puedes especificar minutosAntes para que la notificación se dispare antes del evento
export async function scheduleCalendarNotification({
  userId,
  title,
  body,
  date,
  minutosAntes = 0,
  type = "calendar",
}: { userId: string; title: string; body: string; date: Date | string; minutosAntes?: number; type?: string }) {
  let localNotificationId = null

  try {
    // Asegurarnos de que estamos trabajando con objetos Date adecuados
    const fechaEvento = new Date(date)

    // Validar que la fecha del evento es válida
    if (isNaN(fechaEvento.getTime())) {
      console.error("❌ Invalid event date provided:", date)
      throw new Error("Fecha de evento inválida")
    }

    // Calcular cuándo debe notificarse (X minutos antes del evento)
    const fechaNotificacion = new Date(fechaEvento.getTime() - minutosAntes * 60000)

    // Verificar si la fecha de notificación ya pasó
    const now = new Date()
    
    console.log(`📱 Debugging notification scheduling:`)
    console.log(`- Event time (local): ${fechaEvento.toLocaleString()}`)
    console.log(`- Reminder minutes: ${minutosAntes}`)
    console.log(`- Notification time (local): ${fechaNotificacion.toLocaleString()}`)
    console.log(`- Current time (local): ${now.toLocaleString()}`)
    console.log(`- Minutes until notification: ${Math.round((fechaNotificacion.getTime() - now.getTime()) / 60000)}`)
    
    if (fechaNotificacion <= now) {
      console.warn(`⚠️ Notification scheduled for past time:`, {
        now: now.toLocaleString(),
        eventTime: fechaEvento.toLocaleString(),
        notificationTime: fechaNotificacion.toLocaleString(),
        minutesBeforeEvent: minutosAntes,
        minutesDifference: Math.round((fechaNotificacion.getTime() - now.getTime()) / 60000),
      })

      // Si la hora ya pasó, podemos enviar una notificación inmediata si el evento aún no ha ocurrido
      if (fechaEvento > now) {
        console.log(`⚠️ Sending immediate notification instead as event hasn't occurred yet`)
        // Configuramos la notificación para 10 segundos en el futuro (casi inmediata)
        fechaNotificacion.setTime(now.getTime() + 10000)
      } else {
        console.log(`⚠️ Event already passed, skipping notification`)
        return null
      }
    }

    console.log(`📱 Scheduling notification:`)
    console.log(`- Title: ${title}`)
    console.log(`- Event time: ${fechaEvento.toLocaleString()}`)
    console.log(`- Reminder minutes: ${minutosAntes}`)
    console.log(`- Notification time: ${fechaNotificacion.toLocaleString()}`)
    console.log(
      `- Time until notification: ${Math.round((fechaNotificacion.getTime() - now.getTime()) / 60000)} minutes`,
    )

    // Primero programamos la notificación local (esto debe funcionar incluso sin conexión)
    // Aseguramos que la fecha es un objeto Date válido
    const triggerDate = new Date(fechaNotificacion)

    console.log(`📆 Scheduling notification for exact time:`, {
      rawDate: fechaNotificacion,
      triggerDateISOString: triggerDate.toISOString(),
      triggerDateLocaleString: triggerDate.toLocaleString(),
      currentTime: new Date().toLocaleString(),
      timeDifference: `${Math.round((triggerDate.getTime() - new Date().getTime()) / 60000)} minutes from now`,
    })

    // Configurar el contenido de la notificación
    const notificationContent = {
      title,
      body,
      sound: "default",
      priority: Notifications.AndroidNotificationPriority.HIGH,
      vibrate: [0, 250, 250, 250],
      data: {
        eventDate: fechaEvento.toISOString(),
        scheduledFor: triggerDate.toISOString(),
        type: type,
        userId: userId,
      },
    }

    // Programar la notificación local
    localNotificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: {
        date: triggerDate,
        ...(Platform.OS === "android" ? { channelId: "calendar-reminders" } : {}),
      } as any,
    })

    console.log(`✅ Local notification scheduled with ID: ${localNotificationId}`)

    // Guardar en la base de datos para persistencia
    try {
      const dbResult = await saveNotificationToDatabase({
        userId,
        title,
        message: body,
        scheduledFor: fechaNotificacion,
        type,
      })

      if (dbResult) {
        console.log("✅ Remote notification record created in database")
      } else {
        console.warn("⚠️ Failed to create remote notification record, but local notification was scheduled")
      }
    } catch (dbError) {
      console.warn("⚠️ Could not save notification to database, but local notification was scheduled:", dbError)
    }

    return localNotificationId
  } catch (error) {
    console.error("❌ Failed to schedule notification:", error)

    if (localNotificationId) {
      console.log("⚠️ Error in notification process, but local notification was scheduled")
      return localNotificationId
    }

    throw error
  }
}

export async function setupAndroidChannel() {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("calendar-reminders", {
        name: "Calendar Reminders",
        description: "Notificaciones de recordatorio para eventos del calendario",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      })
      console.log("✅ Android notification channel setup complete")
    } catch (error) {
      console.error("❌ Failed to set up Android notification channel:", error)
      throw error
    }
  }
}
