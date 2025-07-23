"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useGlobalModal } from "@/hooks/ModalProvider"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { Dimensions, ScrollView, TouchableOpacity, View } from "react-native"

const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const { theme } = useTheme()
  const { signOut, user } = useAuth()
  const { showConfirm } = useGlobalModal()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  const userName = user?.full_name || user?.email?.split("@")[0] || "Estudiante"

  const handleLogout = async () => {
    showConfirm(
      "¿Estás seguro de que quieres cerrar sesión?",
      async () => {
        try {
          await signOut()
          router.replace("/(auth)/login")
        } catch (error) {
          console.error("Error al cerrar sesión:", error)
          router.replace("/(auth)/login")
        }
      },
      undefined,
      "Cerrar Sesión",
    )
  }

  const quickActions = [
    {
      title: "Cursos",
      icon: "book.closed.fill" as const,
      route: "/courses",
      color: theme.colors.primary,
      description: "Gestiona tus materias",
    },
    {
      title: "Tareas",
      icon: "checklist" as const,
      route: "/tasks",
      color: theme.colors.secondary,
      description: "Organiza tus pendientes",
    },
    {
      title: "Notas",
      icon: "note.text" as const,
      route: "/notes",
      color: theme.colors.accent,
      description: "Tus apuntes importantes",
    },
    {
      title: "Calendario",
      icon: "calendar" as const,
      route: "/calendar",
      color: theme.colors.info,
      description: "Planifica tu tiempo",
    },
  ]

  // Datos reales de ejemplo
  const stats = [
    {
      label: "Cursos Activos",
      value: "8",
      icon: "book.closed.fill" as const,
      color: theme.colors.primary,
    },
    {
      label: "Tareas Pendientes",
      value: "23",
      icon: "clock.fill" as const,
      color: theme.colors.warning,
    },
    {
      label: "Notas Guardadas",
      value: "156",
      icon: "note.text" as const,
      color: theme.colors.success,
    },
    {
      label: "Días Estudiados",
      value: "42",
      icon: "calendar.badge.checkmark" as const,
      color: theme.colors.info,
    },
  ]

  // Próximas tareas reales
  const upcomingTasks = [
    {
      title: "Examen de Cálculo Diferencial",
      course: "Matemáticas III",
      dueDate: "Mañana",
      priority: "high" as const,
      icon: "exclamationmark.triangle.fill" as const,
    },
    {
      title: "Entrega Proyecto React Native",
      course: "Desarrollo Móvil",
      dueDate: "En 3 días",
      priority: "medium" as const,
      icon: "clock.fill" as const,
    },
    {
      title: "Laboratorio de Química Orgánica",
      course: "Química II",
      dueDate: "Viernes",
      priority: "low" as const,
      icon: "flask.fill" as const,
    },
  ]

  // Notas recientes reales
  const recentNotes = [
    {
      title: "Hooks en React Native",
      course: "Desarrollo Móvil",
      preview: "useState, useEffect, useContext - Los hooks más importantes para el manejo de estado...",
      lastModified: "Hace 2 horas",
    },
    {
      title: "Algoritmos de Ordenamiento",
      course: "Estructuras de Datos",
      preview: "QuickSort, MergeSort, BubbleSort - Comparación de complejidades temporales...",
      lastModified: "Ayer",
    },
    {
      title: "Bases de Datos Relacionales",
      course: "Base de Datos",
      preview: "Normalización, claves primarias, relaciones uno a muchos, muchos a muchos...",
      lastModified: "Hace 3 días",
    },
  ]

  const navigateTo = (route: string) => {
    try {
      router.push(route as any)
    } catch {
      router.navigate(route as any)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return theme.colors.error
      case "medium":
        return theme.colors.warning
      case "low":
        return theme.colors.success
      default:
        return theme.colors.textSecondary
    }
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header mejorado */}
        <ThemedView
          style={{
            marginBottom: theme.spacing.xl,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: theme.colors.text,
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ThemedView style={{ flex: 1 }}>
            <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
              <IconSymbol name="graduationcap.fill" size={32} color={theme.colors.primary} />
              <ThemedText
                variant="h1"
                style={{
                  marginLeft: theme.spacing.sm,
                  fontSize: 28,
                  fontWeight: "800",
                }}
              >
                StudyVault
              </ThemedText>
            </ThemedView>
            <ThemedText variant="body" color="secondary" style={{ fontSize: 16 }}>
              {getGreeting()}, {userName}! Tienes 5 tareas pendientes para esta semana
            </ThemedText>
          </ThemedView>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: theme.colors.surface,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: theme.colors.text,
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </ThemedView>

        {/* Estadísticas rápidas */}
        <ThemedView style={{ marginBottom: theme.spacing.xl }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="chart.bar.fill" size={24} color={theme.colors.primary} />
            <ThemedText
              variant="h3"
              style={{
                marginLeft: theme.spacing.sm,
                fontWeight: "700",
              }}
            >
              Resumen Académico
            </ThemedText>
          </ThemedView>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: theme.spacing.sm,
            }}
          >
            {stats.map((stat, index) => (
              <ThemedCard
                key={index}
                variant="elevated"
                padding="small"
                style={{
                  width: (width - theme.spacing.md * 2 - theme.spacing.sm) / 2,
                  alignItems: "center",
                  backgroundColor: stat.color + "15",
                  borderLeftWidth: 3,
                  borderLeftColor: stat.color,
                  minHeight: 80,
                  justifyContent: "center",
                }}
              >
                <IconSymbol name={stat.icon} size={24} color={stat.color} />
                <ThemedText
                  variant="h2"
                  style={{
                    marginTop: theme.spacing.xs,
                    fontSize: 20,
                    fontWeight: "800",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </ThemedText>
                <ThemedText
                  variant="caption"
                  color="secondary"
                  style={{
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: "500",
                  }}
                >
                  {stat.label}
                </ThemedText>
              </ThemedCard>
            ))}
          </View>
        </ThemedView>

        {/* Acciones rápidas */}
        <ThemedView style={{ marginBottom: theme.spacing.xl }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="arrow.right" size={24} color={theme.colors.secondary} />
            <ThemedText
              variant="h3"
              style={{
                marginLeft: theme.spacing.sm,
                fontWeight: "700",
              }}
            >
              Acceso Rápido
            </ThemedText>
          </ThemedView>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: theme.spacing.md,
            }}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateTo(action.route)}
                style={{
                  width: (width - theme.spacing.md * 2 - theme.spacing.md) / 2,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 120,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  shadowColor: theme.colors.text,
                  shadowOpacity: 0.08,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 8,
                  elevation: 4,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    backgroundColor: action.color + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name={action.icon} size={28} color={action.color} />
                </View>
                <ThemedText
                  variant="button"
                  style={{
                    fontWeight: "700",
                    marginBottom: theme.spacing.xs / 2,
                  }}
                >
                  {action.title}
                </ThemedText>
                <ThemedText
                  variant="caption"
                  color="secondary"
                  style={{
                    textAlign: "center",
                    fontSize: 11,
                  }}
                >
                  {action.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Próximas tareas */}
        <ThemedView style={{ marginBottom: theme.spacing.xl }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="clock.fill" size={24} color={theme.colors.warning} />
            <ThemedText
              variant="h3"
              style={{
                marginLeft: theme.spacing.sm,
                fontWeight: "700",
              }}
            >
              Próximas Entregas
            </ThemedText>
          </ThemedView>
          {upcomingTasks.map((task, index) => (
            <ThemedCard
              key={index}
              variant="elevated"
              padding="medium"
              style={{
                marginBottom: theme.spacing.md,
                backgroundColor: theme.colors.surface,
                borderLeftWidth: 3,
                borderLeftColor: getPriorityColor(task.priority),
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View
                  style={{
                    backgroundColor: getPriorityColor(task.priority) + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name={task.icon} size={20} color={getPriorityColor(task.priority)} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="h3" style={{ fontWeight: "600", marginBottom: theme.spacing.xs }}>
                    {task.title}
                  </ThemedText>
                  <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
                    {task.course}
                  </ThemedText>
                  <ThemedText variant="caption" style={{ color: getPriorityColor(task.priority), fontWeight: "500" }}>
                    {task.dueDate}
                  </ThemedText>
                </View>
              </View>
            </ThemedCard>
          ))}
        </ThemedView>

        {/* Notas recientes */}
        <ThemedView style={{ marginBottom: theme.spacing.xl }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="note.text" size={24} color={theme.colors.accent} />
            <ThemedText
              variant="h3"
              style={{
                marginLeft: theme.spacing.sm,
                fontWeight: "700",
              }}
            >
              Notas Recientes
            </ThemedText>
          </ThemedView>
          {recentNotes.map((note, index) => (
            <TouchableOpacity key={index} onPress={() => navigateTo(`/notes/view/${index + 1}`)} activeOpacity={0.7}>
              <ThemedCard
                variant="elevated"
                padding="medium"
                style={{
                  marginBottom: theme.spacing.md,
                  backgroundColor: theme.colors.surface,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View
                    style={{
                      backgroundColor: theme.colors.accent + "20",
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.full,
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <IconSymbol name="note.text" size={20} color={theme.colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="h3" style={{ fontWeight: "600", marginBottom: theme.spacing.xs }}>
                      {note.title}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
                      {note.course}
                    </ThemedText>
                    <ThemedText
                      variant="body"
                      color="secondary"
                      style={{ marginBottom: theme.spacing.xs, lineHeight: 20 }}
                    >
                      {note.preview}
                    </ThemedText>
                    <ThemedText variant="caption" style={{ color: theme.colors.textMuted }}>
                      {note.lastModified}
                    </ThemedText>
                  </View>
                </View>
              </ThemedCard>
            </TouchableOpacity>
          ))}
        </ThemedView>

        {/* Motivación y tips */}
        <ThemedCard
          variant="elevated"
          padding="medium"
          style={{
            marginBottom: theme.spacing.lg,
            backgroundColor: theme.colors.primary + "10",
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                backgroundColor: theme.colors.primary + "20",
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.md,
              }}
            >
              <IconSymbol name="lightbulb" size={24} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <ThemedText
                  variant="h3"
                  style={{
                    fontWeight: "700",
                  }}
                >
                  Consejo de Estudio
                </ThemedText>
              </ThemedView>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                Revisa tus notas de Cálculo antes del examen de mañana. Practica los ejercicios de derivadas e
                integrales que guardaste la semana pasada.
              </ThemedText>
            </View>
          </View>
        </ThemedCard>

        {/* Progreso semanal */}
        <ThemedCard
          variant="outlined"
          padding="medium"
          style={{
            backgroundColor: theme.colors.success + "08",
            borderColor: theme.colors.success + "30",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                backgroundColor: theme.colors.success + "20",
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.md,
              }}
            >
              <IconSymbol name="chart.line.uptrend.xyaxis" size={24} color={theme.colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <ThemedText
                  variant="h3"
                  style={{
                    fontWeight: "700",
                  }}
                >
                  Progreso de la Semana
                </ThemedText>
              </ThemedView>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                ¡Excelente trabajo! Has completado 18 de 23 tareas esta semana. Mantén el ritmo para alcanzar tus
                objetivos académicos.
              </ThemedText>
            </View>
          </View>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}
