import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    return newStatus === 'granted';
  }
  return true;
}

// Programa una notificación local para un evento de calendario
// Puedes especificar minutosAntes para que la notificación se dispare antes del evento
export async function scheduleCalendarNotification({ title, body, date, minutosAntes = 0 }: { title: string; body: string; date: Date | string; minutosAntes?: number }) {
  try {
    // Calcula la fecha/hora de la notificación restando los minutos indicados
    const fechaEvento = new Date(date);
    const fechaNotificacion = new Date(fechaEvento.getTime() - minutosAntes * 60000);
    
    // Verificar si la fecha de notificación ya pasó
    if (fechaNotificacion <= new Date()) {
      console.warn(`⚠️ Notification scheduled for past time: ${fechaNotificacion.toLocaleString()}, skipping.`);
      return null;
    }
    
    console.log(`📱 Scheduling notification:`);
    console.log(`- Title: ${title}`);
    console.log(`- Event time: ${fechaEvento.toLocaleString()}`);
    console.log(`- Reminder minutes: ${minutosAntes}`);
    console.log(`- Notification time: ${fechaNotificacion.toLocaleString()}`);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: 'high',
        vibrate: [0, 250, 250, 250],
        data: { eventDate: fechaEvento.toISOString() },
      },
      trigger: {
        type: 'datetime',
        date: fechaNotificacion,
        ...(Platform.OS === 'android' ? { channelId: 'calendar-reminders' } : {}),
      } as any, // 'as any' para evitar error de tipado, seguro en Expo
    });
    
    console.log(`✅ Notification scheduled with ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('❌ Failed to schedule notification:', error);
    throw error;
  }
}

export async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('calendar-reminders', {
        name: 'Calendar Reminders',
        description: 'Notificaciones de recordatorio para eventos del calendario',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
      console.log('✅ Android notification channel setup complete');
    } catch (error) {
      console.error('❌ Failed to set up Android notification channel:', error);
      throw error;
    }
  }
}
