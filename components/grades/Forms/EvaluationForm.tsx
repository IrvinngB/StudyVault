import React, { useEffect } from 'react'
import {
  View,
  ScrollView,
  Modal
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { ThemedText, ThemedInput, ThemedButton, ThemedCard } from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'

interface Props {
  visible: boolean
  onCancel: () => void
  onSubmit: () => void
  formData: any
  setFormData: (fn: (prev: any) => any) => void
  datePickerVisible: boolean
  setDatePickerVisible: (v: boolean) => void
  onConfirmDate: (date: Date) => void
}

export default function EvaluationFormModal({
  visible,
  onCancel,
  onSubmit,
  formData,
  setFormData,
  datePickerVisible,
  setDatePickerVisible,
  onConfirmDate
}: Props) {
  const { theme } = useTheme()

  useEffect(() => {
    const fetchMaxScore = async () => {
      const stored = await AsyncStorage.getItem('defaultMaxScore')
      if (stored) {
        setFormData(prev => ({ ...prev, max_score: Number(stored) }))
      }
    }

    if (visible) {
      fetchMaxScore()
    }
  }, [visible])

  return (
    <Modal animationType="slide" transparent={false} visible={visible}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: theme.spacing.md,
          backgroundColor: theme.colors.background
        }}
      >
        <ThemedCard variant="outlined" padding="large">
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            ➕ Nueva Evaluación
          </ThemedText>

          <View style={{ gap: theme.spacing.md }}>
            <ThemedInput
              label="Título"
              value={formData.title}
              onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
            />
            <ThemedInput
              label="Nota obtenida"
              value={formData.score}
              keyboardType="numeric"
              onChangeText={text => setFormData(prev => ({ ...prev, score: text }))}
            />
            {/* Nota máxima ahora está oculta pero se actualiza internamente */}
            <ThemedInput
              label="Descripción"
              value={formData.description}
              onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
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
              onConfirm={onConfirmDate}
              onCancel={() => setDatePickerVisible(false)}
            />
            <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
              <ThemedButton title="Cancelar" variant="outline" onPress={onCancel} style={{ flex: 1 }} />
              <ThemedButton title="Guardar" variant="primary" onPress={onSubmit} style={{ flex: 1 }} />
            </View>
          </View>
        </ThemedCard>
      </ScrollView>
    </Modal>
  )
}
