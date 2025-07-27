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
      // Obtener categorías existentes de la clase
      const categories = await categoryService.getCategoriesByClassId(classId)
      
      // Obtener el mapeo para este tipo de evento
      const categoryMapping = getCategoryMappingForEventType(eventType)
      
      // Buscar si ya existe una categoría con el nombre apropiado
      let existingCategory = findMatchingCategory(categories, eventType)
      
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
      
      return newCategory.id
    } catch (error) {
      console.error('Error finding/creating category for event type:', error)
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
      // Verificar si este tipo de evento debe generar una calificación
      if (!shouldCreateGradeForEventType(eventType)) {
        console.log(`⏭️ Evento tipo "${eventType}" no genera calificación automática`)
        return
      }

      // Buscar o crear categoría específica para el tipo de evento
      let categoryId = await findOrCreateCategoryForEventType(classId, eventType)
      
      // Si falló la creación de categoría específica, usar/crear categoría general
      if (!categoryId) {
        const categories = await categoryService.getCategoriesByClassId(classId)
        categoryId = categories.length > 0 ? categories[0].id : null
        
        // Si no hay categoría, crear una por defecto
        if (!categoryId && classId) {
          const defaultCategory = await categoryService.createCategory({ 
            class_id: classId, 
            name: "General", 
            percentage: 100 
          })
          categoryId = defaultCategory.id
        }
      }
      
      if (!categoryId) {
        console.warn('No se pudo crear calificación sin categoría')
        return
      }
      
      // Crear la calificación con score 0 y max_score 0 por defecto
      await gradesService.createGrade({
        class_id: classId,
        category_id: categoryId,
        title: eventTitle,
        score: 0,
        max_score: 0,
        ...(eventId && { calendar_event_id: eventId }),
        event_type: eventType,
        value: 1 // 1 = incompleta/activa por defecto
      })
      
      console.log(`✅ Calificación creada automáticamente para evento tipo: ${eventType}`)
    } catch (err) {
      console.error("Error creando calificación automática:", err)
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
