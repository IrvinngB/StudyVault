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
  const { signOut } = useAuth()
  const { showConfirm } = useGlobalModal()

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

  const stats = [
    {
      label: "Cursos Activos",
      value: "5",
      icon: "book.closed.fill" as const,
      color: theme.colors.primary,
    },
    {
      label: "Tareas Pendientes",
      value: "12",
      icon: "clock.fill" as const,
      color: theme.colors.warning,
    },
    {
      label: "Notas Guardadas",
      value: "28",
      icon: "note.text" as const,
      color: theme.colors.success,
    },
    {
      label: "Días Estudiados",
      value: "15",
      icon: "calendar.badge.checkmark" as const,
      color: theme.colors.info,
    },
  ]

  const navigateTo = (route: string) => {
    try {
      router.push(route as any)
    } catch {
      router.navigate(route as any)
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
              ¡Hola! Que tengas un excelente día de estudio
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
              Resumen de Hoy
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

        {/* Acciones rápidas mejoradas */}
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
                  Tip del Día
                </ThemedText>
              </ThemedView>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                Organiza tu tiempo de estudio en bloques de 25 minutos con descansos de 5 minutos. La técnica Pomodoro
                te ayudará a mantener la concentración.
              </ThemedText>
            </View>
          </View>
        </ThemedCard>

        {/* Próximas funciones */}
        <ThemedCard
          variant="outlined"
          padding="medium"
          style={{
            backgroundColor: theme.colors.info + "08",
            borderColor: theme.colors.info + "30",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                backgroundColor: theme.colors.info + "20",
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.md,
              }}
            >
              <IconSymbol name="star" size={24} color={theme.colors.info} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <ThemedText
                  variant="h3"
                  style={{
                    fontWeight: "700",
                  }}
                >
                  Próximamente
                </ThemedText>
              </ThemedView>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                • Recordatorios inteligentes para tus tareas{"\n"}• Estadísticas detalladas de tu progreso{"\n"}• Modo
                de estudio con temporizador Pomodoro{"\n"}• Sincronización en la nube
              </ThemedText>
            </View>
          </View>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}
