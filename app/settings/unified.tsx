"use client"

import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { ThemeSelector } from "@/components/ui/ThemeSelector"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { useUserProfile } from "@/hooks/useUserProfile"
import { formatTimeWithPreferences, getTimezoneInfo } from "@/utils/timezoneHelpers"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, Switch, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface AppSettings {
  timezone: string
  use24HourFormat: boolean
  notifications: boolean
  language: string
  theme: string
}

export default function ProfileAndSettingsScreen() {
  const { theme } = useTheme()
  const { signOut, user } = useAuth()
  const insets = useSafeAreaInsets()
  
  // Usar los nuevos hooks - solo si tenemos usuario autenticado
  const { profile, loading: profileLoading, updateProfile, refresh: refreshProfile } = useUserProfile()

  // Estados para edición
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedProfile, setEditedProfile] = useState({
    full_name: user?.name || "",
    timezone: "",
  })

  // Estados para configuraciones de la app
  const [settings, setSettings] = useState<AppSettings>({
    timezone: "auto",
    use24HourFormat: false,
    notifications: true,
    language: "es",
    theme: "auto",
  })

  const [timezoneInfo, setTimezoneInfo] = useState(getTimezoneInfo())

  // Sincronizar el perfil editado con el perfil del backend
  useEffect(() => {
    if (profile) {
      setEditedProfile({
        full_name: profile.full_name || "",
        timezone: profile.timezone || "",
      })
    }
  }, [profile])

  // Cargar configuraciones guardadas
  useEffect(() => {
    loadSettings()
    
    // Cargar perfil manualmente solo si el usuario está autenticado
    if (user) {
      refreshProfile().catch((error) => {
        console.log("Could not load profile from backend:", error)
      })
    }
    
    // Actualizar info de zona horaria cada minuto
    const interval = setInterval(() => {
      setTimezoneInfo(getTimezoneInfo())
    }, 60000)
    return () => clearInterval(interval)
  }, [refreshProfile, user])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("app_settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch {
      console.error("Error loading settings")
    }
  }

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem("app_settings", JSON.stringify(newSettings))
      setSettings(newSettings)
    } catch (error) {
      console.error("Error saving settings:", error)
      Alert.alert("Error", "No se pudieron guardar las configuraciones")
    }
  }

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const updateEditedProfile = (field: keyof typeof editedProfile, value: string) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(editedProfile)
      if (result) {
        Alert.alert("Éxito", "Tu perfil ha sido actualizado correctamente.", [
          { text: "OK", onPress: () => setIsEditingProfile(false) },
        ])
      } else {
        Alert.alert("Error", "No se pudo actualizar el perfil")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "No se pudo actualizar el perfil")
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Cerrar sesión", 
          style: "destructive",
          onPress: () => signOut()
        }
      ]
    )
  }

  const clearAppData = () => {
    Alert.alert(
      "Limpiar datos",
      "¿Estás seguro? Esto eliminará todas las configuraciones guardadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear()
              Alert.alert("Éxito", "Datos limpiados correctamente")
            } catch {
              Alert.alert("Error", "No se pudieron limpiar los datos")
            }
          },
        },
      ]
    )
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.background
      }}>
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginTop: 8
        }}>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 24 }}>
          
          {/* Sección de Perfil */}
          <ThemedCard>
            <View style={{ padding: 16 }}>
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "space-between",
                marginBottom: 16
              }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="person-circle" size={24} color={theme.colors.primary} />
                  <ThemedText variant="h3" style={{ marginLeft: 8 }}>
                    Información Personal
                  </ThemedText>
                  {profileLoading && (
                    <Ionicons 
                      name="refresh" 
                      size={16} 
                      color={theme.colors.textMuted} 
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
                <TouchableOpacity 
                  onPress={() => setIsEditingProfile(!isEditingProfile)}
                  style={{ padding: 4 }}
                  disabled={profileLoading}
                >
                  <Ionicons 
                    name={isEditingProfile ? "checkmark" : "pencil"} 
                    size={20} 
                    color={profileLoading ? theme.colors.textMuted : theme.colors.primary} 
                  />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 16 }}>
                {/* Nombre completo */}
                <View>
                  <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: 4 }}>
                    Nombre completo
                  </ThemedText>
                  {isEditingProfile ? (
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                      }}
                      value={editedProfile.full_name}
                      onChangeText={(text) => updateEditedProfile("full_name", text)}
                      placeholder="Tu nombre completo"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  ) : (
                    <ThemedText variant="body">
                      {profile?.full_name || "No especificado"}
                    </ThemedText>
                  )}
                </View>

                {/* Email */}
                <View>
                  <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: 4 }}>
                    Email
                  </ThemedText>
                  <ThemedText variant="body" color="secondary">
                    {profile?.email || "No especificado"}
                  </ThemedText>
                </View>

                {/* Zona horaria */}
                <View>
                  <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: 4 }}>
                    Zona horaria preferida
                  </ThemedText>
                  {isEditingProfile ? (
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                      }}
                      value={editedProfile.timezone}
                      onChangeText={(text) => updateEditedProfile("timezone", text)}
                      placeholder="Ej: America/Panama"
                      placeholderTextColor={theme.colors.textMuted}
                    />
                  ) : (
                    <ThemedText variant="body">
                      {profile?.timezone || timezoneInfo.timezone}
                    </ThemedText>
                  )}
                </View>

                {/* Plan */}
                <View>
                  <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: 4 }}>
                    Plan
                  </ThemedText>
                  <ThemedText variant="body">
                    {profile?.subscription_tier || "No especificado"}
                  </ThemedText>
                </View>

                {isEditingProfile && (
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                    <ThemedButton
                      title="Cancelar"
                      variant="outline"
                      onPress={() => setIsEditingProfile(false)}
                      style={{ flex: 1 }}
                    />
                    <ThemedButton
                      title="Guardar"
                      variant="primary"
                      onPress={handleSaveProfile}
                      style={{ flex: 1 }}
                    />
                  </View>
                )}
              </View>
            </View>
          </ThemedCard>

          {/* Sección de Configuraciones */}
          <ThemedCard>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Ionicons name="settings" size={24} color={theme.colors.primary} />
                <ThemedText variant="h3" style={{ marginLeft: 8 }}>
                  Configuraciones de la App
                </ThemedText>
              </View>

              <View style={{ gap: 20 }}>
                {/* Zona horaria */}
                <View>
                  <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    marginBottom: 8
                  }}>
                    <ThemedText variant="body">Zona horaria</ThemedText>
                    <ThemedText variant="bodySmall" color="secondary">
                      {timezoneInfo.timezone}
                    </ThemedText>
                  </View>
                  <ThemedText variant="caption" color="secondary">
                    Offset: {timezoneInfo.offsetString} • 
                    Ejemplo: {formatTimeWithPreferences(new Date(), settings.use24HourFormat)}
                  </ThemedText>
                </View>

                {/* Formato de hora */}
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: "space-between" 
                }}>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body">Formato 24 horas</ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      {settings.use24HourFormat ? "Ejemplo: 14:30" : "Ejemplo: 2:30 PM"}
                    </ThemedText>
                  </View>
                  <Switch
                    value={settings.use24HourFormat}
                    onValueChange={(value) => updateSetting("use24HourFormat", value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                    thumbColor={settings.use24HourFormat ? theme.colors.primary : theme.colors.textMuted}
                  />
                </View>

                {/* Notificaciones */}
                <View style={{ 
                  flexDirection: "row", 
                  alignItems: "center", 
                  justifyContent: "space-between" 
                }}>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="body">Notificaciones</ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      Recibir recordatorios de eventos (solo en este dispositivo)
                    </ThemedText>
                  </View>
                  <Switch
                    value={settings.notifications}
                    onValueChange={(value) => updateSetting("notifications", value)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                    thumbColor={settings.notifications ? theme.colors.primary : theme.colors.textMuted}
                  />
                </View>

                {/* Selector de tema */}
                <View>
                  <ThemedText variant="body" style={{ marginBottom: 12 }}>
                    Tema de la aplicación
                  </ThemedText>
                  <ThemeSelector />
                </View>
              </View>
            </View>
          </ThemedCard>

          {/* Sección de Acciones */}
          <ThemedCard>
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <Ionicons name="build" size={24} color={theme.colors.primary} />
                <ThemedText variant="h3" style={{ marginLeft: 8 }}>
                  Acciones
                </ThemedText>
              </View>

              <View style={{ gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: theme.colors.surface,
                    borderRadius: 8,
                  }}
                  onPress={() => router.push("/settings/help")}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="help-circle" size={20} color={theme.colors.text} />
                    <ThemedText variant="body" style={{ marginLeft: 12 }}>
                      Ayuda y soporte
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: theme.colors.surface,
                    borderRadius: 8,
                  }}
                  onPress={() => router.push("/settings/Privacy")}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.colors.text} />
                    <ThemedText variant="body" style={{ marginLeft: 12 }}>
                      Privacidad
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: theme.colors.warning + "10",
                    borderRadius: 8,
                  }}
                  onPress={clearAppData}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="trash" size={20} color={theme.colors.warning} />
                    <ThemedText variant="body" style={{ marginLeft: 12, color: theme.colors.warning }}>
                      Limpiar datos de la app
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: theme.colors.error + "10",
                    borderRadius: 8,
                  }}
                  onPress={handleSignOut}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="log-out" size={20} color={theme.colors.error} />
                    <ThemedText variant="body" style={{ marginLeft: 12, color: theme.colors.error }}>
                      Cerrar sesión
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ThemedCard>

          {/* Información de la app */}
          <View style={{ alignItems: "center", paddingVertical: 16 }}>
            <ThemedText variant="caption" color="secondary">
              StudyVault v1.0.0
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              © 2025 Tu Universidad
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  )
}
