"use client"

import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { ThemeSelector } from "@/components/ui/ThemeSelector"
import { useTheme } from "@/hooks/useTheme"
import { formatTimeWithPreferences, getTimezoneInfo } from "@/utils/timezoneHelpers"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useState } from "react"
import { Alert, ScrollView, Switch, View } from "react-native"

interface AppSettings {
  timezone: string
  use24HourFormat: boolean
  notifications: boolean
  autoSync: boolean
  language: string
  theme: string
}

export default function SettingsScreen() {
  const { theme } = useTheme()
  const [settings, setSettings] = useState<AppSettings>({
    timezone: "auto", // "auto" significa usar la del dispositivo
    use24HourFormat: false,
    notifications: true,
    autoSync: true,
    language: "es",
    theme: "auto",
  })
  const [timezoneInfo, setTimezoneInfo] = useState(getTimezoneInfo())

  // Cargar configuraciones guardadas
  useEffect(() => {
    loadSettings()
    // Actualizar info de zona horaria cada minuto
    const interval = setInterval(() => {
      setTimezoneInfo(getTimezoneInfo())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("app_settings")
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem("app_settings", JSON.stringify(newSettings))
      setSettings(newSettings)
      Alert.alert("Configuración", "Configuración guardada correctamente")
    } catch (error) {
      console.error("Error saving settings:", error)
      Alert.alert("Error", "No se pudo guardar la configuración")
    }
  }

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    saveSettings(newSettings)
  }

  const resetSettings = () => {
    Alert.alert(
      "Restablecer Configuración",
      "¿Estás seguro de que quieres restablecer toda la configuración a los valores predeterminados?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restablecer",
          style: "destructive",
          onPress: () => {
            const defaultSettings: AppSettings = {
              timezone: "auto",
              use24HourFormat: false,
              notifications: true,
              autoSync: true,
              language: "es",
              theme: "auto",
            }
            saveSettings(defaultSettings)
          },
        },
      ],
    )
  }

  const testTimezoneConversion = () => {
    const now = new Date()
    const utcTime = now.toISOString()
    const localTime = formatTimeWithPreferences(now, settings.use24HourFormat)

    Alert.alert(
      "Prueba de Conversión",
      `Hora actual:\n• Local: ${localTime}\n• UTC: ${utcTime}\n• Zona: ${timezoneInfo.timezone}`,
    )
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={{ marginBottom: 24 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.primary + "20",
                padding: 12,
                borderRadius: theme.borderRadius.full,
                marginRight: 12,
              }}
            >
              <Ionicons name="settings" size={28} color={theme.colors.primary} />
            </View>
            <ThemedText
              variant="h1"
              style={{
                fontSize: 28,
                fontWeight: "800",
              }}
            >
              Configuración
            </ThemedText>
          </ThemedView>
          <ThemedText variant="body" color="secondary">
            Personaliza StudyVault según tus preferencias
          </ThemedText>
        </ThemedView>

        {/* Zona Horaria */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: 16 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.warning + "20",
                padding: 8,
                borderRadius: theme.borderRadius.full,
                marginRight: 12,
              }}
            >
              <Ionicons name="time" size={20} color={theme.colors.warning} />
            </View>
            <ThemedText variant="h2">Zona Horaria y Fecha</ThemedText>
          </ThemedView>

          {/* Información actual */}
          <ThemedView
            style={{
              backgroundColor: theme.colors.surface,
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: 4 }}>
              <ThemedText variant="bodySmall" style={{ fontWeight: "600" }}>
                Zona Horaria:
              </ThemedText>{" "}
              {timezoneInfo.timezone}
            </ThemedText>
            <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: 4 }}>
              <ThemedText variant="bodySmall" style={{ fontWeight: "600" }}>
                Offset UTC:
              </ThemedText>{" "}
              {timezoneInfo.offsetString}
            </ThemedText>
            <ThemedText variant="bodySmall" color="secondary">
              <ThemedText variant="bodySmall" style={{ fontWeight: "600" }}>
                Hora Actual:
              </ThemedText>{" "}
              {formatTimeWithPreferences(new Date(), settings.use24HourFormat)}
            </ThemedText>
          </ThemedView>

          {/* Formato de hora */}
          <ThemedView
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <ThemedView>
              <ThemedText variant="body">Formato 24 horas</ThemedText>
              <ThemedText variant="caption" color="secondary">
                {settings.use24HourFormat ? "20:30" : "8:30 PM"}
              </ThemedText>
            </ThemedView>
            <Switch
              value={settings.use24HourFormat}
              onValueChange={(value) => updateSetting("use24HourFormat", value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
              thumbColor={settings.use24HourFormat ? theme.colors.primary : theme.colors.textMuted}
            />
          </ThemedView>

          {/* Botón de prueba */}
          <ThemedButton
            title="Probar Conversión"
            variant="outline"
            onPress={testTimezoneConversion}
            style={{ marginTop: 8 }}
          />
        </ThemedCard>

        {/* Tema */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: 16 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.primary + "20",
                padding: 8,
                borderRadius: theme.borderRadius.full,
                marginRight: 12,
              }}
            >
              <Ionicons name="color-palette" size={20} color={theme.colors.primary} />
            </View>
            <ThemedText variant="h2">Apariencia</ThemedText>
          </ThemedView>

          <ThemeSelector />
        </ThemedCard>

        {/* Notificaciones */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: 16 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.info + "20",
                padding: 8,
                borderRadius: theme.borderRadius.full,
                marginRight: 12,
              }}
            >
              <Ionicons name="notifications" size={20} color={theme.colors.info} />
            </View>
            <ThemedText variant="h2">Notificaciones</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: 12 }}>
            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <ThemedView>
                <ThemedText variant="body">Notificaciones Push</ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Recibir recordatorios de eventos y tareas
                </ThemedText>
              </ThemedView>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting("notifications", value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                thumbColor={settings.notifications ? theme.colors.primary : theme.colors.textMuted}
              />
            </ThemedView>

            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <ThemedView>
                <ThemedText variant="body">Sincronización Automática</ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Sincronizar datos automáticamente
                </ThemedText>
              </ThemedView>
              <Switch
                value={settings.autoSync}
                onValueChange={(value) => updateSetting("autoSync", value)}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                thumbColor={settings.autoSync ? theme.colors.primary : theme.colors.textMuted}
              />
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Información del Sistema */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: 16 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.secondary + "20",
                padding: 8,
                borderRadius: theme.borderRadius.full,
                marginRight: 12,
              }}
            >
              <Ionicons name="information-circle" size={20} color={theme.colors.secondary} />
            </View>
            <ThemedText variant="h2">Información del Sistema</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: 8 }}>
            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <ThemedText variant="bodySmall" color="secondary">
                Versión de la App
              </ThemedText>
              <ThemedText variant="bodySmall">1.0.0</ThemedText>
            </ThemedView>
            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <ThemedText variant="bodySmall" color="secondary">
                Zona Horaria del Sistema
              </ThemedText>
              <ThemedText variant="bodySmall">{timezoneInfo.timezone}</ThemedText>
            </ThemedView>
            <ThemedView
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
              }}
            >
              <ThemedText variant="bodySmall" color="secondary">
                Idioma
              </ThemedText>
              <ThemedText variant="bodySmall">Español</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Acciones */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: 16 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.accent + "20",
                padding: 8,
                borderRadius: theme.borderRadius.full,
                marginRight: 12,
              }}
            >
              <Ionicons name="build" size={20} color={theme.colors.accent} />
            </View>
            <ThemedText variant="h2">Acciones</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: 8 }}>
            <ThemedButton
              title="Exportar Configuración"
              variant="outline"
              icon={<Ionicons name="download" size={18} color={theme.colors.primary} />}
              onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
            />
            <ThemedButton
              title="Restablecer Configuración"
              variant="error"
              icon={<Ionicons name="refresh" size={18} color="white" />}
              onPress={resetSettings}
            />
          </ThemedView>
        </ThemedCard>

        {/* Debug Info */}
        <ThemedCard variant="outlined" padding="medium">
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Ionicons name="bug" size={16} color={theme.colors.textMuted} />
            <ThemedText variant="h3" style={{ marginLeft: 8, fontSize: 14 }}>
              Información de Debug
            </ThemedText>
          </ThemedView>
          <ThemedView style={{ gap: 4 }}>
            <ThemedText variant="caption" color="secondary">
              Offset: {timezoneInfo.offsetString} | UTC: {new Date().toISOString().substring(11, 19)}
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Local: {new Date().toLocaleTimeString("es-ES", { hour12: !settings.use24HourFormat })}
            </ThemedText>
          </ThemedView>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}
