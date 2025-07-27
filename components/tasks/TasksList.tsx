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

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "exams") {
      return task.event_type === "exam" || task.event_type === "quiz"
    }
    return task.event_type !== "exam" && task.event_type !== "quiz"
  })

  const pendingTasks = filteredTasks.filter((task) => task.status !== "completed")

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
        Pendientes ({pendingTasks.length})
      </ThemedText>

      {/* Tasks List */}
      {pendingTasks.length === 0 ? (
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
            {activeTab === "exams" ? "No tienes exámenes pendientes" : "¡Todas las tareas completadas!"}
          </ThemedText>
        </ThemedView>
      ) : (
        pendingTasks.map((task, index) => (
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
