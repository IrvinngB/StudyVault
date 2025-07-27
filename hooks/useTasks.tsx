"use client"

import { tasksService, type TaskWithEvent, type TasksFilters, type TasksStats } from "@/database/services/tasksService"
import { useCallback, useEffect, useState } from "react"
import { Alert } from "react-native"

export interface UseTasksReturn {
  tasks: TaskWithEvent[]
  stats: TasksStats | null
  loading: boolean
  refreshing: boolean
  error: string | null
  fetchTasks: (filters?: TasksFilters) => Promise<void>
  refreshTasks: () => Promise<void>
  updateTaskStatus: (
    taskId: string,
    status: "pending" | "in_progress" | "completed" | "overdue",
    completionPercentage?: number,
  ) => Promise<void>
  createTask: (
    title: string,
    description?: string,
    dueDate?: string,
    priority?: "low" | "medium" | "high",
    classId?: string,
  ) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  getTasksByClass: (classId: string) => Promise<TaskWithEvent[]>
  getUpcomingTasks: () => Promise<TaskWithEvent[]>
  getOverdueTasks: () => Promise<TaskWithEvent[]>
}

export function useTasks(initialFilters?: TasksFilters): UseTasksReturn {
  const [tasks, setTasks] = useState<TaskWithEvent[]>([])
  const [stats, setStats] = useState<TasksStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(
    async (filters?: TasksFilters) => {
      try {
        setError(null)
        const [tasksData, statsData] = await Promise.all([
          tasksService.getTasksWithEvents(filters || initialFilters),
          tasksService.getTasksStats(),
        ])

        setTasks(tasksData)
        setStats(statsData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar las tareas"
        setError(errorMessage)
        console.error("Error fetching tasks:", err)

        // Mostrar error al usuario
        Alert.alert("Error", "No se pudieron cargar las tareas. Verifica tu conexión a internet.", [{ text: "OK" }])
      } finally {
        setLoading(false)
      }
    },
    [initialFilters],
  )

  const refreshTasks = useCallback(async () => {
    setRefreshing(true)
    await fetchTasks()
    setRefreshing(false)
  }, [fetchTasks])

  const updateTaskStatus = useCallback(
    async (
      taskId: string,
      status: "pending" | "in_progress" | "completed" | "overdue",
      completionPercentage?: number,
    ) => {
      try {
        await tasksService.updateTaskStatus({
          task_id: taskId,
          status,
          completion_percentage: completionPercentage,
        })

        // Actualizar el estado local
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === taskId
              ? {
                  ...task,
                  status,
                  completion_percentage: completionPercentage ?? task.completion_percentage,
                }
              : task,
          ),
        )

        // Actualizar estadísticas
        await tasksService.getTasksStats().then(setStats)

        Alert.alert(
          "Éxito",
          `Tarea marcada como ${status === "completed" ? "completada" : status === "pending" ? "pendiente" : status}`,
          [{ text: "OK" }],
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al actualizar la tarea"
        Alert.alert("Error", errorMessage, [{ text: "OK" }])
        console.error("Error updating task status:", err)
      }
    },
    [],
  )

  const createTask = useCallback(
    async (
      title: string,
      description?: string,
      dueDate?: string,
      priority: "low" | "medium" | "high" = "medium",
      classId?: string,
    ) => {
      try {
        const newTask = await tasksService.createTask({
          title,
          description,
          due_date: dueDate,
          priority,
          class_id: classId,
        })

        // Agregar la nueva tarea al estado local
        setTasks((prevTasks) => [newTask, ...prevTasks])

        // Actualizar estadísticas
        await tasksService.getTasksStats().then(setStats)

        Alert.alert("Éxito", "Tarea creada correctamente", [{ text: "OK" }])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al crear la tarea"
        Alert.alert("Error", errorMessage, [{ text: "OK" }])
        console.error("Error creating task:", err)
      }
    },
    [],
  )

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await tasksService.deleteTask(taskId)

      // Remover la tarea del estado local
      setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== taskId))

      // Actualizar estadísticas
      await tasksService.getTasksStats().then(setStats)

      Alert.alert("Éxito", "Tarea eliminada correctamente", [{ text: "OK" }])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar la tarea"
      Alert.alert("Error", errorMessage, [{ text: "OK" }])
      console.error("Error deleting task:", err)
    }
  }, [])

  const getTasksByClass = useCallback(async (classId: string): Promise<TaskWithEvent[]> => {
    try {
      return await tasksService.getTasksByClass(classId)
    } catch (err) {
      console.error("Error fetching tasks by class:", err)
      return []
    }
  }, [])

  const getUpcomingTasks = useCallback(async (): Promise<TaskWithEvent[]> => {
    try {
      return await tasksService.getUpcomingTasks()
    } catch (err) {
      console.error("Error fetching upcoming tasks:", err)
      return []
    }
  }, [])

  const getOverdueTasks = useCallback(async (): Promise<TaskWithEvent[]> => {
    try {
      return await tasksService.getOverdueTasks()
    } catch (err) {
      console.error("Error fetching overdue tasks:", err)
      return []
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    stats,
    loading,
    refreshing,
    error,
    fetchTasks,
    refreshTasks,
    updateTaskStatus,
    createTask,
    deleteTask,
    getTasksByClass,
    getUpcomingTasks,
    getOverdueTasks,
  }
}
