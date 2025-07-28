"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useGlobalModal } from "@/hooks/ModalProvider"
import { useAuth } from "@/hooks/useAuth"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { clearCredentialsIfNeeded } from "@/utils/biometricAuth"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

interface DailyStats {
  tasksCompleted: number
  totalTasks: number
  studyHours: number
  focusPercentage: number
  streak: number
}

interface WeeklyProgress {
  studyGoal: number // hours
  studyAchieved: number
  tasksGoal: number
  tasksCompleted: number
}

export default function HomeScreen() {
  const { theme } = useTheme()
  const { signOut, user } = useAuth()
  const { showConfirm } = useGlobalModal()
  const { tasks } = useTasks()
  const insets = useSafeAreaInsets()

  const [dailyStats, setDailyStats] = useState<DailyStats>({
    tasksCompleted: 0,
    totalTasks: 0,
    studyHours: 0,
    focusPercentage: 0,
    streak: 0,
  })

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    studyGoal: 35,
    studyAchieved: 28,
    tasksGoal: 15,
    tasksCompleted: 12,
  })

  const [showStreakAchievement, setShowStreakAchievement] = useState(false)

  useEffect(() => {
    calculateDailyStats()
    calculateWeeklyProgress()
    checkStreakAchievements()
  }, [tasks])

  const calculateDailyStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.due_date || task.start_datetime)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === today.getTime()
    })

    const completedTasks = todayTasks.filter((task) => task.status === "completed")

    // Calculate streak - days without overdue tasks
    const streak = calculateStreak()

    // Simulate study hours and focus (these would come from real tracking)
    const studyHours = Math.random() * 2 + 3 // 3-5 hours
    const focusPercentage = Math.round(Math.random() * 15 + 80) // 80-95%

    setDailyStats({
      tasksCompleted: completedTasks.length,
      totalTasks: todayTasks.length,
      studyHours: Math.round(studyHours * 10) / 10,
      focusPercentage,
      streak,
    })
  }

  const calculateStreak = (): number => {
    // Calculate consecutive days without overdue tasks
    const today = new Date()
    let streak = 0

    for (let i = 0; i < 30; i++) {
      // Check last 30 days
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      checkDate.setHours(23, 59, 59, 999)

      const dayTasks = tasks.filter((task) => {
        const taskDue = new Date(task.due_date || task.start_datetime)
        return taskDue <= checkDate && taskDue >= new Date(checkDate.getTime() - 24 * 60 * 60 * 1000)
      })

      const hasOverdueTasks = dayTasks.some(
        (task) =>
          task.status === "overdue" ||
          (task.status !== "completed" && new Date(task.due_date || task.start_datetime) < new Date()),
      )

      if (hasOverdueTasks && i > 0) {
        break
      }

      if (dayTasks.length > 0 && !hasOverdueTasks) {
        streak++
      }
    }

    return streak
  }

  const calculateWeeklyProgress = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Start of week

    const weekTasks = tasks.filter((task) => {
      const taskDate = new Date(task.due_date || task.start_datetime)
      return taskDate >= weekStart && taskDate <= today
    })

    const completedWeekTasks = weekTasks.filter((task) => task.status === "completed")

    // Simulate study hours achieved this week
    const studyAchieved = Math.round((Math.random() * 10 + 25) * 10) / 10 // 25-35 hours

    setWeeklyProgress({
      studyGoal: 35,
      studyAchieved,
      tasksGoal: 15,
      tasksCompleted: completedWeekTasks.length,
    })
  }

  const checkStreakAchievements = () => {
    const streak = calculateStreak()
    const milestones = [7, 14, 30, 60, 100]

    // Check if user just hit a milestone
    if (milestones.includes(streak)) {
      setShowStreakAchievement(true)
      setTimeout(() => setShowStreakAchievement(false), 5000)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "¡Buenos días"
    if (hour < 18) return "¡Buenas tardes"
    return "¡Buenas noches"
  }

  const userName = user?.email?.split("@")[0] || "Estudiante"
  const userInitials = userName.substring(0, 2).toUpperCase()

  const handleLogout = () => {
    showConfirm(
      "¿Estás seguro de que quieres cerrar sesión?",
      async () => {
        try {
          const currentEmail = user?.email || null
          await signOut()
          await clearCredentialsIfNeeded(currentEmail)
          router.replace("/(auth)/login")
        } catch (error) {
          console.error("Error al cerrar sesión:", error)
        }
      },
      () => {
        console.log("Logout cancelado")
      },
      "Cerrar Sesión",
    )
  }

  const upcomingTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort(
      (a, b) => new Date(a.due_date || a.start_datetime).getTime() - new Date(b.due_date || b.start_datetime).getTime(),
    )
    .slice(0, 3)

  const navigateTo = (route: string) => {
    try {
      router.push(route as any)
    } catch {
      router.navigate(route as any)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ThemedView variant="background" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.md,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ThemedView
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: theme.spacing.lg,
            }}
          >
            <ThemedView style={{ flex: 1 }}>
              <ThemedText
                variant="h1"
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  marginBottom: theme.spacing.xs,
                }}
              >
                {getGreeting()}, {userName}! 👋
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ fontSize: 16 }}>
                Continúa con tu racha de estudio
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
              <TouchableOpacity>
                <IconSymbol name="bell" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <ThemedText variant="button" style={{ color: "white", fontWeight: "600" }}>
                  {userInitials}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  backgroundColor: theme.colors.error,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ThemedText variant="body" style={{ color: "white", fontWeight: "600" }}>
                  Cerrar sesión
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Stats Cards */}
          <ThemedView
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: theme.spacing.lg,
              gap: theme.spacing.sm,
            }}
          >
            {/* Tasks */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.success + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <IconSymbol name="checkmark.circle" size={24} color={theme.colors.success} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Tareas
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {dailyStats.tasksCompleted}/{dailyStats.totalTasks}
              </ThemedText>
            </ThemedCard>

            {/* Study Hours */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.info + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <IconSymbol name="clock" size={24} color={theme.colors.info} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Horas hoy
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {dailyStats.studyHours}h
              </ThemedText>
            </ThemedCard>

            {/* Streak */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
              width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
              alignItems: "center",
              }}
            >
              <View
              style={{
                backgroundColor: "#FFD580", // color cálido de fondo
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.full,
                marginBottom: theme.spacing.sm,
                alignItems: "center",
                justifyContent: "center",
              }}
              >
              <IconSymbol name="flame" size={28} color="#FF9900" />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
              Racha
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
              {dailyStats.streak} días
              </ThemedText>
            </ThemedCard>

            {/* Focus */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.accent + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <IconSymbol name="target" size={24} color={theme.colors.accent} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Enfoque
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {dailyStats.focusPercentage}%
              </ThemedText>
            </ThemedCard>
          </ThemedView>

          {/* Weekly Progress */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
              <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={theme.colors.primary} />
              <ThemedText
                variant="h2"
                style={{
                  marginLeft: theme.spacing.sm,
                  fontWeight: "700",
                }}
              >
                Progreso Semanal
              </ThemedText>
            </ThemedView>

            {/* Study Goal */}
            <ThemedView style={{ marginBottom: theme.spacing.md }}>
              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing.xs,
                }}
              >
                <ThemedText variant="body">Meta de estudio</ThemedText>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  {weeklyProgress.studyAchieved}/{weeklyProgress.studyGoal} horas
                </ThemedText>
              </ThemedView>
              <View
                style={{
                  height: 8,
                  backgroundColor: theme.colors.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (weeklyProgress.studyAchieved / weeklyProgress.studyGoal) * 100)}%`,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 4,
                  }}
                />
              </View>
            </ThemedView>

            {/* Tasks Goal */}
            <ThemedView>
              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: theme.spacing.xs,
                }}
              >
                <ThemedText variant="body">Tareas completadas</ThemedText>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  {weeklyProgress.tasksCompleted}/{weeklyProgress.tasksGoal}
                </ThemedText>
              </ThemedView>
              <View
                style={{
                  height: 8,
                  backgroundColor: theme.colors.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (weeklyProgress.tasksCompleted / weeklyProgress.tasksGoal) * 100)}%`,
                    backgroundColor: theme.colors.success,
                    borderRadius: 4,
                  }}
                />
              </View>
            </ThemedView>
          </ThemedCard>

          {/* Streak Achievement */}
          {showStreakAchievement && (
            <ThemedCard
              variant="elevated"
              padding="large"
              style={{
                backgroundColor: theme.colors.accent + "20",
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.accent,
                marginBottom: theme.spacing.lg,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.accent + "30",
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.full,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name="trophy" size={28} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="h3" style={{ fontWeight: "700", marginBottom: 4 }}>
                    ¡Logro Desbloqueado!
                  </ThemedText>
                  <ThemedText variant="body" color="secondary">
                    Completaste {dailyStats.streak} días consecutivos de estudio
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          )}

          {/* Upcoming Tasks */}
          <ThemedCard variant="elevated" padding="large">
            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <IconSymbol name="clock" size={24} color={theme.colors.primary} />
                <ThemedText
                  variant="h2"
                  style={{
                    marginLeft: theme.spacing.sm,
                    fontWeight: "700",
                  }}
                >
                  Próximas Tareas
                </ThemedText>
              </ThemedView>
              <TouchableOpacity
                onPress={() => navigateTo("/tasks")}
                style={{
                  backgroundColor: theme.colors.surface,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                  + Agregar
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {upcomingTasks.length === 0 ? (
              <ThemedView style={{ alignItems: "center", paddingVertical: theme.spacing.lg }}>
                <IconSymbol name="checkmark.circle" size={48} color={theme.colors.success} />
                <ThemedText variant="body" color="secondary" style={{ marginTop: theme.spacing.sm }}>
                  ¡No tienes tareas pendientes!
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedView style={{ gap: theme.spacing.md }}>
                {upcomingTasks.map((task, index) => {
                  const dueDate = new Date(task.due_date || task.start_datetime)
                  const isOverdue = dueDate < new Date() && task.status !== "completed"
                  const diffDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

                  let priorityColor = theme.colors.success
                  let priorityLabel = "Baja"

                  if (isOverdue) {
                    priorityColor = theme.colors.error
                    priorityLabel = "Atrasada"
                  } else if (diffDays <= 1) {
                    priorityColor = theme.colors.error
                    priorityLabel = "Alta"
                  } else if (diffDays <= 3) {
                    priorityColor = theme.colors.warning
                    priorityLabel = "Media"
                  }

                  return (
                    <TouchableOpacity
                      key={task.task_id || index}
                      onPress={() => navigateTo("/tasks")}
                      style={{
                        backgroundColor: theme.colors.surface,
                        padding: theme.spacing.md,
                        borderRadius: theme.borderRadius.md,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <ThemedView
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <ThemedView style={{ flex: 1 }}>
                          <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                            {task.task_title || task.event_title}
                          </ThemedText>
                          <ThemedText variant="caption" color="secondary">
                            {task.class_name || "Sin materia"}
                          </ThemedText>
                        </ThemedView>
                        <ThemedView style={{ alignItems: "flex-end" }}>
                          <View
                            style={{
                              backgroundColor: priorityColor + "20",
                              paddingHorizontal: theme.spacing.sm,
                              paddingVertical: 4,
                              borderRadius: theme.borderRadius.sm,
                              marginBottom: 4,
                            }}
                          >
                            <ThemedText variant="caption" style={{ color: priorityColor, fontWeight: "600" }}>
                              {priorityLabel}
                            </ThemedText>
                          </View>
                          <ThemedText variant="caption" color="secondary">
                            {dueDate.toLocaleDateString()}
                          </ThemedText>
                        </ThemedView>
                      </ThemedView>
                    </TouchableOpacity>
                  )
                })}
              </ThemedView>
            )}
          </ThemedCard>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}
