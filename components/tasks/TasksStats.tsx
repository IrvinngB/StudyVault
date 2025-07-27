"use client"

import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { TasksStats } from "@/database/services/tasksService"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"

interface TasksStatsProps {
  stats: TasksStats | null
  estimatedHours?: number
}

export function TasksStatsComponent({ stats, estimatedHours = 12 }: TasksStatsProps) {
  const { theme } = useTheme()

  if (!stats) return null

  const statsData = [
    {
      icon: "alert-circle",
      iconColor: theme.colors.error,
      value: stats.total - stats.completed,
      label: "Pendientes",
      backgroundColor: theme.isDark ? theme.colors.surface : "#FFF5F5",
    },
    {
      icon: "checkmark-circle",
      iconColor: theme.colors.success,
      value: stats.completed,
      label: "Completadas",
      backgroundColor: theme.isDark ? theme.colors.surface : "#F0FFF4",
    },
    {
      icon: "time",
      iconColor: theme.colors.info,
      value: `${estimatedHours}h`,
      label: "Estimadas",
      backgroundColor: theme.isDark ? theme.colors.surface : "#F0F8FF",
    },
  ]

  return (
    <ThemedView
      style={{
        flexDirection: "row",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
      }}
    >
      {statsData.map((stat, index) => (
        <ThemedView
          key={index}
          style={{
            flex: 1,
            backgroundColor: stat.backgroundColor,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.colors.border,
            ...theme.shadows.small,
          }}
        >
          <ThemedView
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.background,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: theme.spacing.sm,
              ...theme.shadows.small,
            }}
          >
            <Ionicons name={stat.icon as any} size={20} color={stat.iconColor} />
          </ThemedView>

          <ThemedText
            variant="h2"
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 2,
            }}
          >
            {stat.value}
          </ThemedText>

          <ThemedText
            variant="caption"
            color="secondary"
            style={{
              fontSize: 12,
              textAlign: "center",
            }}
          >
            {stat.label}
          </ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  )
}
