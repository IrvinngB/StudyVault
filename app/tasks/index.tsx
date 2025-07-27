"use client"

import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { TaskWithEvent, TasksFilters } from "@/database/services/tasksService"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, RefreshControl, ScrollView } from "react-native"

type FilterType = "all" | "pending" | "in_progress" | "completed" | "overdue"
type SortType = "due_date" | "priority" | "class" | "completion"

export default function TasksScreen() {
  const { theme } = useTheme()
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("due_date")

  // Configurar filtros para la API
  const apiFilters: TasksFilters = useMemo(() => {
    const filters: TasksFilters = {}

    if (activeFilter !== "all") {
      filters.status = activeFilter
    }

    return filters
  }, [activeFilter])

  const {
    tasks,
    stats,
    loading,
    refreshing,
    error,
    refreshTasks,
    updateTaskStatus,
    createTask,
    deleteTask,
    fetchTasks,
  } = useTasks(apiFilters)

  // Filtrar y ordenar tareas localmente
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks]

    // Aplicar filtro local adicional si es necesario
    if (activeFilter !== "all") {
      filtered = filtered.filter((task) => task.status === activeFilter)
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "due_date":
          return new Date(a.due_date || a.start_datetime).getTime() - new Date(b.due_date || b.start_datetime).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "class":
          return (a.class_name || "").localeCompare(b.class_name || "")
        case "completion":
          return (b.completion_percentage || 0) - (a.completion_percentage || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, activeFilter, sortBy])

  // Refrescar datos cuando cambian los filtros
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

  const handleDeleteTask = (task: TaskWithEvent) => {
    if (!task.task_id) return

    Alert.alert("Eliminar Tarea", `¿Estás seguro de que quieres eliminar "${task.task_title || task.event_title}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteTask(task.task_id!),
      },
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return theme.colors.success
      case "in_progress":
        return theme.colors.warning
      case "overdue":
        return theme.colors.error
      default:
        return theme.colors.textMuted
    }
  }

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

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case "exam":
        return "school"
      case "assignment":
        return "document-text"
      case "presentation":
        return "easel"
      case "quiz":
        return "help-circle"
      case "lab":
        return "flask"
      default:
        return "calendar"
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
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`
    if (diffDays <= 7) return `En ${diffDays} días`

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  // Mostrar loading inicial
  if (loading && !refreshing) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
          Cargando tareas...
        </ThemedText>
      </ThemedView>
    )
  }

  // Mostrar error si no hay conexión
  if (error && tasks.length === 0) {
    return (
      <ThemedView
        variant="background"
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.lg }}
      >
        <Ionicons name="cloud-offline" size={64} color={theme.colors.error} />
        <ThemedText variant="h2" style={{ marginTop: theme.spacing.md, textAlign: "center" }}>
          Error de Conexión
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={{ marginTop: theme.spacing.sm, textAlign: "center" }}>
          No se pudieron cargar las tareas. Verifica tu conexión a internet.
        </ThemedText>
        <ThemedButton
          title="Reintentar"
          variant="primary"
          onPress={() => fetchTasks(apiFilters)}
          style={{ marginTop: theme.spacing.lg }}
          icon={<Ionicons name="refresh" size={18} color="white" />}
        />
      </ThemedView>
    )
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshTasks} />}
      >
        {/* Header */}
        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h1" style={{ marginBottom: theme.spacing.sm }}>
            📋 Mis Tareas
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Gestiona tus tareas, eventos y calificaciones
          </ThemedText>
        </ThemedView>

        {/* Stats Cards */}
        {stats && (
          <ThemedView
            style={{
              flexDirection: "row",
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.lg,
              flexWrap: "wrap",
            }}
          >
            <ThemedCard variant="elevated" padding="small" style={{ flex: 1, minWidth: 80 }}>
              <ThemedText variant="h2" style={{ textAlign: "center", color: theme.colors.primary }}>
                {stats.total}
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={{ textAlign: "center" }}>
                Total
              </ThemedText>
            </ThemedCard>

            <ThemedCard variant="elevated" padding="small" style={{ flex: 1, minWidth: 80 }}>
              <ThemedText variant="h2" style={{ textAlign: "center", color: theme.colors.success }}>
                {stats.completed}
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={{ textAlign: "center" }}>
                Completadas
              </ThemedText>
            </ThemedCard>

            <ThemedCard variant="elevated" padding="small" style={{ flex: 1, minWidth: 80 }}>
              <ThemedText variant="h2" style={{ textAlign: "center", color: theme.colors.warning }}>
                {stats.in_progress}
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={{ textAlign: "center" }}>
                En Progreso
              </ThemedText>
            </ThemedCard>

            <ThemedCard variant="elevated" padding="small" style={{ flex: 1, minWidth: 80 }}>
              <ThemedText variant="h2" style={{ textAlign: "center", color: theme.colors.error }}>
                {stats.overdue}
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={{ textAlign: "center" }}>
                Atrasadas
              </ThemedText>
            </ThemedCard>
          </ThemedView>
        )}

        {/* Filters */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🔍 Filtros y Ordenamiento
          </ThemedText>

          {/* Filter Buttons */}
          <ThemedView
            style={{
              flexDirection: "row",
              gap: theme.spacing.xs,
              marginBottom: theme.spacing.md,
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "all", label: "Todas", icon: "list" },
              { key: "pending", label: "Pendientes", icon: "time" },
              { key: "in_progress", label: "En Progreso", icon: "play" },
              { key: "completed", label: "Completadas", icon: "checkmark-circle" },
              { key: "overdue", label: "Atrasadas", icon: "alert-circle" },
            ].map((filter) => (
              <ThemedButton
                key={filter.key}
                title={filter.label}
                variant={activeFilter === filter.key ? "primary" : "outline"}
                size="small"
                icon={
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={activeFilter === filter.key ? "white" : theme.colors.primary}
                  />
                }
                onPress={() => setActiveFilter(filter.key as FilterType)}
              />
            ))}
          </ThemedView>

          {/* Sort Options */}
          <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
            Ordenar por:
          </ThemedText>
          <ThemedView
            style={{
              flexDirection: "row",
              gap: theme.spacing.xs,
              flexWrap: "wrap",
            }}
          >
            {[
              { key: "due_date", label: "Fecha", icon: "calendar" },
              { key: "priority", label: "Prioridad", icon: "flag" },
              { key: "class", label: "Clase", icon: "school" },
              { key: "completion", label: "Progreso", icon: "bar-chart" },
            ].map((sort) => (
              <ThemedButton
                key={sort.key}
                title={sort.label}
                variant={sortBy === sort.key ? "secondary" : "ghost"}
                size="small"
                icon={
                  <Ionicons
                    name={sort.icon as any}
                    size={14}
                    color={sortBy === sort.key ? "white" : theme.colors.primary}
                  />
                }
                onPress={() => setSortBy(sort.key as SortType)}
              />
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Tasks List */}
        <ThemedView style={{ gap: theme.spacing.md }}>
          {filteredAndSortedTasks.length === 0 ? (
            <ThemedCard variant="elevated" padding="large">
              <ThemedView style={{ alignItems: "center", gap: theme.spacing.md }}>
                <Ionicons name="checkmark-done-circle" size={64} color={theme.colors.success} />
                <ThemedText variant="h3" style={{ textAlign: "center" }}>
                  {loading ? "Cargando..." : "¡Excelente trabajo!"}
                </ThemedText>
                <ThemedText variant="body" color="secondary" style={{ textAlign: "center" }}>
                  {loading
                    ? "Obteniendo tus tareas..."
                    : activeFilter === "all"
                      ? "No tienes tareas registradas"
                      : `No hay tareas ${activeFilter === "completed" ? "completadas" : activeFilter}`}
                </ThemedText>
              </ThemedView>
            </ThemedCard>
          ) : (
            filteredAndSortedTasks.map((task, idx) => (
              <ThemedCard key={task.calendar_event_id || task.task_id || `${task.event_title}-${task.due_date}` || idx} variant="elevated" padding="medium">
                {/* Task Header */}
                <ThemedView
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <ThemedView style={{ flex: 1, marginRight: theme.spacing.sm }}>
                    <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
                      <Ionicons
                        name={getEventTypeIcon(task.event_type) as any}
                        size={20}
                        color={theme.colors.primary}
                        style={{ marginRight: theme.spacing.xs }}
                      />
                      <ThemedText variant="h3" style={{ flex: 1 }}>
                        {task.event_title}
                      </ThemedText>
                    </ThemedView>

                    {task.class_name && (
                      <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
                        📚 {task.class_name} {task.class_code && `(${task.class_code})`}
                      </ThemedText>
                    )}

                    {task.task_title && task.task_title !== task.event_title && (
                      <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs }}>
                        {task.task_title}
                      </ThemedText>
                    )}

                    {task.task_description && (
                      <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
                        {task.task_description}
                      </ThemedText>
                    )}
                  </ThemedView>

                  {/* Priority Badge */}
                  <ThemedView
                    style={{
                      backgroundColor: getPriorityColor(task.priority),
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: theme.spacing.xs,
                      borderRadius: theme.borderRadius.sm,
                      alignItems: "center",
                    }}
                  >
                    <ThemedText variant="caption" style={{ color: "#FFFFFF", fontWeight: "600" }}>
                      {task.priority.toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>

                {/* Task Details */}
                <ThemedView style={{ gap: theme.spacing.sm }}>
                  {/* Due Date */}
                  <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="time" size={16} color={theme.colors.textMuted} />
                    <ThemedText variant="bodySmall" color="secondary" style={{ marginLeft: theme.spacing.xs }}>
                      Vence: {formatDate(task.due_date || task.start_datetime)}
                    </ThemedText>
                  </ThemedView>

                  {/* Status */}
                  <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name={
                        task.status === "completed"
                          ? "checkmark-circle"
                          : task.status === "overdue"
                            ? "alert-circle"
                            : task.status === "in_progress"
                              ? "play-circle"
                              : "time"
                      }
                      size={16}
                      color={getStatusColor(task.status)}
                    />
                    <ThemedText
                      variant="bodySmall"
                      style={{
                        marginLeft: theme.spacing.xs,
                        color: getStatusColor(task.status),
                        fontWeight: "600",
                      }}
                    >
                      {task.status === "completed"
                        ? "Completada"
                        : task.status === "overdue"
                          ? "Atrasada"
                          : task.status === "in_progress"
                            ? "En Progreso"
                            : "Pendiente"}
                    </ThemedText>
                  </ThemedView>

                  {/* Progress Bar */}
                  {task.completion_percentage !== undefined && (
                    <ThemedView>
                      <ThemedView
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        <ThemedText variant="caption" color="secondary">
                          Progreso
                        </ThemedText>
                        <ThemedText variant="caption" color="secondary">
                          {task.completion_percentage}%
                        </ThemedText>
                      </ThemedView>
                      <ThemedView
                        style={{
                          height: 6,
                          backgroundColor: theme.colors.border,
                          borderRadius: theme.borderRadius.sm,
                          overflow: "hidden",
                        }}
                      >
                        <ThemedView
                          style={{
                            height: "100%",
                            width: `${task.completion_percentage}%`,
                            backgroundColor: getStatusColor(task.status),
                          }}
                        />
                      </ThemedView>
                    </ThemedView>
                  )}

                  {/* Grade Info */}
                  {task.grade_id && task.score !== undefined && (
                    <ThemedView
                      style={{
                        backgroundColor: theme.colors.success + "20",
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.sm,
                        borderLeftWidth: 4,
                        borderLeftColor: theme.colors.success,
                      }}
                    >
                      <ThemedView
                        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                      >
                        <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons name="trophy" size={16} color={theme.colors.success} />
                          <ThemedText variant="bodySmall" style={{ marginLeft: theme.spacing.xs, fontWeight: "600" }}>
                            Calificación
                          </ThemedText>
                        </ThemedView>
                        <ThemedText variant="bodySmall" style={{ fontWeight: "600", color: theme.colors.success }}>
                          {task.score}/{task.max_score}
                        </ThemedText>
                      </ThemedView>
                      {task.category_name && (
                        <ThemedText variant="caption" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                          Categoría: {task.category_name}
                          {task.category_weight && ` (${task.category_weight}%)`}
                        </ThemedText>
                      )}
                    </ThemedView>
                  )}
                </ThemedView>

                {/* Action Buttons */}
                <ThemedView
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.sm,
                    marginTop: theme.spacing.md,
                  }}
                >
                  {task.task_id && (
                    <ThemedButton
                      title={task.status === "completed" ? "Marcar Pendiente" : "Marcar Completada"}
                      variant={task.status === "completed" ? "outline" : "success"}
                      size="small"
                      icon={
                        <Ionicons
                          name={task.status === "completed" ? "refresh" : "checkmark"}
                          size={16}
                          color={task.status === "completed" ? theme.colors.primary : "white"}
                        />
                      }
                      onPress={() => handleToggleTaskCompletion(task)}
                      style={{ flex: 1 }}
                    />
                  )}

                  <ThemedButton
                    title="Eliminar"
                    variant="ghost"
                    size="small"
                    icon={<Ionicons name="trash" size={16} color={theme.colors.error} />}
                    onPress={() => handleDeleteTask(task)}
                    style={{ minWidth: 100 }}
                  />
                </ThemedView>
              </ThemedCard>
            ))
          )}
        </ThemedView>

        {/* Quick Actions */}
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
                onPress={handleCreateTask}
              />
              <ThemedButton
                title="Actualizar"
                variant="secondary"
                icon={<Ionicons name="refresh" size={18} color="white" />}
                style={{ flex: 1 }}
                onPress={refreshTasks}
                disabled={refreshing}
              />
            </ThemedView>

            <ThemedView style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <ThemedButton
                title="Ver Calendario"
                variant="outline"
                icon={<Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />}
                style={{ flex: 1 }}
                onPress={() => Alert.alert("Calendario", "Función próximamente disponible")}
              />
              <ThemedButton
                title="Estadísticas"
                variant="ghost"
                icon={<Ionicons name="bar-chart" size={18} color={theme.colors.primary} />}
                style={{ flex: 1 }}
                onPress={() => Alert.alert("Estadísticas", `Tasa de completación: ${stats?.completion_rate || 0}%`)}
              />
            </ThemedView>
          </ThemedView>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}
