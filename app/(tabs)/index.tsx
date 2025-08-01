"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { AVAILABLE_AVATARS } from "@/database/models/userTypes"
import { useGlobalModal } from "@/hooks/ModalProvider"
import { useAuth } from "@/hooks/useAuth"
import { useClasses } from "@/hooks/useClasses"
import { useStreakSystem } from "@/hooks/useStreakSystem"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { useUserProfile } from "@/hooks/useUserProfile"
import { clearCredentialsIfNeeded } from "@/utils/biometricAuth"
import { router } from "expo-router"
import { Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

interface DailyStats {
  tasksCompleted: number
  totalTasks: number
  streak: number
}

export default function HomeScreen() {
  const { theme } = useTheme()
  const { signOut, user } = useAuth()
  const { showConfirm, showModal } = useGlobalModal()
  const { tasks } = useTasks()
  const { classes } = useClasses()
  const insets = useSafeAreaInsets()
  const { profile } = useUserProfile()

  // Nuevo sistema de rachas
  const {
    streakData,
    streakStatus,
    motivation,
    nextMilestone,
    achievedMilestones,
    recentActivities,
    refreshStreak
  } = useStreakSystem(tasks, profile)

  // Debug logs para verificar el sistema de rachas
  console.log('🔥 Streak System Debug:', {
    currentStreak: streakData.current,
    longestStreak: streakData.longest,
    lastActivityDate: streakData.lastActivityDate,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    todayTasks: tasks.filter(t => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const completedDate = new Date(t.completed_at || 0)
      completedDate.setHours(0, 0, 0, 0)
      return t.status === 'completed' && completedDate.getTime() === today.getTime()
    }).length,
    streakStatus: streakStatus.status,
    motivation: motivation
  })

  // Stats para hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayActivity = recentActivities.find(a => a.date === today.toISOString().split('T')[0])
  const dailyStats = {
    tasksCompleted: todayActivity?.tasksCompleted || 0,
    totalTasks: tasks.filter((task) => {
      const taskDate = new Date(task.due_date || task.start_datetime)
      taskDate.setHours(0, 0, 0, 0)
      return taskDate.getTime() === today.getTime()
    }).length,
    streak: streakData.current
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "¡Buenos días"
    if (hour < 18) return "¡Buenas tardes"
    return "¡Buenas noches"
  }

  const userName = profile?.full_name || user?.email?.split("@")[0] || "Estudiante"
  const userInitials = userName.substring(0, 2).toUpperCase()

  // Get avatar source
  const getAvatarSource = () => {
    if (profile?.avatar_url) {
      const avatar = AVAILABLE_AVATARS.find((a) => a.id === profile.avatar_url)
      return avatar?.path
    }
    return null
  }

  const avatarSource = getAvatarSource()

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

  // Get upcoming tasks with proper class names
  const upcomingTasks = tasks
    .filter((task) => {
      // Filtra tareas que no están completadas
      return task.status !== "completed"
    })
    .sort(
      (a, b) => new Date(a.due_date || a.start_datetime).getTime() - new Date(b.due_date || b.start_datetime).getTime(),
    )
    .slice(0, 3)
    .map((task) => {
      // Find the class name from classes array
      const taskClass = classes.find((cls) => cls.id === task.class_id)
      return {
        ...task,
        class_name: taskClass?.name || "Sin materia",
      }
    })

  const navigateTo = (route: string) => {
    try {
      router.push(route as any)
    } catch {
      router.navigate(route as any)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
       <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.background }} />
      <ThemedView variant="background" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ top: insets.top }}
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
                onPress={() => {
                  if (profile) {
                    const avatar = AVAILABLE_AVATARS.find((a) => a.id === profile.avatar_url)
                    const avatarName = avatar?.name || "No seleccionado"
                    showModal({
                      type: "info",
                      title: "Perfil de Usuario",
                      message: `Nombre: ${profile.full_name || "No especificado"}\nEmail: ${profile.email || user?.email || "No especificado"}\nAvatar: ${avatarName}`,
                      confirmText: "Ir a Ajustes",
                      cancelText: "Cerrar",
                      onConfirm: () => navigateTo("/settings"),
                    })
                  } else {
                    navigateTo("/settings")
                  }
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: avatarSource ? "transparent" : theme.colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  overflow: "hidden",
                }}
              >
                {avatarSource ? (
                  <Image
                    source={avatarSource}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <ThemedText variant="button" style={{ color: "white", fontWeight: "600" }}>
                    {userInitials}
                  </ThemedText>
                )}
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
                Tareas Hoy
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {dailyStats.tasksCompleted}/{dailyStats.totalTasks}
              </ThemedText>
            </ThemedCard>

            {/* Streak - Nuevo sistema */}
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
                  backgroundColor: streakStatus.color + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <IconSymbol name="flame" size={24} color={streakStatus.color} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Racha
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700", color: streakStatus.color }}>
                {streakData.current} días
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ marginTop: 2, textAlign: 'center' }}>
                {motivation}
              </ThemedText>
              {nextMilestone && (
                <ThemedText variant="caption" color="primary" style={{ marginTop: 2, textAlign: 'center' }}>
                  Próximo logro: {nextMilestone} días
                </ThemedText>
              )}
            </ThemedCard>
          </ThemedView>

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
                            {task.class_name}
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
