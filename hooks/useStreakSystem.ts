// hooks/useStreakSystem.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

interface StreakData {
  current: number
  longest: number
  lastActivityDate: string | null
  weeklyGoal: number
  weeklyCompleted: number
  milestones: number[]
  streakType: 'daily' | 'weekly'
}

interface DailyActivity {
  date: string
  tasksCompleted: number
  studyMinutes: number
  hasActivity: boolean
}

export const useStreakSystem = (tasks: any[], profile: any) => {
  const [streakData, setStreakData] = useState<StreakData>({
    current: 0,
    longest: 0,
    lastActivityDate: null,
    weeklyGoal: 5, // 5 días de actividad por semana
    weeklyCompleted: 0,
    milestones: [7, 30, 100, 365], // días
    streakType: 'daily'
  })

  const [recentActivities, setRecentActivities] = useState<DailyActivity[]>([])

  // Cargar datos de racha al inicializar
  useEffect(() => {
    loadStreakData()
  }, [])

  // Recalcular racha cuando cambien las tareas
  useEffect(() => {
    calculateCurrentStreak()
  }, [tasks])

  const loadStreakData = async () => {
    try {
      const saved = await AsyncStorage.getItem('streakData')
      if (saved) {
        setStreakData(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading streak data:', error)
    }
  }

  const saveStreakData = async (data: StreakData) => {
    try {
      await AsyncStorage.setItem('streakData', JSON.stringify(data))
      setStreakData(data)
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
      } else {
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

    if (JSON.stringify(newStreakData) !== JSON.stringify(streakData)) {
      saveStreakData(newStreakData)
    }
  }

  const checkTodayActivity = (): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Criterios para considerar "actividad del día":
    // 1. Al menos 1 tarea completada HOY
    // 2. O al menos 30 minutos de estudio (si tienes esa data)
    // 3. O participación en clase (si tienes esa feature)
    
    const todayTasks = tasks.filter(task => {
      const completedDate = new Date(task.completed_at || 0)
      completedDate.setHours(0, 0, 0, 0)
      return task.status === 'completed' && completedDate.getTime() === today.getTime()
    })

    return todayTasks.length > 0
  }

  const getLast30DaysActivities = (): DailyActivity[] => {
    const activities: DailyActivity[] = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(0, 0, 0, 0)
      
      const dateStr = checkDate.toISOString().split('T')[0]
      
      // Tareas completadas ese día
      const completedTasks = tasks.filter(task => {
        if (task.status !== 'completed' || !task.completed_at) return false
        const completedDate = new Date(task.completed_at)
        completedDate.setHours(0, 0, 0, 0)
        return completedDate.getTime() === checkDate.getTime()
      })

      activities.push({
        date: dateStr,
        tasksCompleted: completedTasks.length,
        studyMinutes: 0, // Puedes agregar esta funcionalidad
        hasActivity: completedTasks.length > 0
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
    useStreakFreeze
  }
}
