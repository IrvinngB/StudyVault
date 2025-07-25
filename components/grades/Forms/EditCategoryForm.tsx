import React, { useState } from 'react'
import { View, ActivityIndicator, Alert } from 'react-native'
import {
  ThemedCard,
  ThemedText,
  ThemedInput,
  ThemedButton
} from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'
import { categoryService } from '@/database/services/categoryService'

interface EditCategoryFormProps {
  categoryId: string
  currentName: string
  currentPercentage: number
  onSuccess: () => void
  onCancel?: () => void
  onUpdate?: () => void
}

export default function EditCategoryForm({
  categoryId,
  currentName,
  currentPercentage,
  onSuccess,
  onCancel,
  onUpdate
}: EditCategoryFormProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({
    name: currentName,
    percentage: currentPercentage.toString()
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    const nombre = formData.name.trim()
    const porcentajeNum = parseFloat(formData.percentage)

    if (!nombre) {
      setError('El nombre no puede estar vacío')
      return
    }

    if (isNaN(porcentajeNum) || porcentajeNum <= 0 || porcentajeNum > 100) {
      setError('El porcentaje debe ser un número entre 1 y 100')
      return
    }

    setError('')
    setLoading(true)

    try {
      await categoryService.updateCategory(categoryId, {
        name: nombre,
        percentage: porcentajeNum
      })

      if (onUpdate) onUpdate()

      onSuccess()
    } catch (err: any) {
      console.error('❌ Error al actualizar categoría:', err)
      setError(err.message || 'Error al guardar cambios')
    } finally {
      setLoading(false)
    }
  }

  const confirmDeletion = () => {
    Alert.alert(
      'Eliminar categoría',
      '¿Seguro que quieres eliminar esta categoría? Se eliminarán también sus evaluaciones.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: handleDeleteCategory
        }
      ]
    )
  }

  const handleDeleteCategory = async () => {
    setLoading(true)
    try {
      await categoryService.deleteCategory(categoryId)
      if (onUpdate) onUpdate()
      onSuccess()
    } catch (error: any) {
      console.error('❌ Error al eliminar categoría:', error)
      Alert.alert('Error', 'No se pudo eliminar la categoría.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedCard variant="outlined" padding="large" style={{ marginTop: theme.spacing.md }}>
      <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        ✏️ Editar Categoría
      </ThemedText>

      <View style={{ gap: theme.spacing.md }}>
        <ThemedInput
          label="Nombre"
          value={formData.name}
          onChangeText={text => handleChange('name', text)}
          error={error.includes('nombre') ? error : undefined}
        />

        <ThemedInput
          label="Porcentaje (1 a 100%)"
          value={formData.percentage}
          onChangeText={text => handleChange('percentage', text)}
          keyboardType="numeric"
          error={error.includes('porcentaje') ? error : undefined}
        />

        {error && !error.includes('nombre') && !error.includes('porcentaje') && (
          <ThemedText color="error">{error}</ThemedText>
        )}

        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <ThemedButton
            title="Cancelar"
            variant="outline"
            onPress={onCancel}
            style={{ flex: 1 }}
            disabled={loading}
          />
          <ThemedButton
            title="Guardar"
            variant="primary"
            onPress={handleSubmit}
            style={{ flex: 1 }}
            disabled={loading}
          />
        </View>

        <ThemedButton
          title="🗑️ Eliminar categoría"
          variant="error"
          onPress={confirmDeletion}
          style={{ marginTop: theme.spacing.sm }}
          disabled={loading}
        />

        {loading && (
          <ActivityIndicator
            style={{ marginTop: theme.spacing.sm }}
            color={theme.colors.primary}
          />
        )}
      </View>
    </ThemedCard>
  )
}
