import React, { useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import {
  ThemedCard,
  ThemedText,
  ThemedInput,
  ThemedButton
} from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'
import { categoryService } from '@/database/services/categoryService'
import type { CategoryGradeData } from '@/database/services/categoryService'

interface AddCategoryFormProps {
  classId: string
  onSuccess: (categoria: CategoryGradeData) => void
  onCancel?: () => void
}

export default function AddCategoryForm({ classId, onSuccess, onCancel }: AddCategoryFormProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({ name: '', percentage: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    const porcentajeNum = parseFloat(formData.percentage)
    const nombre = formData.name.trim()

    if (!nombre) {
      setError('El nombre de la categoría es requerido')
      return
    }
    if (isNaN(porcentajeNum) || porcentajeNum <= 0 || porcentajeNum > 100) {
      setError('El porcentaje debe ser un número entre 1 y 100')
      return
    }

    setError('')
    setLoading(true)

    try {
      const payload = {
        class_id: classId,
        name: nombre,
        percentage: porcentajeNum
      }

      console.log('🟡 AddCategoryForm: Enviando payload', payload)

      const nuevaCategoria = await categoryService.createCategory(payload)

      console.log('✅ AddCategoryForm: Categoría creada', nuevaCategoria)

      onSuccess(nuevaCategoria)
      setFormData({ name: '', percentage: '' })
    } catch (err: any) {
      console.error('❌ AddCategoryForm: Error al crear categoría', err)
      setError(err.message || 'Error al crear categoría')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedCard variant="outlined" padding="large" style={{ marginTop: theme.spacing.md }}>
      <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        ➕ Nueva Categoría
      </ThemedText>

      <View style={{ gap: theme.spacing.md }}>
        <ThemedInput
          label="Nombre de la categoría"
          value={formData.name}
          onChangeText={text => handleChange('name', text)}
          error={error.includes('nombre') ? error : undefined}
        />

        <ThemedInput
          label="Porcentaje que representa"
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
            title="Agregar"
            variant="primary"
            onPress={handleSubmit}
            style={{ flex: 1 }}
            disabled={loading}
          />
        </View>

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
