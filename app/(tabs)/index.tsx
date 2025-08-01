"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
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



  // Stats para hoy
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Obtener tareas de hoy (completadas y pendientes)
  const todayTasks = tasks.filter((task) => {
    const taskDate = new Date(task.due_date || task.start_datetime)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.getTime()
  })
  
  const completedToday = todayTasks.filter(task => task.status === "completed").length
  const pendingToday = todayTasks.filter(task => task.status !== "completed").length
  
  const dailyStats = {
    tasksCompleted: completedToday,
    totalTasks: todayTasks.length,
    streak: streakData.current
  }

  // Función para obtener el color del icono basado en el progreso
  const getTaskIconColor = () => {
    if (dailyStats.totalTasks === 0) return theme.colors.textMuted
    if (dailyStats.tasksCompleted === dailyStats.totalTasks) return theme.colors.success
    if (dailyStats.tasksCompleted > 0) return theme.colors.warning
    return theme.colors.error
  }

  // Función para obtener el icono basado en el progreso
  const getTaskIcon = () => {
    if (dailyStats.totalTasks === 0) return "calendar"
    if (dailyStats.tasksCompleted === dailyStats.totalTasks) return "checkmark.circle"
    if (dailyStats.tasksCompleted > 0) return "clock"
    return "exclamationmark.triangle"
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
    .map((task, index) => {
      // Find the class name from classes array
      const taskClass = classes.find((cls) => cls.id === task.class_id)
      return {
        ...task,
        class_name: taskClass?.name || "Sin materia",
        key: task.calendar_event_id || `task-${index}`,
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
                  backgroundColor: getTaskIconColor() + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <IconSymbol name={getTaskIcon()} size={24} color={getTaskIconColor()} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Tareas Hoy
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {dailyStats.tasksCompleted}/{dailyStats.totalTasks}
              </ThemedText>
              {dailyStats.totalTasks > 0 && (
                <ThemedText variant="caption" color="secondary" style={{ marginTop: 2, textAlign: 'center' }}>
                  {pendingToday > 0 ? `${pendingToday} pendientes` : '¡Todas completadas!'}
                </ThemedText>
              )}
              {dailyStats.totalTasks === 0 && (
                <ThemedText variant="caption" color="secondary" style={{ marginTop: 2, textAlign: 'center' }}>
                  Sin tareas hoy
                </ThemedText>
              )}
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
              {/* Botón de debug temporal */}
              <TouchableOpacity
                onPress={() => {
              
                  refreshStreak()
                }}
                style={{
                  backgroundColor: theme.colors.primary + "20",
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 4,
                  borderRadius: theme.borderRadius.sm,
                  marginTop: theme.spacing.sm,
                }}
              >
                
              </TouchableOpacity>
            </ThemedCard>
          </ThemedView>

          {/* Próximas Tareas */}
          {upcomingTasks.length > 0 && (
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                marginBottom: theme.spacing.lg,
              }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <IconSymbol name="calendar" size={20} color={theme.colors.primary} />
                <ThemedText variant="h3" style={{ marginLeft: theme.spacing.sm, fontWeight: "600" }}>
                  Próximas tareas
                </ThemedText>
              </ThemedView>
              
              {upcomingTasks.map((task, index) => (
                <TouchableOpacity
                  key={task.calendar_event_id}
                  onPress={() => navigateTo("/tasks")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: theme.spacing.sm,
                    borderBottomWidth: index < upcomingTasks.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: theme.colors.primary,
                      marginRight: theme.spacing.sm,
                    }}
                  />
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ fontWeight: "500", marginBottom: 2 }}>
                      {task.event_title}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      {task.class_name} • {new Date(task.due_date || task.start_datetime).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </ThemedText>
                  </ThemedView>
                  <IconSymbol name="chevron.right" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ThemedCard>
          )}

          {/* Instrucciones para probar la app */}
          {true && (
            <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
              <ThemedView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: theme.spacing.md,
                }}
              >
                <IconSymbol name="lightbulb" size={24} color={theme.colors.primary} />
                <ThemedText
                  variant="h2"
                  style={{
                    marginLeft: theme.spacing.sm,
                    fontWeight: "700",
                  }}
                >
                  ¡Bienvenido a StudyVault! 🎓
                </ThemedText>
              </ThemedView>

              <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
                Aquí tienes algunas ideas para comenzar a usar la app:
              </ThemedText>

              <ThemedView style={{ gap: theme.spacing.sm }}>
                <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600", marginRight: theme.spacing.xs }}>
                    1.
                  </ThemedText>
                  <ThemedText variant="body" color="secondary" style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                      Crea una materia:
                    </ThemedText>{" "}
                    Ve a &quot;Clases&quot; y agrega tus materias del semestre
                  </ThemedText>
                </ThemedView>

                <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600", marginRight: theme.spacing.xs }}>
                    2.
                  </ThemedText>
                  <ThemedText variant="body" color="secondary" style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                      Agrega tareas:
                    </ThemedText>{" "}
                    Ve a &quot;Tareas&quot; y crea tareas con fechas de vencimiento
                  </ThemedText>
                </ThemedView>

                <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600", marginRight: theme.spacing.xs }}>
                    3.
                  </ThemedText>
                  <ThemedText variant="body" color="secondary" style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                      Completa tareas:
                    </ThemedText>{" "}
                    Marca las tareas como completadas para mantener tu racha
                  </ThemedText>
                </ThemedView>

                <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600", marginRight: theme.spacing.xs }}>
                    4.
                  </ThemedText>
                  <ThemedText variant="body" color="secondary" style={{ flex: 1 }}>
                    <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                      Sistema de rachas:
                    </ThemedText>{" "}
                    Tu racha aumenta si completas tareas sin tener atrasadas, o si no tienes tareas atrasadas
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={{ 
                backgroundColor: theme.colors.primary + "10", 
                padding: theme.spacing.md, 
                borderRadius: theme.borderRadius.md,
                marginTop: theme.spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.primary
              }}>
                <ThemedText variant="body" style={{ color: theme.colors.primary, fontWeight: "600", marginBottom: theme.spacing.xs }}>
                  💡 Tip para probar el sistema de rachas:
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.md }}>
                  Crea una tarea para hoy, complétala y verás cómo aumenta tu racha. También puedes crear tareas para días futuros y ver cómo se mantiene la racha sin tareas atrasadas.
                </ThemedText>

                <ThemedView style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                  <ThemedButton
                    title="Crear Materia"
                    variant="primary"
                    size="small"
                    onPress={() => navigateTo("/courses/create")}
                    style={{ flex: 1 }}
                  />
                  <ThemedButton
                    title="Crear Tarea"
                    variant="secondary"
                    size="small"
                    onPress={() => navigateTo("/tasks")}
                    style={{ flex: 1 }}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedCard>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}
