import { apiClient } from "../api/client"

// Tipos basados en los endpoints reales del backend
export interface CalendarWithGrades {
  calendar_event_id: string
  event_title: string
  start_datetime: string
  end_datetime: string
  event_type: string
  event_description?: string
  location?: string
  class_id?: string
  class_name?: string
  class_code?: string
  grade_id?: string
  score?: number
  max_score?: number
  category_name?: string
  category_weight?: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface GradeByCategory {
  category_id: string
  category_name: string
  category_weight: number
  class_id: string
  class_name: string
  class_code?: string
  total_grades: number
  completed_grades: number
  average_score: number
  weighted_contribution: number
  user_id: string
}

export interface GradeByCourse {
  class_id: string
  class_name: string
  class_code?: string
  total_categories: number
  total_grades: number
  completed_grades: number
  overall_average: number
  final_grade: number
  user_id: string
}

export interface CalendarGradesLinked {
  calendar_event_id: string
  event_title: string
  start_datetime: string
  end_datetime: string
  event_type: string
  class_id?: string
  class_name?: string
  grade_id?: string
  score?: number
  max_score?: number
  category_name?: string
  is_completed: boolean
  user_id: string
}

// Tipo adaptado para la UI de tareas
export interface TaskWithEvent {
  calendar_event_id: string
  event_title: string
  start_datetime: string
  end_datetime: string
  event_type: string
  event_description?: string
  location?: string
  class_id?: string
  class_name?: string
  class_code?: string
  task_id?: string
  task_title?: string
  task_description?: string
  due_date?: string
  status: "pending" | "in_progress" | "completed" | "overdue"
  completion_percentage?: number
  priority: "low" | "medium" | "high"
  grade_id?: string
  score?: number
  max_score?: number
  category_name?: string
  category_weight?: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface TasksFilters {
  status?: "pending" | "in_progress" | "completed" | "overdue"
  class_id?: string
  event_type?: string
  priority?: "low" | "medium" | "high"
  start_date?: string
  end_date?: string
  limit?: number
  offset?: number
}

export interface UpdateTaskStatusRequest {
  task_id: string
  status: "pending" | "in_progress" | "completed" | "overdue"
  completion_percentage?: number
}

export interface CreateTaskRequest {
  title: string
  description?: string
  due_date?: string
  priority: "low" | "medium" | "high"
  class_id?: string
  calendar_event_id?: string
}

export interface TasksStats {
  total: number
  completed: number
  pending: number
  in_progress: number
  overdue: number
  completion_rate: number
}

class TasksService {
  /**
   * Obtener todas las tareas con eventos asociados
   * Probando diferentes rutas posibles para los endpoints
   */
  async getTasksWithEvents(filters?: TasksFilters): Promise<TaskWithEvent[]> {
    const possibleRoutes = [
      "/tasks/vw/calendar-grades-linked",
      "/grades/vw/calendar-grades-linked",
      "/api/tasks/vw/calendar-grades-linked",
      "/api/grades/vw/calendar-grades-linked",
      "/vw/calendar-grades-linked",
      "/tasks/vw/calendar-with-grades",
      "/grades/vw/calendar-with-grades",
      "/api/tasks/vw/calendar-with-grades",
      "/api/grades/vw/calendar-with-grades",
      "/vw/calendar-with-grades",
    ]

    // Intentar con cada ruta posible
    for (const route of possibleRoutes) {
      try {
        console.log(`Trying route: ${route}`)
        const response = await apiClient.get<CalendarGradesLinked[] | CalendarWithGrades[]>(route)

        if (response && response.length >= 0) {
          console.log(`Success with route: ${route}`)

          // Determinar el tipo de respuesta y transformar
          const tasks = response.map((item) => {
            if ("is_completed" in item) {
              return this.transformToTaskWithEvent(item as CalendarGradesLinked)
            } else {
              return this.transformCalendarWithGradesToTask(item as CalendarWithGrades)
            }
          })

          return this.applyFilters(tasks, filters)
        }
      } catch (error) {
        console.log(`Failed with route ${route}:`, error)
        continue
      }
    }

    // Si ninguna ruta funciona, intentar con endpoints de calendario existentes
    try {
      console.log("Trying calendar events as final fallback")
      const calendarEvents = await apiClient.get<any[]>("/calendar/events")

      const tasks = calendarEvents.map((event) => ({
        calendar_event_id: event.id || event.event_id || event.calendar_event_id,
        event_title: event.title || event.event_title || event.name,
        start_datetime: event.start_datetime || event.start_date || event.date,
        end_datetime: event.end_datetime || event.end_date || event.date,
        event_type: event.event_type || event.type || "event",
        event_description: event.description,
        location: event.location,
        class_id: event.class_id,
        class_name: event.class_name,
        class_code: event.class_code,
        task_id: event.id || event.event_id,
        task_title: event.title || event.event_title,
        task_description: event.description,
        due_date: event.end_datetime || event.end_date || event.date,
        status: this.determineTaskStatusFromEvent(event),
        completion_percentage: event.completion_percentage || 0,
        priority: this.determinePriorityFromEvent(event),
        grade_id: event.grade_id,
        score: event.score,
        max_score: event.max_score,
        category_name: event.category_name,
        category_weight: event.category_weight,
        user_id: event.user_id,
        created_at: event.created_at || new Date().toISOString(),
        updated_at: event.updated_at || new Date().toISOString(),
      }))

      return this.applyFilters(tasks, filters)
    } catch (error) {
      console.error("All endpoints failed:", error)
      return []
    }
  }

  /**
   * Transformar CalendarGradesLinked a TaskWithEvent
   */
  private transformToTaskWithEvent(item: CalendarGradesLinked): TaskWithEvent {
    const now = new Date()
    const eventDate = new Date(item.end_datetime || item.start_datetime)

    // Use value or grade_value if present for status
    let status: "pending" | "completed" | "overdue" | "in_progress" = this.determineTaskStatus(item, eventDate, now);
    if (typeof (item as any).value !== "undefined") {
      status = (item as any).value === 1 ? "pending" : "completed";
    } else if (typeof (item as any).grade_value !== "undefined") {
      status = (item as any).grade_value === 1 ? "pending" : "completed";
    }

    // Fallback para título
    const fallbackTitle = item.event_title || (item as any).task_title || (item as any).title || (item as any).name || "Sin título";
    return {
      calendar_event_id: item.calendar_event_id,
      event_title: fallbackTitle,
      start_datetime: item.start_datetime,
      end_datetime: item.end_datetime,
      event_type: item.event_type,
      class_id: item.class_id,
      class_name: item.class_name,
      task_id: item.calendar_event_id,
      task_title: fallbackTitle,
      due_date: item.end_datetime,
      status,
      completion_percentage: status === "completed" ? 100 : this.calculateCompletionPercentage(eventDate, now),
      priority: this.determinePriority(item.event_type, eventDate, now),
      grade_id: item.grade_id,
      score: item.score,
      max_score: item.max_score,
      category_name: item.category_name,
      user_id: item.user_id,
      created_at: item.start_datetime,
      updated_at: item.start_datetime,
    }
  }

  /**
   * Transformar CalendarWithGrades a TaskWithEvent
   */
  private transformCalendarWithGradesToTask(item: CalendarWithGrades): TaskWithEvent {
    const now = new Date()
    const eventDate = new Date(item.end_datetime || item.start_datetime)

    // Use value or grade_value if present for status
    let status: "pending" | "completed" | "overdue" | "in_progress" = this.determineTaskStatusFromGrades(item, eventDate, now);
    if (typeof (item as any).value !== "undefined") {
      status = (item as any).value === 1 ? "pending" : "completed";
    } else if (typeof (item as any).grade_value !== "undefined") {
      status = (item as any).grade_value === 1 ? "pending" : "completed";
    }

    // Fallback para título
    const fallbackTitle = item.event_title || (item as any).task_title || (item as any).title || (item as any).name || "Sin título";
    return {
      calendar_event_id: item.calendar_event_id,
      event_title: fallbackTitle,
      start_datetime: item.start_datetime,
      end_datetime: item.end_datetime,
      event_type: item.event_type,
      event_description: item.event_description,
      location: item.location,
      class_id: item.class_id,
      class_name: item.class_name,
      class_code: item.class_code,
      task_id: item.calendar_event_id,
      task_title: fallbackTitle,
      task_description: item.event_description,
      due_date: item.end_datetime,
      status,
      completion_percentage: status === "completed" ? 100 : this.calculateCompletionPercentage(eventDate, now),
      priority: this.determinePriority(item.event_type, eventDate, now),
      grade_id: item.grade_id,
      score: item.score,
      max_score: item.max_score,
      category_name: item.category_name,
      category_weight: item.category_weight,
      user_id: item.user_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }
  }

  /**
   * Determinar estado desde evento genérico
   */
  private determineTaskStatusFromEvent(event: any): "pending" | "in_progress" | "completed" | "overdue" {
    const now = new Date()
    const eventDate = new Date(event.end_datetime || event.end_date || event.date || event.start_datetime)

    if (event.score !== undefined && event.score !== null) {
      return "completed"
    }

    if (eventDate < now) {
      return "overdue"
    }

    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 3) {
      return "in_progress"
    }

    return "pending"
  }

  /**
   * Determinar prioridad desde evento genérico
   */
  private determinePriorityFromEvent(event: any): "low" | "medium" | "high" {
    const now = new Date()
    const eventDate = new Date(event.end_datetime || event.end_date || event.date || event.start_datetime)
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const eventType = event.event_type || event.type || ""

    if (eventType === "exam" || eventType === "presentation") {
      return "high"
    }

    if (diffDays <= 2) {
      return "high"
    }

    if (diffDays <= 7) {
      return "medium"
    }

    return "low"
  }

  /**
   * Determinar el estado de la tarea basado en CalendarGradesLinked
   */
  private determineTaskStatus(
    item: CalendarGradesLinked,
    eventDate: Date,
    now: Date,
  ): "pending" | "in_progress" | "completed" | "overdue" {
    if (item.is_completed || (item.score !== undefined && item.score !== null)) {
      return "completed"
    }

    if (eventDate < now) {
      return "overdue"
    }

    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 3) {
      return "in_progress"
    }

    return "pending"
  }

  /**
   * Determinar el estado de la tarea basado en CalendarWithGrades
   */
  private determineTaskStatusFromGrades(
    item: CalendarWithGrades,
    eventDate: Date,
    now: Date,
  ): "pending" | "in_progress" | "completed" | "overdue" {
    if (item.score !== undefined && item.score !== null) {
      return "completed"
    }

    if (eventDate < now) {
      return "overdue"
    }

    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 3) {
      return "in_progress"
    }

    return "pending"
  }

  /**
   * Calcular porcentaje de completación basado en proximidad a la fecha
   */
  private calculateCompletionPercentage(eventDate: Date, now: Date): number {
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 0
    if (diffDays >= 7) return 0

    return Math.max(0, Math.min(100, (7 - diffDays) * 15))
  }

  /**
   * Determinar prioridad basada en tipo de evento y proximidad
   */
  private determinePriority(eventType: string, eventDate: Date, now: Date): "low" | "medium" | "high" {
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (eventType === "exam" || eventType === "presentation") {
      return "high"
    }

    if (diffDays <= 2) {
      return "high"
    }

    if (diffDays <= 7) {
      return "medium"
    }

    return "low"
  }

  /**
   * Aplicar filtros localmente
   */
  private applyFilters(tasks: TaskWithEvent[], filters?: TasksFilters): TaskWithEvent[] {
    if (!filters) return tasks

    let filtered = tasks

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status)
    }

    if (filters.class_id) {
      filtered = filtered.filter((task) => task.class_id === filters.class_id)
    }

    if (filters.event_type) {
      filtered = filtered.filter((task) => task.event_type === filters.event_type)
    }

    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority)
    }

    if (filters.start_date) {
      const startDate = new Date(filters.start_date)
      filtered = filtered.filter((task) => new Date(task.start_datetime) >= startDate)
    }

    if (filters.end_date) {
      const endDate = new Date(filters.end_date)
      filtered = filtered.filter((task) => new Date(task.end_datetime) <= endDate)
    }

    if (filters.offset) {
      filtered = filtered.slice(filters.offset)
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  /**
   * Obtener estadísticas de tareas calculadas desde los datos
   */
  async getTasksStats(): Promise<TasksStats> {
    try {
      const tasks = await this.getTasksWithEvents()

      const total = tasks.length
      const completed = tasks.filter((t) => t.status === "completed").length
      const pending = tasks.filter((t) => t.status === "pending").length
      const in_progress = tasks.filter((t) => t.status === "in_progress").length
      const overdue = tasks.filter((t) => t.status === "overdue").length
      const completion_rate = total > 0 ? Math.round((completed / total) * 100) : 0

      return {
        total,
        completed,
        pending,
        in_progress,
        overdue,
        completion_rate,
      }
    } catch (error) {
      console.error("Error fetching tasks stats:", error)
      return {
        total: 0,
        completed: 0,
        pending: 0,
        in_progress: 0,
        overdue: 0,
        completion_rate: 0,
      }
    }
  }

  /**
   * Actualizar estado de una tarea usando el endpoint de grades
   */
  async updateTaskStatus(request: UpdateTaskStatusRequest): Promise<void> {
    try {
      if (request.status === "completed") {
        const tasks = await this.getTasksWithEvents()
        const task = tasks.find((t) => t.task_id === request.task_id)

        if (task && task.grade_id) {
          // Actualizar el campo value de la calificación a 0 (completada) usando gradesService
          const { gradesService } = await import("@/database/services/gradesService")
          await gradesService.patchGrade(task.grade_id, { value: 0 })
          console.log(`Grade ${task.grade_id} value actualizado a 0 (completada) usando gradesService`)
          return
        }
      }

      console.log(`Task ${request.task_id} status updated to ${request.status} (simulated)`)
    } catch (error) {
      console.error("Error updating task status:", error)
      throw error
    }
  }


  /**
   * Eliminar tarea
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      throw new Error("Delete task endpoint not implemented in backend")
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }

  /**
   * Obtener tareas por clase
   */
  async getTasksByClass(classId: string): Promise<TaskWithEvent[]> {
    try {
      const tasks = await this.getTasksWithEvents({ class_id: classId })
      return tasks
    } catch (error) {
      console.error("Error fetching tasks by class:", error)
      return []
    }
  }

  /**
   * Obtener tareas próximas
   */
  async getUpcomingTasks(): Promise<TaskWithEvent[]> {
    try {
      const today = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(today.getDate() + 7)

      const tasks = await this.getTasksWithEvents({
        start_date: today.toISOString(),
        end_date: nextWeek.toISOString(),
      })
      return tasks
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error)
      return []
    }
  }

  /**
   * Obtener tareas atrasadas
   */
  async getOverdueTasks(): Promise<TaskWithEvent[]> {
    try {
      const tasks = await this.getTasksWithEvents()
      return tasks.filter((task) => task.status === "overdue")
    } catch (error) {
      console.error("Error fetching overdue tasks:", error)
      return []
    }
  }

  /**
   * Marcar múltiples tareas como completadas
   */
  async markTasksAsCompleted(taskIds: string[]): Promise<void> {
    try {
      const promises = taskIds.map((taskId) =>
        this.updateTaskStatus({
          task_id: taskId,
          status: "completed",
          completion_percentage: 100,
        }),
      )

      await Promise.all(promises)
    } catch (error) {
      console.error("Error marking tasks as completed:", error)
      throw error
    }
  }
}

export const tasksService = new TasksService()
