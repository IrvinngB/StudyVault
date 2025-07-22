import { ClassSelector } from '@/components/calendar/ClassSelector';
import { ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { EVENT_TYPES_CONFIG, REMINDER_OPTIONS } from '@/constants/Calendar';
import type { CreateCalendarEventRequest, EventType } from '@/database/models/calendarTypes';
import type { ClassData } from '@/database/services';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEvent: (eventData: CreateCalendarEventRequest) => Promise<void>;
  selectedDate: string; // YYYY-MM-DD format
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  visible,
  onClose,
  onCreateEvent,
  selectedDate,
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [eventType, setEventType] = useState<EventType>('class');
  const [location, setLocation] = useState('');
  const [classroom, setClassroom] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  // Time picker state
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  // Initialize times on mount
  React.useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(9, 0, 0, 0); // 9:00 AM
    const end = new Date(now);
    end.setHours(10, 0, 0, 0); // 10:00 AM
    
    setStartTime(start);
    setEndTime(end);
  }, []);

  // Get current event type config
  const currentEventConfig = EVENT_TYPES_CONFIG.find(config => config.value === eventType);

  // Función para formatear Date a HH:MM
  const formatTimeToHHMM = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Función para formatear Date a string legible
  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    // Reset times to default values
    const now = new Date();
    const start = new Date(now);
    start.setHours(9, 0, 0, 0); // 9:00 AM
    const end = new Date(now);
    end.setHours(10, 0, 0, 0); // 10:00 AM
    setStartTime(start);
    setEndTime(end);
    setEventType('class');
    setLocation('');
    setClassroom('');
    setReminderMinutes(15);
    setIsRecurring(false);
    setSelectedClass(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return;
    }

    // Validar y formatear las horas
    let formattedStartTime: string;
    let formattedEndTime: string;
    
    try {
      formattedStartTime = formatTimeToHHMM(startTime);
      formattedEndTime = formatTimeToHHMM(endTime);
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return;
    }

    if (formattedStartTime >= formattedEndTime) {
      Alert.alert('Error', 'La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    if (currentEventConfig?.requiresClass && !selectedClass) {
      Alert.alert('Error', 'Por favor selecciona una clase para este tipo de evento');
      return;
    }

    setLoading(true);

    try {
      // Crear objetos Date en la zona horaria local
      const startDateTime = new Date(`${selectedDate}T${formattedStartTime}:00`);
      const endDateTime = new Date(`${selectedDate}T${formattedEndTime}:00`);
      
      // Verificar que las fechas sean válidas
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error('Formato de fecha/hora inválido');
      }

      // Convertir a formato ISO pero manteniendo la zona horaria local
      // Esto evita problemas de conversión de zona horaria
      const formatLocalDateTime = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      };

      const startDateTimeString = formatLocalDateTime(startDateTime);
      const endDateTimeString = formatLocalDateTime(endDateTime);

      console.log('DateTime debugging:');
      console.log('Selected date:', selectedDate);
      console.log('Formatted start time:', formattedStartTime);
      console.log('Formatted end time:', formattedEndTime);
      console.log('Start DateTime object:', startDateTime);
      console.log('End DateTime object:', endDateTime);
      console.log('Start DateTime string:', startDateTimeString);
      console.log('End DateTime string:', endDateTimeString);

      // Calculate day of week correctly
      const dayOfWeek = startDateTime.getDay();
      console.log('📅 Day of week calculation:', {
        selectedDate,
        startDateTime: startDateTime.toString(),
        dayOfWeek,
        dayName: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dayOfWeek]
      });

      const eventData: CreateCalendarEventRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        start_datetime: startDateTimeString,
        end_datetime: endDateTimeString,
        event_type: eventType,
        event_category: currentEventConfig?.category || 'general_event',
        class_id: selectedClass?.id || undefined,
        location: currentEventConfig?.supportsClassroom ? undefined : (location.trim() || undefined),
        classroom: currentEventConfig?.supportsClassroom ? (classroom.trim() || undefined) : undefined,
        reminder_minutes: reminderMinutes,
        is_recurring: currentEventConfig?.supportsRecurrence ? isRecurring : false,
        recurrence_pattern: isRecurring ? {
          type: 'weekly',
          interval: 1, // cada 1 semana
          days_of_week: [dayOfWeek], // usar el día calculado correctamente
        } : undefined,
      };

      console.log('🚀 FINAL EVENT DATA BEFORE SEND:', JSON.stringify(eventData, null, 2));

      console.log('Sending event data:', JSON.stringify(eventData, null, 2));

      await onCreateEvent(eventData);
      
      // Cerrar modal automáticamente al completar exitosamente
      setTimeout(() => {
        Alert.alert('Éxito', 'Evento creado correctamente');
        handleClose();
      }, 100);
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      
      // Mejor manejo de errores
      let errorMessage = 'Error al crear el evento';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.detail) {
        errorMessage = Array.isArray(error.detail) 
          ? error.detail.map((d: any) => d.msg).join(', ')
          : error.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <ThemedView style={styles.container}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <ThemedText variant="h2" style={{ color: theme.colors.text }}>
              Nuevo Evento
            </ThemedText>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {loading ? 'Creando...' : 'Crear'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                        backgroundColor: eventType === type.value 
                          ? theme.colors.primary 
                          : theme.colors.surfaceLight,
                        borderColor: theme.colors.border,
                      }
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
                        textAlign: 'center'
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
                  backgroundColor: theme.colors.surfaceLight,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
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
                  backgroundColor: theme.colors.surfaceLight,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
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
                      backgroundColor: theme.colors.surfaceLight,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => setStartTimePickerVisibility(true)}
                >
                  <ThemedText variant="body" style={{ color: theme.colors.text }}>
                    {formatTimeForDisplay(startTime)}
                  </ThemedText>
                  <Ionicons name="time-outline" size={20} color={theme.colors.textMuted} />
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
                      backgroundColor: theme.colors.surfaceLight,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => setEndTimePickerVisibility(true)}
                >
                  <ThemedText variant="body" style={{ color: theme.colors.text }}>
                    {formatTimeForDisplay(endTime)}
                  </ThemedText>
                  <Ionicons name="time-outline" size={20} color={theme.colors.textMuted} />
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
                    backgroundColor: theme.colors.surfaceLight,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
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
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={isRecurring ? theme.colors.surface : theme.colors.textMuted}
                />
              </View>
              {isRecurring && (
                <View style={{ marginTop: 12 }}>
                  <View style={{ padding: 12, backgroundColor: theme.colors.surfaceLight, borderRadius: 8, marginBottom: 12 }}>
                    <ThemedText variant="body" style={{ color: theme.colors.text, fontSize: 13, fontWeight: '500' }}>
                      📅 Repetición automática
                    </ThemedText>
                    <ThemedText variant="body" style={{ color: theme.colors.textMuted, marginTop: 4, fontSize: 12 }}>
                      {eventType === 'class' 
                        ? 'Esta clase se repetirá cada semana el mismo día y hora (ej: todos los jueves de 9:00 a 10:00)'
                        : 'Este evento se repetirá automáticamente según el patrón configurado'}
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
                        backgroundColor: reminderMinutes === option.value 
                          ? theme.colors.primary 
                          : theme.colors.surfaceLight,
                        borderColor: theme.colors.border,
                      }
                    ]}
                    onPress={() => setReminderMinutes(option.value)}
                  >
                    <ThemedText 
                      variant="body" 
                      style={{ 
                        color: reminderMinutes === option.value ? theme.colors.surface : theme.colors.text,
                        fontSize: 12,
                        textAlign: 'center'
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
                    backgroundColor: theme.colors.surfaceLight,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
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
        setStartTime(date);
        setStartTimePickerVisibility(false);
        
        // Auto-adjust end time to be 1 hour after start time
        const newEndTime = new Date(date);
        newEndTime.setHours(newEndTime.getHours() + 1);
        setEndTime(newEndTime);
      }}
      onCancel={() => setStartTimePickerVisibility(false)}
      confirmTextIOS="Confirmar"
      cancelTextIOS="Cancelar"
      is24Hour={true}
    />

    <DateTimePickerModal
      isVisible={isEndTimePickerVisible}
      mode="time"
      onConfirm={(date) => {
        setEndTime(date);
        setEndTimePickerVisibility(false);
      }}
      onCancel={() => setEndTimePickerVisibility(false)}
      confirmTextIOS="Confirmar"
      cancelTextIOS="Cancelar"
      is24Hour={true}
    />
  </>);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  eventTypeButton: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  reminderButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
