"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { useState } from "react"
import { Alert, ScrollView, Switch, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface PersonalInfo {
  fullName: string
  email: string
  timeZone: string
}

export default function ProfileScreen() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  const insets = useSafeAreaInsets()

  // Estados para los campos del formulario
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: user?.user_metadata?.full_name || "Nombre Apellido",
    email: user?.email || "correo.estudiante@email.com",
    timeZone: "America/Panama (UTC-5)",
  })

  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false)

  // Función para actualizar los campos
  const updateField = (field: keyof PersonalInfo, value: string): void => {
    setPersonalInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Función para guardar cambios
  const handleSave = (): void => {
    Alert.alert("Información actualizada", "Tus datos personales han sido guardados correctamente.", [
      { text: "OK", onPress: () => setIsEditing(false) },
    ])
  }

  // Función para cancelar edición
  const handleCancel = (): void => {
    setIsEditing(false)
    // Restaurar valores originales si es necesario
  }

  const handleLogout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut()
            router.replace("/(auth)/login")
          } catch (error) {
            console.error("Error al cerrar sesión:", error)
            router.replace("/(auth)/login")
          }
        },
      },
    ])
  }

  const userName = user?.email?.split("@")[0] || "Estudiante"

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingTop: insets.top + theme.spacing.md,
          paddingBottom: insets.bottom + theme.spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={{ marginBottom: theme.spacing.xl }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.spacing.md,
            }}
          >
            <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: theme.colors.primary + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginRight: theme.spacing.sm,
                }}
              >
                <IconSymbol name="person.fill" size={24} color={theme.colors.primary} />
              </View>
              <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800" }}>
                Perfil
              </ThemedText>
            </ThemedView>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={{
                backgroundColor: theme.colors.surface,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <IconSymbol
                name={isEditing ? "xmark" : "pencil"}
                size={18}
                color={isEditing ? theme.colors.error : theme.colors.primary}
              />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Avatar Section */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ alignItems: "center", marginBottom: theme.spacing.md }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: theme.spacing.md,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 40,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {personalInfo.fullName.charAt(0)}
              </ThemedText>
            </View>
            <ThemedText variant="h2" style={{ marginBottom: theme.spacing.xs }}>
              {userName}
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              {personalInfo.email}
            </ThemedText>
            {isEditing && (
              <ThemedButton
                title="Cambiar foto"
                variant="outline"
                style={{ marginTop: theme.spacing.sm }}
                onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
              />
            )}
          </ThemedView>
        </ThemedCard>

        {/* Information Fields */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.info + "20",
                padding: theme.spacing.xs,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.sm,
              }}
            >
              <IconSymbol name="info.circle" size={20} color={theme.colors.info} />
            </View>
            <ThemedText variant="h2">Información Personal</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.md }}>
            {/* Nombre completo */}
            <ThemedView>
              <ThemedView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: theme.spacing.sm,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.primary + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name="person" size={16} color={theme.colors.primary} />
                </View>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Nombre completo
                </ThemedText>
              </ThemedView>
              {isEditing ? (
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    color: theme.colors.text,
                    fontSize: 16,
                  }}
                  value={personalInfo.fullName}
                  onChangeText={(value) => updateField("fullName", value)}
                  placeholder="Ingresa tu nombre completo"
                  placeholderTextColor={theme.colors.textMuted}
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg }}>
                  {personalInfo.fullName}
                </ThemedText>
              )}
            </ThemedView>

            {/* Email */}
            <ThemedView>
              <ThemedView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: theme.spacing.sm,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.warning + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name="envelope" size={16} color={theme.colors.warning} />
                </View>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Correo electrónico
                </ThemedText>
              </ThemedView>
              {isEditing ? (
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    color: theme.colors.text,
                    fontSize: 16,
                  }}
                  value={personalInfo.email}
                  onChangeText={(value) => updateField("email", value)}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg }}>
                  {personalInfo.email}
                </ThemedText>
              )}
            </ThemedView>

            {/* Zona horaria */}
            <ThemedView>
              <ThemedView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: theme.spacing.sm,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.success + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name="clock" size={16} color={theme.colors.success} />
                </View>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Zona horaria
                </ThemedText>
              </ThemedView>
              {isEditing ? (
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    color: theme.colors.text,
                    fontSize: 16,
                  }}
                  value={personalInfo.timeZone}
                  onChangeText={(value) => updateField("timeZone", value)}
                  placeholder="America/Panama (UTC-5)"
                  placeholderTextColor={theme.colors.textMuted}
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg }}>
                  {personalInfo.timeZone}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>

          {/* Botones de acción cuando está editando */}
          {isEditing && (
            <ThemedView
              style={{
                flexDirection: "row",
                gap: theme.spacing.sm,
                marginTop: theme.spacing.lg,
              }}
            >
              <ThemedButton title="Cancelar" variant="outline" onPress={handleCancel} style={{ flex: 1 }} />
              <ThemedButton title="Guardar cambios" variant="primary" onPress={handleSave} style={{ flex: 1 }} />
            </ThemedView>
          )}
        </ThemedCard>

        {/* Configuraciones */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.secondary + "20",
                padding: theme.spacing.xs,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.sm,
              }}
            >
              <IconSymbol name="gear" size={20} color={theme.colors.secondary} />
            </View>
            <ThemedText variant="h2">Preferencias</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.md }}>
            {/* Notificaciones */}
            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: theme.spacing.sm,
              }}
            >
              <ThemedView>
                <ThemedText variant="body">Notificaciones</ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Alertas y recordatorios
                </ThemedText>
              </ThemedView>
              <Switch
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.textMuted}
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </ThemedView>

            {/* Modo oscuro */}
            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: theme.spacing.sm,
              }}
            >
              <ThemedView>
                <ThemedText variant="body">Modo oscuro</ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Tema de la aplicación
                </ThemedText>
              </ThemedView>
              <Switch
                trackColor={{ false: theme.colors.border, true: theme.colors.warning + "40" }}
                thumbColor={darkModeEnabled ? theme.colors.warning : theme.colors.textMuted}
                onValueChange={setDarkModeEnabled}
                value={darkModeEnabled}
              />
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Enlaces rápidos */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.accent + "20",
                padding: theme.spacing.xs,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.sm,
              }}
            >
              <IconSymbol name="link" size={20} color={theme.colors.accent} />
            </View>
            <ThemedText variant="h2">Enlaces</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.sm }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.sm,
              }}
              onPress={() => router.push("/settings/privacy")}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.info + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name="lock.fill" size={16} color={theme.colors.info} />
                </View>
                <ThemedView>
                  <ThemedText variant="body">Privacidad</ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    Control de datos y permisos
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.sm,
              }}
              onPress={() => router.push("/settings/help")}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.secondary + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name="questionmark.circle.fill" size={16} color={theme.colors.secondary} />
                </View>
                <ThemedView>
                  <ThemedText variant="body">Ayuda y soporte</ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    FAQ y contacto
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedCard>

        {/* Logout Button */}
        <ThemedButton
          title="Cerrar sesión"
          variant="error"
          icon={<IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="white" />}
          onPress={handleLogout}
        />
      </ScrollView>
    </ThemedView>
  )
}
