"use client"

import { ClassSelector } from "@/components/calendar/ClassSelector"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { ClassData } from "@/database/services/courseService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useTheme } from "@/hooks/useTheme"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

export default function CreateNoteScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { showError, showSuccess } = useModal()
  const { createNote, loading } = useNotes()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)

  const handleCreateNote = async () => {
    if (!title.trim()) {
      showError("El título es requerido")
      return
    }

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
        class_id: selectedClass?.id,
        is_favorite: false,
      }

      const success = await createNote(noteData)
      
      if (success) {
        showSuccess("Nota creada exitosamente")
        router.back()
      } else {
        showError("No se pudo crear la nota")
      }
    } catch (error: any) {
      console.error("Error creando nota:", error)
      showError(`Error al crear la nota: ${error.message || "Error desconocido"}`)
    }
  }

  const handleAddAttachment = () => {
    Alert.alert(
      "Próximamente",
      "La funcionalidad de adjuntos estará disponible en una próxima versión",
      [{ text: "OK" }]
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView variant="background" style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText variant="h2" style={styles.headerTitle}>
                Nueva Nota
              </ThemedText>
              <ThemedText variant="body" color="secondary">
                Crea un nuevo apunte
              </ThemedText>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Información principal */}
          <ThemedCard variant="elevated" padding="large" style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="doc.text" size={20} color={theme.colors.primary} />
              <ThemedText variant="h3" style={styles.sectionTitle}>
                Nueva Nota
              </ThemedText>
            </View>
            <ThemedText variant="body" color="secondary" style={styles.sectionDescription}>
              Crea un nuevo apunte
            </ThemedText>

            {/* Título */}
            <View style={styles.inputGroup}>
              <ThemedText variant="body" style={styles.label}>
                Título *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceLight,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Escribe el título de tu apunte"
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
                multiline={false}
              />
            </View>

            {/* Selector de materia */}
            <View style={styles.inputGroup}>
              <ThemedText variant="body" style={styles.label}>
                Materia
              </ThemedText>
              <ClassSelector
                selectedClassId={selectedClass?.id}
                onSelectClass={setSelectedClass}
                placeholder="Selecciona la materia de la nota"
                required={false}
              />
            </View>

            {/* Etiquetas */}
            <View style={styles.inputGroup}>
              <ThemedText variant="body" style={styles.label}>
                Etiquetas (separadas por comas)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceLight,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Ej: Álgebra, Examen, Cuántica"
                placeholderTextColor={theme.colors.textMuted}
                value={tags}
                onChangeText={setTags}
                multiline={false}
              />
            </View>

            {/* Contenido */}
            <View style={styles.inputGroup}>
              <ThemedText variant="body" style={styles.label}>
                Contenido
              </ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.surfaceLight,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Escribe el contenido de tu nota aquí..."
                placeholderTextColor={theme.colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline={true}
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          </ThemedCard>

          {/* Archivos Adjuntos */}
          <ThemedCard variant="elevated" padding="large" style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="paperclip" size={20} color={theme.colors.success} />
              <ThemedText variant="h3" style={styles.sectionTitle}>
                Archivos Adjuntos
              </ThemedText>
            </View>

            <View style={styles.attachmentButtons}>
              <TouchableOpacity
                onPress={handleAddAttachment}
                style={[styles.attachmentButton, { borderColor: theme.colors.primary }]}
              >
                <IconSymbol name="camera" size={24} color={theme.colors.primary} />
                <ThemedText variant="body" style={[styles.attachmentText, { color: theme.colors.primary }]}>
                  Cámara
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddAttachment}
                style={[styles.attachmentButton, { borderColor: theme.colors.info }]}
              >
                <IconSymbol name="folder" size={24} color={theme.colors.info} />
                <ThemedText variant="body" style={[styles.attachmentText, { color: theme.colors.info }]}>
                  Documentos
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddAttachment}
                style={[styles.attachmentButton, { borderColor: theme.colors.warning }]}
              >
                <IconSymbol name="lightbulb" size={24} color={theme.colors.warning} />
                <ThemedText variant="body" style={[styles.attachmentText, { color: theme.colors.warning }]}>
                  Ideas
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedCard>
        </ScrollView>

        {/* Footer con botones */}
        <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
          <ThemedButton
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
            style={styles.footerButton}
          />
          <ThemedButton
            title={loading ? "Creando..." : "Crear Nota"}
            variant="primary"
            onPress={handleCreateNote}
            disabled={loading || !title.trim()}
            icon={
              loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <IconSymbol name="checkmark" size={18} color="white" />
              )
            }
            style={[styles.footerButton, { flex: 2 }]}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    marginLeft: 8,
    fontWeight: "600",
  },
  sectionDescription: {
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
  },
  attachmentButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  attachmentButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: "dashed",
  },
  attachmentText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  footerButton: {
    flex: 1,
  },
})
