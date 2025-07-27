"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText } from "@/components/ui/ThemedComponents"
import type { ClassData } from "@/database/services/courseService"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { TouchableOpacity, View } from "react-native"

interface EnhancedCourseCardProps {
  course: ClassData
}

export default function EnhancedCourseCard({ course }: EnhancedCourseCardProps) {
  const { theme } = useTheme()
  const { tasks } = useTasks()
  const [courseProgress, setCourseProgress] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)

  useEffect(() => {
    // Filtrar tareas de este curso
    const courseTasks = tasks.filter((task) => task.class_id === course.id)
    const completedTasks = courseTasks.filter((task) => task.completed)

    const total = courseTasks.length
    const completed = completedTasks.length
    const pending = total - completed

    setTotalTasks(total)
    setPendingTasks(pending)
    setCourseProgress(total > 0 ? Math.round((completed / total) * 100) : 0)
  }, [tasks, course.id])

  const handlePress = () => {
    if (course.id) {
      router.push(`/courses/${course.id}` as any)
    }
  }

  // Simular próxima clase (esto debería venir del calendario)
  const getNextClass = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Simular horarios basados en el día de la semana
    const dayOfWeek = today.getDay()
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      // Lun, Mié, Vie
      return "Hoy 14:00"
    } else {
      return "Mañana 10:00"
    }
  }

  // Simular horario de clases
  const getClassSchedule = () => {
    return "Lun, Mié, Vie 14:00-15:30"
  }

  // Simular aula
  const getClassroom = () => {
    const classrooms = ["Aula 205", "Aula 101", "Lab 301", "Aula 150"]
    return classrooms[Math.floor(Math.random() * classrooms.length)]
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.md }}>
        {/* Header con nombre del curso y menú */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: course.color || theme.colors.primary,
                borderRadius: 6,
                marginRight: theme.spacing.sm,
              }}
            />
            <View style={{ flex: 1 }}>
              <ThemedText
                variant="h2"
                style={{
                  fontWeight: "600",
                  marginBottom: theme.spacing.xs,
                }}
              >
                {course.name}
              </ThemedText>
              {course.instructor && (
                <ThemedText variant="body" color="secondary">
                  {course.instructor}
                </ThemedText>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={{
              padding: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
            }}
          >
            <IconSymbol name="ellipsis" size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Horario y ubicación */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <IconSymbol name="clock" size={16} color={theme.colors.secondary} />
            <ThemedText variant="body" color="secondary" style={{ marginLeft: theme.spacing.xs }}>
              {getClassSchedule()}
            </ThemedText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconSymbol name="location" size={16} color={theme.colors.secondary} />
            <ThemedText variant="body" color="secondary" style={{ marginLeft: theme.spacing.xs }}>
              {getClassroom()}
            </ThemedText>
          </View>
        </View>

        {/* Próxima clase */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing.md,
          }}
        >
          <ThemedText variant="body" color="secondary">
            Próxima clase:
          </ThemedText>
          <ThemedText variant="body" style={{ fontWeight: "600" }}>
            {getNextClass()}
          </ThemedText>
        </View>

        {/* Progreso del curso */}
        <View style={{ marginBottom: theme.spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.spacing.xs,
            }}
          >
            <ThemedText variant="body" color="secondary">
              Progreso del curso
            </ThemedText>
            <ThemedText variant="body" style={{ fontWeight: "600" }}>
              {courseProgress}%
            </ThemedText>
          </View>

          <View
            style={{
              height: 8,
              backgroundColor: theme.colors.border,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${courseProgress}%`,
                backgroundColor: course.color || theme.colors.primary,
                borderRadius: 4,
              }}
            />
          </View>
        </View>

        {/* Estadísticas del curso */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <ThemedText variant="h3" style={{ fontWeight: "600" }}>
              {pendingTasks}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Tareas
            </ThemedText>
          </View>

          <View style={{ alignItems: "center" }}>
            <ThemedText variant="h3" style={{ fontWeight: "600" }}>
              {Math.floor(Math.random() * 20) + 5}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Notas
            </ThemedText>
          </View>

          <TouchableOpacity
            onPress={() => {
              if (course.id) {
                router.push(`/grades/${course.id}` as any)
              }
            }}
            style={{
              backgroundColor: theme.colors.primary,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <ThemedText variant="body" style={{ color: "white", fontWeight: "600" }}>
              Notas
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  )
}
