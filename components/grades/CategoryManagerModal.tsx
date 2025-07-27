/**
 * Modal para gestión inteligente de categorías
 */

import { CategoryManager } from '@/components/grades/CategoryManager'
import { ThemedButton, ThemedText, ThemedView } from '@/components/ui/ThemedComponents'
import type { CategoryGradeData } from '@/database/services/categoryService'
import { useTheme } from '@/hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'

interface CategoryManagerModalProps {
  visible: boolean
  classId: string
  onClose: () => void
  onCategoriesUpdated?: (categories: CategoryGradeData[]) => void
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  visible,
  classId,
  onClose,
  onCategoriesUpdated
}) => {
  const { theme } = useTheme()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView variant="background" style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name="library-outline" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <ThemedText variant="h2" style={{ color: theme.colors.text }}>
                  Gestión Inteligente
                </ThemedText>
                <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
                  Categorías automáticas basadas en eventos
                </ThemedText>
              </View>
            </View>
            <Pressable 
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
            >
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <CategoryManager
            classId={classId}
            onCategoriesUpdated={onCategoriesUpdated}
          />
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <ThemedButton
            title="Cerrar"
            onPress={onClose}
            variant="outline"
            style={styles.footerButton}
          />
        </View>
      </ThemedView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: 60, // Para el safe area
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 32, // Para el safe area
  },
  footerButton: {
    width: '100%',
  },
})
