import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import {
  ThemedCard,
  ThemedText,
  ThemedButton,
  ThemedInput
} from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { gradesService } from '@/database/services/gradesService'
import type { GradeData } from '@/database/services/gradesService'

interface CategoryCardProps {
  classId: string
  categoryId: string
  nombre: string
  porcentaje: number
}

export default function CategoryCard({
  classId,
  categoryId,
  nombre,
  porcentaje
}: CategoryCardProps) {
  const { theme } = useTheme()
  const [evaluaciones, setEvaluaciones] = useState<GradeData[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    score: '',
    max_score: '',
    graded_at: '',
    notes: '',
    calendar_event_id: '',
    event_type: ''
  })
  const [datePickerVisible, setDatePickerVisible] = useState(false)

  useEffect(() => {
    loadEvaluaciones()
  }, [])

  const loadEvaluaciones = async () => {
    setLoading(true)
    try {
      console.log('🟡 CategoryCard: Cargando evaluaciones...', { classId, categoryId })
      const allGrades = await gradesService.getGrades(classId)
      const filtradas = allGrades.filter(g => g.category_id === categoryId)
      setEvaluaciones(filtradas)
      console.log('✅ Evaluaciones filtradas:', filtradas.length)
    } catch (error: any) {
      console.error('❌ Error al cargar evaluaciones:', error)
      Alert.alert('Error', error.message || 'No se pudieron cargar las calificaciones')
    } finally {
      setLoading(false)
    }
  }

  const validateEvaluation = (data: typeof formData): string | null => {
    const score = parseFloat(data.score)
    const max = parseFloat(data.max_score)

    if (!data.title.trim()) return 'El título es obligatorio'
    if (!data.graded_at) return 'Selecciona una fecha'
    if (isNaN(score) || score < 0) return 'La nota debe ser válida'
    if (isNaN(max) || max <= 0) return 'La nota máxima debe ser mayor que 0'
    if (score > max) return 'La nota no puede superar la nota máxima'
    return null
  }

  const handleConfirmDate = (date: Date) => {
    setFormData(prev => ({ ...prev, graded_at: date.toISOString() }))
    setDatePickerVisible(false)
  }

  const handleSubmit = async () => {
    const errorMsg = validateEvaluation(formData)
    if (errorMsg) {
      Alert.alert('Validación', errorMsg)
      return
    }

    const payload = {
      class_id: classId,
      category_id: categoryId,
      title: formData.title.trim(),
      description: formData.description || undefined,
      score: parseFloat(formData.score),
      max_score: parseFloat(formData.max_score),
      graded_at: formData.graded_at,
      notes: formData.notes || undefined,
      event_type: formData.event_type || undefined,
      calendar_event_id: formData.calendar_event_id || undefined
    }

    try {
      console.log('🟡 Enviando nueva evaluación:', payload)
      const nueva = await gradesService.createGrade(payload)
      console.log('✅ Evaluación creada correctamente', nueva)
      setEvaluaciones(prev => [...prev, nueva])
      setFormVisible(false)
      setFormData({
        title: '',
        description: '',
        score: '',
        max_score: '',
        graded_at: '',
        notes: '',
        calendar_event_id: '',
        event_type: ''
      })
    } catch (error: any) {
      console.error('❌ Error al guardar evaluación', error)
      Alert.alert('Error', error.message || 'No se pudo guardar la evaluación')
    }
  }

  const GradeItem = ({ ev }: { ev: GradeData }) => (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        marginTop: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border
      }}
    >
      <ThemedText variant="body" style={{ fontWeight: 'bold' }}>
        {ev.title || ev.description || '—'}
      </ThemedText>
      <ThemedText>
        Nota: {ev.score} / {ev.max_score}
      </ThemedText>
      <ThemedText>
        Fecha: {new Date(ev.graded_at!).toLocaleDateString()}
      </ThemedText>
      {ev.notes && <ThemedText color="secondary">{ev.notes}</ThemedText>}
    </View>
  )

  const EvaluationForm = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
        <ThemedInput
          label="Título de la evaluación"
          value={formData.title}
          onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
        />
        <ThemedInput
          label="Nota obtenida"
          value={formData.score}
          keyboardType="numeric"
          onChangeText={text => setFormData(prev => ({ ...prev, score: text }))}
        />
        <ThemedInput
          label="Nota máxima"
          value={formData.max_score}
          keyboardType="numeric"
          onChangeText={text => setFormData(prev => ({ ...prev, max_score: text }))}
        />
        <ThemedInput
          label="Descripción"
          value={formData.description}
          onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
          multiline
        />
        <ThemedInput
          label="Notas (opcional)"
          value={formData.notes}
          onChangeText={text => setFormData(prev => ({ ...prev, notes: text }))}
          multiline
        />
        <ThemedButton
          title={
            formData.graded_at
              ? new Date(formData.graded_at).toLocaleDateString()
              : 'Seleccionar fecha'
          }
          variant="outline"
          onPress={() => setDatePickerVisible(true)}
        />
        <DateTimePickerModal
          isVisible={datePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisible(false)}
        />
        <ThemedButton title="Guardar evaluación" onPress={handleSubmit} />
      </View>
    </KeyboardAvoidingView>
  )

  return (
    <ThemedCard variant="outlined" padding="medium" style={{ marginTop: theme.spacing.md }}>
      <ThemedText variant="h3">{nombre}</ThemedText>
      <ThemedText>Porcentaje: {porcentaje}%</ThemedText>

      <ThemedButton
        title={formVisible ? 'Cancelar' : 'Agregar evaluación'}
        variant={formVisible ? 'outline' : 'primary'}
        onPress={() => setFormVisible(v => !v)}
        style={{ marginTop: theme.spacing.sm }}
      />

      {formVisible && <EvaluationForm />}

      {loading ? (
        <ActivityIndicator style={{ marginTop: theme.spacing.md }} color={theme.colors.primary} />
      ) : (
        <>
          {evaluaciones.map(ev => (
            <GradeItem key={ev.id} ev={ev} />
          ))}

          {evaluaciones.length === 0 && (
            <ThemedText
              variant="bodySmall"
              color="secondary"
              style={{ marginTop: theme.spacing.sm }}
            >
              Aún no hay evaluaciones en esta categoría.
            </ThemedText>
          )}
        </>
      )}
    </ThemedCard> )}
