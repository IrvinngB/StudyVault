"use client"

import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { TaskWithEvent } from "@/database/services/tasksService"
import { useTheme } from "@/hooks/useTheme"
import { TaskCard } from "./TaskCard"

interface TasksListProps {
  tasks: TaskWithEvent[]
  loading: boolean
  onToggleTaskCompletion: (task: TaskWithEvent) => void
  activeTab: "tasks" | "exams"
}

export function TasksList({ tasks, loading, onToggleTaskCompletion, activeTab }: TasksListProps) {
  const { theme } = useTheme()

  // Filtrar por tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "exams") {
      return task.event_type === "exam" || task.event_type === "quiz"
    }
    return task.event_type !== "exam" && task.event_type !== "quiz"
  })

  // Ordenar: pendientes primero, completadas al final
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1
    if (a.status !== "completed" && b.status === "completed") return -1
    // Si ambos son iguales, ordenar por fecha
    return new Date(a.due_date || a.start_datetime).getTime() - new Date(b.due_date || b.start_datetime).getTime()
  })

  if (loading) {
    return (
      <ThemedView style={{ padding: theme.spacing.lg, alignItems: "center" }}>
        <ThemedText variant="body" color="secondary">
          Cargando tareas...
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView>
      {/* Section Header */}
      <ThemedText
        variant="h2"
        style={{
          fontSize: 20,
          fontWeight: "600",
          marginBottom: theme.spacing.md,
        }}
      >
        Tareas ({sortedTasks.length})
      </ThemedText>

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <ThemedView
          variant="surface"
          style={{
            padding: theme.spacing.xl,
            alignItems: "center",
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <ThemedText
            variant="body"
            color="secondary"
            style={{
              textAlign: "center",
              fontSize: 16,
            }}
          >
            {activeTab === "exams" ? "No tienes exámenes" : "No tienes tareas"}
          </ThemedText>
        </ThemedView>
      ) : (
        sortedTasks.map((task, index) => (
          <TaskCard
            key={task.task_id || task.calendar_event_id || index}
            task={task}
            onToggleCompletion={onToggleTaskCompletion}
          />
        ))
      )}
    </ThemedView>
  )
}
