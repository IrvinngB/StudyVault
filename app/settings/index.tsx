"use client"

import { AvatarSelector } from "@/components/ui/AvatarSelector"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { ThemeSelector } from "@/components/ui/ThemeSelector"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { useUserProfile } from "@/hooks/useUserProfile"
import { clearCredentialsIfNeeded } from "@/utils/biometricAuth"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Switch, TextInput, TouchableOpacity } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function UnifiedSettingsScreen() {
  const { theme } = useTheme()
  const { user, signOut } = useAuth()
  const { profile, updateProfile, loading } = useUserProfile()
  const insets = useSafeAreaInsets()

  // Form state
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [university, setUniversity] = useState("")
  const [career, setCareer] = useState("")
  const [semester, setSemester] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [studyReminders, setStudyReminders] = useState(true)
  const [gradeNotifications, setGradeNotifications] = useState(true)
  const [calendarReminders, setCalendarReminders] = useState(true)

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setSelectedAvatar(profile.avatar_url || "")

      // Leer datos desde preferences si existen
      const preferences = profile.preferences || {}
      setBio(preferences.bio || "")
      setUniversity(preferences.university || "")
      setCareer(preferences.career || "")
      setSemester(preferences.semester ? preferences.semester.toString() : "")

      // Load notification settings
      if (profile.notification_settings) {
        setNotificationsEnabled(profile.notification_settings.push_notifications ?? true)
        setStudyReminders(profile.notification_settings.study_session_reminders ?? true)
        setGradeNotifications(profile.notification_settings.grade_notifications ?? true)
        setCalendarReminders(profile.notification_settings.calendar_reminders ?? true)
      }
    }
  }, [profile])

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        full_name: fullName.trim() || undefined,
        avatar_url: selectedAvatar || undefined,
        notification_settings: {
          push_notifications: notificationsEnabled,
          study_session_reminders: studyReminders,
          grade_notifications: gradeNotifications,
          calendar_reminders: calendarReminders,
        },
        preferences: {
          bio: bio.trim() || undefined,
          university: university.trim() || undefined,
          career: career.trim() || undefined,
          semester: semester ? Number.parseInt(semester) : undefined,
        },
      }

      const success = await updateProfile(updateData)
      if (success) {
        Alert.alert("Éxito", "Perfil actualizado correctamente")
      } else {
        Alert.alert("Error", "No se pudo actualizar el perfil")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Ocurrió un error al actualizar el perfil")
    }
  }

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          try {
            const currentEmail = user?.email || null
            await signOut()
            await clearCredentialsIfNeeded(currentEmail)
            router.replace("/(auth)/login")
          } catch (error) {
            console.error("Error al cerrar sesión:", error)
          }
        },
      },
    ])
  }

  const userName = user?.email?.split("@")[0] || "Usuario"

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
          <ThemedView style={{ marginBottom: theme.spacing.lg }}>
            <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800", marginBottom: theme.spacing.xs }}>
              Configuración
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={{ fontSize: 16 }}>
              Personaliza tu experiencia de estudio
            </ThemedText>
          </ThemedView>

          {/* Profile Section */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.lg }}>
              <IconSymbol name="person.circle" size={24} color={theme.colors.primary} />
              <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                Perfil
              </ThemedText>
            </ThemedView>

            {/* Avatar Selection */}
            <ThemedView style={{ alignItems: "center", marginBottom: theme.spacing.lg }}>
              <AvatarSelector selectedAvatar={selectedAvatar} onAvatarSelect={setSelectedAvatar} size={80} />
              <ThemedText variant="body" color="secondary" style={{ marginTop: theme.spacing.sm, textAlign: "center" }}>
                Toca para cambiar tu avatar
              </ThemedText>
            </ThemedView>

            {/* Profile Form */}
            <ThemedView style={{ gap: theme.spacing.md }}>
              <ThemedView>
                <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                  Nombre completo
                </ThemedText>
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
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </ThemedView>

              <ThemedView>
                <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                  Biografía
                </ThemedText>
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
                    height: 80,
                    textAlignVertical: "top",
                  }}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Cuéntanos sobre ti..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </ThemedView>

              <ThemedView style={{ flexDirection: "row", gap: theme.spacing.md }}>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                    Universidad
                  </ThemedText>
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
                    value={university}
                    onChangeText={setUniversity}
                    placeholder="Tu universidad"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </ThemedView>

                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                    Semestre
                  </ThemedText>
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
                    value={semester}
                    onChangeText={setSemester}
                    placeholder="Ej: 5"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="numeric"
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView>
                <ThemedText variant="body" style={{ marginBottom: theme.spacing.xs, fontWeight: "600" }}>
                  Carrera
                </ThemedText>
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
                  value={career}
                  onChangeText={setCareer}
                  placeholder="Tu carrera"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </ThemedView>
            </ThemedView>
          </ThemedCard>

          {/* Theme Section */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
              <IconSymbol name="paintbrush" size={24} color={theme.colors.primary} />
              <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                Apariencia
              </ThemedText>
            </ThemedView>

            <ThemeSelector />
          </ThemedCard>

          {/* Notifications Section */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
              <IconSymbol name="bell" size={24} color={theme.colors.primary} />
              <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                Notificaciones
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ gap: theme.spacing.md }}>
              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: "600" }}>
                    Notificaciones push
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    Recibir notificaciones en tu dispositivo
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                  thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.textMuted}
                />
              </ThemedView>

              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: "600" }}>
                    Recordatorios de estudio
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    Recordatorios para sesiones de estudio
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={studyReminders}
                  onValueChange={setStudyReminders}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                  thumbColor={studyReminders ? theme.colors.primary : theme.colors.textMuted}
                />
              </ThemedView>

              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: "600" }}>
                    Notificaciones de calificaciones
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    Alertas sobre nuevas calificaciones
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={gradeNotifications}
                  onValueChange={setGradeNotifications}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                  thumbColor={gradeNotifications ? theme.colors.primary : theme.colors.textMuted}
                />
              </ThemedView>

              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: theme.spacing.xs,
                }}
              >
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: "600" }}>
                    Recordatorios de calendario
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    Alertas para eventos del calendario
                  </ThemedText>
                </ThemedView>
                <Switch
                  value={calendarReminders}
                  onValueChange={setCalendarReminders}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                  thumbColor={calendarReminders ? theme.colors.primary : theme.colors.textMuted}
                />
              </ThemedView>
            </ThemedView>
          </ThemedCard>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={loading}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              alignItems: "center",
              marginBottom: theme.spacing.lg,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <ThemedText variant="button" style={{ color: "white", fontWeight: "600" }}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </ThemedText>
          </TouchableOpacity>

          {/* Account Section */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
              <IconSymbol name="gear" size={24} color={theme.colors.primary} />
              <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
                Cuenta
              </ThemedText>
            </ThemedView>

            <ThemedView style={{ gap: theme.spacing.sm }}>
              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: theme.spacing.sm,
                }}
              >
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Email
                </ThemedText>
                <ThemedText variant="body" color="secondary">
                  {user?.email}
                </ThemedText>
              </ThemedView>

              <ThemedView
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: theme.spacing.sm,
                }}
              >
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Usuario
                </ThemedText>
                <ThemedText variant="body" color="secondary">
                  {userName}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedCard>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: theme.colors.error + "20",
              paddingVertical: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.error + "40",
            }}
          >
            <ThemedText variant="button" style={{ color: theme.colors.error, fontWeight: "600" }}>
              Cerrar Sesión
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  )
}
