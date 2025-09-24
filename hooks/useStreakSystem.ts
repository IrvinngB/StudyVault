// hooks/useStreakSystem.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { useUserProfile } from './useUserProfile'

interface StreakData {
  current: number
  longest: number
  lastActivityDate: string | null
  weeklyGoal: number
  weeklyCompleted: number
  milestones: number[]
  streakType: 'daily' | 'weekly'
  // Nuevos campos para restauración
  restorationsUsed: number
  lastRestorationMonth: string | null // Formato: "YYYY-MM"
}

interface DailyActivity {
  date: string
  tasksCompleted: number
  studyMinutes: number
  hasActivity: boolean
}

export const useStreakSystem = (tasks: any[], profile: any) => {
  const { updateProfile } = useUserProfile()
  const [streakData, setStreakData] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastActivityDate: null,
    weeklyGoal: 5, // 5 días de actividad por semana
    weeklyCompleted: 0,
    milestones: [7, 30, 100, 365], // días
    streakType: 'daily',
    restorationsUsed: 0,
    lastRestorationMonth: null
  })

  const [recentActivities, setRecentActivities] = useState<DailyActivity[]>([])
  
  // Referencias para evitar bucles infinitos
  const isCalculating = useRef(false)
  const lastTasksHash = useRef<string>('')
  const lastProfileHash = useRef<string>('')

  // Función para normalizar fechas y evitar problemas de zona horaria
  const normalizeDate = useCallback((date: Date): Date => {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }, [])

  const getDateString = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0]
  }, [])

  const saveStreakDataToDB = useCallback(async (data: StreakData) => {
    try {
      await updateProfile({
        preferences: {
          ...profile?.preferences,
          streakData: data
        }
      })
      console.log('💾 Streak data saved to DB:', data)
    } catch (error) {
      console.error('Error saving streak data to DB:', error)
    }
  }, [updateProfile, profile?.preferences])

  const saveStreakData = useCallback(async (data: StreakData) => {
    try {
      // Actualizar el estado local primero
      setStreakData(data)
      
      // Guardar en la base de datos de forma asíncrona
      await saveStreakDataToDB(data)
      console.log('💾 Streak data saved to DB:', data)
    } catch (error) {
      console.error('Error saving streak data:', error)
    }
  }, [saveStreakDataToDB])

  const checkTodayActivity = useCallback((): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Si no hay tareas cargadas, no considerar como actividad
    if (!tasks || tasks.length === 0) {
      console.log('📊 No tasks available, cannot determine activity')
      return false
    }
    
    // Obtener tareas completadas hoy
    const todayCompletedTasks = tasks.filter(task => {
      if (task.status !== 'completed' || !task.updated_at) return false
      
      const completedDate = new Date(task.updated_at)
      completedDate.setHours(0, 0, 0, 0)
      
      const hasActivity = completedDate.getTime() === today.getTime()
      if (hasActivity) {
        console.log('✅ Task completed today:', task.task_title || task.event_title)
      }
      
      return hasActivity
    })

    // Verificar si hay tareas atrasadas (solo las que no están completadas)
    const overdueTasks = tasks.filter(task => {
      if (task.status === 'completed') return false
      
      const dueDate = new Date(task.due_date || task.start_datetime)
      dueDate.setHours(0, 0, 0, 0)
      
      return dueDate < today
    })

    // Verificar si hay tareas para hoy o futuras (para determinar si es realmente un "día libre")
    const todayOrFutureTasks = tasks.filter(task => {
      if (task.status === 'completed') return false
      
      const dueDate = new Date(task.due_date || task.start_datetime)
      dueDate.setHours(0, 0, 0, 0)
      
      return dueDate >= today
    })

    const hasOverdueTasks = overdueTasks.length > 0
    const hasCompletedTaskToday = todayCompletedTasks.length > 0
    const hasTodayOrFutureTasks = todayOrFutureTasks.length > 0

    console.log('📊 Today activity analysis:', {
      completedToday: todayCompletedTasks.length,
      overdueTasks: overdueTasks.length,
      todayOrFutureTasks: todayOrFutureTasks.length,
      hasOverdueTasks,
      hasCompletedTaskToday,
      hasTodayOrFutureTasks
    })

    // LÓGICA CORREGIDA:
    // 1. Si completó al menos una tarea hoy = actividad válida
    if (hasCompletedTaskToday) {
      console.log('🎉 Activity: Completed task today')
      return true
    }

    // 2. Verificar si hay tareas programadas para hoy
    const todayTasks = tasks.filter(task => {
      if (task.status === 'completed') return false
      
      const dueDate = new Date(task.due_date || task.start_datetime)
      dueDate.setHours(0, 0, 0, 0)
      
      return dueDate.getTime() === today.getTime()
    })

    // 3. Solo considerar como actividad si hay tareas programadas para hoy
    if (todayTasks.length > 0) {
      console.log('✅ Activity: Has tasks scheduled for today')
      return true
    }

    console.log('❌ No activity: No completed tasks and no tasks scheduled for today')
    return false
  }, [tasks])

  const getLast30DaysActivities = useCallback((): DailyActivity[] => {
    const activities: DailyActivity[] = []
    const today = new Date()
    
    // Si no hay tareas, retornar actividades vacías
    if (!tasks || tasks.length === 0) {
      console.log('📊 No tasks available for activities calculation')
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]
        activities.push({
          date: dateStr,
          tasksCompleted: 0,
          studyMinutes: 0,
          hasActivity: false
        })
      }
      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)
      
      const dateStr = checkDate.toISOString().split('T')[0]

      // Tareas completadas ese día
      const completedTasks = tasks.filter(task => {
        if (task.status !== 'completed' || !task.updated_at) return false
        const completedDate = new Date(task.updated_at)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === checkDate.getTime()
      })

      // Verificar tareas atrasadas hasta ese día (solo las no completadas)
      const overdueTasks = tasks.filter(task => {
        if (task.status === 'completed') return false
        
        const dueDate = new Date(task.due_date || task.start_datetime)
        dueDate.setHours(0, 0, 0, 0)
        
        return dueDate < checkDate
      })

      const hasOverdueTasks = overdueTasks.length > 0
      const hasCompletedTaskOnDay = completedTasks.length > 0

      // LÓGICA CORREGIDA: Se considera actividad válida SOLO si:
      // 1. Se completó al menos una tarea ese día
      // 2. O había tareas programadas para ese día (aunque no se completaran)
      let hasActivity = false
      
      if (hasCompletedTaskOnDay) {
        hasActivity = true
      } else {
        // Verificar si había tareas programadas para ese día
        const tasksForDay = tasks.filter(task => {
          if (task.status === 'completed') return false
          
          const dueDate = new Date(task.due_date || task.start_datetime)
          dueDate.setHours(0, 0, 0, 0)
          
          return dueDate.getTime() === checkDate.getTime()
        })
        
        // Solo considerar como actividad si había tareas programadas para ese día
        hasActivity = tasksForDay.length > 0
      }

      activities.push({
        date: dateStr,
        tasksCompleted: completedTasks.length,
        studyMinutes: 0, // Puedes agregar esta funcionalidad
        hasActivity: hasActivity
      })
    }
    
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [tasks])

  const loadStreakData = useCallback(async () => {
    try {
      // Cargar desde la base de datos (user_preferences)
      if (profile?.preferences?.streakData) {
        const dbStreakData = profile.preferences.streakData
        setStreakData(dbStreakData)
        console.log('📊 Streak data loaded from DB:', dbStreakData)
        return
      }

      // Si no hay datos en la BDD, usar valores por defecto
      console.log('📊 No streak data found, using defaults')
    } catch (error) {
      console.error('Error loading streak data:', error)
    }
  }, [profile?.preferences?.streakData])

  const calculateCurrentStreak = useCallback(() => {
    if (isCalculating.current) {
      console.log('🔄 Already calculating streak, skipping...')
      return
    }
    
    isCalculating.current = true
    
    try {
      const today = normalizeDate(new Date())
      const todayStr = getDateString(today)
      
      console.log('🔄 Calculating streak for date:', todayStr)
      console.log('📊 Available tasks:', tasks?.length || 0)
      
      // Debug: Mostrar información de las tareas
      if (tasks && tasks.length > 0) {
        console.log('📊 Tasks sample:', tasks.slice(0, 3).map(t => ({
          id: t.task_id || t.calendar_event_id,
          title: t.task_title || t.event_title,
          status: t.status,
          due_date: t.due_date || t.start_datetime,
          updated_at: t.updated_at
        })))
      }
      
      // Obtener actividades de los últimos 30 días
      const activities = getLast30DaysActivities()
      setRecentActivities(activities)

      console.log('📊 Activities calculated:', activities.length)
      console.log('📊 Recent activities sample:', activities.slice(0, 7).map(a => ({
        date: a.date,
        completed: a.tasksCompleted,
        hasActivity: a.hasActivity
      })))

      // Calcular racha actual
      let currentStreak = 0
      let checkDate = new Date(today)
      
      // Verificar actividad de hoy
      let hasActivityToday = checkTodayActivity()
      console.log('📅 Today activity check:', hasActivityToday)
      
      // Si no hay actividad hoy, empezar desde ayer
      if (!hasActivityToday) {
        checkDate.setDate(checkDate.getDate() - 1)
      }

      // Contar días consecutivos con actividad
      while (checkDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        const dateStr = getDateString(checkDate)
        const dayActivity = activities.find(a => a.date === dateStr)
        
        if (dayActivity && dayActivity.hasActivity) {
          currentStreak++
          console.log(`✅ Day ${dateStr}: Activity found, streak: ${currentStreak}`)
        } else {
          console.log(`❌ Day ${dateStr}: No activity, breaking streak`)
          break
        }
        
        checkDate.setDate(checkDate.getDate() - 1)
      }

      // Actualizar datos de racha
      const newStreakData = {
        ...streakData,
        current: currentStreak,
        longest: Math.max(streakData.longest, currentStreak),
        lastActivityDate: hasActivityToday ? todayStr : streakData.lastActivityDate
      }

      console.log('🔥 New streak calculation:', {
        current: currentStreak,
        longest: newStreakData.longest,
        lastActivity: newStreakData.lastActivityDate,
        previousStreak: streakData.current
      })

      // Solo guardar si hay cambios reales
      if (JSON.stringify(newStreakData) !== JSON.stringify(streakData)) {
        console.log('💾 Streak data changed, saving to DB...')
        saveStreakData(newStreakData)
      } else {
        console.log('📊 No changes in streak data')
        // Actualizar el estado local sin guardar en DB
        setStreakData(newStreakData)
      }
    } finally {
      isCalculating.current = false
    }
  }, [normalizeDate, getDateString, getLast30DaysActivities, checkTodayActivity, streakData, saveStreakData])

  // Cargar datos de racha al inicializar
  useEffect(() => {
    loadStreakData()
  }, [loadStreakData])

  // Recalcular racha cuando cambien las tareas (con protección anti-bucle)
  useEffect(() => {
    if (isCalculating.current) return
    
    // Crear un hash simple de las tareas para detectar cambios reales
    const tasksHash = JSON.stringify(tasks.map(t => ({
      id: t.task_id || t.calendar_event_id,
      status: t.status,
      updated_at: t.updated_at,
      due_date: t.due_date || t.start_datetime
    })))
    
    // Solo recalcular si realmente cambiaron las tareas
    if (tasksHash !== lastTasksHash.current) {
      lastTasksHash.current = tasksHash
      console.log('🔄 Tasks changed, recalculating streak...')
      calculateCurrentStreak()
    }
  }, [tasks, calculateCurrentStreak])

  // Recalcular cuando cambie el perfil (para sincronizar con BDD)
  useEffect(() => {
    if (isCalculating.current || !profile) return
    
    // Crear un hash del perfil para detectar cambios reales
    const profileHash = JSON.stringify(profile.preferences?.streakData || {})
    
    // Solo recargar si realmente cambió el perfil
    if (profileHash !== lastProfileHash.current) {
      lastProfileHash.current = profileHash
      console.log('🔄 Profile changed, reloading streak data...')
      loadStreakData()
    }
  }, [profile, loadStreakData])

  const getStreakStatus = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    const hasActivityToday = checkTodayActivity()
    
    if (hasActivityToday) {
      return {
        status: 'active',
        message: '¡Racha activa! 🔥',
        color: '#FF6B35'
      }
    } else if (streakData.lastActivityDate === today) {
      return {
        status: 'active',
        message: '¡Racha activa! 🔥',
        color: '#FF6B35'
      }
    } else {
      const lastActivity = new Date(streakData.lastActivityDate || 0)
      const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceActivity === 1) {
        return {
          status: 'at_risk',
          message: '¡No pierdas tu racha! ⚠️',
          color: '#FFB800'
        }
      } else if (daysSinceActivity > 1) {
        return {
          status: 'lost',
          message: 'Comienza una nueva racha 💪',
          color: '#8E8E93'
        }
      }
    }
    
    return {
      status: 'new',
      message: '¡Comienza tu racha! 🚀',
      color: '#007AFF'
    }
  }, [checkTodayActivity, streakData.lastActivityDate])

  const getNextMilestone = useCallback(() => {
    return streakData.milestones.find(milestone => milestone > streakData.current) || null
  }, [streakData.milestones, streakData.current])

  const getAchievedMilestones = useCallback(() => {
    return streakData.milestones.filter(milestone => milestone <= streakData.longest)
  }, [streakData.milestones, streakData.longest])

  const getStreakMotivation = useCallback(() => {
    const { current } = streakData
    
    if (current === 0) {
      return "¡Completa tu primera tarea para comenzar tu racha! 🎯"
    } else if (current < 7) {
      return `¡Genial! Solo ${7 - current} días más para tu primera semana 📅`
    } else if (current < 30) {
      return `¡Increíble! Faltan ${30 - current} días para el mes completo 🏆`
    } else if (current < 100) {
      return `¡Eres una máquina! ${100 - current} días para los 100 🚀`
    } else {
      return "¡Eres una leyenda del estudio! 👑"
    }
  }, [streakData])

  // Función para restablecer la racha (reset completo)
  const resetStreak = useCallback(async () => {
    const newStreakData = {
      ...streakData,
      current: 0,
      lastActivityDate: null
    }
    
    await saveStreakData(newStreakData)
    console.log('🔄 Streak reset successfully')
  }, [streakData, saveStreakData])

  // Función para restaurar la racha perdida
  const restoreStreak = useCallback(async () => {
    const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
    
    // Verificar si es un nuevo mes
    if (streakData.lastRestorationMonth !== currentMonth) {
      // Resetear contador para el nuevo mes
      const newStreakData = {
        ...streakData,
        restorationsUsed: 1,
        lastRestorationMonth: currentMonth,
        current: streakData.current, // Mantener la racha actual
        lastActivityDate: new Date().toISOString().split('T')[0] // Marcar como actividad hoy
      }
      
      await saveStreakData(newStreakData)
      console.log('🔄 Streak restored for new month')
      return true
    }
    
    // Verificar límite mensual
    if (streakData.restorationsUsed >= 3) {
      console.log('❌ Monthly restoration limit reached')
      return false
    }
    
    // Restaurar la racha
    const newStreakData = {
      ...streakData,
      restorationsUsed: streakData.restorationsUsed + 1,
      lastActivityDate: new Date().toISOString().split('T')[0] // Marcar como actividad hoy
    }
    
    await saveStreakData(newStreakData)
    console.log('🔄 Streak restored successfully')
    return true
  }, [streakData, saveStreakData])

  // Verificar si se puede restaurar la racha
  const canRestoreStreak = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // Si es un nuevo mes, resetear contador
    if (streakData.lastRestorationMonth !== currentMonth) {
      return true
    }
    
    return streakData.restorationsUsed < 3
  }, [streakData.lastRestorationMonth, streakData.restorationsUsed])

  // Obtener restauraciones restantes
  const getRemainingRestorations = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    if (streakData.lastRestorationMonth !== currentMonth) {
      return 3
    }
    
    return Math.max(0, 3 - streakData.restorationsUsed)
  }, [streakData.lastRestorationMonth, streakData.restorationsUsed])

  // Función para "congelar" racha (como en Duolingo)
  const useStreakFreeze = useCallback(async () => {
    // Implementar lógica para usar un "congelador de racha"
    // Requiere sistema de coins o premium
  }, [])

  // FUNCIONES ADICIONALES PARA GAMIFICACIÓN (solo las que se exportan):

  const getStreakEmoji = useCallback(() => {
    const { current } = streakData
    if (current === 0) return '🎯'
    if (current < 3) return '🔥'
    if (current < 7) return '💪'
    if (current < 30) return '🚀'
    if (current < 100) return '👑'
    return '🏆'
  }, [streakData])

  const getStreakTitle = useCallback(() => {
    const { current } = streakData
    if (current === 0) return 'Principiante'
    if (current < 7) return 'Estudiante Dedicado'
    if (current < 30) return 'Académico Consistente'
    if (current < 100) return 'Máquina de Estudio'
    return 'Leyenda Académica'
  }, [streakData])

  const shouldShowCelebration = useCallback(() => {
    // Mostrar celebración en milestones
    return streakData.milestones.includes(streakData.current)
  }, [streakData.milestones, streakData.current])

  const getWeeklyProgress = useCallback(() => {
    const currentWeek = recentActivities.slice(0, 7)
    const activeDays = currentWeek.filter(day => day.hasActivity).length
    return {
      completed: activeDays,
      total: 7,
      percentage: (activeDays / 7) * 100
    }
  }, [recentActivities])

  const refreshStreak = useCallback(() => {
    console.log('🔄 Manual streak refresh requested')
    console.log('📊 Current tasks count:', tasks?.length || 0)
    console.log('📊 Tasks sample:', tasks?.slice(0, 3).map(t => ({
      id: t.task_id || t.calendar_event_id,
      title: t.task_title || t.event_title,
      status: t.status,
      due_date: t.due_date || t.start_datetime,
      updated_at: t.updated_at
    })))
    
    // Resetear las referencias para forzar el recálculo
    lastTasksHash.current = ''
    lastProfileHash.current = ''
    isCalculating.current = false
    calculateCurrentStreak()
  }, [calculateCurrentStreak, tasks])

  return {
    streakData,
    recentActivities,
    streakStatus: getStreakStatus(),
    nextMilestone: getNextMilestone(),
    achievedMilestones: getAchievedMilestones(),
    motivation: getStreakMotivation(),
    refreshStreak,
    resetStreak,
    restoreStreak,
    canRestoreStreak,
    getRemainingRestorations,
    useStreakFreeze,
    // Exportar funciones adicionales para gamificación
    getStreakEmoji,
    getStreakTitle,
    shouldShowCelebration,
    getWeeklyProgress
  }
}