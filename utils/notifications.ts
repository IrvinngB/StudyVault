import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { convertUTCToLocal, debugTimezone } from "./timezoneHelpers"

// Función para crear una fecha local correctamente usando las utilidades de zona horaria
function createLocalDate(dateString: string): Date {
  try {
    // Usar la función de conversión de zona horaria
    const localDate = convertUTCToLocal(dateString)
    
    console.log(`📅 Date conversion using timezone helpers:`, {
      original: dateString,
      converted: localDate.toISOString(),
      localString: localDate.toLocaleString()
    })
    
    return localDate
  } catch (error) {
    console.error("❌ Error in createLocalDate:", error)
    // Fallback a la conversión original
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`)
    }
    
    return date
  }
}

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
  eventId,
}: { userId: string; title: string; body: string; date: Date | string; minutosAntes?: number; type?: string; eventId?: string }) {
  let localNotificationId = null

  try {
    console.log(`📱 Received notification request:`, {
      title,
      body,
      date,
      dateType: typeof date,
      minutosAntes,
      type,
      eventId
    })
    
    // Asegurarnos de que estamos trabajando con objetos Date adecuados
    // Si la fecha viene como string ISO, la parseamos correctamente
    let fechaEvento: Date
    
    if (typeof date === 'string') {
      // Si es un string ISO, crear la fecha manteniendo la zona horaria local
      fechaEvento = createLocalDate(date)
      
      // Debug de zona horaria
      debugTimezone(date)
    } else {
      fechaEvento = new Date(date)
    }
    
    console.log(`📱 Date parsing debug:`, {
      originalDate: date,
      parsedDate: fechaEvento,
      parsedDateLocal: fechaEvento.toLocaleString(),
      parsedDateISO: fechaEvento.toISOString(),
      timezoneOffset: fechaEvento.getTimezoneOffset()
    })

    // Validar que la fecha del evento es válida
    if (isNaN(fechaEvento.getTime())) {
      console.error("❌ Invalid event date provided:", date)
      throw new Error("Fecha de evento inválida")
    }

    // Calcular cuándo debe notificarse (X minutos antes del evento)
    let fechaNotificacion = new Date(fechaEvento.getTime() - minutosAntes * 60000)

    // Verificar si la fecha de notificación ya pasó
    const now = new Date()
    
    // Asegurar que la notificación se programe al menos 1 minuto en el futuro
    const oneMinuteFromNow = new Date(now.getTime() + 60000)
    if (fechaNotificacion < oneMinuteFromNow) {
      console.log(`📱 Adjusting notification time to be at least 1 minute in the future`)
      fechaNotificacion = new Date(oneMinuteFromNow)
    }
    
    console.log(`📱 Debugging notification scheduling:`)
    console.log(`- Original date input: ${date}`)
    console.log(`- Event time (local): ${fechaEvento.toLocaleString()}`)
    console.log(`- Event time (UTC): ${fechaEvento.toISOString()}`)
    console.log(`- Event timezone offset: ${fechaEvento.getTimezoneOffset()} minutes`)
    console.log(`- Reminder minutes: ${minutosAntes}`)
    console.log(`- Notification time (local): ${fechaNotificacion.toLocaleString()}`)
    console.log(`- Notification time (UTC): ${fechaNotificacion.toISOString()}`)
    console.log(`- Current time (local): ${now.toLocaleString()}`)
    console.log(`- Current time (UTC): ${now.toISOString()}`)
    console.log(`- Current timezone offset: ${now.getTimezoneOffset()} minutes`)
    console.log(`- Minutes until notification: ${Math.round((fechaNotificacion.getTime() - now.getTime()) / 60000)}`)
    console.log(`- Minutes until event: ${Math.round((fechaEvento.getTime() - now.getTime()) / 60000)}`)
    
    // Solo programar la notificación si el evento aún no ha ocurrido
    if (fechaEvento <= now) {
      console.log(`⚠️ Event already passed, skipping notification`)
      return null
    }
    
    // Cancelar notificaciones existentes para este evento si se proporciona eventId
    if (eventId) {
      await cancelEventNotifications(eventId)
    }
    
    // Si la fecha de notificación ya pasó pero el evento aún no ha ocurrido,
    // significa que el recordatorio debería haberse enviado antes.
    // En este caso, NO programamos la notificación para evitar notificaciones inmediatas
    if (fechaNotificacion <= now) {
      console.warn(`⚠️ Reminder time already passed, skipping notification:`, {
        now: now.toLocaleString(),
        eventTime: fechaEvento.toLocaleString(),
        notificationTime: fechaNotificacion.toLocaleString(),
        minutesBeforeEvent: minutosAntes,
        minutesDifference: Math.round((fechaNotificacion.getTime() - now.getTime()) / 60000),
      })
      
      // No programar la notificación si el tiempo de recordatorio ya pasó
      console.log(`📱 Skipping notification because reminder time already passed`)
      return null
    }

    console.log(`📱 Scheduling notification:`)
    console.log(`- Title: ${title}`)
    console.log(`- Event time: ${fechaEvento.toLocaleString()}`)
    console.log(`- Event time (ISO): ${fechaEvento.toISOString()}`)
    console.log(`- Reminder minutes: ${minutosAntes}`)
    console.log(`- Notification time: ${fechaNotificacion.toLocaleString()}`)
    console.log(`- Notification time (ISO): ${fechaNotificacion.toISOString()}`)
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
        eventId: eventId,
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

    // Listar todas las notificaciones programadas para debugging
    await listScheduledNotifications()

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

// Función para cancelar notificaciones existentes para un evento específico
export async function cancelEventNotifications(eventId: string) {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()
    
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.eventId === eventId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier)
        console.log(`🗑️ Cancelled notification ${notification.identifier} for event ${eventId}`)
      }
    }
  } catch (error) {
    console.error("❌ Error cancelling notifications:", error)
  }
}

// Función para listar todas las notificaciones programadas (para debugging)
export async function listScheduledNotifications() {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()
    console.log(`📋 Found ${scheduledNotifications.length} scheduled notifications:`)
    
    scheduledNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ID: ${notification.identifier}`)
      console.log(`   Title: ${notification.content.title}`)
      console.log(`   Body: ${notification.content.body}`)
      console.log(`   Trigger: ${JSON.stringify(notification.trigger)}`)
      console.log(`   Data: ${JSON.stringify(notification.content.data)}`)
      console.log(`   ---`)
    })
    
    return scheduledNotifications
  } catch (error) {
    console.error("❌ Error listing notifications:", error)
    return []
  }
}
