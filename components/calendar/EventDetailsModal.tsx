"use client"

import { ClassSelector } from "@/components/calendar/ClassSelector"
import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { EVENT_TYPES_CONFIG } from "@/constants/Calendar"
import type { CalendarEvent, EventType, UpdateCalendarEventRequest } from "@/database/models/calendarTypes"
import type { ClassData as ClassDataWithClassroom } from "@/database/models/types"
import { useClasses } from "@/hooks/useClasses"
import { useTheme } from "@/hooks/useTheme"
import { formatDateForDisplay, formatTimeForDisplay, isValidDate, safeParseDate } from "@/utils/dateHelpers"; // Usar funciones más seguras
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import type React from "react"
import { useEffect, useState } from "react"
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"

interface EventDetailsModalProps {
  visible: boolean
  onClose: () => void
  event: CalendarEvent | null
  onUpdateEvent: (eventId: string, eventData: UpdateCalendarEventRequest) => Promise<void>
  onDeleteEvent: (eventId: string) => Promise<void>
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  visible,
  onClose,
  event,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  const { theme } = useTheme()
  const { getClassById } = useClasses()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [eventType, setEventType] = useState<EventType>("class")
  const [location, setLocation] = useState("")
  const [classroom, setClassroom] = useState("")
  const [reminderMinutes, setReminderMinutes] = useState(15)
  const [isRecurring, setIsRecurring] = useState(false)
  const [selectedClass, setSelectedClass] = useState<ClassDataWithClassroom | null>(null)

  // Get current event type config
  const currentEventConfig = EVENT_TYPES_CONFIG.find((config) => config.value === eventType)

  // Check if this is a recurring instance
  const isRecurringInstance = event?.id.includes("_recurring_") || false
  const originalEventId = isRecurringInstance ? event?.id.split("_recurring_")[0] : event?.id

  // Function to navigate to course details
  const handleNavigateToCourse = () => {
    if (selectedClass?.id) {
      router.push(`/courses/${selectedClass.id}`)
    }
  }

  // Initialize form with event data
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setEventType(event.event_type)
      
      // Determine if this event type supports classroom
      const eventTypeConfig = EVENT_TYPES_CONFIG.find(config => config.value === event.event_type)
      const supportsClassroom = eventTypeConfig?.supportsClassroom || false
      
      if (supportsClassroom) {
        setClassroom(event.location || "")
        setLocation("")
      } else {
        setLocation(event.location || "")
        setClassroom("")
      }
      
      setReminderMinutes(event.reminder_minutes)
      setIsRecurring(event.is_recurring)

      // USAR LAS FUNCIONES SEGURAS PARA PARSEAR LAS FECHAS
      const startDate = safeParseDate(event.start_datetime)
      const endDate = safeParseDate(event.end_datetime)

      const formatTime = (date: Date) => {
        if (!isValidDate(date)) {
          console.error("❌ Invalid date in formatTime:", date)
          return "09:00"
        }
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
      }

      setStartTime(formatTime(startDate))
      setEndTime(formatTime(endDate))

      // Load class data if class_id exists
      if (event.class_id) {
        const loadClassData = async () => {
          try {
            const classData = await getClassById(event.class_id!)
            if (classData && classData.id) {
              // Convertir el tipo de ClassData (services) a ClassDataWithClassroom (types)
              const classWithClassroom: ClassDataWithClassroom = {
                id: classData.id,
                name: classData.name,
                code: classData.code,
                description: classData.description,
                instructor: classData.instructor,
                professor: classData.instructor, // Mapear instructor a professor
                schedule: undefined, // No disponible en el tipo de services
                classroom: undefined, // Asignar undefined por defecto
                color: classData.color,
                credits: classData.credits,
                semester: classData.semester,
                syllabus_url: classData.syllabus_url,
                is_active: classData.is_active,
                user_id: classData.user_id || '',
                created_at: classData.created_at || '',
                updated_at: classData.updated_at || ''
              }
              
              setSelectedClass(classWithClassroom)
              // Si no hay classroom definido en el evento y la clase tiene uno, usar el de la clase
              if (!event.classroom && classWithClassroom.classroom) {
                setClassroom(classWithClassroom.classroom)
              }
            }
          } catch (error) {
            console.error("Error loading class data:", error)
            setSelectedClass(null)
          }
        }
        loadClassData()
      } else {
        setSelectedClass(null)
      }
    }
  }, [event, getClassById])

  // Función para formatear y validar la hora
  const formatTimeToHHMM = (timeString: string): string => {
    // Remover cualquier texto extra como "Ej: "
    const cleanTime = timeString.replace(/^(Ej:\s*|ej:\s*)/i, "").trim()

    // Detectar formato 12 horas (con AM/PM)
    const time12Regex = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i
    const time24Regex = /^(\d{1,2}):(\d{2})$/

    let hours: number
    let minutes: number

    const match12 = cleanTime.match(time12Regex)
    const match24 = cleanTime.match(time24Regex)

    if (match12) {
      // Formato 12 horas
      hours = Number.parseInt(match12[1], 10)
      minutes = Number.parseInt(match12[2], 10)
      const period = match12[3].toUpperCase()

      // Validar rangos para formato 12 horas
      if (hours < 1 || hours > 12) {
        throw new Error("En formato 12 horas, las horas deben estar entre 1 y 12")
      }

      // Convertir a formato 24 horas
      if (period === "AM") {
        if (hours === 12) hours = 0 // 12:00 AM = 00:00
      } else {
        // PM
        if (hours !== 12) hours += 12 // 1:00 PM = 13:00, pero 12:00 PM = 12:00
      }
    } else if (match24) {
      // Formato 24 horas
      hours = Number.parseInt(match24[1], 10)
      minutes = Number.parseInt(match24[2], 10)

      // Validar rangos para formato 24 horas
      if (hours < 0 || hours > 23) {
        throw new Error("En formato 24 horas, las horas deben estar entre 00 y 23")
      }
    } else {
      throw new Error("Formato de hora inválido. Use HH:MM (24h) o HH:MM AM/PM (12h)")
    }

    // Validar minutos
    if (minutes < 0 || minutes > 59) {
      throw new Error("Los minutos deben estar entre 00 y 59")
    }

    // Formatear a HH:MM en formato 24 horas
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const handleClose = () => {
    setIsEditing(false)
    onClose()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    // Reset form to original event data
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setEventType(event.event_type)
      setLocation(event.location || "")
      setClassroom(event.classroom || "")
      setReminderMinutes(event.reminder_minutes)
      setIsRecurring(event.is_recurring)

      // USAR LAS FUNCIONES SEGURAS PARA PARSEAR LAS FECHAS
      const startDate = safeParseDate(event.start_datetime)
      const endDate = safeParseDate(event.end_datetime)

      const formatTime = (date: Date) => {
        if (!isValidDate(date)) {
          console.error("❌ Invalid date in formatTime:", date)
          return "09:00"
        }
        return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
      }

      setStartTime(formatTime(startDate))
      setEndTime(formatTime(endDate))
    }
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!event) return

    if (!title.trim()) {
      Alert.alert("Error", "El título es requerido")
      return
    }

    // Validar y formatear las horas
    let formattedStartTime: string
    let formattedEndTime: string

    try {
      formattedStartTime = formatTimeToHHMM(startTime)
      formattedEndTime = formatTimeToHHMM(endTime)
    } catch (error: any) {
      Alert.alert("Error", error.message)
      return
    }

    if (formattedStartTime >= formattedEndTime) {
      Alert.alert("Error", "La hora de inicio debe ser anterior a la hora de fin")
      return
    }

    if (currentEventConfig?.requiresClass && !selectedClass) {
      Alert.alert("Error", "Por favor selecciona una clase para este tipo de evento")
      return
    }

    // Función interna para realizar la actualización
    const performUpdate = async (eventIdToUpdate: string) => {
      setLoading(true)
      try {
        // Get original date from event (usar función segura)
        const originalDateTime = safeParseDate(event.start_datetime)

        if (!isValidDate(originalDateTime)) {
          throw new Error("Fecha del evento inválida")
        }

        const originalDate = originalDateTime.toISOString().split("T")[0]

        // Create new datetime strings
        const startDateTime = new Date(`${originalDate}T${formattedStartTime}:00`)
        const endDateTime = new Date(`${originalDate}T${formattedEndTime}:00`)

        if (!isValidDate(startDateTime) || !isValidDate(endDateTime)) {
          throw new Error("Fechas calculadas inválidas")
        }

        const formatLocalDateTime = (date: Date): string => {
          const year = date.getFullYear()
          const month = (date.getMonth() + 1).toString().padStart(2, "0")
          const day = date.getDate().toString().padStart(2, "0")
          const hours = date.getHours().toString().padStart(2, "0")
          const minutes = date.getMinutes().toString().padStart(2, "0")
          const seconds = date.getSeconds().toString().padStart(2, "0")
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
        }

        const startDateTimeString = formatLocalDateTime(startDateTime)
        const endDateTimeString = formatLocalDateTime(endDateTime)

        const updateData: UpdateCalendarEventRequest = {
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
                days_of_week: [originalDateTime.getDay()], // Usar la fecha parseada correctamente
              }
            : undefined,
        }

        await onUpdateEvent(eventIdToUpdate, updateData)
        setIsEditing(false)
        Alert.alert("Éxito", "Evento actualizado correctamente")
      } catch (error: any) {
        console.error("Error updating calendar event:", error)

        let errorMessage = "Error al actualizar el evento"

        if (error.message) {
          errorMessage = error.message
        } else if (error.detail) {
          errorMessage = Array.isArray(error.detail) ? error.detail.map((d: any) => d.msg).join(", ") : error.detail
        }

        Alert.alert("Error", errorMessage)
      } finally {
        setLoading(false)
      }
    }

    // Decidir cómo manejar la edición basado en si es una instancia recurrente
    if (isRecurringInstance) {
      // Para instancias recurrentes, preguntar qué hacer
      Alert.alert("Editar Evento Recurrente", "Este es un evento recurrente. ¿Qué deseas hacer?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Solo esta instancia",
          onPress: () => {
            Alert.alert(
              "Información",
              "Las instancias recurrentes no se pueden editar individualmente. Los cambios se aplicarán a toda la serie.",
              [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "Continuar",
                  onPress: () => performUpdate(originalEventId!),
                },
              ],
            )
          },
        },
        {
          text: "Toda la serie",
          onPress: () => performUpdate(originalEventId!),
        },
      ])
    } else {
      // Para eventos regulares o el evento base de una serie
      if (event.is_recurring) {
        Alert.alert(
          "Editar Evento Recurrente",
          "Este cambio se aplicará a todas las instancias del evento recurrente.",
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Continuar",
              onPress: () => performUpdate(event.id),
            },
          ],
        )
      } else {
        performUpdate(event.id)
      }
    }
  }

  const handleDelete = () => {
    if (!event) return

    if (isRecurringInstance) {
      // Para instancias recurrentes, mostrar opciones
      Alert.alert("Eliminar Evento Recurrente", "Este es un evento recurrente. ¿Qué deseas hacer?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Solo esta instancia",
          onPress: () => {
            Alert.alert(
              "Información",
              "Las instancias recurrentes no se pueden eliminar individualmente. Puedes eliminar todo el evento recurrente si lo deseas.",
              [{ text: "OK" }],
            )
          },
        },
        {
          text: "Toda la serie",
          style: "destructive",
          onPress: async () => {
            setLoading(true)
            try {
              await onDeleteEvent(originalEventId!)
              Alert.alert("Éxito", "Serie de eventos eliminada correctamente")
              handleClose()
            } catch (error: any) {
              console.error("Error deleting calendar event:", error)
              Alert.alert("Error", "No se pudo eliminar el evento")
            } finally {
              setLoading(false)
            }
          },
        },
      ])
    } else {
      // Para eventos regulares
      const deleteMessage = event.is_recurring
        ? "¿Estás seguro de que quieres eliminar este evento recurrente? Se eliminarán todas las instancias."
        : "¿Estás seguro de que quieres eliminar este evento?"

      Alert.alert("Eliminar Evento", deleteMessage, [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoading(true)
            try {
              await onDeleteEvent(event.id)
              Alert.alert("Éxito", "Evento eliminado correctamente")
              handleClose()
            } catch (error: any) {
              console.error("Error deleting calendar event:", error)
              Alert.alert("Error", "No se pudo eliminar el evento")
            } finally {
              setLoading(false)
            }
          },
        },
      ])
    }
  }

  if (!event) return null

  const eventConfig = EVENT_TYPES_CONFIG.find((config) => config.value === event.event_type)

  // USAR LAS FUNCIONES SEGURAS PARA MOSTRAR LAS FECHAS CORRECTAMENTE
  const startDateTime = safeParseDate(event.start_datetime)
  const endDateTime = safeParseDate(event.end_datetime)

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <ThemedView variant="background" style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <ThemedText variant="h2" style={{ color: theme.colors.text }}>
            {isEditing ? "Editar Evento" : "Detalles del Evento"}
          </ThemedText>

          {isEditing ? (
            <TouchableOpacity
              onPress={handleSaveEdit}
              style={[styles.headerButton, { opacity: loading ? 0.5 : 1 }]}
              disabled={loading}
            >
              <ThemedText variant="h3" style={{ color: theme.colors.primary }}>
                {loading ? "Guardando..." : "Guardar"}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <ThemedText variant="h3" style={{ color: theme.colors.primary }}>
                Editar
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recurring Instance Banner */}
          {isRecurringInstance && (
            <View
              style={[
                styles.recurringBanner,
                { backgroundColor: theme.colors.primary + "20", borderColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="repeat-outline" size={16} color={theme.colors.primary} />
              <ThemedText
                variant="body"
                style={{ color: theme.colors.primary, marginLeft: 8, fontSize: 12, fontWeight: "600" }}
              >
                Esta es una instancia de un evento recurrente
              </ThemedText>
            </View>
          )}

          {/* Event Type and Icon */}
          <View style={styles.eventHeader}>
            <View style={styles.eventIconContainer}>
              <Ionicons
                name={(eventConfig?.icon as any) || "calendar-outline"}
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <ThemedText variant="body" style={{ color: theme.colors.textMuted, fontSize: 14 }}>
                {eventConfig?.label || "Evento"}
              </ThemedText>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.titleInput,
                    {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Título del evento"
                  placeholderTextColor={theme.colors.textMuted}
                  maxLength={100}
                />
              ) : (
                <ThemedText variant="h2" style={{ color: theme.colors.text, marginTop: 4 }}>
                  {event.title}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
              <ThemedText variant="body" style={{ color: theme.colors.text, marginLeft: 12 }}>
                {formatDateForDisplay(startDateTime)}
              </ThemedText>
            </View>

            {isEditing ? (
              <View style={styles.timeContainer}>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ color: theme.colors.textMuted, marginBottom: 8 }}>
                    Inicio
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
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="09:00"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <View style={{ width: 16 }} />

                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ color: theme.colors.textMuted, marginBottom: 8 }}>
                    Fin
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
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="10:00"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={theme.colors.textMuted} />
                <ThemedText variant="body" style={{ color: theme.colors.text, marginLeft: 12 }}>
                  {formatTimeForDisplay(startDateTime)} - {formatTimeForDisplay(endDateTime)}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Classroom/Room Information - Solo mostrar cuando hay classroom y no está en edición */}
          {/* Classroom/Location Information - Solo mostrar cuando hay ubicación y no está en edición */}
          {event.location && !isEditing && (() => {
            const eventTypeConfig = EVENT_TYPES_CONFIG.find(config => config.value === event.event_type)
            const supportsClassroom = eventTypeConfig?.supportsClassroom || false
            
            return (
              <View style={styles.section}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color={theme.colors.textMuted} />
                  <ThemedText variant="body" style={{ color: theme.colors.text, marginLeft: 12 }}>
                    {supportsClassroom ? `Salón: ${event.location}` : `Ubicación: ${event.location}`}
                  </ThemedText>
                </View>
              </View>
            )
          })()}

          {/* Course Information - Solo mostrar cuando hay clase seleccionada y no está en edición */}
          {selectedClass && !isEditing && (
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.courseButton}
                onPress={handleNavigateToCourse}
                activeOpacity={0.7}
              >
                <View style={styles.infoRow}>
                  <Ionicons name="school-outline" size={20} color={theme.colors.textMuted} />
                  <ThemedText variant="body" style={{ color: theme.colors.primary, marginLeft: 12, textDecorationLine: 'underline' }}>
                    Curso: {selectedClass.name}
                  </ThemedText>
                  <Ionicons name="chevron-forward-outline" size={16} color={theme.colors.primary} style={{ marginLeft: 8 }} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Class Selector - Solo en modo edición y para eventos que requieren clase */}
          {isEditing && currentEventConfig?.requiresClass && (
            <View style={styles.section}>
              <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Clase *
              </ThemedText>
              <ClassSelector
                selectedClassId={selectedClass?.id}
                onSelectClass={(classData) => {
                  if (classData) {
                    // Convertir el tipo de ClassData (services) a ClassDataWithClassroom (types)
                    const classWithClassroom: ClassDataWithClassroom = {
                      id: classData.id || '',
                      name: classData.name,
                      code: classData.code,
                      description: classData.description,
                      instructor: classData.instructor,
                      professor: classData.instructor, // Mapear instructor a professor
                      schedule: undefined, // No disponible en el tipo de services
                      classroom: undefined, // Asignar undefined por defecto
                      color: classData.color,
                      credits: classData.credits,
                      semester: classData.semester,
                      syllabus_url: classData.syllabus_url,
                      is_active: classData.is_active,
                      user_id: classData.user_id || '',
                      created_at: classData.created_at || '',
                      updated_at: classData.updated_at || ''
                    }
                    setSelectedClass(classWithClassroom)
                  } else {
                    setSelectedClass(null)
                  }
                }}
                placeholder="Seleccionar clase"
                required={true}
              />
            </View>
          )}

          {/* Location/Classroom - Solo en modo edición */}
          {isEditing && (
            <View style={styles.section}>
              {currentEventConfig?.supportsClassroom ? (
                <View>
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
              ) : (
                <View>
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
                    placeholder="Ubicación del evento"
                    placeholderTextColor={theme.colors.textMuted}
                    maxLength={200}
                  />
                </View>
              )}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            {isEditing ? (
              <View>
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
            ) : (
              event.description && (
                <View>
                  <ThemedText variant="h3" style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Descripción
                  </ThemedText>
                  <ThemedText variant="body" style={{ color: theme.colors.text, lineHeight: 20 }}>
                    {event.description}
                  </ThemedText>
                </View>
              )
            )}
          </View>

          {/* Recurring Info */}
          {event.is_recurring && (
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="repeat-outline" size={20} color={theme.colors.textMuted} />
                <ThemedText variant="body" style={{ color: theme.colors.text, marginLeft: 12 }}>
                  Evento recurrente (semanal)
                </ThemedText>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {isEditing ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={handleCancelEdit}
              >
                <ThemedText variant="body" style={{ color: theme.colors.text }}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                onPress={handleDelete}
                disabled={loading}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.surface} />
                <ThemedText variant="body" style={{ color: theme.colors.surface, marginLeft: 8 }}>
                  Eliminar
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </Modal>
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
  recurringBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 16,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  courseButton: {
    borderRadius: 8,
    padding: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 12,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: "center",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    justifyContent: "center",
  },
})
