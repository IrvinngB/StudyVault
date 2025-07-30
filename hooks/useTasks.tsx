"use client"

import { tasksService, type TaskWithEvent, type TasksFilters, type TasksStats } from "@/database/services/tasksService"
import { useCallback, useEffect, useState } from "react"
import { useGlobalModal } from "./ModalProvider"
import { useNotifications } from "./useNotifications"

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
  const { showModal } = useGlobalModal()
  const { createNotification } = useNotifications()

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
        showModal({
          type: "error",
          title: "Error de Carga",
          message: "No se pudieron cargar las tareas. Verifica tu conexión a internet.",
        })
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

        // Refrescar los datos desde el servidor para asegurar sincronización
        await fetchTasks()

        // Actualizar estadísticas
        await tasksService.getTasksStats().then(setStats)

        // Mostrar modal de éxito
        showModal({
          type: "success",
          title: "Tarea Actualizada",
          message: `Tarea marcada como ${status === "completed" ? "completada" : status === "pending" ? "pendiente" : status}`,
          autoClose: 2000,
        })

        // Si la tarea se completó y tiene grade_id, mostrar opción para ir a grades
        if (status === "completed") {
          const completedTask = tasks.find(t => t.task_id === taskId || t.grade_id === taskId)
          if (completedTask && completedTask.grade_id) {
            // Mostrar modal con opción de ir a grades
            showModal({
              type: "confirm",
              title: "Tarea Completada",
              message: `¿Quieres agregar la calificación para "${completedTask.task_title || completedTask.event_title}" ahora?`,
              confirmText: "Ir a Calificaciones",
              cancelText: "Más Tarde",
              onConfirm: () => {
                // Navegar a la pantalla de grades con el class_id
                if (completedTask.class_id) {
                  // Usar router para navegar a grades
                  const router = require('expo-router').router
                  router.push(`/grades/${completedTask.class_id}`)
                }
              },
            })
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al actualizar la tarea"
        showModal({
          type: "error",
          title: "Error",
          message: errorMessage,
        })
        console.error("Error updating task status:", err)
      }
    },
    [showModal],
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

        showModal({
          type: "success",
          title: "Tarea Creada",
          message: "Tarea creada correctamente",
          autoClose: 2000,
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al crear la tarea"
        showModal({
          type: "error",
          title: "Error",
          message: errorMessage,
        })
        console.error("Error creating task:", err)
      }
    },
    [showModal],
  )

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await tasksService.deleteTask(taskId)

      // Remover la tarea del estado local
      setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== taskId))

      // Actualizar estadísticas
      await tasksService.getTasksStats().then(setStats)

      showModal({
        type: "success",
        title: "Tarea Eliminada",
        message: "Tarea eliminada correctamente",
        autoClose: 2000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar la tarea"
      showModal({
        type: "error",
        title: "Error",
        message: errorMessage,
      })
      console.error("Error deleting task:", err)
    }
  }, [showModal])

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
