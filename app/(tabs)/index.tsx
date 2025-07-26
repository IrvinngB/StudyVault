"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useGlobalModal } from "@/hooks/ModalProvider"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { Dimensions, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width } = Dimensions.get("window")

export default function HomeScreen() {
  const { theme } = useTheme()
  const { signOut, user } = useAuth()
  const { showConfirm } = useGlobalModal()
  const insets = useSafeAreaInsets()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  const userName = user?.email?.split("@")[0] || "Estudiante"

  const handleLogout = () => {
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
      () => {
        // Callback para cancelar - no hacer nada
        console.log("Logout cancelado")
      },
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
            justifyContent: "center",
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.md,
            paddingBottom: insets.bottom || theme.spacing.xs,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
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
                {getGreeting()}, {userName}!
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

          {/* Mensaje de bienvenida */}
          <ThemedCard
            variant="elevated"
            padding="medium"
            style={{
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
                    ¡Bienvenido a StudyVault!
                  </ThemedText>
                </ThemedView>
                <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                  Organiza tus estudios de manera eficiente. Comienza creando tus primeros cursos y tareas para mantener
                  todo bajo control.
                </ThemedText>
              </View>
            </View>
          </ThemedCard>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}
