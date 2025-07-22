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
  // Calcula la fecha/hora de la notificación restando los minutos indicados
  const fechaEvento = new Date(date);
  const fechaNotificacion = new Date(fechaEvento.getTime() - minutosAntes * 60000);
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      type: 'datetime',
      date: fechaNotificacion,
      ...(Platform.OS === 'android' ? { channelId: 'calendar-reminders' } : {}),
    } as any, // 'as any' para evitar error de tipado, seguro en Expo
  });
}

export async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('calendar-reminders', {
      name: 'Calendar Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}
