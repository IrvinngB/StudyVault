"use client"

import { CreateEventModal } from "@/components/calendar/CreateEventModal"
import { EventDetailsModal } from "@/components/calendar/EventDetailsModal"
import { FloatingActionButton } from "@/components/ui/FloatingActionButton"
import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { EVENT_TYPES_CONFIG } from "@/constants/Calendar"
import type {
  CalendarEvent,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
} from "@/database/models/calendarTypes"
import { useCalendar } from "@/hooks/useCalendar"
import { useClasses } from "@/hooks/useClasses"
import { useTheme } from "@/hooks/useTheme"
import { formatTimeForDisplay, isValidDate, safeParseDate } from "@/utils/dateHelpers"; // Usar funciones más seguras
import { Ionicons } from "@expo/vector-icons"
import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const daysSpanish = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

// Función para obtener información de zona horaria
const getTimezoneInfo = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const offset = new Date().getTimezoneOffset()
  const offsetHours = Math.abs(Math.floor(offset / 60))
  const offsetMinutes = Math.abs(offset % 60)
  const offsetSign = offset > 0 ? "-" : "+"
  
  return {
    timezone,
    offsetString: `${offsetSign}${offsetHours.toString().padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`
  }
}

// Función para formatear fecha con información de zona horaria
const formatDateWithTimezone = (dateString: string) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return {
        localDate: "Fecha inválida",
        localTime: "--:--",
        timezone: "Unknown",
        offset: "--:--",
        originalDate: dateString
      }
    }
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const offset = new Date().getTimezoneOffset()
    const offsetHours = Math.abs(Math.floor(offset / 60))
    const offsetMinutes = Math.abs(offset % 60)
    const offsetSign = offset > 0 ? "-" : "+"
    const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`
    
    return {
      localDate: date.toLocaleDateString('es-ES', { timeZone: timezone }),
      localTime: date.toLocaleTimeString('es-ES', { 
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit'
      }),
      timezone: timezone,
      offset: offsetString,
      originalDate: dateString
    }
  } catch (error) {
    return {
      localDate: "Fecha inválida",
      localTime: "--:--",
      timezone: "Unknown",
      offset: "--:--",
      originalDate: dateString
    }
  }
}

// Formatear fecha a 'YYYY-MM-DD'
const formatDate = (date: Date) => {
  if (!isValidDate(date)) {
    return new Date().toISOString().split("T")[0] // Fallback a fecha actual
  }

  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${d}`
}

// Función mejorada para formatear fecha de manera consistente
const formatDateConsistent = (date: Date) => {
  if (!isValidDate(date)) {
    return new Date().toLocaleDateString('en-CA') // Fallback a fecha actual
  }

  // Usar toLocaleDateString para evitar problemas de zona horaria
  return date.toLocaleDateString('en-CA') // Formato YYYY-MM-DD
}

// Formatear fecha larga con día y mes en español
const formatDateLong = (date: Date) => {
  if (!isValidDate(date)) {
    return "Fecha inválida"
  }

  try {
    const dayName = daysSpanish[date.getDay()]
    const dayNumber = date.getDate()
    const monthName = months[date.getMonth()]
    const year = date.getFullYear()
    return `${dayName}, ${dayNumber} de ${monthName} de ${year}`
  } catch (error) {
    return "Fecha inválida"
  }
}

// Obtener primer y último día del mes en formato YYYY-MM-DD
const getMonthRange = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay),
  }
}

// Obtener días del mes
const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = []
  const date = new Date(year, month, 1)
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

export default function CalendarScreen() {
  const { theme } = useTheme()
  const { getClassById } = useClasses()
  const today = new Date()

  // Estado mes y año seleccionados
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  // Día seleccionado (Date)
  const [selectedDay, setSelectedDay] = useState(today)

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  
  // State para almacenar nombres de cursos
  const [classNames, setClassNames] = useState<Record<string, string>>({})

  // Hook del calendario
  const {
    events,
    loading,
    error,
    fetchEventsForDateRange: originalFetchEventsForDateRange,
    getEventsForDate,
    createEvent,
    updateEvent,
    deleteEvent,
    clearError,
  } = useCalendar()

  // Memoizar fetchEventsForDateRange para evitar recreaciones
  const fetchEventsForDateRange = useCallback(async (startDate: string, endDate: string) => {
    await originalFetchEventsForDateRange(startDate, endDate)
  }, [originalFetchEventsForDateRange])

  // Ref para FlatList de días
  const flatListRef = useRef<FlatList<Date>>(null)
  
  // Ref para evitar re-renders innecesarios
  const lastEventsCount = useRef<number>(0)
  const lastSelectedDate = useRef<string>("")

  // Obtener días del mes
  const daysInMonth = getDaysInMonth(year, month)

  // Filtrar eventos para el día seleccionado
  const eventsForSelectedDay = getEventsForDate(formatDateConsistent(selectedDay))
  
  // Debug: Log eventos para el día seleccionado
  useEffect(() => {
    console.log('📅 Calendar: Events for selected day:', {
      date: formatDateConsistent(selectedDay),
      count: eventsForSelectedDay.length,
      events: eventsForSelectedDay.map(e => ({ 
        id: e.id, 
        title: e.title, 
        type: e.event_type, 
        start_datetime: e.start_datetime 
      }))
    })
  }, [eventsForSelectedDay, selectedDay])
  
  // Optimización: solo actualizar si realmente hay cambios
  const currentSelectedDate = formatDateConsistent(selectedDay)
  const shouldUpdateEvents = lastSelectedDate.current !== currentSelectedDate || lastEventsCount.current !== eventsForSelectedDay.length
  
  if (shouldUpdateEvents) {
    lastSelectedDate.current = currentSelectedDate
    lastEventsCount.current = eventsForSelectedDay.length
  }

  // Scroll al día seleccionado cada vez que cambian mes, año o día seleccionado
  useEffect(() => {
    if (!flatListRef.current) return
    const index = daysInMonth.findIndex((d) => formatDateConsistent(d) === formatDateConsistent(selectedDay))
    if (index >= 0) {
      flatListRef.current.scrollToIndex({ index, animated: true })
    }
  }, [month, year, selectedDay, daysInMonth])

  // Cargar eventos cuando cambien el mes o año
  useEffect(() => {
    const { start, end } = getMonthRange(year, month)
    fetchEventsForDateRange(start, end)
  }, [year, month, fetchEventsForDateRange])

  // Mostrar error si existe
  useEffect(() => {
    if (error) {
      Alert.alert("Error", error, [{ text: "OK", onPress: clearError }])
    }
  }, [error, clearError])

  // Cargar nombres de cursos cuando cambien los eventos
  useEffect(() => {
    const loadClassNames = async () => {
      const classIds = new Set<string>()
      events.forEach(event => {
        if (event.class_id) {
          classIds.add(event.class_id)
        }
      })
      
      const names: Record<string, string> = {}
      for (const classId of classIds) {
        try {
          const classData = await getClassById(classId)
          if (classData) {
            names[classId] = classData.name
          }
        } catch (error) {
          // Error loading class data
        }
      }
      setClassNames(names)
    }
    
    if (events.length > 0) {
      loadClassNames()
    }
  }, [events, getClassById])

  // Cambiar mes (prev / next)
  const changeMonth = (increment: number) => {
    let newMonth = month + increment
    let newYear = year
    if (newMonth < 0) {
      newMonth = 11
      newYear -= 1
    } else if (newMonth > 11) {
      newMonth = 0
      newYear += 1
    }
    setMonth(newMonth)
    setYear(newYear)
    // Al cambiar mes, seleccionamos primer día del nuevo mes
    setSelectedDay(new Date(newYear, newMonth, 1))
  }

  // Handle event creation
  const handleCreateEvent = async (eventData: CreateCalendarEventRequest) => {
    const result = await createEvent(eventData)
    if (!result) {
      throw new Error("No se pudo crear el evento")
    }
    return result;
  }

  // Handle event update
  const handleUpdateEvent = async (eventId: string, eventData: UpdateCalendarEventRequest) => {
    const result = await updateEvent(eventId, eventData)
    if (!result) {
      throw new Error("No se pudo actualizar el evento")
    }
  }

  // Handle event deletion
  const handleDeleteEvent = async (eventId: string) => {
    const success = await deleteEvent(eventId)
    if (!success) {
      throw new Error("No se pudo eliminar el evento")
    }
  }

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetailsModal(true)
  }

  // Render día en scroll horizontal
  const renderDay = ({ item }: { item: Date }) => {
    const isSelected = formatDateConsistent(item) === formatDateConsistent(selectedDay)
    return (
      <TouchableOpacity
        onPress={() => setSelectedDay(item)}
        style={[
          styles.dayContainer,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
          },
        ]}
      >
        <ThemedText variant="h3" style={{ color: isSelected ? theme.colors.surface : theme.colors.text }}>
          {String(item?.getDate?.() || 1)}
        </ThemedText>
        <ThemedText
          variant="body"
          style={{ color: isSelected ? theme.colors.surface : theme.colors.textMuted, fontSize: 12, marginTop: 2 }}
        >
          {(daysSpanish[item?.getDay?.() || 0] || 'Día').substring(0, 3)}
        </ThemedText>
      </TouchableOpacity>
    )
  }

  // Render evento
  const renderEventItem = useMemo(() => {
    const EventItem = ({ item }: { item: CalendarEvent }) => {
      // Find the event type configuration
      const eventConfig = EVENT_TYPES_CONFIG.find((config) => config.value === item.event_type)

      const iconName: React.ComponentProps<typeof Ionicons>["name"] = (eventConfig?.icon as any) || "calendar-outline"
      let iconColor = theme.colors.primary

      // Set color based on event category
      switch (item.event_category || eventConfig?.category) {
        case "class":
          iconColor = theme.colors.primary
          break
        case "grade_event":
          iconColor = theme.colors.accent
          break
        case "general_event":
          iconColor = theme.colors.secondary
          break
        default:
          iconColor = theme.colors.primary
          break
      }

      // Override specific colors for important events
      if (item.event_type === "parcial" || item.event_type === "examen_final") {
        iconColor = theme.colors.error
      }

      // USAR LA FUNCIÓN SEGURA PARA PARSEAR LA FECHA
      const startDateTime = safeParseDate(item.start_datetime)
       
      // Obtener información adicional de la fecha
      const eventDate = new Date(item.start_datetime)
      const isToday = formatDateConsistent(eventDate) === formatDateConsistent(new Date())
      const isTomorrow = formatDateConsistent(eventDate) === formatDateConsistent(new Date(Date.now() + 24 * 60 * 60 * 1000))

      // Obtener información de zona horaria para este evento
      const timezoneInfo = formatDateWithTimezone(item.start_datetime)
      
      // Verificar si hay discrepancia entre la fecha original y la fecha local
      const originalDate = new Date(item.start_datetime)
      const originalDateString = originalDate.toISOString().split('T')[0]
      const localDateString = formatDateConsistent(eventDate)
      const hasTimezoneDiscrepancy = originalDateString !== localDateString

      return (
        <TouchableOpacity
          style={[styles.eventItem, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          onPress={() => handleEventClick(item)}
          activeOpacity={0.7}
        >
          <Ionicons name={iconName} size={24} color={iconColor} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <ThemedText variant="h3" style={{ color: theme.colors.text }}>
              {item.title || 'Sin título'}
            </ThemedText>
            {item.description ? (
              <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
                {item.description}
              </ThemedText>
            ) : null}
            
            {/* Mostrar curso y salón de manera sutil */}
            {(item.location || item.classroom) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                {item.location && item.classroom ? (
                  <>
                    <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                      📍 {item.location}
                    </ThemedText>
                    <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12, marginLeft: 8 }}>
                      🏫 {item.classroom}
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                    {item.location ? `📍 ${item.location}` : `🏫 ${item.classroom}`}
                  </ThemedText>
                )}
              </View>
            ) : null}
            
            {/* Mostrar información de zona horaria si hay discrepancia */}
            {hasTimezoneDiscrepancy && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <ThemedText variant="body" style={{ color: theme.colors.accent, fontSize: 11 }}>
                      🌍 {timezoneInfo.localTime} ({timezoneInfo.offset})
                </ThemedText>
              </View>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12 }}>
              {formatTimeForDisplay(startDateTime) || '--:--'}
            </ThemedText>
            {(isToday || isTomorrow) && (
              <ThemedText variant="body" style={{ 
                color: isToday ? theme.colors.primary : theme.colors.accent, 
                fontSize: 10, 
                marginTop: 2 
              }}>
                {isToday ? 'Hoy' : 'Mañana'}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      )
    }
    
    EventItem.displayName = 'EventItem'
    return EventItem
  }, [theme.colors, handleEventClick])

  return (
    <>
      <ThemedView variant="background" style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header mes con botones */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
              <Ionicons name="chevron-back-outline" size={28} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <ThemedText variant="h1" style={{ color: theme.colors.primary }}>
                {months[month] || 'Mes'} {year || new Date().getFullYear()}
              </ThemedText>
              <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>
                {getTimezoneInfo().timezone} ({getTimezoneInfo().offsetString})
              </ThemedText>
              <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 1 }}>
                Los eventos se muestran en tu zona horaria local
              </ThemedText>
            </View>
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
            initialScrollIndex={Math.max(0, Math.min(selectedDay.getDate() - 1, daysInMonth.length - 1))}
          />

          {/* Eventos */}
          <ThemedText variant="h2" style={{ marginBottom: 12 }}>
            Eventos del día {formatDateLong(selectedDay) || 'Fecha seleccionada'}
          </ThemedText>

          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20 }}>
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
      <FloatingActionButton onPress={() => setShowCreateModal(true)} icon="add" />

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
          setShowEventDetailsModal(false)
          setSelectedEvent(null)
        }}
        event={selectedEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  eventItem: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
})
