/**
 * Hook personalizado para gestionar el mapeo automático de categorías de calificaciones
 * basado en tipos de eventos de calendario
 */

import { categoryService, type CategoryGradeData } from '@/database/services/categoryService'
import { gradesService } from '@/database/services/gradesService'
import {
    findMatchingCategory,
    getCategoryMappingForEventType,
    getSuggestedPercentageDistribution,
    shouldCreateGradeForEventType
} from '@/utils/categoryMapping'
import { useCallback } from 'react'

export interface UseAutoCategoryReturn {
  // Main functions
  findOrCreateCategoryForEventType: (classId: string, eventType: string) => Promise<string | null>
  createAutoGradeForEvent: (eventId: string | undefined, classId: string, eventTitle: string, eventType: string) => Promise<void>
  
  // Utility functions
  getCategoryMapping: (eventType: string) => { name: string; percentage: number; description?: string }
  shouldCreateGrade: (eventType: string) => boolean
  getSuggestedDistribution: () => Record<string, number>
  
  // Category management
  ensureAllCategoriesExist: (classId: string) => Promise<CategoryGradeData[]>
  syncCategoriesWithEventTypes: (classId: string) => Promise<void>
}

export const useAutoCategory = (): UseAutoCategoryReturn => {
  
  /**
   * Buscar o crear categoría específica para el tipo de evento
   */
  const findOrCreateCategoryForEventType = useCallback(async (classId: string, eventType: string): Promise<string | null> => {
    try {
      console.log("🔍 findOrCreateCategoryForEventType iniciado:", { classId, eventType })
      
      // Obtener categorías existentes de la clase
      const categories = await categoryService.getCategoriesByClassId(classId)
      console.log("📋 Categorías existentes encontradas:", categories.length)
      
      // Obtener el mapeo para este tipo de evento
      const categoryMapping = getCategoryMappingForEventType(eventType)
      console.log("🗺️ Mapeo de categoría encontrado:", categoryMapping)
      
      // Buscar si ya existe una categoría con el nombre apropiado
      let existingCategory = findMatchingCategory(categories, eventType)
      console.log("🔍 Categoría existente encontrada:", existingCategory?.name || "Ninguna")
      
      if (existingCategory) {
        console.log(`✅ Usando categoría existente: ${existingCategory.name}`)
        return existingCategory.id
      }
      
      // Si no existe, crear la categoría específica para este tipo de evento
      console.log(`🔄 Creando nueva categoría: ${categoryMapping.name} (${categoryMapping.percentage}%)`)
      const newCategory = await categoryService.createCategory({
        class_id: classId,
        name: categoryMapping.name,
        percentage: categoryMapping.percentage
      })
      
      console.log("✅ Nueva categoría creada:", newCategory.id, newCategory.name)
      return newCategory.id
    } catch (error) {
      console.error('❌ Error finding/creating category for event type:', error)
      return null
    }
  }, [])

  /**
   * Crear calificación automática para un evento
   */
  const createAutoGradeForEvent = useCallback(async (
    eventId: string | undefined, 
    classId: string, 
    eventTitle: string, 
    eventType: string
  ): Promise<void> => {
    try {
      console.log("🔄 createAutoGradeForEvent iniciado:", { eventId, classId, eventTitle, eventType })
      
      // Verificar si este tipo de evento debe generar una calificación
      if (!shouldCreateGradeForEventType(eventType)) {
        console.log(`⏭️ Evento tipo "${eventType}" no genera calificación automática`)
        return
      }

      console.log("✅ Evento tipo válido para calificación automática")
      
      // Validar que tenemos los datos necesarios
      if (!classId || !eventTitle || !eventType) {
        console.error("❌ Datos insuficientes para crear calificación:", { classId, eventTitle, eventType })
        throw new Error("Datos insuficientes para crear calificación automática")
      }

      // Buscar o crear categoría específica para el tipo de evento
      console.log("🔍 Buscando/creando categoría para tipo:", eventType)
      let categoryId = await findOrCreateCategoryForEventType(classId, eventType)
      console.log("📋 Categoría encontrada/creada:", categoryId)
      
      // Si falló la creación de categoría específica, usar/crear categoría general
      if (!categoryId) {
        console.log("⚠️ No se pudo crear categoría específica, buscando categorías existentes")
        const categories = await categoryService.getCategoriesByClassId(classId)
        console.log("📋 Categorías existentes:", categories.length)
        
        // Buscar una categoría que coincida con el tipo de evento
        const matchingCategory = findMatchingCategory(categories, eventType)
        if (matchingCategory) {
          console.log("✅ Encontrada categoría existente que coincide:", matchingCategory.name)
          categoryId = matchingCategory.id
        } else if (categories.length > 0) {
          // Usar la primera categoría disponible
          console.log("📋 Usando primera categoría disponible:", categories[0].name)
          categoryId = categories[0].id
        } else {
          // Si no hay categoría, crear una por defecto
          console.log("🔄 Creando categoría general por defecto")
          try {
            const defaultCategory = await categoryService.createCategory({ 
              class_id: classId, 
              name: "General", 
              percentage: 100 
            })
            categoryId = defaultCategory.id
            console.log("✅ Categoría general creada:", categoryId)
          } catch (error) {
            console.error("❌ Error creando categoría general:", error)
            throw new Error("No se pudo crear categoría para la calificación")
          }
        }
      }
      
      if (!categoryId) {
        console.warn('❌ No se pudo crear calificación sin categoría')
        return
      }
      
      console.log("🎯 Creando calificación con categoría:", categoryId)
      
      // Obtener el mapeo para determinar el puntaje máximo sugerido
      const categoryMapping = getCategoryMappingForEventType(eventType)
      
      // Determinar puntaje máximo basado en el tipo de evento
      let maxScore = 100 // Por defecto
      if (eventType === "quiz") maxScore = 20
      else if (eventType === "parcial") maxScore = 50
      else if (eventType === "examen_final") maxScore = 100
      else if (eventType === "proyecto") maxScore = 100
      else if (eventType === "laboratorio") maxScore = 30
      else if (eventType === "tarea") maxScore = 20
      else if (eventType === "presentacion") maxScore = 30
      else if (eventType === "ensayo") maxScore = 50
      else if (eventType === "investigacion") maxScore = 100
      else if (eventType === "practica") maxScore = 25
      else if (eventType === "evaluacion_continua") maxScore = 10
      else if (eventType === "trabajo_grupo") maxScore = 30
      else if (eventType === "portafolio") maxScore = 100
      else if (eventType === "examen_oral") maxScore = 50
      else if (eventType === "caso_estudio") maxScore = 40
      
      // Crear la calificación con valores apropiados
      const gradeData = {
        class_id: classId,
        category_id: categoryId,
        title: eventTitle,
        score: 0, // Sin calificar por defecto
        max_score: maxScore,
        ...(eventId && { calendar_event_id: eventId }),
        event_type: eventType,
        value: 1 // 1 = incompleta/activa por defecto
      }
      
      console.log("📊 Datos de calificación a crear:", gradeData)
      
      const createdGrade = await gradesService.createGrade(gradeData)
      console.log("✅ Calificación creada:", createdGrade.id)
      
      // Mensaje de éxito más detallado
      const taskType = eventType === "tarea" ? "Tarea" : 
                      eventType === "examen_final" ? "Examen Final" :
                      eventType === "parcial" ? "Parcial" :
                      eventType === "quiz" ? "Quiz" :
                      eventType === "proyecto" ? "Proyecto" :
                      eventType === "laboratorio" ? "Laboratorio" :
                      eventType === "presentacion" ? "Presentación" :
                      eventType === "ensayo" ? "Ensayo" :
                      eventType === "investigacion" ? "Investigación" :
                      eventType === "practica" ? "Práctica" :
                      eventType === "evaluacion_continua" ? "Evaluación Continua" :
                      eventType === "trabajo_grupo" ? "Trabajo en Grupo" :
                      eventType === "portafolio" ? "Portafolio" :
                      eventType === "examen_oral" ? "Examen Oral" :
                      eventType === "caso_estudio" ? "Caso de Estudio" : "Evaluación"
      
      console.log(`✅ ${taskType} creada automáticamente:`)
      console.log(`   - Título: ${eventTitle}`)
      console.log(`   - Categoría: ${categoryMapping.name}`)
      console.log(`   - Puntaje máximo: ${maxScore}`)
      console.log(`   - Vinculada al evento: ${eventId ? "Sí" : "No"}`)
    } catch (err) {
      console.error("❌ Error creando calificación automática:", err)
      throw err
    }
  }, [findOrCreateCategoryForEventType])

  /**
   * Asegurar que todas las categorías necesarias existen para una clase
   */
  const ensureAllCategoriesExist = useCallback(async (classId: string): Promise<CategoryGradeData[]> => {
    try {
      const existingCategories = await categoryService.getCategoriesByClassId(classId)
      const suggestedDistribution = getSuggestedPercentageDistribution()
      
      const createdCategories: CategoryGradeData[] = [...existingCategories]
      
      // Crear categorías faltantes
      for (const [categoryName, percentage] of Object.entries(suggestedDistribution)) {
        const exists = existingCategories.some(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase()
        )
        
        if (!exists) {
          console.log(`🔄 Creando categoría faltante: ${categoryName}`)
          const newCategory = await categoryService.createCategory({
            class_id: classId,
            name: categoryName,
            percentage: percentage
          })
          createdCategories.push(newCategory)
        }
      }
      
      return createdCategories
    } catch (error) {
      console.error('Error ensuring categories exist:', error)
      throw error
    }
  }, [])

  /**
   * Sincronizar categorías existentes con tipos de eventos
   */
  const syncCategoriesWithEventTypes = useCallback(async (classId: string): Promise<void> => {
    try {
      console.log(`🔄 Sincronizando categorías para clase: ${classId}`)
      await ensureAllCategoriesExist(classId)
      console.log(`✅ Categorías sincronizadas correctamente`)
    } catch (error) {
      console.error('Error syncing categories:', error)
      throw error
    }
  }, [ensureAllCategoriesExist])

  return {
    // Main functions
    findOrCreateCategoryForEventType,
    createAutoGradeForEvent,
    
    // Utility functions
    getCategoryMapping: getCategoryMappingForEventType,
    shouldCreateGrade: shouldCreateGradeForEventType,
    getSuggestedDistribution: getSuggestedPercentageDistribution,
    
    // Category management
    ensureAllCategoriesExist,
    syncCategoriesWithEventTypes,
  }
}
