import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotFoundError, QueryOptions } from '../../lib/database/repositories/base.repository';
import { Task } from '../../lib/database/schemas/task.schema';
import { useAuth } from '../../lib/hooks/useAuth';

/**
 * Hook for managing tasks, assignments, and evaluations
 */
export type TaskFormData = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

// Using a placeholder for TaskRepository until it's implemented
class TaskRepository {
  async getAll(options?: QueryOptions): Promise<Task[]> {
    // Placeholder
    return [];
  }

  async getById(id: string): Promise<Task | null> {
    // Placeholder
    return null;
  }

  async create(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    // Placeholder
    return {} as Task;
  }

  async update(id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    // Placeholder
    return {} as Task;
  }

  async delete(id: string): Promise<void> {
    // Placeholder
  }

  async getTasksByCourse(userId: string, courseId: string): Promise<Task[]> {
    // Placeholder
    return [];
  }

  async getTasksByStatus(userId: string, status: Task['status']): Promise<Task[]> {
    // Placeholder
    return [];
  }

  async getTasksByDateRange(userId: string, startDate: string, endDate: string): Promise<Task[]> {
    // Placeholder
    return [];
  }

  async getUpcomingTasks(userId: string, days: number = 7): Promise<Task[]> {
    // Placeholder
    return [];
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    // Placeholder
    return [];
  }

  async searchTasks(userId: string, query: string): Promise<Task[]> {
    // Placeholder
    return [];
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const { user } = useAuth();
  const taskRepo = useMemo(() => new TaskRepository(), []);

  // Helper to filter tasks by status
  const filterTasksByStatus = useCallback((allTasks: Task[], status: Task['status']) => {
    return allTasks.filter(task => task.status === status);
  }, []);

  // Fetch all tasks for the current user
  const fetchTasks = useCallback(async (options?: QueryOptions) => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filters = { user_id: user.id, ...options?.filters };
      const allTasks = await taskRepo.getAll({ 
        ...options,
        filters,
        sort: options?.sort || { field: 'due_date', direction: 'ASC' }
      });
      
      setTasks(allTasks);
      
      // Also update tasks by status
      setPendingTasks(filterTasksByStatus(allTasks, 'pending'));
      setCompletedTasks(filterTasksByStatus(allTasks, 'completed'));
      
      return allTasks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching tasks');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, taskRepo, filterTasksByStatus]);
  
  // Fetch tasks by course ID
  const fetchTasksByCourse = useCallback(async (courseId: string) => {
    if (!user?.id) return [];
    
    try {
      return await taskRepo.getTasksByCourse(user.id, courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching tasks by course');
      return [];
    }
  }, [user?.id, taskRepo]);
  
  // Fetch upcoming tasks
  const fetchUpcomingTasks = useCallback(async (days: number = 7) => {
    if (!user?.id) return [];
    
    try {
      const upcoming = await taskRepo.getUpcomingTasks(user.id, days);
      setUpcomingTasks(upcoming);
      return upcoming;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching upcoming tasks');
      return [];
    }
  }, [user?.id, taskRepo]);
  
  // Fetch overdue tasks
  const fetchOverdueTasks = useCallback(async () => {
    if (!user?.id) return [];
    
    try {
      const overdue = await taskRepo.getOverdueTasks(user.id);
      setOverdueTasks(overdue);
      return overdue;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching overdue tasks');
      return [];
    }
  }, [user?.id, taskRepo]);
  
  // Fetch tasks by date range
  const fetchTasksByDateRange = useCallback(async (startDate: string, endDate: string) => {
    if (!user?.id) return [];
    
    try {
      return await taskRepo.getTasksByDateRange(user.id, startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching tasks by date range');
      return [];
    }
  }, [user?.id, taskRepo]);
  
  // Create a new task
  const createTask = useCallback(async (taskData: TaskFormData) => {
    if (!user?.id) return null;
    
    setError(null);
    
    try {
      const newTask = await taskRepo.create({
        ...taskData,
        user_id: user.id,
        tags: taskData.tags || '[]'
      });
      
      // Update the tasks list
      setTasks(prev => [...prev, newTask]);
      
      // Update status-based lists
      if (newTask.status === 'pending') {
        setPendingTasks(prev => [...prev, newTask]);
      } else if (newTask.status === 'completed') {
        setCompletedTasks(prev => [...prev, newTask]);
      }
      
      // Check if it's upcoming or overdue
      const dueDate = newTask.due_date ? new Date(newTask.due_date) : null;
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);
      
      if (dueDate && dueDate <= weekFromNow && dueDate >= now) {
        setUpcomingTasks(prev => [...prev, newTask]);
      } else if (dueDate && dueDate < now) {
        setOverdueTasks(prev => [...prev, newTask]);
      }
      
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating task');
      return null;
    }
  }, [user?.id, taskRepo]);
  
  // Update an existing task
  const updateTask = useCallback(async (taskId: string, updates: Partial<TaskFormData>) => {
    setError(null);
    
    try {
      const updatedTask = await taskRepo.update(taskId, updates);
      
      // Update the tasks list
      setTasks(prev => 
        prev.map(task => task.id === taskId ? updatedTask : task)
      );
      
      // Update status-based lists if status changed
      if ('status' in updates) {
        // Remove from all status lists first
        setPendingTasks(prev => prev.filter(task => task.id !== taskId));
        setCompletedTasks(prev => prev.filter(task => task.id !== taskId));
        
        // Add to appropriate list
        if (updatedTask.status === 'pending') {
          setPendingTasks(prev => [...prev, updatedTask]);
        } else if (updatedTask.status === 'completed') {
          setCompletedTasks(prev => [...prev, updatedTask]);
        }
      }
      
      // Update upcoming/overdue if due_date changed
      if ('due_date' in updates) {
        setUpcomingTasks(prev => prev.filter(task => task.id !== taskId));
        setOverdueTasks(prev => prev.filter(task => task.id !== taskId));
        
        const dueDate = updatedTask.due_date ? new Date(updatedTask.due_date) : null;
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);
        
        if (dueDate && dueDate <= weekFromNow && dueDate >= now) {
          setUpcomingTasks(prev => [...prev, updatedTask]);
        } else if (dueDate && dueDate < now) {
          setOverdueTasks(prev => [...prev, updatedTask]);
        }
      }
      
      // Update selected task if it's the one being edited
      if (selectedTask?.id === taskId) {
        setSelectedTask(updatedTask);
      }
      
      return updatedTask;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Task not found: ${taskId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error updating task');
      }
      return null;
    }
  }, [selectedTask, taskRepo]);
  
  // Delete a task
  const deleteTask = useCallback(async (taskId: string) => {
    setError(null);
    
    try {
      await taskRepo.delete(taskId);
      
      // Remove from all lists
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setPendingTasks(prev => prev.filter(task => task.id !== taskId));
      setCompletedTasks(prev => prev.filter(task => task.id !== taskId));
      setUpcomingTasks(prev => prev.filter(task => task.id !== taskId));
      setOverdueTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Clear selected task if it was the deleted one
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
      
      return true;
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError(`Task not found: ${taskId}`);
      } else {
        setError(err instanceof Error ? err.message : 'Error deleting task');
      }
      return false;
    }
  }, [selectedTask, taskRepo]);
  
  // Mark a task as complete
  const markTaskAsComplete = useCallback(async (taskId: string, obtainedGrade?: number) => {
    const updates: Partial<TaskFormData> = {
      status: 'completed',
      completed_date: new Date().toISOString()
    };
    
    if (obtainedGrade !== undefined) {
      updates.obtained_grade = obtainedGrade;
    }
    
    return updateTask(taskId, updates);
  }, [updateTask]);
  
  // Mark a task as pending/incomplete
  const markTaskAsPending = useCallback(async (taskId: string) => {
    return updateTask(taskId, { 
      status: 'pending',
      completed_date: undefined 
    });
  }, [updateTask]);
  
  // Get a task by ID
  const getTaskById = useCallback(async (taskId: string) => {
    setError(null);
    
    try {
      const task = await taskRepo.getById(taskId);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Error getting task: ${taskId}`);
      return null;
    }
  }, [taskRepo]);
  
  // Select a task (sets the selectedTask state)
  const selectTask = useCallback(async (taskId: string | null) => {
    if (taskId === null) {
      setSelectedTask(null);
      return null;
    }
    
    const task = await getTaskById(taskId);
    setSelectedTask(task);
    return task;
  }, [getTaskById]);
  
  // Search for tasks
  const searchTasks = useCallback(async (query: string) => {
    if (!user?.id || !query) return [];
    
    try {
      return await taskRepo.searchTasks(user.id, query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching tasks');
      return [];
    }
  }, [user?.id, taskRepo]);
  
  // Load tasks on initial render and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchUpcomingTasks();
      fetchOverdueTasks();
    }
  }, [user?.id, fetchTasks, fetchUpcomingTasks, fetchOverdueTasks]);
  
  return {
    // Data
    tasks,
    pendingTasks,
    completedTasks,
    upcomingTasks,
    overdueTasks,
    selectedTask,
    loading,
    error,
    
    // Actions
    fetchTasks,
    fetchTasksByCourse,
    fetchUpcomingTasks,
    fetchOverdueTasks,
    fetchTasksByDateRange,
    createTask,
    updateTask,
    deleteTask,
    markTaskAsComplete,
    markTaskAsPending,
    getTaskById,
    selectTask,
    searchTasks
  };
}
