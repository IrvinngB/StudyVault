"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { useState } from "react"
import { Linking, ScrollView, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

interface FAQItem {
  question: string
  answer: string
  icon: string
}

interface ContactMethod {
  name: string
  description: string
  icon: string
  action: () => void
  color: string
}

export default function HelpScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqItems: FAQItem[] = [
    {
      question: "¿Cómo crear una tarea automáticamente?",
      answer: "Al crear un evento en el calendario que no sea de tipo 'clase' y seleccionar una materia, se creará automáticamente una tarea vinculada. La tarea aparecerá en la pantalla de calificaciones para que puedas agregar tu nota.",
      icon: "plus.circle"
    },
    {
      question: "¿Cómo funciona el sistema de rachas?",
      answer: "El sistema de rachas cuenta los días consecutivos en los que completas al menos una tarea. Mantén tu racha activa completando tareas diariamente para desbloquear logros y mantener tu motivación.",
      icon: "flame"
    },
    {
      question: "¿Puedo cambiar mi avatar?",
      answer: "Sí, ve a Configuración > Perfil y toca en tu avatar actual. Se abrirá un selector con diferentes opciones de avatares para personalizar tu perfil.",
      icon: "person.circle"
    },
    {
      question: "¿Cómo agregar una nueva materia?",
      answer: "Ve a la pantalla de Materias y toca el botón '+ Agregar'. Completa el nombre de la materia y guarda. Luego podrás crear categorías y calificaciones para esa materia.",
      icon: "plus.square"
    },
    {
      question: "¿Cómo funcionan las notificaciones?",
      answer: "Las notificaciones se configuran al crear eventos en el calendario. Puedes establecer recordatorios de 5 minutos hasta 1 día antes del evento. Las notificaciones aparecerán en tu dispositivo.",
      icon: "bell"
    },
    {
      question: "¿Puedo exportar mis datos?",
      answer: "Actualmente no hay función de exportación, pero estamos trabajando en implementar esta funcionalidad para que puedas respaldar tus datos.",
      icon: "square.and.arrow.up"
    }
  ]

  const contactMethods: ContactMethod[] = [
    {
      name: "Email de Soporte",
      description: "Envía un email directo al equipo de desarrollo",
      icon: "envelope",
      color: theme.colors.primary,
      action: () => Linking.openURL("mailto:soporte@studyvault.app?subject=Soporte StudyVault")
    },
    {
      name: "GitHub Issues",
      description: "Reporta bugs o solicita nuevas funciones",
      icon: "exclamationmark.triangle",
      color: theme.colors.warning,
      action: () => Linking.openURL("https://github.com/studyvault-app/issues")
    },
    {
      name: "Documentación",
      description: "Accede a la documentación completa",
      icon: "book",
      color: theme.colors.info,
      action: () => Linking.openURL("https://docs.studyvault.app")
    }
  ]

  const quickGuides = [
    {
      title: "Primeros Pasos",
      description: "Configura tu perfil y agrega tus primeras materias",
      icon: "star",
      action: () => router.push("/settings")
    },
    {
      title: "Crear Eventos",
      description: "Aprende a crear eventos y tareas automáticas",
      icon: "calendar.plus",
      action: () => router.push("/calendar")
    },
    {
      title: "Gestionar Calificaciones",
      description: "Organiza tus calificaciones por categorías",
      icon: "chart.bar",
      action: () => router.push("/grades" as any)
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
              backgroundColor: theme.colors.info + "20",
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.full,
              marginRight: theme.spacing.sm,
            }}
          >
            <IconSymbol name="questionmark.circle" size={24} color={theme.colors.info} />
          </View>
          <ThemedText variant="h1" style={{ fontSize: 28, fontWeight: "800" }}>
            Ayuda y Soporte
          </ThemedText>
        </ThemedView>

        {/* Quick Guides */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="star" size={24} color={theme.colors.primary} />
            <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
              Guías Rápidas
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ gap: theme.spacing.md }}>
            {quickGuides.map((guide, index) => (
              <TouchableOpacity
                key={index}
                onPress={guide.action}
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
                  <IconSymbol name={guide.icon as any} size={20} color={theme.colors.primary} />
                </View>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                    {guide.title}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {guide.description}
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* FAQ Section */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="questionmark.circle" size={24} color={theme.colors.primary} />
            <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
              Preguntas Frecuentes
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            {faqItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                style={{
                  backgroundColor: theme.colors.surface,
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <ThemedView style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <View
                    style={{
                      backgroundColor: theme.colors.primary + "20",
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.full,
                      marginRight: theme.spacing.md,
                      marginTop: 2,
                    }}
                  >
                    <IconSymbol name={item.icon as any} size={16} color={theme.colors.primary} />
                  </View>
                  <ThemedView style={{ flex: 1 }}>
                    <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 8 }}>
                      {item.question}
                    </ThemedText>
                    {expandedFAQ === index && (
                      <ThemedText variant="body" color="secondary" style={{ lineHeight: 20 }}>
                        {item.answer}
                      </ThemedText>
                    )}
                  </ThemedView>
                  <IconSymbol 
                    name={expandedFAQ === index ? "chevron.up" : "chevron.down"} 
                    size={16} 
                    color={theme.colors.textMuted} 
                    style={{ marginTop: 2 }}
                  />
                </ThemedView>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Contact Section */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
            <IconSymbol name="envelope" size={24} color={theme.colors.primary} />
            <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, fontWeight: "700" }}>
              Contacto y Soporte
            </ThemedText>
          </ThemedView>
          
          <ThemedView style={{ gap: theme.spacing.md }}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                onPress={method.action}
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
                    backgroundColor: method.color + "20",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.full,
                    marginRight: theme.spacing.md,
                  }}
                >
                  <IconSymbol name={method.icon as any} size={20} color={method.color} />
                </View>
                <ThemedView style={{ flex: 1 }}>
                  <ThemedText variant="button" style={{ fontWeight: "600", marginBottom: 4 }}>
                    {method.name}
                  </ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {method.description}
                  </ThemedText>
                </ThemedView>
                <IconSymbol name="arrow.up.right" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* App Info */}
        <ThemedCard variant="outlined" padding="medium">
          <ThemedView style={{ alignItems: "center" }}>
            <ThemedText variant="h3" style={{ fontWeight: "700", marginBottom: theme.spacing.sm }}>
              StudyVault
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ textAlign: "center", marginBottom: theme.spacing.sm }}>
              Versión 1.0.0
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ textAlign: "center" }}>
              Desarrollado con ❤️ por el equipo de StudyVault
            </ThemedText>
          </ThemedView>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  )
}
