/**
 * Configuración de tipos de eventos del calendario
 */

// Opciones de recordatorio predefinidas
export interface ReminderOption {
  label: string
  value: number // minutos antes del evento
}

export const REMINDER_OPTIONS: ReminderOption[] = [
  { label: 'Sin recordatorio', value: 0 },
  { label: '5 minutos antes', value: 5 },
  { label: '15 minutos antes', value: 15 },
  { label: '30 minutos antes', value: 30 },
  { label: '1 hora antes', value: 60 },
  { label: '2 horas antes', value: 120 },
  { label: '1 día antes', value: 1440 },
  { label: '2 días antes', value: 2880 },
  { label: '1 semana antes', value: 10080 }
]

// Configuración de tipos de eventos
export interface EventTypeConfig {
  value: string
  label: string
  icon: string
  category: 'class' | 'grade_event' | 'general_event'
  color: string
  requiresClass: boolean // Si requiere estar asociado a una clase
  supportsRecurrence: boolean // Si puede ser recurrente
  supportsClassroom: boolean // Si usa campo classroom en lugar de location
}

export const EVENT_TYPES_CONFIG: EventTypeConfig[] = [
  // Clases de cursos
  {
    value: 'class',
    label: 'Clase',
    icon: 'school-outline',
    category: 'class',
    color: 'primary',
    requiresClass: true,
    supportsRecurrence: true,
    supportsClassroom: true
  },
  
  // Eventos con calificaciones
  {
    value: 'tarea',
    label: 'Tarea',
    icon: 'document-text-outline',
    category: 'grade_event',
    color: 'accent',
    requiresClass: true,
    supportsRecurrence: false,
    supportsClassroom: false
  },
  {
    value: 'laboratorio',
    label: 'Laboratorio',
    icon: 'flask-outline',
    category: 'grade_event',
    color: 'accent',
    requiresClass: true,
    supportsRecurrence: false,
    supportsClassroom: true
  },
  {
    value: 'quiz',
    label: 'Quiz',
    icon: 'help-circle-outline',
    category: 'grade_event',
    color: 'warning',
    requiresClass: true,
    supportsRecurrence: false,
    supportsClassroom: false
  },
  {
    value: 'parcial',
    label: 'Parcial',
    icon: 'clipboard-outline',
    category: 'grade_event',
    color: 'error',
    requiresClass: true,
    supportsRecurrence: false,
    supportsClassroom: true
  },
  {
    value: 'proyecto',
    label: 'Proyecto',
    icon: 'construct-outline',
    category: 'grade_event',
    color: 'secondary',
    requiresClass: true,
    supportsRecurrence: false,
    supportsClassroom: false
  },
  {
    value: 'examen_final',
    label: 'Examen Final',
    icon: 'medal-outline',
    category: 'grade_event',
    color: 'error',
    requiresClass: true,
    supportsRecurrence: false,
    supportsClassroom: true
  },
  
  // Eventos generales (al final)
  {
    value: 'recordatorio',
    label: 'Otros',
    icon: 'ellipsis-horizontal-outline',
    category: 'general_event',
    color: 'warning',
    requiresClass: false,
    supportsRecurrence: true,
    supportsClassroom: false
  }
]

// Helper functions
export const getEventTypeConfig = (eventType: string): EventTypeConfig | undefined => {
  return EVENT_TYPES_CONFIG.find(config => config.value === eventType)
}

export const getEventTypesByCategory = (category: 'class' | 'grade_event' | 'general_event'): EventTypeConfig[] => {
  return EVENT_TYPES_CONFIG.filter(config => config.category === category)
}

export const getReminderOption = (minutes: number): ReminderOption | undefined => {
  return REMINDER_OPTIONS.find(option => option.value === minutes)
}
