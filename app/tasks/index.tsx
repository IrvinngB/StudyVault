"use client"

import { TasksFilters } from "@/components/tasks/TasksFilters"
import { TasksHeader } from "@/components/tasks/TasksHeader"
import { TasksList } from "@/components/tasks/TasksList"
import { TasksStatsComponent } from "@/components/tasks/TasksStats"
import { TasksTabs } from "@/components/tasks/TasksTabs"
import { ThemedView } from "@/components/ui/ThemedComponents"
import type { TaskWithEvent, TasksFilters as TasksFiltersType } from "@/database/services/tasksService"
import { useClasses } from "@/hooks/useClasses"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, RefreshControl, ScrollView } from "react-native"

export default function TasksScreen() {
  const { theme } = useTheme()
  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState<"tasks" | "exams">("tasks")
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "completed" | "in_progress" | "overdue">("all")
  const [sortBy, setSortBy] = useState<"due_date" | "priority" | "class" | "completion">("due_date")

  // Configurar filtros para la API - solo tareas pendientes por defecto
  const apiFilters: TasksFiltersType = useMemo(() => {
    // Si quieres que el filtro afecte la API, descomenta:
    // return activeFilter === "all" ? {} : { status: activeFilter }
    return {}
  }, [])

  const { tasks, stats, loading, refreshing, error, refreshTasks, updateTaskStatus, createTask, fetchTasks } =
    useTasks(apiFilters)
  
  // Obtener las clases para mapear los nombres
  const { classes } = useClasses()

  // Convertir class_id a class_name en las tareas
  const tasksWithClassNames = useMemo(() => {
    return tasks.map((task) => {
      const taskClass = classes.find((cls) => cls.id === task.class_id)
      return {
        ...task,
        class_name: taskClass?.name || task.class_name || "Sin materia"
      }
    })
  }, [tasks, classes])

  // Filtrar tareas localmente por búsqueda y filtro
  const filteredTasks = useMemo(() => {
    let filtered = [...tasksWithClassNames]

    // Filtrar por estado
    if (activeFilter !== "all") {
      filtered = filtered.filter((task) => task.status === activeFilter)
    }

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
  }, [tasksWithClassNames, searchText, activeFilter])

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

  const handleFilterChange = (filter: "all" | "pending" | "completed" | "in_progress" | "overdue") => {
    setActiveFilter(filter)
  }

  const handleSortChange = (sort: "due_date" | "priority" | "class" | "completion") => {
    setSortBy(sort)
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

        <TasksFilters
          activeFilter={activeFilter}
          sortBy={sortBy}
          searchText={searchText}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
        />

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