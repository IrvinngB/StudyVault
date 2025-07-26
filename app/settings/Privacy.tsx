"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import type React from "react"
import { useState } from "react"
import { Dimensions, Modal, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

export default function PrivacyScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  // Estados
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false)
  const [showAppInfoModal, setShowAppInfoModal] = useState<boolean>(false)

  // Componente de Modal Burbuja
  const BubbleModal: React.FC<{
    visible: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    iconName: string
    iconColor: string
  }> = ({ visible, onClose, title, children, iconName, iconColor }) => (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: theme.spacing.lg,
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                maxWidth: screenWidth * 0.9,
                maxHeight: screenHeight * 0.8,
                alignItems: "center",
              }}
            >
              {/* Flecha apuntando hacia arriba */}
              <View
                style={{
                  width: 0,
                  height: 0,
                  backgroundColor: "transparent",
                  borderStyle: "solid",
                  borderLeftWidth: 15,
                  borderRightWidth: 15,
                  borderBottomWidth: 15,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderBottomColor: theme.colors.surface,
                  marginBottom: -1,
                  zIndex: 1,
                }}
              />

              {/* Contenido de la burbuja */}
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.xl,
                  ...theme.shadows.large,
                  minWidth: screenWidth * 0.8,
                  maxWidth: screenWidth * 0.9,
                }}
              >
                {/* Header del modal */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: theme.spacing.lg,
                    paddingBottom: theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: iconColor + "20",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <IconSymbol name={iconName as any} size={24} color={iconColor} />
                  </View>
                  <ThemedText variant="h2" style={{ flex: 1 }}>
                    {title}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: theme.colors.background,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconSymbol name="xmark" size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Contenido */}
                <ScrollView
                  style={{
                    maxHeight: screenHeight * 0.5,
                    paddingHorizontal: theme.spacing.lg,
                  }}
                  showsVerticalScrollIndicator={false}
                >
                  {children}
                </ScrollView>

                {/* Footer con botón */}
                <View
                  style={{
                    padding: theme.spacing.lg,
                    paddingTop: theme.spacing.md,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                  }}
                >
                  <ThemedButton title="Entendido" variant="primary" onPress={onClose} />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )

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
              marginBottom: theme.spacing.md,
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
            <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  backgroundColor: theme.colors.info + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginRight: theme.spacing.sm,
                }}
              >
                <IconSymbol name="lock.fill" size={24} color={theme.colors.info} />
              </View>
              <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800" }}>
                Privacidad
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText variant="body" color="secondary">
            Información sobre cómo protegemos tus datos
          </ThemedText>
        </ThemedView>

        {/* Información */}
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
                backgroundColor: theme.colors.primary + "20",
                padding: theme.spacing.xs,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.sm,
              }}
            >
              <IconSymbol name="doc.text" size={20} color={theme.colors.primary} />
            </View>
            <ThemedText variant="h2">Información</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.sm }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.sm,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.md,
              }}
              onPress={() => setShowPrivacyModal(true)}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.success + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name="doc.text" size={20} color={theme.colors.success} />
                </View>
                <ThemedText variant="body">Política de privacidad</ThemedText>
              </ThemedView>
              <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.sm,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.md,
              }}
              onPress={() => setShowAppInfoModal(true)}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.secondary + "20",
                    padding: theme.spacing.xs,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name="info.circle" size={20} color={theme.colors.secondary} />
                </View>
                <ThemedText variant="body">Acerca de Study Vault</ThemedText>
              </ThemedView>
              <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedCard>

        {/* Mensaje tranquilizador */}
        <ThemedCard
          variant="elevated"
          padding="medium"
          style={{
            backgroundColor: theme.colors.success + "10",
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.success,
          }}
        >
          <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                backgroundColor: theme.colors.success + "20",
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.md,
              }}
            >
              <IconSymbol name="shield.checkmark" size={28} color={theme.colors.success} />
            </View>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
                Tu privacidad es importante
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                Solo usamos la información necesaria para que Study Vault funcione bien. Puedes cambiar estos ajustes
                cuando quieras.
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedCard>
      </ScrollView>

      {/* Modal de Política de Privacidad */}
      <BubbleModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Política de Privacidad"
        iconName="shield.checkmark"
        iconColor={theme.colors.success}
      >
        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🛡️ Cómo cuidamos tus datos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Tu información es súper importante para nosotros. Solo recopilamos lo mínimo necesario para que la app
            funcione de maravilla.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            📱 Qué información usamos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Tu perfil básico (nombre, foto){"\n"}• Preferencias de la app{"\n"}• Datos de uso para mejorar la
            experiencia
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🤝 Nuestras promesas
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Nunca vendemos tu información{"\n"}• Solo compartimos lo esencial con servicios confiables{"\n"}• Puedes
            eliminar tus datos cuando quieras{"\n"}• Siempre te avisamos si algo cambia
          </ThemedText>
        </ThemedView>
      </BubbleModal>

      {/* Modal de Acerca de la App */}
      <BubbleModal
        visible={showAppInfoModal}
        onClose={() => setShowAppInfoModal(false)}
        title="Acerca de Study Vault"
        iconName="heart.fill"
        iconColor={theme.colors.accent}
      >
        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            ✨ ¿Qué hace Study Vault?
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Study Vault está diseñada para revolucionar tu experiencia de estudio. Te ayudamos a organizar, guardar y
            acceder a todos tus materiales académicos de forma inteligente y eficiente.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            💡 ¿Por qué la creamos?
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Queríamos crear la herramienta de estudio definitiva que realmente transformara la forma en que los
            estudiantes organizan y acceden a su conocimiento. Después de muchas tazas de café y noches programando,
            Study Vault nació.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🚀 Dato curioso
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            El nombre "Study Vault" surgió porque queríamos que fuera como una bóveda segura para todo tu conocimiento.
            ¡Un lugar donde tus estudios estén protegidos y organizados como un tesoro!
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            ❤️ Gracias por usar Study Vault
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Cada vez que abres Study Vault, nos haces felices. Tu feedback nos ayuda a mejorar la experiencia de estudio
            cada día.
          </ThemedText>
        </ThemedView>
      </BubbleModal>
    </ThemedView>
  )
}
