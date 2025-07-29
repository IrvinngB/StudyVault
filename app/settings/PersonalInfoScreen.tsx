"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useAuth } from "@/hooks/useAuth"

import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import type React from "react"
import { useState } from "react"
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface PersonalInfo {
  fullName: string
  email: string
  timeZone: string
  phoneNumber: string
  bio: string
}

const PersonalInformationScreen: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuth()
  const insets = useSafeAreaInsets()


  // Estados para los campos del formulario
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: user?.user_metadata?.full_name || "Nombre Apellido",
    email: user?.email || "correo.estudiante@email.com",
    timeZone: "America/Panama (UTC-5)",
    phoneNumber: "+507 0000-0000",
    bio: "Estudiante apasionado por el aprendizaje",
  })

  const [isEditing, setIsEditing] = useState<boolean>(false)

  // Función para actualizar los campos
  const updateField = (field: keyof PersonalInfo, value: string): void => {
    setPersonalInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Función para guardar cambios
  const handleSave = (): void => {
    recordProfileUpdated() // Registrar acción para Easter egg
    Alert.alert("Información actualizada", "Tus datos personales han sido guardados correctamente.", [
      { text: "OK", onPress: () => setIsEditing(false) },
    ])
  }

  // Función para cancelar edición
  const handleCancel = (): void => {
    setIsEditing(false)
    // Aquí podrías restaurar los valores originales si quisieras
  }

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
        {/* Header con título y botón de editar */}
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
              <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800" }}>
                Información Personal
              </ThemedText>
            </ThemedView>
            <TouchableOpacity
              style={{
                backgroundColor: isEditing ? theme.colors.error + "20" : theme.colors.primary + "20",
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: isEditing ? theme.colors.error : theme.colors.primary,
              }}
              onPress={() => setIsEditing(!isEditing)}
            >
              <IconSymbol
                name={isEditing ? "xmark" : "pencil"}
                size={18}
                color={isEditing ? theme.colors.error : theme.colors.primary}
              />
            </TouchableOpacity>
          </ThemedView>
          <ThemedText variant="body" color="secondary" style={{ fontSize: 16 }}>
            Gestiona tu información personal y de contacto
          </ThemedText>
        </ThemedView>

        {/* Avatar Section */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ alignItems: "center", paddingVertical: theme.spacing.md }}>
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.primary,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: theme.spacing.lg,
                ...theme.shadows.medium,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 48,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {personalInfo.fullName.charAt(0)}
              </ThemedText>
            </View>
            {isEditing && (
              <ThemedButton
                title="Cambiar foto de perfil"
                variant="outline"
                icon={<IconSymbol name="camera" size={16} color={theme.colors.primary} />}
                onPress={() => Alert.alert("Próximamente", "Esta función estará disponible pronto")}
              />
            )}
          </ThemedView>
        </ThemedCard>

        {/* Information Fields */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.lg,
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
              <IconSymbol name="person.circle" size={24} color={theme.colors.info} />
            </View>
            <ThemedText variant="h2" style={{ fontWeight: "700" }}>
              Datos Personales
            </ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.lg }}>
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
                    borderWidth: 2,
                    borderColor: theme.colors.primary + "40",
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    color: theme.colors.text,
                    fontSize: 16,
                    marginLeft: theme.spacing.lg,
                  }}
                  value={personalInfo.fullName}
                  onChangeText={(value) => updateField("fullName", value)}
                  placeholder="Ingresa tu nombre completo"
                  placeholderTextColor={theme.colors.textMuted}
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg, fontSize: 16 }}>
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
                    borderWidth: 2,
                    borderColor: theme.colors.warning + "40",
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    color: theme.colors.text,
                    fontSize: 16,
                    marginLeft: theme.spacing.lg,
                  }}
                  value={personalInfo.email}
                  onChangeText={(value) => updateField("email", value)}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg, fontSize: 16 }}>
                  {personalInfo.email}
                </ThemedText>
              )}
            </ThemedView>

            {/* Teléfono */}
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
                  <IconSymbol name="phone" size={16} color={theme.colors.success} />
                </View>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Número de teléfono
                </ThemedText>
              </ThemedView>
              {isEditing ? (
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: theme.colors.success + "40",
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    color: theme.colors.text,
                    fontSize: 16,
                    marginLeft: theme.spacing.lg,
                  }}
                  value={personalInfo.phoneNumber}
                  onChangeText={(value) => updateField("phoneNumber", value)}
                  placeholder="+507 0000-0000"
                  placeholderTextColor={theme.colors.textMuted}
                  keyboardType="phone-pad"
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg, fontSize: 16 }}>
                  {personalInfo.phoneNumber}
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
                    backgroundColor: theme.colors.secondary + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name="clock" size={16} color={theme.colors.secondary} />
                </View>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Zona horaria
                </ThemedText>
              </ThemedView>
              {isEditing ? (
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: theme.colors.secondary + "40",
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    color: theme.colors.text,
                    fontSize: 16,
                    marginLeft: theme.spacing.lg,
                  }}
                  value={personalInfo.timeZone}
                  onChangeText={(value) => updateField("timeZone", value)}
                  placeholder="America/Panama (UTC-5)"
                  placeholderTextColor={theme.colors.textMuted}
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg, fontSize: 16 }}>
                  {personalInfo.timeZone}
                </ThemedText>
              )}
            </ThemedView>

            {/* Biografía */}
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
                    backgroundColor: theme.colors.accent + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.sm,
                  }}
                >
                  <IconSymbol name="text.alignleft" size={16} color={theme.colors.accent} />
                </View>
                <ThemedText variant="body" style={{ fontWeight: "600" }}>
                  Biografía
                </ThemedText>
              </ThemedView>
              {isEditing ? (
                <TextInput
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: theme.colors.accent + "40",
                    borderRadius: theme.borderRadius.md,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    color: theme.colors.text,
                    fontSize: 16,
                    marginLeft: theme.spacing.lg,
                    height: 80,
                    textAlignVertical: "top",
                  }}
                  value={personalInfo.bio}
                  onChangeText={(value) => updateField("bio", value)}
                  placeholder="Cuéntanos un poco sobre ti..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline={true}
                  numberOfLines={3}
                />
              ) : (
                <ThemedText variant="body" style={{ marginLeft: theme.spacing.lg, fontSize: 16, lineHeight: 22 }}>
                  {personalInfo.bio}
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
                marginTop: theme.spacing.xl,
              }}
            >
              <ThemedButton title="Cancelar" variant="outline" onPress={handleCancel} style={{ flex: 1 }} />
              <ThemedButton title="Guardar cambios" variant="primary" onPress={handleSave} style={{ flex: 1 }} />
            </ThemedView>
          )}
        </ThemedCard>

        {/* Información adicional */}
        <ThemedCard
          variant="elevated"
          padding="large"
          style={{
            backgroundColor: theme.colors.info + "10",
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.info,
          }}
        >
          <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                backgroundColor: theme.colors.info + "20",
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.lg,
              }}
            >
              <IconSymbol name="info.circle" size={28} color={theme.colors.info} />
            </View>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm, color: theme.colors.info }}>
                Información importante
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                Tu información personal se mantiene privada y segura. Solo tú puedes ver y editar estos datos. Para
                cambios importantes como el email, es posible que necesites verificación adicional.
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}

export default PersonalInformationScreen
