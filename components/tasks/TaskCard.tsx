"use client"

import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { TaskWithEvent } from "@/database/services/tasksService"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"

interface TaskCardProps {
  task: TaskWithEvent
  onToggleCompletion: (task: TaskWithEvent) => void
}

export function TaskCard({ task, onToggleCompletion }: TaskCardProps) {
  const { theme } = useTheme()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return theme.colors.error
      case "medium":
        return theme.colors.warning
      case "low":
        return theme.colors.success
      default:
        return theme.colors.textMuted
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta"
      case "medium":
        return "Media"
      case "low":
        return "Baja"
      default:
        return "Media"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoy"
    if (diffDays === 1) return "Mañana"
    if (diffDays === -1) return "Ayer"
    if (diffDays < 0) {
      return `Hace ${Math.abs(diffDays)} días`
    }
    return `En ${diffDays} días`
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Sin fecha"
    const date = new Date(dateString)
    const day = date.toLocaleDateString()
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return `${day} · ${time}`
  }

  const getEstimatedTime = () => {
    // Simulamos tiempo estimado basado en el tipo de tarea
    if (task.event_type === "exam") return "3 horas"
    if (task.event_type === "assignment") return "2 horas"
    return "1 hora"
  }

  const taskName = task.task_title || task.event_title || "(Sin título)"
  const className =
    task.class_name && !/^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(task.class_name)
      ? task.class_name
      : "Materia"

  const isCompleted = task.status === "completed"

  return (
    <ThemedView
      variant="surface"
      style={{
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadows.small,
      }}
    >
      <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => {
            console.log('Checkbox pressed for task:', task);
            // Si no tiene task_id pero tiene grade_id, lo pasamos como task_id y value: 0
            if (!task.task_id && task.grade_id) {
              const updatedTask = { ...task, task_id: task.grade_id, value: 0 };
              onToggleCompletion(updatedTask);
            } else if (task.grade_id) {
              const updatedTask = { ...task, value: 0 };
              onToggleCompletion(updatedTask);
            } else {
              onToggleCompletion(task);
            }
          }}
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: isCompleted ? theme.colors.success : theme.colors.border,
            backgroundColor: isCompleted ? theme.colors.success : "transparent",
            justifyContent: "center",
            alignItems: "center",
            marginRight: theme.spacing.md,
            marginTop: 2,
          }}
        >
          {isCompleted && <Ionicons name="checkmark" size={16} color="white" />}
        </TouchableOpacity>

        {/* Task Content */}
        <ThemedView style={{ flex: 1 }}>
          {/* Task Title and Priority */}
          <ThemedView
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: theme.spacing.xs,
            }}
          >
            <ThemedText
              variant="h3"
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: "600",
                textDecorationLine: isCompleted ? "line-through" : "none",
                opacity: isCompleted ? 0.6 : 1,
              }}
            >
              {taskName}
            </ThemedText>

            <ThemedView
              style={{
                backgroundColor: getPriorityColor(task.priority),
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 4,
                borderRadius: theme.borderRadius.sm,
                marginLeft: theme.spacing.sm,
              }}
            >
              <ThemedText
                variant="caption"
                style={{
                  color: "white",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {getPriorityLabel(task.priority)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Subject */}
          <ThemedText
            variant="body"
            color="primary"
            style={{
              fontSize: 14,
              marginBottom: theme.spacing.sm,
              opacity: isCompleted ? 0.6 : 1,
            }}
          >
            {className}
          </ThemedText>

          {/* Description */}
          {task.task_description && (
            <ThemedText
              variant="body"
              style={{
                fontSize: 14,
                marginBottom: theme.spacing.sm,
                opacity: isCompleted ? 0.6 : 1,
              }}
            >
              {task.task_description}
            </ThemedText>
          )}

          {/* Fecha y hora de inicio */}
          <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
            <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="calendar" size={14} color={theme.colors.primary} />
              <ThemedText
                variant="caption"
                color="primary"
                style={{ fontSize: 12, marginLeft: 4, opacity: isCompleted ? 0.6 : 1 }}
              >
                {formatDateTime(task.start_datetime)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  )
}
