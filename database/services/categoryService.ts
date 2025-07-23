// @/database/services/categoryService.ts
import { ApiClient } from '../api/client'

export interface CategoryGradeData {
  id: string
  class_id: string
  name: string
  percentage: number
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface CreateCategoryGradeRequest {
  class_id?: string
  name?: string
  percentage?: number
}

export interface UpdateCategoryGradeRequest extends Partial<CreateCategoryGradeRequest> {}

class CategoryService {
  private apiClient: ApiClient

  constructor() {
    this.apiClient = ApiClient.getInstance()
  }

  /**
   * Crear nueva categoría de evaluación
   */
  async createCategory(categoryData: CreateCategoryGradeRequest): Promise<CategoryGradeData> {
    try {
      const dataToSend = {
        class_id: categoryData.class_id,
        ...(categoryData.name && { name: categoryData.name }),
        ...(categoryData.percentage !== undefined && { percentage: categoryData.percentage })
      }

      console.log('🟡 CategoryService: Creando categoría', dataToSend)
      const response = await this.apiClient.post<CategoryGradeData>('/categories/', dataToSend)
      console.log('✅ Categoria creada', response)
      return response
    } catch (error) {
      console.error('❌ CategoryService: Error al crear categoría', error)
      throw new Error(`No se pudo crear la categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtener todas las categorías de una clase
   */
  async getCategoriesByClassId(classId: string): Promise<CategoryGradeData[]> {
    try {
      const response = await this.apiClient.get<CategoryGradeData[]>(`/categories/?class_id=${classId}`)
      return response
    } catch (error) {
      console.error('❌ CategoryService: Error al obtener categorías por clase', error)
      throw new Error(`No se pudieron obtener las categorías: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtener una categoría por su ID
   */
  async getCategoryById(categoryId: string): Promise<CategoryGradeData> {
    try {
      const response = await this.apiClient.get<CategoryGradeData>(`/categories/${categoryId}`)
      return response
    } catch (error) {
      console.error('❌ CategoryService: Error al obtener categoría por ID', error)
      throw new Error(`No se pudo obtener la categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Actualizar una categoría por ID
   */
  async updateCategory(categoryId: string, data: UpdateCategoryGradeRequest): Promise<CategoryGradeData> {
    try {
      const updatePayload: Partial<CategoryGradeData> = {}

      if (data.name !== undefined) updatePayload.name = data.name
      if (data.percentage !== undefined) updatePayload.percentage = data.percentage

      console.log('🟡 CategoryService: Actualizando categoría', updatePayload)

      const response = await this.apiClient.put<CategoryGradeData>(`/categories/${categoryId}`, updatePayload)
      console.log('✅ Categoría actualizada', response)
      return response
    } catch (error) {
      console.error('❌ CategoryService: Error al actualizar categoría', error)
      throw new Error(`No se pudo actualizar la categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Eliminar una categoría por ID
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      console.log('🟡 CategoryService: Eliminando categoría', categoryId)
      await this.apiClient.delete(`/categories/${categoryId}`)
      console.log('✅ Categoría eliminada')
    } catch (error) {
      console.error('❌ CategoryService: Error al eliminar categoría', error)
      throw new Error(`No se pudo eliminar la categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }
}

export const categoryService = new CategoryService()
export default categoryService
