"use client"

import { TasksHeader } from "@/components/tasks/TasksHeader"
import { TasksList } from "@/components/tasks/TasksList"
import { TasksSearch } from "@/components/tasks/TasksSearch"
import { TasksStatsComponent } from "@/components/tasks/TasksStats"
import { TasksTabs } from "@/components/tasks/TasksTabs"
import { ThemedView } from "@/components/ui/ThemedComponents"
import type { TaskWithEvent, TasksFilters as TasksFiltersType } from "@/database/services/tasksService"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, RefreshControl, ScrollView } from "react-native"

export default function TasksScreen() {
  const { theme } = useTheme()
  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState<"tasks" | "exams">("tasks")

  // Configurar filtros para la API - solo tareas pendientes por defecto
  const apiFilters: TasksFiltersType = useMemo(() => {
    return {}
  }, [])

  const { tasks, stats, loading, refreshing, error, refreshTasks, updateTaskStatus, createTask, fetchTasks } =
    useTasks(apiFilters)

  // Filtrar tareas localmente por búsqueda
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    // Filtrar por texto de búsqueda
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          (task.task_title || task.event_title || "").toLowerCase().includes(searchLower) ||
          (task.class_name || "").toLowerCase().includes(searchLower) ||
          (task.task_description || "").toLowerCase().includes(searchLower),
      )
    }

    // Ordenar por fecha de vencimiento
    filtered.sort((a, b) => {
      return new Date(a.due_date || a.start_datetime).getTime() - new Date(b.due_date || b.start_datetime).getTime()
    })

    return filtered
  }, [tasks, searchText])

  // Refrescar datos al cargar
  useEffect(() => {
    fetchTasks(apiFilters)
  }, [apiFilters, fetchTasks])

  const handleToggleTaskCompletion = async (task: TaskWithEvent) => {
    if (!task.task_id) return

    const newStatus = task.status === "completed" ? "pending" : "completed"
    const newCompletion = newStatus === "completed" ? 100 : task.completion_percentage

    await updateTaskStatus(task.task_id, newStatus, newCompletion)
  }

  const handleCreateTask = () => {
    Alert.prompt(
      "Nueva Tarea",
      "Ingresa el título de la tarea:",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Crear",
          onPress: async (title) => {
            if (title && title.trim()) {
              await createTask(title.trim())
            }
          },
        },
      ],
      "plain-text",
    )
  }

  const handleSearchChange = (text: string) => {
    setSearchText(text)
  }

  const handleFilterPress = () => {
    Alert.alert("Filtros", "Funcionalidad de filtros próximamente")
  }

  const handleTabChange = (tab: "tasks" | "exams") => {
    setActiveTab(tab)
  }

  // Mostrar loading inicial
  if (loading && !refreshing && tasks.length === 0) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    )
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshTasks} />}
      >
        <TasksHeader onCreateTask={handleCreateTask} />

        <TasksSearch searchText={searchText} onSearchChange={handleSearchChange} onFilterPress={handleFilterPress} />

        <TasksStatsComponent stats={stats} estimatedHours={12} />

        <TasksTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <TasksList
          tasks={filteredTasks}
          loading={loading}
          onToggleTaskCompletion={handleToggleTaskCompletion}
          activeTab={activeTab}
        />
      </ScrollView>
    </ThemedView>
  )
}
