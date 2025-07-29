/**
 * Utilidades para mapear tipos de eventos de calendario a categorías de calificaciones
 */

export interface CategoryMapping {
  name: string
  percentage: number
  description?: string
}

/**
 * Mapeo de tipos de eventos a categorías de calificaciones
 */
export const EVENT_TYPE_CATEGORY_MAPPING: Record<string, CategoryMapping> = {
  // Eventos de evaluación con calificación
  'tarea': {
    name: 'Tareas',
    percentage: 20,
    description: 'Asignaciones y trabajos para entregar'
  },
  'laboratorio': {
    name: 'Laboratorios',
    percentage: 15,
    description: 'Prácticas de laboratorio y ejercicios'
  },
  'quiz': {
    name: 'Quizzes',
    percentage: 15,
    description: 'Evaluaciones cortas y cuestionarios'
  },
  'parcial': {
    name: 'Exámenes Parciales',
    percentage: 25,
    description: 'Exámenes parciales del curso'
  },
  'proyecto': {
    name: 'Proyectos',
    percentage: 20,
    description: 'Proyectos finales y trabajos de investigación'
  },
  'examen_final': {
    name: 'Examen Final',
    percentage: 25,
    description: 'Examen final del curso'
  },
  'practica': {
    name: 'Prácticas',
    percentage: 15,
    description: 'Ejercicios prácticos y talleres'
  },
  'investigacion': {
    name: 'Investigación',
    percentage: 25,
    description: 'Trabajos de investigación y análisis'
  },
  'charla': {
    name: 'Charlas',
    percentage: 10,
    description: 'Presentaciones y exposiciones orales'
  },
  // Fallback para eventos sin mapeo específico
  'general': {
    name: 'General',
    percentage: 5,
    description: 'Otras evaluaciones y actividades'
  }
}

/**
 * Obtiene el mapeo de categoría para un tipo de evento específico
 */
export const getCategoryMappingForEventType = (eventType: string): CategoryMapping => {
  return EVENT_TYPE_CATEGORY_MAPPING[eventType] || EVENT_TYPE_CATEGORY_MAPPING['general']
}

/**
 * Verifica si un tipo de evento debe generar automáticamente una calificación
 */
export const shouldCreateGradeForEventType = (eventType: string): boolean => {
  const gradeEventTypes = [
    'tarea', 'laboratorio', 'quiz', 'parcial', 'proyecto', 'examen_final',
    'practica', 'investigacion', 'charla'
  ]
  return gradeEventTypes.includes(eventType)
}

/**
 * Obtiene todos los tipos de eventos que generan calificaciones
 */
export const getGradeEventTypes = (): string[] => {
  return Object.keys(EVENT_TYPE_CATEGORY_MAPPING).filter(type => type !== 'general')
}

/**
 * Normaliza el nombre de categoría para comparación
 */
export const normalizeCategoryName = (name: string): string => {
  return name.toLowerCase().trim()
}

/**
 * Busca una categoría existente que coincida con el mapeo de un tipo de evento
 */
export const findMatchingCategory = (categories: any[], eventType: string): any | null => {
  const mapping = getCategoryMappingForEventType(eventType)
  const normalizedMappingName = normalizeCategoryName(mapping.name)
  
  return categories.find(category => 
    normalizeCategoryName(category.name) === normalizedMappingName
  ) || null
}

/**
 * Obtiene sugerencias de distribución de porcentajes para todas las categorías
 */
export const getSuggestedPercentageDistribution = (): Record<string, number> => {
  const distribution: Record<string, number> = {}
  
  Object.entries(EVENT_TYPE_CATEGORY_MAPPING).forEach(([eventType, mapping]) => {
    if (eventType !== 'general') {
      distribution[mapping.name] = mapping.percentage
    }
  })
  
  return distribution
}
