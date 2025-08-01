import { ThemedCard, ThemedText } from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { View } from 'react-native'

interface CourseHeaderCardProps {
  nombre: string
  codigo?: string
  creditos?: number
  escala: number
  notaActual: number
  notaFinal: number
}

export default function CourseHeaderCard({
  nombre,
  codigo,
  creditos,
  escala,
  notaActual,
  notaFinal
}: CourseHeaderCardProps) {
  const { theme } = useTheme()

  return (
    <ThemedCard
      variant="elevated"
      padding="large"
      style={{
        alignSelf: 'center',
        marginBottom: theme.spacing.lg,
        width: '93%'
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        {/* 📘 Info del curso a la izquierda */}
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <ThemedText
            variant="h2"
            style={{ fontWeight: 'bold', marginBottom: theme.spacing.xs }}
          >
            {nombre}
          </ThemedText>
          {codigo && (
            <ThemedText variant="bodySmall" color="secondary">
              Código: {codigo}
            </ThemedText>
          )}
          {creditos !== undefined && (
            <ThemedText variant="bodySmall" color="secondary">
              Créditos: {creditos}
            </ThemedText>
          )}
          <ThemedText variant="bodySmall" color="secondary">
            Escala: {escala}
          </ThemedText>
        </View>

        {/* 🎯 Notas a la derecha */}
        <View style={{ alignItems: 'flex-end', flexShrink: 1, maxWidth: '45%' }}>
          <View style={{ alignItems: 'flex-end', marginBottom: theme.spacing.sm }}>
            <ThemedText
              variant="h1"
              style={{
                fontWeight: 'bold',
                color: theme.colors.primary,
                marginBottom: theme.spacing.xs
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {notaActual.toFixed(1)}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Nota actual
            </ThemedText>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText
              variant="h3"
              style={{
                fontWeight: 'bold',
                color: theme.colors.secondary,
                marginBottom: theme.spacing.xs
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
          
            </ThemedText>
            
          </View>
        </View>
      </View>
    </ThemedCard>
  )
}
