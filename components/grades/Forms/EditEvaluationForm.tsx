import React, { useState } from 'react'
import { View, Alert, ActivityIndicator } from 'react-native'
import {
  ThemedCard,
  ThemedInput,
  ThemedButton,
  ThemedText
} from '@/components/ui/ThemedComponents'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { useTheme } from '@/hooks/useTheme'
import { gradesService } from '@/database/services/gradesService'

interface EditEvaluationFormProps {
  evaluationId: string
  categoryId: string
  initialData: {
    title: string
    description?: string
    score: number
    max_score: number
    graded_at: string
  }
  onCancel?: () => void
  onSuccess?: () => void
  onUpdate?: () => void // ✅ Se llamará al guardar o eliminar para actualizar la categoría
}

export default function EditEvaluationForm({
  evaluationId,
  categoryId,
  initialData,
  onCancel,
  onSuccess,
  onUpdate
}: EditEvaluationFormProps) {
  const { theme } = useTheme()

  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description ?? '',
    score: initialData.score.toString(),
    max_score: initialData.max_score.toString(),
    graded_at: initialData.graded_at
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [datePickerVisible, setDatePickerVisible] = useState(false)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }


  const validate = () => {
    const score = parseFloat(formData.score)
    const max = parseFloat(formData.max_score)

    if (!formData.title.trim()) return 'El título es obligatorio'
    if (!formData.graded_at) return 'Selecciona una fecha'
    if (isNaN(score) || score < 0) return 'La nota debe ser válida'
    if (isNaN(max) || max <= 0) return 'La escala debe ser un número positivo'
    if (score > max) return `La nota no puede superar el máximo (${max})`

    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      await gradesService.patchGrade(evaluationId, {
        title: formData.title.trim(),
        description: formData.description || undefined,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        graded_at: formData.graded_at,
        category_id: categoryId
      })

      onUpdate?.() // ✅ Notifica al componente padre que debe recargar la categoría
      onSuccess?.()
    } catch (error: any) {
      console.error('❌ Error al actualizar evaluación:', error)
      Alert.alert('Error', 'No se pudo actualizar la evaluación')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDate = (date: Date) => {
    setFormData(prev => ({ ...prev, graded_at: date.toISOString() }))
    setDatePickerVisible(false)
  }

  const handleDelete = () => {
    Alert.alert(
      'Eliminar evaluación',
      '¿Seguro que quieres eliminar esta evaluación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await gradesService.deleteGrade(evaluationId)

              onUpdate?.() // ✅ También se llama aquí para que el padre actualice
              onSuccess?.()
            } catch (err) {
              console.error('❌ Error al eliminar evaluación:', err)
              Alert.alert('Error', 'No se pudo eliminar la evaluación.')
            }
          }
        }
      ]
    )
  }

  return (
    <ThemedCard variant="outlined" padding="large">
      <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
        ✏️ Editar Evaluación
      </ThemedText>

      <View style={{ gap: theme.spacing.md }}>
        <ThemedInput
          label="Título"
          value={formData.title}
          onChangeText={text => handleChange('title', text)}
        />

        <ThemedInput
          label="Descripción"
          value={formData.description}
          onChangeText={text => handleChange('description', text)}
        />

        <ThemedInput
          label="Nota"
          value={formData.score}
          onChangeText={text => handleChange('score', text)}
          keyboardType="numeric"
        />

        <ThemedInput
          label="Escala máxima"
          value={formData.max_score}
          onChangeText={text => handleChange('max_score', text)}
          keyboardType="numeric"
        />

        <ThemedButton
          title={`📅 ${new Date(formData.graded_at).toLocaleDateString()}`}
          variant="outline"
          onPress={() => setDatePickerVisible(true)}
        />

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
          title="Eliminar evaluación"
          variant="error"
          onPress={handleDelete}
          style={{ marginTop: theme.spacing.md }}
          disabled={loading}
        />

        {error && <ThemedText color="error">{error}</ThemedText>}
        {loading && <ActivityIndicator color={theme.colors.primary} />}
      </View>

      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisible(false)}
      />
    </ThemedCard>
  )
}
