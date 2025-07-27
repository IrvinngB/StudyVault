/**
 * Componente para mostrar y gestionar categorías de calificaciones
 * con mapeo automático basado en tipos de eventos
 */

import { CategoryDistribution } from '@/components/grades/CategoryDistribution'
import { ThemedButton, ThemedText, ThemedView } from '@/components/ui/ThemedComponents'
import { categoryService, type CategoryGradeData } from '@/database/services/categoryService'
import { useAutoCategory } from '@/hooks/useAutoCategory'
import { useTheme } from '@/hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'

interface CategoryManagerProps {
  classId: string
  onCategoriesUpdated?: (categories: CategoryGradeData[]) => void
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  classId,
  onCategoriesUpdated
}) => {
  const { theme } = useTheme()
  const { 
    getSuggestedDistribution, 
    ensureAllCategoriesExist, 
    syncCategoriesWithEventTypes 
  } = useAutoCategory()
  
  const [categories, setCategories] = useState<CategoryGradeData[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestedCategories, setSuggestedCategories] = useState<Record<string, number>>({})

  useEffect(() => {
    loadCategories()
    setSuggestedCategories(getSuggestedDistribution())
  }, [classId])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const fetchedCategories = await categoryService.getCategoriesByClassId(classId)
      setCategories(fetchedCategories)
      onCategoriesUpdated?.(fetchedCategories)
    } catch (error) {
      console.error('Error loading categories:', error)
      Alert.alert('Error', 'No se pudieron cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncCategories = async () => {
    try {
      setLoading(true)
      await syncCategoriesWithEventTypes(classId)
      await loadCategories()
      Alert.alert('Éxito', 'Categorías sincronizadas correctamente')
    } catch (error) {
      console.error('Error syncing categories:', error)
      Alert.alert('Error', 'Error al sincronizar categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAllCategories = async () => {
    try {
      setLoading(true)
      const newCategories = await ensureAllCategoriesExist(classId)
      setCategories(newCategories)
      onCategoriesUpdated?.(newCategories)
      Alert.alert('Éxito', 'Todas las categorías han sido creadas')
    } catch (error) {
      console.error('Error creating categories:', error)
      Alert.alert('Error', 'Error al crear categorías')
    } finally {
      setLoading(false)
    }
  }

  const renderCategoryItem = ({ item }: { item: CategoryGradeData }) => {
    const isRecommended = Object.keys(suggestedCategories).some(
      suggestedName => suggestedName.toLowerCase() === item.name.toLowerCase()
    )
    
    return (
      <View style={[
        styles.categoryItem, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: isRecommended ? theme.colors.primary : theme.colors.border
        }
      ]}>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryHeader}>
            <ThemedText variant="h3" style={{ color: theme.colors.text }}>
              {item.name}
            </ThemedText>
            {isRecommended && (
              <View style={[styles.recommendedBadge, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="checkmark" size={12} color={theme.colors.surface} />
                <ThemedText variant="caption" style={{ color: theme.colors.surface, marginLeft: 4 }}>
                  Recomendada
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText variant="body" style={{ color: theme.colors.textMuted }}>
            Peso: {item.percentage}%
          </ThemedText>
        </View>
      </View>
    )
  }

  const renderSuggestedCategory = ({ item }: { item: [string, number] }) => {
    const [name, percentage] = item
    const exists = categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())
    
    if (exists) return null

    return (
      <View style={[
        styles.suggestedItem,
        { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent }
      ]}>
        <Ionicons name="add-circle-outline" size={20} color={theme.colors.accent} />
        <View style={styles.suggestedInfo}>
          <ThemedText variant="body" style={{ color: theme.colors.text }}>
            {name}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
            Sugerido: {percentage}%
          </ThemedText>
        </View>
      </View>
    )
  }

  const missingSuggested = Object.entries(suggestedCategories).filter(
    ([name]) => !categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())
  )

  return (
    <ThemedView variant="background" style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="h2" style={{ color: theme.colors.text }}>
          Gestión de Categorías
        </ThemedText>
        <ThemedText variant="body" style={{ color: theme.colors.textMuted, marginTop: 4 }}>
          Categorías basadas en tipos de eventos del calendario
        </ThemedText>
      </View>

      {/* Distribución visual */}
      <CategoryDistribution 
        categories={categories}
        maxScale={100} // Asumimos escala de 100 para la distribución
      />

      {missingSuggested.length > 0 && (
        <View style={styles.section}>
          <ThemedText variant="h3" style={{ color: theme.colors.text, marginBottom: 8 }}>
            Categorías Sugeridas
          </ThemedText>
          <FlatList
            data={missingSuggested}
            renderItem={renderSuggestedCategory}
            keyExtractor={([name]) => name}
            scrollEnabled={false}
          />
          <ThemedButton
            title="Crear Todas las Categorías"
            onPress={handleCreateAllCategories}
            loading={loading}
            style={{ marginTop: 12 }}
          />
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText variant="h3" style={{ color: theme.colors.text }}>
            Categorías Actuales ({categories.length})
          </ThemedText>
          <ThemedButton
            title="Sincronizar"
            onPress={handleSyncCategories}
            loading={loading}
            variant="outline"
            size="small"
          />
        </View>
        
        {categories.length > 0 ? (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-outline" size={48} color={theme.colors.textMuted} />
            <ThemedText variant="body" style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: 12 }}>
              No hay categorías creadas.{'\n'}
              Crea categorías automáticamente basadas en tipos de eventos.
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  suggestedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
})
