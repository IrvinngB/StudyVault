import { CreateEventModal } from '@/components/calendar/CreateEventModal';
import { EventDetailsModal } from '@/components/calendar/EventDetailsModal';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { EVENT_TYPES_CONFIG } from '@/constants/Calendar';
import type { CalendarEvent, CreateCalendarEventRequest, UpdateCalendarEventRequest } from '@/database/models/calendarTypes';
import { useCalendar } from '@/hooks/useCalendar';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const daysSpanish = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Formatear fecha a 'YYYY-MM-DD'
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Formatear fecha larga con día y mes en español
const formatDateLong = (date: Date) => {
  const dayName = daysSpanish[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${dayNumber} de ${monthName} de ${year}`;
};

// Obtener primer y último día del mes en formato YYYY-MM-DD
const getMonthRange = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay)
  };
};

// Obtener días del mes
const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export default function CalendarScreen() {
  const { theme } = useTheme();

  const today = new Date();

  // Estado mes y año seleccionados
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Día seleccionado (Date)
  const [selectedDay, setSelectedDay] = useState(today);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Hook del calendario
  const {
    events,
    loading,
    error,
    fetchEventsForDateRange,
    getEventsForDate,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError
  } = useCalendar();

  // Obtener días del mes
  const daysInMonth = getDaysInMonth(year, month);

  // Filtrar eventos para el día seleccionado
  const eventsForSelectedDay = getEventsForDate(formatDate(selectedDay));

  // Ref para FlatList de días
  const flatListRef = useRef<FlatList<Date>>(null);

  // Scroll al día seleccionado cada vez que cambian mes, año o día seleccionado
  useEffect(() => {
    if (!flatListRef.current) return;
    const index = daysInMonth.findIndex(d => formatDate(d) === formatDate(selectedDay));
    if (index >= 0) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  }, [month, year, selectedDay, daysInMonth]);

  // Cargar eventos cuando cambien el mes o año
  useEffect(() => {
    const { start, end } = getMonthRange(year, month);
    console.log(`📅 Loading events for month range: ${start} to ${end}`);
    fetchEventsForDateRange(start, end);
  }, [year, month, fetchEventsForDateRange]);

  // Mostrar error si existe
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  // Cambiar mes (prev / next)
  const changeMonth = (increment: number) => {
    let newMonth = month + increment;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    // Al cambiar mes, seleccionamos primer día del nuevo mes
    setSelectedDay(new Date(newYear, newMonth, 1));
  };

  // Handle event creation
  const handleCreateEvent = async (eventData: CreateCalendarEventRequest) => {
    const result = await createEvent(eventData);
    if (!result) {
      throw new Error('No se pudo crear el evento');
    }
    // Refrescar eventos para el mes actual después de crear uno nuevo
    const { start, end } = getMonthRange(year, month);
    await fetchEventsForDateRange(start, end);
  };

  // Handle event update
  const handleUpdateEvent = async (eventId: string, eventData: UpdateCalendarEventRequest) => {
    const result = await updateEvent(eventId, eventData);
    if (!result) {
      throw new Error('No se pudo actualizar el evento');
    }
    // Refrescar eventos para el mes actual después de actualizar
    const { start, end } = getMonthRange(year, month);
    await fetchEventsForDateRange(start, end);
  };

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    const success = await deleteEvent(eventId);
    if (!success) {
      throw new Error('No se pudo eliminar el evento');
    }
    // Refrescar eventos para el mes actual después de eliminar
    const { start, end } = getMonthRange(year, month);
    await fetchEventsForDateRange(start, end);
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  // Render día en scroll horizontal
  const renderDay = ({ item }: { item: Date }) => {
    const isSelected = formatDate(item) === formatDate(selectedDay);
    return (
      <TouchableOpacity
        onPress={() => setSelectedDay(item)}
        style={[
          styles.dayContainer,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surfaceLight,
          },
        ]}
      >
        <ThemedText
          variant="h3"
          style={{ color: isSelected ? theme.colors.surface : theme.colors.text }}
        >
          {item.getDate()}
        </ThemedText>
        <ThemedText
          variant="body"
          style={{ color: isSelected ? theme.colors.surface : theme.colors.textMuted, fontSize: 12, marginTop: 2 }}
        >
          {daysSpanish[item.getDay()].substring(0, 3)}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Render evento
  const renderEventItem = ({ item }: { item: CalendarEvent }) => {
    // Find the event type configuration
    const eventConfig = EVENT_TYPES_CONFIG.find(config => config.value === item.event_type);
    
    let iconName: React.ComponentProps<typeof Ionicons>['name'] = eventConfig?.icon as any || 'calendar-outline';
    let iconColor = theme.colors.primary;

    // Set color based on event category
    switch (item.event_category || eventConfig?.category) {
      case 'class':
        iconColor = theme.colors.primary;
        break;
      case 'grade_event':
        iconColor = theme.colors.accent;
        break;
      case 'general_event':
        iconColor = theme.colors.secondary;
        break;
      default:
        iconColor = theme.colors.primary;
        break;
    }

    // Override specific colors for important events
    if (item.event_type === 'parcial' || item.event_type === 'examen_final') {
      iconColor = theme.colors.error;
    }

    return (
      <TouchableOpacity 
        style={[styles.eventItem, { borderColor: theme.colors.primary }]}
        onPress={() => handleEventClick(item)}
        activeOpacity={0.7}
      >
        <Ionicons name={iconName} size={24} color={iconColor} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <ThemedText variant="h3" style={{ color: theme.colors.text }}>
            {item.title}
          </ThemedText>
          {item.description ? (
            <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
              {item.description}
            </ThemedText>
          ) : null}
          {(item.location || item.classroom) ? (
            <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 4 }}>
              📍 {item.classroom || item.location}
            </ThemedText>
          ) : null}
        </View>
        <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12 }}>
          {new Date(item.start_datetime).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <ThemedView variant="background" style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header mes con botones */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
              <Ionicons name="chevron-back-outline" size={28} color={theme.colors.primary} />
            </TouchableOpacity>

            <ThemedText variant="h1" style={{ color: theme.colors.primary }}>
              {months[month]} {year}
            </ThemedText>

            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowButton}>
              <Ionicons name="chevron-forward-outline" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Scroll horizontal días */}
          <FlatList
            ref={flatListRef}
            horizontal
            data={daysInMonth}
            keyExtractor={(item) => item.toISOString()}
            renderItem={renderDay}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8, marginBottom: 24 }}
            getItemLayout={(_, index) => ({
              length: 52,
              offset: 52 * index,
              index,
            })}
            initialScrollIndex={selectedDay.getDate() - 1}
          />

          {/* Eventos */}
          <ThemedText variant="h2" style={{ marginBottom: 12 }}>
            Eventos del día {formatDateLong(selectedDay)}
          </ThemedText>

          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginRight: 8 }} />
              <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
                Cargando eventos...
              </ThemedText>
            </View>
          ) : eventsForSelectedDay.length === 0 ? (
            <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
              No tienes eventos para este día.
            </ThemedText>
          ) : (
            <FlatList
              data={eventsForSelectedDay}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false} // deshabilitar scroll interno para evitar conflictos con ScrollView padre
              contentContainerStyle={{ paddingBottom: 48 }}
            />
          )}
        </ScrollView>
      </ThemedView>

      {/* Floating Action Button */}
      <FloatingActionButton 
        onPress={() => setShowCreateModal(true)}
        icon="add"
      />

      {/* Create Event Modal */}
      <CreateEventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateEvent={handleCreateEvent}
        selectedDate={formatDate(selectedDay)}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        visible={showEventDetailsModal}
        onClose={() => {
          setShowEventDetailsModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrowButton: {
    padding: 4,
  },
  dayContainer: {
    width: 52,
    height: 64,
    marginHorizontal: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
});
