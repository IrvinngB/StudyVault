"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { ThemeSelector } from "@/components/ui/ThemeSelector"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { useUserProfile } from "@/hooks/useUserProfile"
import { getTimezoneInfo } from "@/utils/timezoneHelpers"
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

    if (user) {
      refreshProfile().catch((error) => {
        console.log("Could not load profile from backend:", error)
      })
    }

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
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => signOut(),
      },
    ])
  }

  const clearAppData = () => {
    Alert.alert("Limpiar datos", "¿Estás seguro? Esto eliminará todas las configuraciones guardadas.", [
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
    ])
  }

  const menuItems = [
    {
      icon: "person.circle",
      title: "Información Personal",
      subtitle: "Nombre, email y preferencias",
      onPress: () => router.push("/settings/PersonalInfoScreen"),
      color: theme.colors.primary,
    },
    {
      icon: "bell",
      title: "Notificaciones",
      subtitle: "Recordatorios y alertas",
      onPress: () => {},
      color: theme.colors.info,
      hasSwitch: true,
      switchValue: settings.notifications,
      onSwitchChange: (value: boolean) => updateSetting("notifications", value),
    },
    {
      icon: "shield.checkmark",
      title: "Privacidad y Seguridad",
      subtitle: "Datos y permisos",
      onPress: () => router.push("/settings/Privacy"),
      color: theme.colors.success,
    },
    {
      icon: "questionmark.circle",
      title: "Ayuda y Soporte",
      subtitle: "FAQ y contacto",
      onPress: () => router.push("/settings/help"),
      color: theme.colors.warning,
    },
    {
      icon: "info.circle",
      title: "Acerca de StudyVault",
      subtitle: "Versión 1.0.0",
      onPress: () => {},
      color: theme.colors.secondary,
    },
  ]

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
      >
        <ThemedText variant="h1" style={{ fontSize: 32, fontWeight: "800", marginBottom: 4 }}>
          Configuración
        </ThemedText>
        <ThemedText variant="body" color="secondary">
          Personaliza tu experiencia
        </ThemedText>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20, gap: 24 }}>
          {/* Profile Card */}
          <ThemedCard style={{ padding: 20, borderRadius: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <ThemedText
                  style={{
                    color: "white",
                    fontSize: 24,
                    fontWeight: "700",
                  }}
                >
                  {(profile?.full_name || user?.name || "U").charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="h3" style={{ fontWeight: "600", marginBottom: 2 }}>
                  {profile?.full_name || user?.name || "Usuario"}
                </ThemedText>
                <ThemedText variant="body" color="secondary">
                  {profile?.email || user?.email || "email@ejemplo.com"}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditingProfile(!isEditingProfile)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: theme.colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name={isEditingProfile ? "checkmark" : "pencil"} size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {isEditingProfile && (
              <View style={{ gap: 16 }}>
                <View>
                  <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: 8 }}>
                    Nombre completo
                  </ThemedText>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      fontSize: 16,
                    }}
                    value={editedProfile.full_name}
                    onChangeText={(text) => updateEditedProfile("full_name", text)}
                    placeholder="Tu nombre completo"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setIsEditingProfile(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: theme.colors.surface,
                      alignItems: "center",
                    }}
                  >
                    <ThemedText style={{ fontWeight: "600" }}>Cancelar</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: theme.colors.primary,
                      alignItems: "center",
                    }}
                  >
                    <ThemedText style={{ color: "white", fontWeight: "600" }}>Guardar</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ThemedCard>

          {/* Theme Selector */}
          <ThemedCard style={{ padding: 20, borderRadius: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <IconSymbol name="paintbrush" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <ThemedText variant="h3" style={{ fontWeight: "600" }}>
                  Tema de la aplicación
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Personaliza la apariencia
                </ThemedText>
              </View>
            </View>
            <ThemeSelector />
          </ThemedCard>

          {/* Settings Menu */}
          <ThemedCard style={{ borderRadius: 20, overflow: "hidden" }}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 20,
                  borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: item.color + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <IconSymbol name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: 2 }}>
                    {item.title}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {item.subtitle}
                  </ThemedText>
                </View>
                {item.hasSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                    thumbColor={item.switchValue ? theme.colors.primary : theme.colors.textMuted}
                  />
                ) : (
                  <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </ThemedCard>

          {/* Danger Zone */}
          <ThemedCard style={{ borderRadius: 20, overflow: "hidden" }}>
            <TouchableOpacity
              onPress={clearAppData}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.warning + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <IconSymbol name="trash" size={20} color={theme.colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: "600", color: theme.colors.warning }}>
                  Limpiar datos de la app
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Eliminar configuraciones locales
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.error + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <IconSymbol name="arrow.right.square" size={20} color={theme.colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: "600", color: theme.colors.error }}>
                  Cerrar sesión
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Salir de tu cuenta
                </ThemedText>
              </View>
            </TouchableOpacity>
          </ThemedCard>

          {/* App Info */}
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <ThemedText variant="caption" color="secondary" style={{ marginBottom: 4 }}>
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
