// hooks/useStreakSystem.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
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

  // Cargar datos de racha al inicializar
  useEffect(() => {
    loadStreakData()
  }, [])

  // Recalcular racha cuando cambien las tareas
  useEffect(() => {
    if (tasks.length > 0) {
      calculateCurrentStreak()
    }
  }, [tasks])

  const loadStreakData = async () => {
    try {
      // Primero intentar cargar desde la base de datos (user_preferences)
      if (profile?.preferences?.streakData) {
        const dbStreakData = profile.preferences.streakData
        setStreakData(dbStreakData)
        console.log('📊 Streak data loaded from DB:', dbStreakData)
        return
      }

      // Fallback a AsyncStorage
      const saved = await AsyncStorage.getItem('streakData')
      if (saved) {
        const parsedData = JSON.parse(saved)
        setStreakData(parsedData)
        console.log('📊 Streak data loaded from AsyncStorage:', parsedData)
        
        // Migrar a la base de datos
        await saveStreakDataToDB(parsedData)
      }
    } catch (error) {
      console.error('Error loading streak data:', error)
    }
  }

  const saveStreakDataToDB = async (data: StreakData) => {
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
  }

  const saveStreakData = async (data: StreakData) => {
    try {
      // Guardar en AsyncStorage como backup
      await AsyncStorage.setItem('streakData', JSON.stringify(data))
      
      // Guardar en la base de datos
      await saveStreakDataToDB(data)
      
      setStreakData(data)
      console.log('💾 Streak data saved:', data)
    } catch (error) {
      console.error('Error saving streak data:', error)
    }
  }

  const calculateCurrentStreak = () => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Obtener actividades de los últimos 30 días
    const activities = getLast30DaysActivities()
    setRecentActivities(activities)

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
      const dateStr = checkDate.toISOString().split('T')[0]
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
      lastActivity: newStreakData.lastActivityDate
    })

    if (JSON.stringify(newStreakData) !== JSON.stringify(streakData)) {
      saveStreakData(newStreakData)
    }
  }

  const checkTodayActivity = (): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Obtener tareas de hoy
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.due_date || task.start_datetime)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === today.getTime()
    })

    // Obtener tareas completadas hoy
    const todayCompletedTasks = tasks.filter(task => {
      if (task.status !== 'completed' || !task.completed_at) return false
      
      const completedDate = new Date(task.completed_at)
      completedDate.setHours(0, 0, 0, 0)
      
      const hasActivity = completedDate.getTime() === today.getTime()
      if (hasActivity) {
        console.log('✅ Task completed today:', task.task_title || task.event_title)
      }
      
      return hasActivity
    })

    // Si no hay tareas para hoy, considerar como "actividad completada"
    if (todayTasks.length === 0) {
      console.log('📅 No tasks scheduled for today - considering as completed day')
      return true
    }

    // Si hay tareas para hoy, verificar si todas están completadas
    const allTasksCompleted = todayTasks.every(task => task.status === 'completed')
    if (allTasksCompleted && todayTasks.length > 0) {
      console.log('🎉 All today tasks completed!')
      return true
    }

    // Si hay tareas completadas hoy, es actividad
    const hasActivity = todayCompletedTasks.length > 0
    console.log(`📊 Today's completed tasks: ${todayCompletedTasks.length}/${todayTasks.length}`)
    return hasActivity
  }

  const getLast30DaysActivities = (): DailyActivity[] => {
    const activities: DailyActivity[] = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)
      
      const dateStr = checkDate.toISOString().split('T')[0]
      
      // Tareas programadas para ese día
      const scheduledTasks = tasks.filter(task => {
        const taskDate = new Date(task.due_date || task.start_datetime)
        taskDate.setHours(0, 0, 0, 0)
        return taskDate.getTime() === checkDate.getTime()
      })

      // Tareas completadas ese día
      const completedTasks = tasks.filter(task => {
        if (task.status !== 'completed' || !task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === checkDate.getTime()
      })

      // Determinar si hay actividad:
      // 1. Si no hay tareas programadas para ese día = actividad (día libre)
      // 2. Si todas las tareas programadas están completadas = actividad
      // 3. Si hay al menos una tarea completada = actividad
      const hasActivity = scheduledTasks.length === 0 || 
                         (scheduledTasks.length > 0 && scheduledTasks.every(t => t.status === 'completed')) ||
                         completedTasks.length > 0

      activities.push({
        date: dateStr,
        tasksCompleted: completedTasks.length,
        studyMinutes: 0, // Puedes agregar esta funcionalidad
        hasActivity: hasActivity
      })
    }
    
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const getStreakStatus = () => {
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
  }

  const getNextMilestone = () => {
    return streakData.milestones.find(milestone => milestone > streakData.current) || null
  }

  const getAchievedMilestones = () => {
    return streakData.milestones.filter(milestone => milestone <= streakData.longest)
  }

  const getStreakMotivation = () => {
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
  }

  // Función para restablecer la racha (reset completo)
  const resetStreak = async () => {
    const newStreakData = {
      ...streakData,
      current: 0,
      lastActivityDate: null
    }
    
    await saveStreakData(newStreakData)
    console.log('🔄 Streak reset successfully')
  }

  // Función para restaurar la racha perdida
  const restoreStreak = async () => {
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
  }

  // Verificar si se puede restaurar la racha
  const canRestoreStreak = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    // Si es un nuevo mes, resetear contador
    if (streakData.lastRestorationMonth !== currentMonth) {
      return true
    }
    
    return streakData.restorationsUsed < 3
  }

  // Obtener restauraciones restantes
  const getRemainingRestorations = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    if (streakData.lastRestorationMonth !== currentMonth) {
      return 3
    }
    
    return Math.max(0, 3 - streakData.restorationsUsed)
  }

  // Función para "congelar" racha (como en Duolingo)
  const useStreakFreeze = async () => {
    // Implementar lógica para usar un "congelador de racha"
    // Requiere sistema de coins o premium
  }

  // FUNCIONES ADICIONALES PARA GAMIFICACIÓN:

  const getStreakEmoji = () => {
    const { current } = streakData
    if (current === 0) return '🎯'
    if (current < 3) return '🔥'
    if (current < 7) return '💪'
    if (current < 30) return '🚀'
    if (current < 100) return '👑'
    return '🏆'
  }

  const getStreakTitle = () => {
    const { current } = streakData
    if (current === 0) return 'Principiante'
    if (current < 7) return 'Estudiante Dedicado'
    if (current < 30) return 'Académico Consistente'
    if (current < 100) return 'Máquina de Estudio'
    return 'Leyenda Académica'
  }

  const shouldShowCelebration = () => {
    // Mostrar celebración en milestones
    return streakData.milestones.includes(streakData.current)
  }

  const getWeeklyProgress = () => {
    const currentWeek = recentActivities.slice(0, 7)
    const activeDays = currentWeek.filter(day => day.hasActivity).length
    return {
      completed: activeDays,
      total: 7,
      percentage: (activeDays / 7) * 100
    }
  }

  return {
    streakData,
    recentActivities,
    streakStatus: getStreakStatus(),
    nextMilestone: getNextMilestone(),
    achievedMilestones: getAchievedMilestones(),
    motivation: getStreakMotivation(),
    refreshStreak: calculateCurrentStreak,
    resetStreak,
    restoreStreak,
    canRestoreStreak,
    getRemainingRestorations,
    useStreakFreeze
  }
}
