import React from 'react'
import { View, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemedCard, ThemedText, ThemedButton } from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'

interface Props {
  classId: string // ← Se añade para guardar escala por clase
  onSelect: (max: number) => void
}

export default function GradeScaleSelector({ classId, onSelect }: Props) {
  const { theme } = useTheme()

  const handleSelect = (max: number) => {
    Alert.alert(
      'Confirmación',
      `¿Deseas usar una escala de 0 a ${max} como base para tus evaluaciones?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const key = `gradingScale:${classId}`
              await AsyncStorage.setItem(key, String(max))
              onSelect(max)
            } catch (error) {
              console.error('❌ Error al guardar la escala en AsyncStorage:', error)
              Alert.alert('Error', 'No se pudo guardar la escala seleccionada')
            }
          }
        }
      ]
    )
  }

  return (
    <ThemedCard variant="outlined" padding="large" style={{ marginVertical: theme.spacing.md }}>
      <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        🧮 ¿Cómo evalúas tus clases?
      </ThemedText>

      <ThemedText variant="body" style={{ marginBottom: theme.spacing.md }}>
        Elige el sistema de calificación que utilizas. Esta escala será usada por defecto en esta clase.
      </ThemedText>

      <View style={{ gap: theme.spacing.sm }}>
        <ThemedButton title="Escala de 0 a 5" onPress={() => handleSelect(5)} />
        <ThemedButton title="Escala de 0 a 10" onPress={() => handleSelect(10)} />
        <ThemedButton title="Escala de 0 a 100" onPress={() => handleSelect(100)} />
      </View>
    </ThemedCard>
  )
}
