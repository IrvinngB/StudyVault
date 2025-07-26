"use client"

import { ClassSelector } from "@/components/calendar/ClassSelector"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { EVENT_TYPES_CONFIG, REMINDER_OPTIONS } from "@/constants/Calendar"
import type { CreateCalendarEventRequest, EventType } from "@/database/models/calendarTypes"
import type { ClassData } from "@/database/services"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { scheduleCalendarNotification } from "@/utils/notifications"
import { convertLocalToUTC, formatTimeWithPreferences, getTimezoneInfo } from "@/utils/timezoneHelpers"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"

interface CreateEventModalProps {
  visible: boolean
  onClose: () => void
  onCreateEvent: (eventData: CreateCalendarEventRequest) => Promise<void>
  selectedDate: string // YYYY-MM-DD format
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onCreateEvent,
  selectedDate,
}) => {
  const { theme } = useTheme()
  const { user } = useAuth();
  const [loading, setLoading] = useState(false)
  const [use24HourFormat, setUse24HourFormat] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const [eventType, setEventType] = useState<EventType>("class")
  const [location, setLocation] = useState("")
  const [classroom, setClassroom] = useState("")
  const [reminderMinutes, setReminderMinutes] = useState(15)
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)

  // Time picker state
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false)
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false)

  // Initialize times on mount and load user preferences
  React.useEffect(() => {
    const initializeSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("app_settings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setUse24HourFormat(settings.use24HourFormat || false)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }

      const now = new Date()
      const start = new Date(now)
      start.setHours(9, 0, 0, 0) // 9:00 AM
      const end = new Date(now)
      end.setHours(10, 0, 0, 0) // 10:00 AM

      setStartTime(start)
      setEndTime(end)
    }

    initializeSettings()
  }, [])

  // Get current event type config
  const currentEventConfig = EVENT_TYPES_CONFIG.find((config) => config.value === eventType)

  // Función para formatear Date a string legible usando preferencias del usuario
  const formatTimeForDisplay = (date: Date): string => {
    return formatTimeWithPreferences(date, use24HourFormat)
  }

  // NUEVA FUNCIÓN: Convierte la fecha y hora local a UTC para la base de datos
  const formatLocalDateTimeForDB = (dateString: string, timeDate: Date): string => {
    try {
      // Crear una fecha combinando la fecha seleccionada con la hora elegida
      const [year, month, day] = dateString.split("-").map(Number)

      // Crear fecha local con la hora seleccionada
      const localDateTime = new Date(
        year,
        month - 1,
        day,
        timeDate.getHours(),
        timeDate.getMinutes(),
        timeDate.getSeconds(),
      )

      // Convertir a UTC usando la función de utilidad
      const utcString = convertLocalToUTC(localDateTime)

      console.log("🕐 Time Conversion Debug:")
      console.log("Selected date:", dateString)
      console.log("Selected time:", timeDate.toLocaleTimeString())
      console.log("Combined local datetime:", localDateTime.toLocaleString())
      console.log("Converted to UTC:", utcString)
      console.log("Timezone info:", getTimezoneInfo())

      return utcString
    } catch (error) {
      console.error("Error converting local time to UTC:", error)
      // Fallback: usar la fecha original
      return new Date().toISOString()
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    // Reset times to default values
    const now = new Date()
    const start = new Date(now)
    start.setHours(9, 0, 0, 0) // 9:00 AM
    const end = new Date(now)
    end.setHours(10, 0, 0, 0) // 10:00 AM
    setStartTime(start)
    setEndTime(end)
    setEventType("class")
    setLocation("")
    setClassroom("")
    setReminderMinutes(15)
    setIsRecurring(false)
    setSelectedClass(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "El título es requerido")
      return
    }

    // Validar horarios
    if (startTime >= endTime) {
      Alert.alert("Error", "La hora de inicio debe ser anterior a la hora de fin")
      return
    }

    if (currentEventConfig?.requiresClass && !selectedClass) {
      Alert.alert("Error", "Por favor selecciona una clase para este tipo de evento")
      return
    }

    setLoading(true)
    try {
      // CAMBIO PRINCIPAL: Usar la nueva función que convierte correctamente a UTC
      const startDateTimeString = formatLocalDateTimeForDB(selectedDate, startTime)
      const endDateTimeString = formatLocalDateTimeForDB(selectedDate, endTime)

      // Calculate day of week from the selected date
      const [year, month, day] = selectedDate.split("-").map(Number)
      const dateForDayCalc = new Date(year, month - 1, day)
      const dayOfWeek = dateForDayCalc.getDay()

      console.log("📅 Final DateTime debugging:")
      console.log("Selected date:", selectedDate)
      console.log("Start time object:", startTime.toString())
      console.log("End time object:", endTime.toString())
      console.log("Start DateTime (UTC for DB):", startDateTimeString)
      console.log("End DateTime (UTC for DB):", endDateTimeString)
      console.log("Day of week:", dayOfWeek)

      const eventData: CreateCalendarEventRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        start_datetime: startDateTimeString,
        end_datetime: endDateTimeString,
        event_type: eventType,
        event_category: currentEventConfig?.category || "general_event",
        class_id: selectedClass?.id || undefined,
        location: currentEventConfig?.supportsClassroom 
          ? (classroom.trim() || undefined) // Para eventos con aula, guardar el classroom en location
          : (location.trim() || undefined), // Para otros eventos, usar location normal
        reminder_minutes: reminderMinutes,
        is_recurring: currentEventConfig?.supportsRecurrence ? isRecurring : false,
        recurrence_pattern: isRecurring
          ? {
              type: "weekly",
              interval: 1,
              days_of_week: [dayOfWeek],
            }
          : undefined,
      }

      console.log("🚀 FINAL EVENT DATA:", JSON.stringify(eventData, null, 2))

      await onCreateEvent(eventData)

      // Programar notificación si el campo de recordatorio tiene un valor válido Y NO es un evento tipo clase
      if (reminderMinutes > 0 && eventType !== "class") {
        // Crear la fecha local para la notificación (NO UTC)
        const [year, month, day] = selectedDate.split("-").map(Number)
        const localEventDateTime = new Date(
          year,
          month - 1,
          day,
          startTime.getHours(),
          startTime.getMinutes(),
          startTime.getSeconds()
        )

        // Verificar que el evento esté en el futuro
        const now = new Date()
        if (localEventDateTime <= now) {
          console.warn("⚠️ Evento programado en el pasado, no se creará notificación")
        } else {
          const notificationData = {
            userId: user?.id || "unknown-user",
            title,
            body: description || "Evento programado",
            date: localEventDateTime, // Usar fecha local en lugar de UTC
            minutosAntes: reminderMinutes,
            type: "calendar",
          };

          console.log("📅 Datos de notificación:", {
            fechaSeleccionada: selectedDate,
            horaInicio: startTime.toLocaleTimeString(),
            eventoLocal: localEventDateTime.toLocaleString(),
            minutosAntes: reminderMinutes,
            horaNotificacion: new Date(localEventDateTime.getTime() - reminderMinutes * 60000).toLocaleString(),
            ahora: now.toLocaleString()
          });

          try {
            await scheduleCalendarNotification(notificationData);
            console.log("✅ Notificación programada exitosamente");
          } catch (error) {
            console.error("❌ Error al programar la notificación:", error);
            // No mostrar alerta al usuario cuando falla la notificación,
            // ya que el evento se creó correctamente
            console.log("⚠️ No se pudo crear la notificación, pero el evento se creó correctamente");
          }
        }
      } else if (eventType === "class") {
        console.log("📚 No se programó notificación porque es un evento tipo clase.");
      } else if (reminderMinutes <= 0) {
        console.log("⏰ No se programó notificación porque el campo de recordatorio está vacío o es 0.");
      }

      // Cerrar modal automáticamente al completar exitosamente
      setTimeout(() => {
        Alert.alert("Éxito", "Evento creado correctamente")
        handleClose()
      }, 100)
    } catch (error: any) {
      console.error("Error creating calendar event:", error)

      // Mejor manejo de errores
      let errorMessage = "Error al crear el evento"

      if (error.message) {
        errorMessage = error.message
      } else if (error.detail) {
        errorMessage = Array.isArray(error.detail) ? error.detail.map((d: any) => d.msg).join(", ") : error.detail
      } else if (typeof error === "string") {
        errorMessage = error
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
        <ThemedView variant="background" style={styles.container}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol name="xmark" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <ThemedText variant="h2" style={{ color: theme.colors.text }}>
              Nuevo Evento
            </ThemedText>
            <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
              <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                {loading ? "Creando..." : "Crear"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Timezone Info Banner */}
            <View
              style={{
                backgroundColor: theme.colors.info + "10",
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.info,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Ionicons name="time" size={16} color={theme.colors.info} />
                <ThemedText variant="bodySmall" style={{ marginLeft: 8, fontWeight: "600" }}>
                  Zona Horaria: {getTimezoneInfo().timezone}
                </ThemedText>
              </View>
              <ThemedText variant="caption" color="secondary">
                Las horas se convertirán automáticamente para almacenamiento correcto
              </ThemedText>
            </View>

            {/* Event Type Selection */}
            <View style={styles.section}>
              <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Tipo de Evento
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.eventTypeContainer}>
                  {EVENT_TYPES_CONFIG.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.eventTypeButton,
                        {
                          backgroundColor: eventType === type.value ? theme.colors.primary : theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      onPress={() => setEventType(type.value as any)}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={20}
                        color={eventType === type.value ? theme.colors.surface : theme.colors.text}
                      />
                      <ThemedText
                        variant="body"
                        style={{
                          color: eventType === type.value ? theme.colors.surface : theme.colors.text,
                          marginTop: 4,
                          fontSize: 10,
                          textAlign: "center",
                        }}
                      >
                        {type.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Title */}
            <View style={styles.section}>
              <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Título *
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Nombre del evento"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Descripción
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción del evento (opcional)"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            {/* Time */}
            <View style={styles.section}>
              <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Horario
              </ThemedText>
              <View style={styles.timeContainer}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ color: theme.colors.textMuted, marginBottom: 8 }}>
                    Inicio
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.timeSelector,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setStartTimePickerVisibility(true)}
                  >
                    <ThemedText variant="body" style={{ color: theme.colors.text }}>
                      {formatTimeForDisplay(startTime)}
                    </ThemedText>
                    <IconSymbol name="clock" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={{ width: 16 }} />

                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ color: theme.colors.textMuted, marginBottom: 8 }}>
                    Fin
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.timeSelector,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => setEndTimePickerVisibility(true)}
                  >
                    <ThemedText variant="body" style={{ color: theme.colors.text }}>
                      {formatTimeForDisplay(endTime)}
                    </ThemedText>
                    <IconSymbol name="clock" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Class Selection - Solo para eventos que requieren clase */}
            {currentEventConfig?.requiresClass && (
              <View style={styles.section}>
                <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Clase *
                </ThemedText>
                <ClassSelector
                  selectedClassId={selectedClass?.id}
                  onSelectClass={setSelectedClass}
                  placeholder="Seleccionar clase"
                  required={true}
                />
              </View>
            )}

            {/* Classroom - Solo para eventos que soportan aula */}
            {currentEventConfig?.supportsClassroom && (
              <View style={styles.section}>
                <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Aula/Salón
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={classroom}
                  onChangeText={setClassroom}
                  placeholder="Número de aula o salón"
                  placeholderTextColor={theme.colors.textMuted}
                  maxLength={50}
                />
              </View>
            )}

            {/* Recurring - Solo para eventos que soportan recurrencia */}
            {currentEventConfig?.supportsRecurrence && (
              <View style={styles.section}>
                <View style={styles.switchContainer}>
                  <ThemedText variant="h3" style={{ color: theme.colors.text }}>
                    Evento recurrente
                  </ThemedText>
                  <Switch
                    value={isRecurring}
                    onValueChange={setIsRecurring}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                    thumbColor={isRecurring ? theme.colors.primary : theme.colors.textMuted}
                  />
                </View>
                {isRecurring && (
                  <View style={{ marginTop: 12 }}>
                    <View
                      style={{
                        padding: 12,
                        backgroundColor: theme.colors.surface,
                        borderRadius: 8,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <IconSymbol name="calendar.circle" size={16} color={theme.colors.primary} />
                        <ThemedText
                          variant="body"
                          style={{ color: theme.colors.text, fontSize: 13, fontWeight: "500", marginLeft: 8 }}
                        >
                          Repetición automática
                        </ThemedText>
                      </View>
                      <ThemedText variant="body" style={{ color: theme.colors.textMuted, marginTop: 4, fontSize: 12 }}>
                        {eventType === "class"
                          ? "Esta clase se repetirá cada semana el mismo día y hora"
                          : "Este evento se repetirá automáticamente según el patrón configurado"}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Reminder */}
            <View style={styles.section}>
              <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Recordatorio
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.reminderContainer}>
                  {REMINDER_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.reminderButton,
                        {
                          backgroundColor:
                            reminderMinutes === option.value ? theme.colors.primary : theme.colors.surface,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      onPress={() => setReminderMinutes(option.value)}
                    >
                      <ThemedText
                        variant="body"
                        style={{
                          color: reminderMinutes === option.value ? theme.colors.surface : theme.colors.text,
                          fontSize: 12,
                          textAlign: "center",
                        }}
                      >
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Location - Solo para eventos que NO soportan aula */}
            {!currentEventConfig?.supportsClassroom && (
              <View style={styles.section}>
                <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Ubicación
                </ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Ubicación del evento (opcional)"
                  placeholderTextColor={theme.colors.textMuted}
                  maxLength={200}
                />
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Time Pickers */}
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={(date) => {
          setStartTime(date)
          setStartTimePickerVisibility(false)

          // Auto-adjust end time to be 1 hour after start time
          const newEndTime = new Date(date)
          newEndTime.setHours(newEndTime.getHours() + 1)
          setEndTime(newEndTime)
        }}
        onCancel={() => setStartTimePickerVisibility(false)}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        is24Hour={use24HourFormat}
      />
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={(date) => {
          setEndTime(date)
          setEndTimePickerVisibility(false)
        }}
        onCancel={() => setEndTimePickerVisibility(false)}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
        is24Hour={use24HourFormat}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
    minWidth: 80,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  timeSelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  eventTypeContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  eventTypeButton: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  reminderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
})
