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
  const [showDataModal, setShowDataModal] = useState<boolean>(false)

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
            backgroundColor: "rgba(0, 0, 0, 0.6)",
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
                Privacidad y Seguridad
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText variant="body" color="secondary" style={{ fontSize: 16 }}>
            Tu privacidad es nuestra prioridad. Conoce cómo protegemos tus datos
          </ThemedText>
        </ThemedView>

        {/* Resumen de Privacidad */}
        <ThemedCard
          variant="elevated"
          padding="large"
          style={{
            marginBottom: theme.spacing.lg,
            backgroundColor: theme.colors.success + "10",
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.success,
          }}
        >
          <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                backgroundColor: theme.colors.success + "20",
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.lg,
              }}
            >
              <IconSymbol name="shield.checkmark" size={28} color={theme.colors.success} />
            </View>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm, color: theme.colors.success }}>
                Tu información está segura
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                Study Vault utiliza encriptación de extremo a extremo y solo recopila la información mínima necesaria
                para brindarte la mejor experiencia de estudio.
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Información */}
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
                backgroundColor: theme.colors.primary + "20",
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.md,
              }}
            >
              <IconSymbol name="doc.text" size={24} color={theme.colors.primary} />
            </View>
            <ThemedText variant="h2" style={{ fontWeight: "700" }}>
              Documentos Legales
            </ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.sm }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.lg,
                paddingHorizontal: theme.spacing.md,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              onPress={() => setShowPrivacyModal(true)}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.success + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.lg,
                  }}
                >
                  <IconSymbol name="doc.text" size={24} color={theme.colors.success} />
                </View>
                <ThemedView>
                  <ThemedText variant="body" style={{ fontWeight: "600", fontSize: 16 }}>
                    Política de Privacidad
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary" style={{ fontSize: 14 }}>
                    Cómo manejamos tu información
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.lg,
                paddingHorizontal: theme.spacing.md,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              onPress={() => setShowDataModal(true)}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.warning + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.lg,
                  }}
                >
                  <IconSymbol name="folder" size={24} color={theme.colors.warning} />
                </View>
                <ThemedView>
                  <ThemedText variant="body" style={{ fontWeight: "600", fontSize: 16 }}>
                    Gestión de Datos
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary" style={{ fontSize: 14 }}>
                    Controla tu información personal
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: theme.spacing.lg,
                paddingHorizontal: theme.spacing.md,
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              onPress={() => setShowAppInfoModal(true)}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: theme.colors.secondary + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.sm,
                    marginRight: theme.spacing.lg,
                  }}
                >
                  <IconSymbol name="info.circle" size={24} color={theme.colors.secondary} />
                </View>
                <ThemedView>
                  <ThemedText variant="body" style={{ fontWeight: "600", fontSize: 16 }}>
                    Acerca de Study Vault
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary" style={{ fontSize: 14 }}>
                    Información de la aplicación
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <IconSymbol name="chevron.right" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedCard>

        {/* Configuraciones de Privacidad */}
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
              <IconSymbol name="gear" size={24} color={theme.colors.info} />
            </View>
            <ThemedText variant="h2" style={{ fontWeight: "700" }}>
              Configuraciones de Privacidad
            </ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.md }}>
            <ThemedView
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <IconSymbol name="eye.slash" size={20} color={theme.colors.info} />
                <ThemedText variant="body" style={{ fontWeight: "600", marginLeft: theme.spacing.sm }}>
                  Datos Anónimos
                </ThemedText>
              </ThemedView>
              <ThemedText variant="caption" color="secondary" style={{ lineHeight: 20 }}>
                Tus datos de estudio se almacenan de forma anónima y encriptada. No compartimos información personal con
                terceros.
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <IconSymbol name="lock" size={20} color={theme.colors.success} />
                <ThemedText variant="body" style={{ fontWeight: "600", marginLeft: theme.spacing.sm }}>
                  Encriptación Local
                </ThemedText>
              </ThemedView>
              <ThemedText variant="caption" color="secondary" style={{ lineHeight: 20 }}>
                Toda tu información se encripta localmente en tu dispositivo antes de sincronizarse con la nube.
              </ThemedText>
            </ThemedView>

            <ThemedView
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <IconSymbol name="trash" size={20} color={theme.colors.error} />
                <ThemedText variant="body" style={{ fontWeight: "600", marginLeft: theme.spacing.sm }}>
                  Eliminación de Datos
                </ThemedText>
              </ThemedView>
              <ThemedText variant="caption" color="secondary" style={{ lineHeight: 20 }}>
                Puedes solicitar la eliminación completa de tus datos en cualquier momento contactando a soporte.
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
            🛡️ Cómo protegemos tus datos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            En Study Vault, tu privacidad es nuestra máxima prioridad. Implementamos las mejores prácticas de seguridad
            para proteger tu información personal y académica.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            📱 Información que recopilamos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Información de perfil básica (nombre, email){"\n"}• Datos académicos (materias, tareas, notas){"\n"}•
            Preferencias de la aplicación{"\n"}• Datos de uso para mejorar la experiencia
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🔒 Cómo protegemos tu información
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Encriptación de extremo a extremo{"\n"}• Almacenamiento seguro en servidores certificados{"\n"}• Acceso
            restringido solo a personal autorizado{"\n"}• Auditorías de seguridad regulares
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🤝 Nuestros compromisos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Nunca vendemos tu información personal{"\n"}• Solo compartimos datos esenciales con servicios confiables
            {"\n"}• Respetamos tu derecho a la privacidad{"\n"}• Te notificamos sobre cualquier cambio importante
          </ThemedText>
        </ThemedView>
      </BubbleModal>

      {/* Modal de Gestión de Datos */}
      <BubbleModal
        visible={showDataModal}
        onClose={() => setShowDataModal(false)}
        title="Gestión de Datos"
        iconName="folder"
        iconColor={theme.colors.warning}
      >
        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            📊 Tus derechos sobre los datos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Tienes control total sobre tu información personal. Puedes acceder, modificar o eliminar tus datos en
            cualquier momento.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🔍 Acceso a tus datos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Puedes ver toda tu información desde la app{"\n"}• Solicita una copia completa de tus datos{"\n"}• Exporta
            tus notas y materiales de estudio{"\n"}• Revisa el historial de actividad
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            ✏️ Modificación de datos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Edita tu perfil desde configuraciones{"\n"}• Actualiza tus preferencias en cualquier momento{"\n"}•
            Corrige información incorrecta{"\n"}• Cambia tus configuraciones de privacidad
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🗑️ Eliminación de datos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Elimina elementos específicos desde la app{"\n"}• Solicita la eliminación completa de tu cuenta{"\n"}• Los
            datos se eliminan permanentemente en 30 días{"\n"}• Contacta a soporte para asistencia
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
            ✨ Nuestra misión
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Study Vault nació con la misión de revolucionar la forma en que los estudiantes organizan y acceden a su
            conocimiento académico. Queremos hacer que estudiar sea más eficiente y organizado.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🎯 Nuestros valores
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            • Privacidad y seguridad primero{"\n"}• Diseño centrado en el usuario{"\n"}• Innovación constante{"\n"}•
            Accesibilidad para todos{"\n"}• Transparencia en nuestras prácticas
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🚀 Versión actual
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Study Vault v2.1.0{"\n"}Última actualización: Enero 2024{"\n"}Nuevas funciones: Sistema de rachas,
            notificaciones mejoradas, y más personalización.
          </ThemedText>
        </ThemedView>

        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            ❤️ Agradecimientos
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
            Gracias a todos los estudiantes que han confiado en Study Vault para organizar sus estudios. Su feedback nos
            ayuda a mejorar cada día.
          </ThemedText>
        </ThemedView>
      </BubbleModal>
    </ThemedView>
  )
}
