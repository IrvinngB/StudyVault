import React from 'react'
import { View } from 'react-native'
import { ThemedCard, ThemedText } from '@/components/ui/ThemedComponents'
import { useTheme } from '@/hooks/useTheme'

interface Evaluacion {
  nota: number
  notaMaxima: number
}

interface CategoriaResumen {
  nombre: string
  porcentaje: number
  evaluaciones: Evaluacion[]
}

interface GradeSummaryCardProps {
  categorias: CategoriaResumen[]
  escala: number
}

export default function GradeSummaryCard({ categorias, escala }: GradeSummaryCardProps) {
  const { theme } = useTheme()

  const calcularPorcentajeCategoria = (cat: CategoriaResumen): number => {
    if (cat.evaluaciones.length === 0) return 0

    const suma = cat.evaluaciones.reduce((acc, ev) => {
      const porcentajeRelativo = ev.notaMaxima > 0 ? (ev.nota / ev.notaMaxima) : 0
      return acc + porcentajeRelativo
    }, 0)

    const promedio = suma / cat.evaluaciones.length
    const aporte = promedio * cat.porcentaje // ya está en escala 100
    return aporte
  }

  const resumenPorCategoria = categorias.map(cat => ({
    nombre: cat.nombre,
    porcentajeTotal: cat.porcentaje,
    porcentajeObtenido: calcularPorcentajeCategoria(cat)
  }))

  const notaFinal = resumenPorCategoria.reduce((acc, cat) => acc + cat.porcentajeObtenido, 0)

  return (
    <ThemedCard variant="outlined" padding="large" style={{ marginTop: theme.spacing.lg }}>
      <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
        📊 Resumen de Calificaciones
      </ThemedText>

      {resumenPorCategoria.map((cat, index) => (
        <View key={index} style={{ marginBottom: theme.spacing.sm }}>
          <ThemedText variant="body">
            {cat.nombre}: {cat.porcentajeObtenido.toFixed(1)}% / {cat.porcentajeTotal}%
          </ThemedText>
        </View>
      ))}

      <View style={{ marginTop: theme.spacing.md }}>
        <ThemedText variant="h3" color="primary">
          Nota final: {notaFinal.toFixed(2)} / 100
        </ThemedText>
      </View>
    </ThemedCard>
  )
}
