"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { AVAILABLE_AVATARS } from "@/database/models/userTypes"
import { useAuth } from "@/hooks/useAuth"
import { useClasses } from "@/hooks/useClasses"
import { useNotes } from "@/hooks/useNotes"
import { useStreakSystem } from "@/hooks/useStreakSystem"
import { useTasks } from "@/hooks/useTasks"
import { useTheme } from "@/hooks/useTheme"
import { useUserProfile } from "@/hooks/useUserProfile"
import { router } from "expo-router"
import { Image, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"


export default function HomeScreen() {
  const { theme } = useTheme()
  const { user } = useAuth()
  const { tasks } = useTasks()
  const { classes } = useClasses()
  const { recentNotes, notesStats } = useNotes()
  const { profile } = useUserProfile()
  const { 
    streakData, 
    streakStatus, 
    motivation, 
    getStreakTitle, 
    getWeeklyProgress
  } = useStreakSystem(tasks, profile)
  const insets = useSafeAreaInsets()




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
    totalTasks: todayTasks.length
  }

  // Progreso semanal
  const weeklyProgress = getWeeklyProgress()
  
  // Estadísticas adicionales
  const additionalStats = {
    totalNotes: notesStats.total,
    favoriteNotes: notesStats.favorites,
    notesWithAI: notesStats.withAISummary,
    streakDays: streakData.current,
    longestStreak: streakData.longest
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
          {/* Header simplificado */}
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
                  fontSize: 24,
                  fontWeight: "700",
                  marginBottom: theme.spacing.xs,
                }}
              >
                {getGreeting()}, {userName}!
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ fontSize: 14 }}>
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </ThemedText>
            </ThemedView>

            <TouchableOpacity
              onPress={() => navigateTo("/settings")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
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
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <ThemedText variant="button" style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
                  {userInitials}
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          {/* Sección de Racha */}
          {streakData.current > 0 && (
            <ThemedCard
              variant="elevated"
              padding="medium"
              style={{
                marginBottom: theme.spacing.lg,
                backgroundColor: streakStatus.color + "10",
                borderWidth: 1,
                borderColor: streakStatus.color + "30",
              }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <ThemedView
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: theme.colors.background,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: theme.spacing.sm,
                    ...theme.shadows.small,
                  }}
                >
                  <IconSymbol name="flame" size={22} color={streakStatus.color} />
                </ThemedView>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="h3" style={{ fontWeight: "700", marginBottom: 2 }}>
                    {streakData.current} días de racha
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {getStreakTitle()} • {streakStatus.message}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{ alignItems: "flex-end" }}>
                  <ThemedText variant="h2" style={{ fontWeight: "700", color: streakStatus.color }}>
                    {streakData.current}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    días
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
                {motivation}
              </ThemedText>
              

              
              {/* Progreso semanal */}
              <ThemedView style={{ marginBottom: theme.spacing.sm }}>
                <ThemedView style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: theme.spacing.xs }}>
                  <ThemedText variant="caption" color="secondary">
                    Progreso semanal
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {weeklyProgress.completed}/7 días
                  </ThemedText>
                </ThemedView>
                <ThemedView
                  style={{
                    height: 6,
                    backgroundColor: theme.colors.border,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <ThemedView
                    style={{
                      height: "100%",
                      width: `${weeklyProgress.percentage}%`,
                      backgroundColor: streakStatus.color,
                      borderRadius: 3,
                    }}
                  />
                </ThemedView>
              </ThemedView>
            </ThemedCard>
          )}

          {/* Stats Cards expandidas */}
          <ThemedView
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: theme.spacing.lg,
              gap: theme.spacing.sm,
            }}
          >
            {/* Tareas de hoy */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                flex: 1,
                minWidth: "48%",
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

            {/* Total de materias */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                flex: 1,
                minWidth: "48%",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primary + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <IconSymbol name="book.closed.fill" size={24} color={theme.colors.primary} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Materias
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {classes.length}
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={{ marginTop: 2, textAlign: 'center' }}>
                {classes.length > 0 ? 'En curso' : 'Sin materias'}
              </ThemedText>
            </ThemedCard>

            {/* Notas totales */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                flex: 1,
                minWidth: "48%",
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
                <IconSymbol name="doc.text.fill" size={24} color={theme.colors.success} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Notas
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {additionalStats.totalNotes}
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={{ marginTop: 2, textAlign: 'center' }}>
                {additionalStats.favoriteNotes > 0 ? `${additionalStats.favoriteNotes} favoritas` : 'Sin notas'}
              </ThemedText>
            </ThemedCard>

            {/* Racha actual */}
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                flex: 1,
                minWidth: "48%",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: (streakStatus.color || theme.colors.warning) + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginBottom: theme.spacing.sm,
                }}
              >
                <IconSymbol name="flame" size={24} color={streakStatus.color || theme.colors.warning} />
              </View>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
                Racha
              </ThemedText>
              <ThemedText variant="h2" style={{ fontWeight: "700" }}>
                {additionalStats.streakDays}
              </ThemedText>
              <ThemedText variant="caption" color="secondary" style={{ marginTop: 2, textAlign: 'center' }}>
                {additionalStats.longestStreak > additionalStats.streakDays ? `Mejor: ${additionalStats.longestStreak}` : '¡Nuevo récord!'}
              </ThemedText>
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

          {/* Notas Recientes */}
          {recentNotes.length > 0 && (
            <ThemedCard
              variant="outlined"
              padding="medium"
              style={{
                marginBottom: theme.spacing.lg,
              }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <IconSymbol name="doc.text" size={20} color={theme.colors.primary} />
                <ThemedText variant="h3" style={{ marginLeft: theme.spacing.sm, fontWeight: "600" }}>
                  Notas recientes
                </ThemedText>
              </ThemedView>
              
              {recentNotes.slice(0, 3).map((note, index) => {
                const noteClass = classes.find((cls) => cls.id === note.class_id)
                return (
                  <TouchableOpacity
                    key={note.id}
                    onPress={() => navigateTo(`/notes/${note.id}`)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: theme.spacing.sm,
                      borderBottomWidth: index < Math.min(recentNotes.length, 3) - 1 ? 1 : 0,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: note.is_favorite ? theme.colors.warning : theme.colors.primary,
                        marginRight: theme.spacing.sm,
                      }}
                    />
                    <ThemedView style={{ flex: 1 }}>
                      <ThemedText variant="body" style={{ fontWeight: "500", marginBottom: 2 }}>
                        {note.title}
                      </ThemedText>
                      <ThemedText variant="caption" color="secondary">
                        {noteClass?.name || "Sin materia"} • {note.updated_at ? new Date(note.updated_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        }) : 'Sin fecha'}
                      </ThemedText>
                    </ThemedView>
                    {note.is_favorite && (
                      <IconSymbol name="heart.fill" size={16} color={theme.colors.warning} />
                    )}
                    <IconSymbol name="chevron.right" size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )
              })}
            </ThemedCard>
          )}

          {/* Acciones rápidas */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <IconSymbol name="bolt.fill" size={24} color={theme.colors.primary} />
              <ThemedText
                variant="h3"
                style={{
                  marginLeft: theme.spacing.sm,
                  fontWeight: "600",
                }}
              >
                Acciones rápidas
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ gap: theme.spacing.sm }}>
              <ThemedView style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <ThemedButton
                  title="Nueva Tarea"
                  variant="primary"
                  onPress={() => navigateTo("/tasks")}
                  icon={<IconSymbol name="plus" size={18} color="white" />}
                  style={{ flex: 1 }}
                />
                <ThemedButton
                  title="Nueva Nota"
                  variant="secondary"
                  onPress={() => navigateTo("/notes/create")}
                  icon={<IconSymbol name="doc.text" size={18} color="white" />}
                  style={{ flex: 1 }}
                />
              </ThemedView>

              <ThemedView style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <ThemedButton
                  title="Ver Calendario"
                  variant="outline"
                  onPress={() => navigateTo("/calendar")}
                  icon={<IconSymbol name="calendar" size={18} color={theme.colors.primary} />}
                  style={{ flex: 1 }}
                />
                <ThemedButton
                  title="Ver Notas"
                  variant="outline"
                  onPress={() => navigateTo("/notes")}
                  icon={<IconSymbol name="doc.text.fill" size={18} color={theme.colors.primary} />}
                  style={{ flex: 1 }}
                />
              </ThemedView>

              {classes.length === 0 && (
                <ThemedButton
                  title="Crear Primera Materia"
                  variant="ghost"
                  onPress={() => navigateTo("/courses/create")}
                  icon={<IconSymbol name="book.closed" size={18} color={theme.colors.primary} />}
                />
              )}
            </ThemedView>
          </ThemedCard>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}
