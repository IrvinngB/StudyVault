import React, { useState, useEffect } from 'react'
import {
  View,
  ActivityIndicator,
  Alert
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ThemedCard,
  ThemedText,
  ThemedButton
} from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { gradesService } from '@/database/services/gradesService'
import type { GradeData } from '@/database/services/gradesService'
import EvaluationFormModal from '@/components/grades/EvaluationForm'

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
    max_score: '', // se obtiene automáticamente
    graded_at: '',
    calendar_event_id: '',
    event_type: ''
  })

  const [datePickerVisible, setDatePickerVisible] = useState(false)

  useEffect(() => {
    loadEvaluaciones()
  }, [])

  useEffect(() => {
    const fetchMaxScore = async () => {
      const key = `gradingScale:${classId}`
      const stored = await AsyncStorage.getItem(key)
      if (stored) {
        setFormData(prev => ({ ...prev, max_score: stored }))
      }
    }

    if (formVisible) {
      fetchMaxScore()
    }
  }, [formVisible])

  const loadEvaluaciones = async () => {
    setLoading(true)
    try {
      const allGrades = await gradesService.getGrades(classId)
      const filtradas = allGrades.filter(g => g.category_id === categoryId)
      setEvaluaciones(filtradas)
      await syncEvaluacionesConEscala(filtradas)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron cargar las calificaciones')
    } finally {
      setLoading(false)
    }
  }

  const syncEvaluacionesConEscala = async (lista: GradeData[]) => {
    const key = `gradingScale:${classId}`
    const stored = await AsyncStorage.getItem(key)
    const nuevaEscala = stored ? Number(stored) : null
    if (!nuevaEscala) return

    const actualizables = lista.filter(ev => ev.max_score !== nuevaEscala)
    for (const ev of actualizables) {
      try {
        await gradesService.patchGrade(ev.id, { max_score: nuevaEscala })
      } catch (err) {
        console.warn(`❌ No se pudo actualizar la escala de ${ev.id}:`, err)
      }
    }
  }

  const validateEvaluation = (data: typeof formData): string | null => {
    const score = parseFloat(data.score)
    const max = parseFloat(data.max_score)

    if (!data.title.trim()) return 'El título es obligatorio'
    if (!data.graded_at) return 'Selecciona una fecha'
    if (isNaN(score) || score < 0) return 'La nota debe ser válida'
    if (isNaN(max)) return 'La escala de calificación no está definida'
    if (score > max) return `La nota no puede superar el máximo (${max})`

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
      event_type: formData.event_type || undefined,
      calendar_event_id: formData.calendar_event_id || undefined
    }

    try {
      const nueva = await gradesService.createGrade(payload)
      setEvaluaciones(prev => [...prev, nueva])
      setFormVisible(false)
      setFormData({
        title: '',
        description: '',
        score: '',
        max_score: '',
        graded_at: '',
        calendar_event_id: '',
        event_type: ''
      })
    } catch (error: any) {
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
      <ThemedText>Nota: {ev.score} / {ev.max_score}</ThemedText>
      <ThemedText>Fecha: {new Date(ev.graded_at!).toLocaleDateString()}</ThemedText>
    </View>
  )

  return (
    <>
      <ThemedCard variant="outlined" padding="medium" style={{ marginTop: theme.spacing.md }}>
        <ThemedText variant="h3">{nombre}</ThemedText>
        <ThemedText>Porcentaje: {porcentaje}%</ThemedText>

        <ThemedButton
          title="Agregar evaluación"
          variant="primary"
          onPress={() => setFormVisible(true)}
          style={{ marginTop: theme.spacing.sm }}
        />

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
      </ThemedCard>

      <EvaluationFormModal
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        datePickerVisible={datePickerVisible}
        setDatePickerVisible={setDatePickerVisible}
        onConfirmDate={handleConfirmDate}
      />
    </>
  )
}
