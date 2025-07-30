/**
 * Componente para mostrar y gestionar categorías de calificaciones
 * con mapeo automático basado en tipos de eventos
 */

import { CategoryDistribution } from '@/components/grades/CategoryDistribution'
import AppModal from '@/components/ui/AppModal'
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
    getSuggestedDistribution
  } = useAutoCategory()
  
  const [categories, setCategories] = useState<CategoryGradeData[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestedCategories, setSuggestedCategories] = useState<Record<string, number>>({})
  const [showInfoModal, setShowInfoModal] = useState(false)

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
        <Ionicons name="information-circle-outline" size={20} color={theme.colors.accent} />
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
          <View style={styles.sectionHeader}>
            <ThemedText variant="h3" style={{ color: theme.colors.text }}>
              Categorías Sugeridas
            </ThemedText>
            <ThemedButton
              title="ℹ️ Info"
              onPress={() => setShowInfoModal(true)}
              variant="outline"
              size="small"
            />
          </View>
          <FlatList
            data={missingSuggested}
            renderItem={renderSuggestedCategory}
            keyExtractor={([name]) => name}
            scrollEnabled={false}
          />
          <ThemedText variant="bodySmall" style={{ color: theme.colors.textMuted, marginTop: 8, textAlign: 'center' }}>
            Estas categorías se crearán automáticamente cuando agregues eventos del calendario
          </ThemedText>
        </View>
      )}

      <View style={styles.section}>
        <ThemedText variant="h3" style={{ color: theme.colors.text, marginBottom: 12 }}>
          Categorías Actuales ({categories.length})
        </ThemedText>
        
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
              Las categorías se crearán automáticamente cuando agregues eventos del calendario.
            </ThemedText>
          </View>
        )}
      </View>

      {/* Modal de información */}
      <AppModal
        visible={showInfoModal}
        type="info"
        title="Categorías Automáticas"
        message="Las categorías se crean automáticamente cuando agregas eventos del calendario. No es necesario crearlas manualmente. El sistema sugiere categorías basadas en los tipos de eventos que has configurado."
        onClose={() => setShowInfoModal(false)}
        confirmText="Entendido"
      />
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
