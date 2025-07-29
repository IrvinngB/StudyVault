export const EVENT_TYPES_CONFIG = [
  {
    value: "class",
    label: "Clase",
    icon: "school",
    category: "academic",
    requiresClass: true,
    supportsClassroom: true,
    supportsRecurrence: true,
  },
  {
    value: "exam",
    label: "Examen",
    icon: "document-text",
    category: "academic",
    requiresClass: true,
    supportsClassroom: true,
    supportsRecurrence: false,
  },
  {
    value: "assignment",
    label: "Tarea",
    icon: "clipboard",
    category: "academic",
    requiresClass: false,
    supportsClassroom: false,
    supportsRecurrence: false,
  },
  {
    value: "study_session",
    label: "Estudio",
    icon: "book",
    category: "academic",
    requiresClass: false,
    supportsClassroom: false,
    supportsRecurrence: true,
  },
  {
    value: "meeting",
    label: "Reunión",
    icon: "people",
    category: "general_event",
    requiresClass: false,
    supportsClassroom: false,
    supportsRecurrence: false,
  },
  {
    value: "personal",
    label: "Personal",
    icon: "person",
    category: "general_event",
    requiresClass: false,
    supportsClassroom: false,
    supportsRecurrence: false,
  },
] as const

export const REMINDER_OPTIONS = [
  { value: 0, label: "Sin recordatorio" },
  { value: 5, label: "5 minutos" },
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 60, label: "1 hora" },
  { value: 120, label: "2 horas" },
  { value: 1440, label: "1 día" },
] as const

export const RECURRENCE_PATTERNS = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const

export const EVENT_CATEGORIES = {
  ACADEMIC: "academic",
  GENERAL_EVENT: "general_event",
} as const
