"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useModal } from "@/hooks/modals"
import { useTheme } from "@/hooks/useTheme"
import { useRouter } from "expo-router"
import { StyleSheet, View } from "react-native"

interface CreateNoteFormProps {
  onCreateNote?: () => void
}

export default function CreateNoteForm({ onCreateNote }: CreateNoteFormProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const { showSuccess } = useModal()

  const handleCreateNote = () => {
    router.push({
      pathname: "/notes/[id]",
      params: { id: "new" },
    })
    
    if (onCreateNote) {
      onCreateNote()
    }
  }

  return (
    <ThemedView variant="background" style={styles.container}>
      {/* Header del formulario */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary + "20" }]}>
              <IconSymbol name="plus.circle" size={28} color={theme.colors.primary} />
            </View>
            <View>
              <ThemedText variant="h1" style={styles.headerTitle}>
                Nueva Nota
              </ThemedText>
              <ThemedText variant="body" color="secondary">
                Crea un nuevo apunte
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Contenido del formulario */}
      <View style={styles.content}>
        <View style={[styles.createCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.createIcon, { backgroundColor: theme.colors.primary + "10" }]}>
            <IconSymbol name="note.text" size={48} color={theme.colors.primary} />
          </View>
          
          <ThemedText variant="h2" style={styles.createTitle}>
            ¡Comienza tu primera nota!
          </ThemedText>
          
          <ThemedText variant="body" color="secondary" style={styles.createDescription}>
            Organiza tus ideas, apuntes de clase y conocimientos importantes en un solo lugar.
          </ThemedText>

          <View style={styles.features}>
            <View style={styles.feature}>
              <IconSymbol name="checkmark.circle" size={20} color={theme.colors.success} />
              <ThemedText variant="body" style={styles.featureText}>
                Editor de texto enriquecido
              </ThemedText>
            </View>
            
            <View style={styles.feature}>
              <IconSymbol name="checkmark.circle" size={20} color={theme.colors.success} />
              <ThemedText variant="body" style={styles.featureText}>
                Organización por materias
              </ThemedText>
            </View>
            
            <View style={styles.feature}>
              <IconSymbol name="checkmark.circle" size={20} color={theme.colors.success} />
              <ThemedText variant="body" style={styles.featureText}>
                Sistema de favoritos
              </ThemedText>
            </View>
          </View>

          <ThemedButton
            title="Crear mi primera nota"
            variant="primary"
            icon={<IconSymbol name="plus" size={18} color="white" />}
            onPress={handleCreateNote}
            style={styles.createButton}
          />
        </View>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  createCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  createTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "700",
  },
  createDescription: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  features: {
    alignSelf: "stretch",
    marginBottom: 32,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
    fontWeight: "500",
  },
  createButton: {
    alignSelf: "stretch",
    paddingVertical: 16,
  },
})