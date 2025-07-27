"use client"

import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { TasksStats } from "@/database/services/tasksService"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import { Alert } from "react-native"

interface TasksQuickActionsProps {
  stats: TasksStats | null
  refreshing: boolean
  onCreateTask: () => void
  onRefreshTasks: () => void
}

export function TasksQuickActions({ stats, refreshing, onCreateTask, onRefreshTasks }: TasksQuickActionsProps) {
  const { theme } = useTheme()

  const handleViewCalendar = () => {
    Alert.alert("Calendario", "Función próximamente disponible")
  }

  const handleViewStats = () => {
    Alert.alert("Estadísticas", `Tasa de completación: ${stats?.completion_rate || 0}%`)
  }

  return (
    <ThemedCard variant="elevated" padding="medium" style={{ marginTop: theme.spacing.lg }}>
      <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
        ⚡ Acciones Rápidas
      </ThemedText>

      <ThemedView style={{ gap: theme.spacing.sm }}>
        <ThemedView style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <ThemedButton
            title="Nueva Tarea"
            variant="primary"
            icon={<Ionicons name="add-circle" size={18} color="white" />}
            style={{ flex: 1 }}
            onPress={onCreateTask}
          />
          <ThemedButton
            title="Actualizar"
            variant="secondary"
            icon={<Ionicons name="refresh" size={18} color="white" />}
            style={{ flex: 1 }}
            onPress={onRefreshTasks}
            disabled={refreshing}
          />
        </ThemedView>

        <ThemedView style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <ThemedButton
            title="Ver Calendario"
            variant="outline"
            icon={<Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />}
            style={{ flex: 1 }}
            onPress={handleViewCalendar}
          />
          <ThemedButton
            title="Estadísticas"
            variant="ghost"
            icon={<Ionicons name="bar-chart" size={18} color={theme.colors.primary} />}
            style={{ flex: 1 }}
            onPress={handleViewStats}
          />
        </ThemedView>
      </ThemedView>
    </ThemedCard>
  )
}
