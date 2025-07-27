/**
 * Componente visual para mostrar la distribución de porcentajes de categorías
 */

import { ThemedText, ThemedView } from '@/components/ui/ThemedComponents'
import type { CategoryGradeData } from '@/database/services/categoryService'
import { useTheme } from '@/hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface CategoryDistributionProps {
  categories: CategoryGradeData[]
  maxScale: number
}

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({
  categories,
  maxScale
}) => {
  const { theme } = useTheme()

  const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0)
  const remaining = maxScale === 100 ? 100 - totalPercentage : 0

  const getBarColor = (percentage: number) => {
    if (percentage <= 15) return '#FF6B6B' // Rojo para poco peso
    if (percentage <= 30) return '#4ECDC4' // Verde azulado para peso medio
    if (percentage <= 50) return '#45B7D1' // Azul para peso alto
    return '#96CEB4' // Verde para peso muy alto
  }

  const getStatusColor = () => {
    if (maxScale !== 100) return theme.colors.textMuted
    if (totalPercentage === 100) return '#27AE60' // Verde para completado
    if (totalPercentage > 100) return '#E74C3C' // Rojo para excedido
    return '#F39C12' // Naranja para incompleto
  }

  const getStatusIcon = () => {
    if (maxScale !== 100) return 'information-circle-outline'
    if (totalPercentage === 100) return 'checkmark-circle'
    if (totalPercentage > 100) return 'warning'
    return 'time-outline'
  }

  const getStatusText = () => {
    if (maxScale !== 100) return `Escala: ${maxScale} puntos`
    if (totalPercentage === 100) return 'Distribución completa'
    if (totalPercentage > 100) return `Excedido por ${totalPercentage - 100}%`
    return `Falta ${remaining}% por asignar`
  }

  return (
    <ThemedView variant="surface" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
            <Ionicons name="pie-chart-outline" size={18} color={theme.colors.primary} />
          </View>
          <ThemedText variant="h3" style={{ color: theme.colors.text }}>
            Distribución de Categorías
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
          <ThemedText variant="caption" style={{ color: getStatusColor(), marginLeft: 4 }}>
            {getStatusText()}
          </ThemedText>
        </View>
      </View>

      {/* Progress Bar */}
      {maxScale === 100 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            {categories.map((category, index) => {
              const leftOffset = categories
                .slice(0, index)
                .reduce((sum, cat) => sum + cat.percentage, 0)
              
              return (
                <View
                  key={category.id}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor: getBarColor(category.percentage),
                      left: `${leftOffset}%`,
                      width: `${category.percentage}%`,
                    }
                  ]}
                />
              )
            })}
          </View>
          <View style={styles.progressLabels}>
            <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
              0%
            </ThemedText>
            <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
              {totalPercentage}%
            </ThemedText>
            <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
              100%
            </ThemedText>
          </View>
        </View>
      )}

      {/* Categories List */}
      <View style={styles.categoriesList}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.categoryColor,
                  { backgroundColor: getBarColor(category.percentage) }
                ]}
              />
              <ThemedText variant="body" style={{ color: theme.colors.text, flex: 1 }}>
                {category.name}
              </ThemedText>
            </View>
            <ThemedText variant="body" style={{ color: theme.colors.text, fontWeight: 'bold' }}>
              {category.percentage}%
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: theme.colors.background }]}>
        <View style={styles.summaryRow}>
          <ThemedText variant="body" style={{ color: theme.colors.textMuted }}>
            Total asignado:
          </ThemedText>
          <ThemedText variant="body" style={{ color: getStatusColor(), fontWeight: 'bold' }}>
            {totalPercentage}%{maxScale === 100 ? '' : ` de ${maxScale}`}
          </ThemedText>
        </View>
        {maxScale === 100 && remaining > 0 && (
          <View style={styles.summaryRow}>
            <ThemedText variant="body" style={{ color: theme.colors.textMuted }}>
              Disponible:
            </ThemedText>
            <ThemedText variant="body" style={{ color: '#F39C12', fontWeight: 'bold' }}>
              {remaining}%
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  progressSegment: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  categoriesList: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  summary: {
    borderRadius: 8,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
})
