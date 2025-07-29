"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { useState } from "react"
import { Linking, ScrollView, Switch, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface PrivacySection {
  title: string
  description: string
  icon: string
  action?: () => void
  hasToggle?: boolean
  toggleValue?: boolean
  onToggleChange?: (value: boolean) => void
}

export default function PrivacyScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  
  // Privacy settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [dataSyncEnabled, setDataSyncEnabled] = useState(true)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  const privacySections: PrivacySection[] = [
    {
      title: "Notificaciones",
      description: "Controla las notificaciones push y recordatorios",
      icon: "bell",
      hasToggle: true,
      toggleValue: notificationsEnabled,
      onToggleChange: setNotificationsEnabled
    },
    {
      title: "Sincronización de Datos",
      description: "Sincroniza tus datos en la nube para acceder desde cualquier dispositivo",
      icon: "icloud",
      hasToggle: true,
      toggleValue: dataSyncEnabled,
      onToggleChange: setDataSyncEnabled
    },
    {
      title: "Autenticación Biométrica",
      description: "Usa tu huella dactilar o Face ID para acceder a la app",
      icon: "touchid",
      hasToggle: true,
      toggleValue: biometricEnabled,
      onToggleChange: setBiometricEnabled
    },
    {
      title: "Análisis y Mejoras",
      description: "Ayúdanos a mejorar la app enviando datos de uso anónimos",
      icon: "chart.bar",
      hasToggle: true,
      toggleValue: analyticsEnabled,
      onToggleChange: setAnalyticsEnabled
    }
  ]

  const legalDocuments = [
    {
      title: "Política de Privacidad",
      description: "Cómo recopilamos, usamos y protegemos tu información",
      icon: "doc.text",
      action: () => Linking.openURL("https://studyvault.app/privacy")
    },
    {
      title: "Términos de Uso",
      description: "Condiciones y términos para usar StudyVault",
      icon: "doc.plaintext",
      action: () => Linking.openURL("https://studyvault.app/terms")
    },
    {
      title: "Licencia de Software",
      description: "Información sobre la licencia de código abierto",
      icon: "doc.badge",
      action: () => Linking.openURL("https://github.com/studyvault-app/LICENSE")
    }
  ]

  const dataManagement = [
    {
      title: "Exportar Datos",
      description: "Descarga una copia de todos tus datos",
      icon: "square.and.arrow.up",
      action: () => {
        // TODO: Implementar exportación de datos
        console.log("Exportar datos")
      }
    },
    {
      title: "Eliminar Datos",
      description: "Elimina permanentemente todos tus datos de la app",
      icon: "trash",
      action: () => {
        // TODO: Implementar eliminación de datos
        console.log("Eliminar datos")
      }
    },
    {
      title: "Configuración de Cookies",
      description: "Gestiona las cookies y tecnologías de seguimiento",
      icon: "cookie",
      action: () => Linking.openURL("https://studyvault.app/cookies")
    }
  ]

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <View style={{ paddingTop: insets.top, backgroundColor: theme.colors.background }} />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: theme.spacing.xl,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: theme.colors.surface,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              marginRight: theme.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <IconSymbol name="chevron.left" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <View
            style={{
              backgroundColor: theme.colors.warning + "20",
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              marginRight: theme.spacing.sm,
            }}
          >
            <IconSymbol name="lock.shield" size={24} color={theme.colors.warning} />
          </View>
          <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800" }}>
            Privacidad y Seguridad
          </ThemedText>
        </ThemedView>

        {/* Privacy Settings */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="gear" size={24} color={theme.colors.primary} />
            <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
              Configuración de Privacidad
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            {privacySections.map((section, index) => (
              <ThemedView
                key={index}
                style={{
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.primary + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name={section.icon as any} size={20} color={theme.colors.primary} />
                </View>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                    {section.title}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {section.description}
                  </ThemedText>
                </ThemedView>
                {section.hasToggle && (
                  <Switch
                    value={section.toggleValue}
                    onValueChange={section.onToggleChange}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + "40" }}
                    thumbColor={section.toggleValue ? theme.colors.primary : theme.colors.textMuted}
                  />
                )}
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Legal Documents */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="doc.text" size={24} color={theme.colors.primary} />
            <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
              Documentos Legales
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            {legalDocuments.map((document, index) => (
              <TouchableOpacity
                key={index}
                onPress={document.action}
                style={{
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.info + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name={document.icon as any} size={20} color={theme.colors.info} />
                </View>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                    {document.title}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {document.description}
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="arrow.up.right" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Data Management */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="folder" size={24} color={theme.colors.primary} />
            <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
              Gestión de Datos
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            {dataManagement.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.action}
                style={{
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.colors.warning + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name={item.icon as any} size={20} color={theme.colors.warning} />
                </View>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                    {item.title}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {item.description}
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Privacy Notice */}
        <ThemedCard variant="outlined" padding="medium">
          <ThemedView style={{ alignItems: "center" }}>
            <View
              style={{
                backgroundColor: theme.colors.success + "20",
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.full,
                marginBottom: theme.spacing.sm,
              }}
            >
              <IconSymbol name="checkmark.shield" size={24} color={theme.colors.success} />
            </View>
            <ThemedText variant="h3" style={{ fontWeight: "700", marginBottom: theme.spacing.sm, textAlign: "center" }}>
              Tu Privacidad es Importante
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={{ textAlign: "center", lineHeight: 20 }}>
              En StudyVault, protegemos tu información personal y académica. 
              Todos los datos se almacenan de forma segura y solo se usan para mejorar tu experiencia.
            </ThemedText>
          </ThemedView>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}
