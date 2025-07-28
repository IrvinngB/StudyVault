"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText } from "@/components/ui/ThemedComponents"
import type { ClassData } from "@/database/services/courseService"
import { useCalendar } from "@/hooks/useCalendar"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { TouchableOpacity, View } from "react-native"

interface EnhancedCourseCardProps {
  course: ClassData
}

interface CourseScheduleInfo {
  nextClass: string
  schedule: string
  classroom: string
}

export default function EnhancedCourseCard({ course }: EnhancedCourseCardProps) {
  const { theme } = useTheme()
  const { tasks } = useTasks()
  const { events } = useCalendar()
  const [courseProgress, setCourseProgress] = useState(0)
  const [pendingTasks, setPendingTasks] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [notesCount, setNotesCount] = useState(0)
  const [scheduleInfo, setScheduleInfo] = useState<CourseScheduleInfo>({
    nextClass: "No programada",
    schedule: "Sin horario",
    classroom: "Por definir",
  })

  useEffect(() => {
    calculateCourseStats()
    calculateScheduleInfo()
  }, [tasks, events, course.id])

  const calculateCourseStats = () => {
    // Filtrar tareas de este curso
    const courseTasks = tasks.filter((task) => task.class_id === course.id)
    const completedTasks = courseTasks.filter((task) => task.status === "completed")

    const total = courseTasks.length
    const completed = completedTasks.length
    const pending = total - completed

    setTotalTasks(total)
    setPendingTasks(pending)
    setCourseProgress(total > 0 ? Math.round((completed / total) * 100) : 0)

    // Simular conteo de notas (esto vendría del servicio de notas real)
    setNotesCount(Math.floor(Math.random() * 15) + 5)
  }

  const calculateScheduleInfo = () => {
    if (!course.id) return

    // Buscar eventos de calendario para este curso que sean clases recurrentes
    const courseEvents = events.filter((event) => event.class_id === course.id && event.event_type === "class")

    if (courseEvents.length === 0) {
      return
    }

    // Encontrar la próxima clase
    const now = new Date()
    const upcomingClasses = courseEvents
      .filter((event) => new Date(event.start_datetime) > now)
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())

    let nextClass = "No programada"
    if (upcomingClasses.length > 0) {
      const nextEvent = upcomingClasses[0]
      const nextDate = new Date(nextEvent.start_datetime)
      const today = new Date()

      if (nextDate.toDateString() === today.toDateString()) {
        nextClass = `Hoy ${nextDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      } else {
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        if (nextDate.toDateString() === tomorrow.toDateString()) {
          nextClass = `Mañana ${nextDate.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        } else {
          const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays <= 7) {
            const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
            nextClass = `${dayNames[nextDate.getDay()]} ${nextDate.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          } else {
            nextClass = nextDate.toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        }
      }
    }

    // Calcular horario regular basado en los eventos existentes
    let schedule = "Sin horario"
    if (courseEvents.length > 0) {
      // Agrupar por día de la semana y hora
      const scheduleMap = new Map<number, Set<string>>()

      courseEvents.forEach((event) => {
        const eventDate = new Date(event.start_datetime)
        const endDate = new Date(event.end_datetime)
        const dayOfWeek = eventDate.getDay()
        const timeRange = `${eventDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })}-${endDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })}`

        if (!scheduleMap.has(dayOfWeek)) {
          scheduleMap.set(dayOfWeek, new Set())
        }
        scheduleMap.get(dayOfWeek)?.add(timeRange)
      })

      // Construir string de horario
      const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      const scheduleParts: string[] = []

      scheduleMap.forEach((times, dayIndex) => {
        const uniqueTimes = Array.from(times)
        if (uniqueTimes.length > 0) {
          scheduleParts.push(`${dayNames[dayIndex]} ${uniqueTimes[0]}`)
        }
      })

      if (scheduleParts.length > 0) {
        schedule = scheduleParts.join(", ")
      }
    }

    // Obtener aula más común
    let classroom = "Por definir"
    if (courseEvents.length > 0) {
      const locations = courseEvents
        .map((event) => event.location)
        .filter((location) => location && location.trim() !== "")

      if (locations.length > 0) {
        // Encontrar la ubicación más frecuente
        const locationCount = locations.reduce(
          (acc, location) => {
            acc[location!] = (acc[location!] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        classroom = Object.entries(locationCount).sort(([, a], [, b]) => b - a)[0][0]
      }
    }

    setScheduleInfo({
      nextClass,
      schedule,
      classroom,
    })
  }

  const handlePress = () => {
    if (course.id) {
      router.push(`/courses/${course.id}` as any)
    }
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
          <View style={{ flexDirection: "row", alignItems: "flex-start", flex: 1, marginRight: theme.spacing.sm }}>
            <IconSymbol name="clock" size={16} color={theme.colors.secondary} style={{ marginTop: 2 }} />
            <ThemedText
              variant="body"
              color="secondary"
              style={{
                marginLeft: theme.spacing.xs,
                flex: 1,
                fontSize: 12,
              }}
            >
              {scheduleInfo.schedule}
            </ThemedText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconSymbol name="location" size={16} color={theme.colors.secondary} />
            <ThemedText
              variant="body"
              color="secondary"
              style={{
                marginLeft: theme.spacing.xs,
                fontSize: 12,
              }}
            >
              {scheduleInfo.classroom}
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
            {scheduleInfo.nextClass}
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
              Porcentaje de tareas completadas:
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
              Ver Notas
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  )
}
