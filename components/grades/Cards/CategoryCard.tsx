import React, { useState, useEffect } from 'react'
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  ThemedCard,
  ThemedText,
  ThemedButton
} from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'
import { gradesService } from '@/database/services/gradesService'
import { categoryService } from '@/database/services/categoryService'
import type { GradeData } from '@/database/services/gradesService'
import EvaluationFormModal from '@/components/grades/Forms/EvaluationForm'
import EditCategoryForm from '@/components/grades/Forms/EditCategoryForm'
import EditEvaluationForm from '@/components/grades/Forms/EditEvaluationForm'

interface CategoryCardProps {
  classId: string
  categoryId: string
  nombre: string
  porcentaje: number
  onDelete?: (categoryId: string) => void
  onUpdate?: () => void
}

export default function CategoryCard({
  classId,
  categoryId,
  nombre,
  porcentaje,
  onDelete,
  onUpdate
}: CategoryCardProps) {
  const { theme } = useTheme()

  const [evaluaciones, setEvaluaciones] = useState<GradeData[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editFormVisible, setEditFormVisible] = useState(false)
  const [editEvaluationId, setEditEvaluationId] = useState<string | null>(null)
  const [editEvaluationData, setEditEvaluationData] = useState<{
    title: string
    description?: string
    score: number
    max_score: number
    graded_at: string
  } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    score: '',
    max_score: '',
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

  const reload = async () => {
  await loadEvaluaciones()
}


  const loadEvaluaciones = async () => {
    setLoading(true)
    try {
      const allGrades = await gradesService.getGrades(classId)
      const filtradas = allGrades.filter(g => g.category_id === categoryId)
      setEvaluaciones(filtradas)
      await syncEvaluacionesConEscala(filtradas)
    } catch (error: any) {
      console.error('❌ Error al cargar evaluaciones:', error)
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
        console.warn(`❌ Error al actualizar escala de ${ev.id}:`, err)
      }
    }
  }

  const handleConfirmDate = (date: Date) => {
    setFormData(prev => ({ ...prev, graded_at: date.toISOString() }))
    setDatePickerVisible(false)
  }

  const validateEvaluation = (data: typeof formData): string | null => {
    const score = parseFloat(data.score)
    const max = parseFloat(data.max_score)

    if (!data.title.trim()) return 'El título es obligatorio'
    if (!data.graded_at) return 'Selecciona una fecha'
    if (isNaN(score) || score < 0) return 'La nota debe ser válida'
    if (isNaN(max)) return 'La escala no está definida'
    if (score > max) return `La nota no puede superar el máximo (${max})`

    return null
  }

  const handleSubmit = async () => {
    const errorMsg = validateEvaluation(formData)
    if (errorMsg) {
      console.error('❌ Validación:', errorMsg)
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

      onUpdate?.()
    } catch (error: any) {
      console.error('❌ Error al guardar evaluación:', error)
    }
  }

  const GradeItem = ({ ev }: { ev: GradeData }) => (
    <TouchableOpacity
      onPress={() => {
        setEditEvaluationId(ev.id)
        setEditEvaluationData({
          title: ev.title ?? '',
          description: ev.description ?? '',
          score: ev.score,
          max_score: ev.max_score,
          graded_at: ev.graded_at ?? ''
        })
      }}
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
    </TouchableOpacity>
  )

  return (
    <>
      <ThemedCard variant="outlined" padding="medium" style={{ marginTop: theme.spacing.md, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.borderRadius.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <TouchableOpacity onPress={() => setEditFormVisible(true)}>
            <ThemedText variant="button" style={{ fontSize: 12 }}>
              Editar
            </ThemedText>
          </TouchableOpacity>
        </View>

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

      <Modal
        visible={editFormVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEditFormVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.md,
          }}
        >
          <View style={{ width: '100%' }}>
            <EditCategoryForm
              categoryId={categoryId}
              currentName={nombre}
              currentPercentage={porcentaje}
              onCancel={() => setEditFormVisible(false)}
              onSuccess={() => {
                setEditFormVisible(false)
                onDelete?.(categoryId)
              }}
              onUpdate={onUpdate}
            />
          </View>
        </View>
      </Modal>

      {editEvaluationId && editEvaluationData && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setEditEvaluationId(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing.md
            }}
          >
            <View style={{ width: '100%' }}>
              <EditEvaluationForm
                categoryId={categoryId}
                evaluationId={editEvaluationId}
                initialData={editEvaluationData}
                onCancel={() => setEditEvaluationId(null)}
                onSuccess={() => {
                  setEditEvaluationId(null)
                  reload()
                }}
                onUpdate={reload}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  )
}
