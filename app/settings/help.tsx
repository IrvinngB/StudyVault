"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { useState } from "react"
import { Alert, Linking, ScrollView, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface FAQItem {
  question: string
  answer: string
  icon: string
  color: string
}

export default function HelpScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqData: FAQItem[] = [
    {
      question: "¿Cómo creo mi primera materia?",
      answer:
        "Ve a la sección 'Cursos' desde el menú principal, toca el botón '+' y completa la información básica como nombre, código y color. ¡Es súper fácil!",
      icon: "book.closed",
      color: theme.colors.primary,
    },
    {
      question: "¿Puedo sincronizar mis datos?",
      answer:
        "Sí, todos tus datos se sincronizan automáticamente en la nube. Puedes acceder a tu información desde cualquier dispositivo donde tengas Study Vault instalado.",
      icon: "icloud",
      color: theme.colors.info,
    },
    {
      question: "¿Cómo organizo mis tareas?",
      answer:
        "En la sección 'Tareas' puedes crear, editar y marcar como completadas tus actividades. También puedes asignarlas a materias específicas y establecer fechas límite.",
      icon: "checklist",
      color: theme.colors.secondary,
    },
    {
      question: "¿Puedo exportar mis notas?",
      answer:
        "Actualmente estamos trabajando en esta función. Pronto podrás exportar tus notas en diferentes formatos como PDF y texto plano.",
      icon: "square.and.arrow.up",
      color: theme.colors.warning,
    },
    {
      question: "¿La app funciona sin internet?",
      answer:
        "¡Por supuesto! Study Vault funciona completamente offline. Tus datos se sincronizarán automáticamente cuando tengas conexión a internet.",
      icon: "wifi.slash",
      color: theme.colors.accent,
    },
  ]

  const contactOptions = [
    {
      title: "Enviar email",
      subtitle: "soporte@studyvault.com",
      icon: "envelope",
      color: theme.colors.primary,
      action: () => Linking.openURL("mailto:soporte@studyvault.com"),
    },
    {
      title: "Chat en vivo",
      subtitle: "Respuesta inmediata",
      icon: "message",
      color: theme.colors.success,
      action: () => Alert.alert("Próximamente", "El chat en vivo estará disponible pronto"),
    },
    {
      title: "Centro de ayuda",
      subtitle: "Guías y tutoriales",
      icon: "questionmark.circle",
      color: theme.colors.info,
      action: () => Alert.alert("Próximamente", "El centro de ayuda estará disponible pronto"),
    },
  ]

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
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
                  backgroundColor: theme.colors.secondary + "20",
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.full,
                  marginRight: theme.spacing.sm,
                }}
              >
                <IconSymbol name="questionmark.circle.fill" size={24} color={theme.colors.secondary} />
              </View>
              <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800" }}>
                Ayuda y Soporte
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText variant="body" color="secondary">
            Encuentra respuestas rápidas o contáctanos
          </ThemedText>
        </ThemedView>

        {/* Preguntas Frecuentes */}
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
              <IconSymbol name="questionmark" size={20} color={theme.colors.primary} />
            </View>
            <ThemedText variant="h2">Preguntas Frecuentes</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.sm }}>
            {faqData.map((faq, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleFAQ(index)}
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  borderWidth: 1,
                  borderColor: expandedFAQ === index ? faq.color : theme.colors.border,
                }}
              >
                <ThemedView
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <ThemedView style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: faq.color + "20",
                        padding: theme.spacing.xs,
                        borderRadius: theme.borderRadius.sm,
                        marginRight: theme.spacing.sm,
                      }}
                    >
                      <IconSymbol name={faq.icon as any} size={16} color={faq.color} />
                    </View>
                    <ThemedText variant="body" style={{ flex: 1, fontWeight: "600" }}>
                      {faq.question}
                    </ThemedText>
                  </ThemedView>
                  <IconSymbol
                    name={expandedFAQ === index ? "chevron.up" : "chevron.down"}
                    size={16}
                    color={theme.colors.textMuted}
                  />
                </ThemedView>

                {expandedFAQ === index && (
                  <ThemedView style={{ marginTop: theme.spacing.md, paddingLeft: theme.spacing.lg }}>
                    <ThemedText variant="body" color="secondary" style={{ lineHeight: 22 }}>
                      {faq.answer}
                    </ThemedText>
                  </ThemedView>
                )}
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Opciones de Contacto */}
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
                backgroundColor: theme.colors.success + "20",
                padding: theme.spacing.xs,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.sm,
              }}
            >
              <IconSymbol name="phone" size={20} color={theme.colors.success} />
            </View>
            <ThemedText variant="h2">Contacto</ThemedText>
          </ThemedView>

          <ThemedView style={{ gap: theme.spacing.sm }}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={option.action}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.sm,
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: option.color + "20",
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.sm,
                      marginRight: theme.spacing.md,
                    }}
                  >
                    <IconSymbol name={option.icon as any} size={20} color={option.color} />
                  </View>
                  <ThemedView>
                    <ThemedText variant="body" style={{ fontWeight: "600" }}>
                      {option.title}
                    </ThemedText>
                    <ThemedText variant="caption" color="secondary">
                      {option.subtitle}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
                <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Información Adicional */}
        <ThemedCard
          variant="elevated"
          padding="medium"
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
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.full,
                marginRight: theme.spacing.md,
              }}
            >
              <IconSymbol name="lightbulb" size={24} color={theme.colors.info} />
            </View>
            <ThemedView style={{ flex: 1 }}>
              <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
                ¿Necesitas ayuda inmediata?
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ lineHeight: 22, marginBottom: theme.spacing.md }}>
                Nuestro equipo de soporte está aquí para ayudarte. Normalmente respondemos en menos de 24 horas.
              </ThemedText>
              <ThemedButton
                title="Enviar consulta"
                variant="outline"
                icon={<IconSymbol name="envelope" size={16} color={theme.colors.info} />}
                onPress={() => Linking.openURL("mailto:soporte@studyvault.com")}
              />
            </ThemedView>
          </ThemedView>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}
