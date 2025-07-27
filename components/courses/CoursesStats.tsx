"use client"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText } from "@/components/ui/ThemedComponents"
import type { ClassData } from "@/database/services/courseService"
import { useTheme } from "@/hooks/useTheme"
import { View } from "react-native"

interface CoursesStatsProps {
  courses: ClassData[]
}

export default function CoursesStats({ courses }: CoursesStatsProps) {
  const { theme } = useTheme()

  // Calcular estadísticas
  const totalCourses = courses.length
  const totalHoursPerWeek = courses.reduce((total, course) => {
    // Estimar horas por semana basado en créditos (cada crédito = ~3 horas)
    return total + (course.credits || 0) * 3
  }, 0)

  const stats = [
    {
      icon: "book",
      value: totalCourses.toString(),
      label: "Clases",
      color: theme.colors.primary,
    },
    {
      icon: "clock",
      value: totalHoursPerWeek.toString(),
      label: "Hrs/semana",
      color: theme.colors.success || "#4CAF50",
    },
  ]

  return (
    <View
      style={{
        flexDirection: "row",
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}
    >
      {stats.map((stat, index) => (
        <ThemedCard
          key={index}
          variant="elevated"
          padding="medium"
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: theme.spacing.lg,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${stat.color}15`,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: theme.spacing.sm,
            }}
          >
            <IconSymbol name={stat.icon as any} size={24} color={stat.color} />
          </View>

          <ThemedText
            variant="h1"
            style={{
              fontSize: 32,
              fontWeight: "bold",
              marginBottom: theme.spacing.xs,
            }}
          >
            {stat.value}
          </ThemedText>

          <ThemedText variant="body" color="secondary">
            {stat.label}
          </ThemedText>
        </ThemedCard>
      ))}
    </View>
  )
}
