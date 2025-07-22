"use client"

import { ClassSelector } from "@/components/calendar/ClassSelector"
import { AppModal } from "@/components/ui/AppModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedInput, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { classService } from "@/database/services/courseService"
import {
    type AttachmentData,
    type CreateNoteRequest,
    type NoteData,
    notesService,
    type UpdateNoteRequest,
} from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useTheme } from "@/hooks/useTheme"
import * as DocumentPicker from "expo-document-picker"
import * as ImagePicker from "expo-image-picker"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native"

export default function NoteDetailScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { modalProps, showError, showSuccess, showConfirm } = useModal()

  // Estados para el formulario de la nota
  const [noteForm, setNoteForm] = useState<NoteData>({
    id: "",
    title: "",
    class_id: "",
    content: "",
    tags: [],
    updated_at: "",
    is_favorite: false,
    local_files_path: "",
    attachments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isNewNote, setIsNewNote] = useState(false)

  // Estados para adjuntos
  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const [attachedDocuments, setAttachedDocuments] = useState<string[]>([])

  // Estados para resumen de IA
  const [generatingAISummary, setGeneratingAISummary] = useState(false)
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null)

  // Estados para visualización de medios
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)

  // (Estados de autocompletado de materia eliminados, ahora se usa ClassSelector)

  // Efecto para cargar la nota y las materias cuando cambia el ID
  useEffect(() => {
    const loadNoteAndSubjects = async () => {
      setLoading(true)
      setError(null)

      // Cargar las materias disponibles PRIMERO
      // (Variable de autocompletado eliminada)
      // (Variable de autocompletado eliminada)
      try {
        await classService.getAllClasses()
        // (Lógica de autocompletado eliminada, solo se carga la nota)
      } catch (err: any) {
        console.error("Error al cargar las clases para sugerencias:", err)
      }

      // Lógica para cargar la nota (existente o nueva)
      if (id === "new") {
        setIsNewNote(true)
        setNoteForm({
          id: "",
          title: "",
          class_id: "",
          content: "",
          tags: [],
          updated_at: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }),
          is_favorite: false,
          local_files_path: "",
          attachments: [],
        })
        // (Lógica de autocompletado eliminada)
      } else if (typeof id === "string") {
        setIsNewNote(false)
        try {
          const loadedNote = await notesService.getNoteById(id)
          if (loadedNote) {
            setNoteForm({
              id: loadedNote.id,
              title: loadedNote.title,
              class_id: loadedNote.class_id || "",
              content: loadedNote.content,
              tags: loadedNote.tags || [],
              updated_at: loadedNote.updated_at || "",
              is_favorite: loadedNote.is_favorite || false,
              local_files_path: loadedNote.local_files_path || "",
              attachments: loadedNote.attachments || [],
              user_id: loadedNote.user_id,
            })
            // Establecer el nombre de la materia en el input
            // (Variable de autocompletado eliminada)
            // (Lógica de autocompletado eliminada)
          } else {
            setError("Nota no encontrada.")
          }
        } catch (err: any) {
          console.error("Error al cargar la nota:", err)
          setError(`Error al cargar la nota: ${err.message || "Error desconocido"}`)
        }
      } else {
        setError("ID de nota inválido.")
      }
      setLoading(false)
    }
    loadNoteAndSubjects()
  }, [id])

  // Manejador para guardar la nota
  const handleSaveNote = async () => {
    if (!noteForm.title.trim()) {
      Alert.alert("Error", "El título es requerido")
      return
    }

    const attachmentsToSave: AttachmentData[] = [
      ...attachedImages.map((uri) => ({
        filename: uri.substring(uri.lastIndexOf("/") + 1),
        type: "image" as const,
        size: 0,
        local_path: uri,
      })),
      ...attachedDocuments.map((uri) => ({
        filename: uri.substring(uri.lastIndexOf("/") + 1),
        type: "document" as const,
        size: 0,
        local_path: uri,
      })),
    ]

    try {
      setLoading(true)
      const dataToSave: CreateNoteRequest = {
        class_id: noteForm.class_id,
        title: noteForm.title,
        content: noteForm.content,
        tags: noteForm.tags,
        is_favorite: noteForm.is_favorite,
        local_files_path: "StudyFiles",
        attachments: attachmentsToSave,
      }

      if (isNewNote) {
        const createdNote = await notesService.createNote(dataToSave)
        showSuccess("Nota creada exitosamente!", "Éxito")
        router.replace(`/notes/${createdNote.id}`)
      } else {
        const updateRequest: UpdateNoteRequest = {
          id: noteForm.id!,
          ...dataToSave,
        }
        await notesService.updateNote(updateRequest)
        showSuccess("Nota actualizada exitosamente!", "Éxito")
        router.back()
      }
    } catch (e: any) {
      console.error("Error al guardar la nota:", e)
      showError(`Hubo un error al guardar la nota: ${e.message || "Error desconocido"}`, "Error")
    } finally {
      setLoading(false)
    }
  }

  // Manejador para eliminar la nota
  const handleDeleteNote = () => {
    showConfirm(
      `¿Estás seguro de que quieres eliminar "${noteForm.title}"?`,
      async () => {
        try {
          setLoading(true)
          await notesService.deleteNote(noteForm.id!)
          showSuccess("Nota eliminada correctamente.", "Eliminado", () => router.back())
        } catch (e: any) {
          console.error("Error al eliminar la nota:", e)
          showError(`No se pudo eliminar la nota: ${e.message || "Error desconocido"}`, "Error")
        } finally {
          setLoading(false)
        }
      },
      undefined,
      "Eliminar Nota",
    )
  }

  // Manejador para generar resumen de IA
  const handleGenerateAISummary = async () => {
    if (!noteForm.id || isNewNote) {
      showError("Debes guardar la nota antes de generar un resumen con IA.", "Error")
      return
    }

    if (!noteForm.content.trim()) {
      showError("La nota debe tener contenido para generar un resumen.", "Error")
      return
    }

    try {
      setGeneratingAISummary(true)
      setAiSummaryError(null)
      
      const result = await notesService.generateAISummary(noteForm.id)
      
      // Actualizar el formulario con el resumen generado
      setNoteForm(prev => ({
        ...prev,
        ai_summary: result.ai_summary
      }))
      
      showSuccess("Resumen de IA generado exitosamente.", "¡Resumen Listo!")
      
    } catch (error: any) {
      console.error("Error al generar resumen de IA:", error)
      const errorMessage = error.message || "Error desconocido al generar el resumen"
      setAiSummaryError(errorMessage)
      showError(`No se pudo generar el resumen: ${errorMessage}`, "Error de IA")
    } finally {
      setGeneratingAISummary(false)
    }
  }

  // Funciones para adjuntos
  const pickImage = async (fromCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult
    try {
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== "granted") {
          showError("Se necesita permiso para acceder a la cámara.", "Permiso Denegado")
          return
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        })
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
          showError("Se necesita permiso para acceder a la galería.", "Permiso Denegado")
          return
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        })
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const assets = result.assets
        setAttachedImages((prev) => [...prev, assets[0].uri])
        showSuccess("Imagen adjuntada correctamente", "Éxito")
      }
    } catch (err) {
      console.error("Error al seleccionar imagen:", err)
      showError("Error al seleccionar la imagen.", "Error")
    }
  }

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachedDocuments((prev) => [...prev, result.assets[0].uri])
        showSuccess(`Documento "${result.assets[0].name}" adjuntado.`, "Adjunto")
      }
    } catch (err: any) {
      console.error("Error al seleccionar documento:", err)
      showError("Error al seleccionar el documento.", "Error")
    }
  }

  const removeAttachment = (uri: string, type: "image" | "document") => {
    if (type === "image") {
      setAttachedImages((prev) => prev.filter((item) => item !== uri))
    } else {
      setAttachedDocuments((prev) => prev.filter((item) => item !== uri))
    }
  }

  // Función para ver imagen en pantalla completa
  const viewImage = (uri: string) => {
    setSelectedImageUri(uri)
    setImageModalVisible(true)
  }

  // Función para abrir documento
  const openDocument = async (uri: string) => {
    try {
      // En una implementación real, podrías usar una librería como react-native-file-viewer
      Alert.alert(
        "Abrir Documento",
        `¿Deseas abrir el documento ${uri.substring(uri.lastIndexOf("/") + 1)}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Abrir", 
            onPress: () => {
              // Aquí iría la lógica para abrir el documento
              showSuccess("Abriendo documento...", "Info")
            }
          }
        ]
      )
    } catch {
      showError("No se pudo abrir el documento", "Error")
    }
  }

  // Renderizado de la UI
  if (loading) {
    return (
      <ThemedView variant="background" style={styles.centeredContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
            {isNewNote ? "Preparando nueva nota..." : "Cargando nota..."}
          </ThemedText>
        </View>
      </ThemedView>
    )
  }

  if (error) {
    return (
      <ThemedView variant="background" style={styles.centeredContainer}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={theme.colors.error} />
          <ThemedText
            variant="h3"
            style={{ color: theme.colors.error, marginBottom: theme.spacing.sm, textAlign: "center" }}
          >
            {error}
          </ThemedText>
          <ThemedButton title="Volver" variant="outline" onPress={() => router.back()} />
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: isNewNote ? "Nueva Nota" : noteForm.title || "Detalle de Nota",
          headerRight: () =>
            !isNewNote ? (
              <ThemedButton
                title="Eliminar"
                variant="error"
                onPress={handleDeleteNote}
                style={{ marginLeft: theme.spacing.md }}
              />
            ) : null,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Card */}
        <ThemedCard variant="elevated" padding="large" style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={[styles.noteIcon, { backgroundColor: theme.colors.primary + "20" }]}>
              <IconSymbol name="note.text" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.headerText}>
              <ThemedText variant="h2" style={styles.headerTitle}>
                {isNewNote ? "Nueva Nota" : "Editar Nota"}
              </ThemedText>
              <ThemedText variant="body" color="secondary">
                {isNewNote ? "Crea un nuevo apunte" : `Última actualización: ${noteForm.updated_at}`}
              </ThemedText>
            </View>
            {!isNewNote && (
              <TouchableOpacity
                onPress={() => setNoteForm({ ...noteForm, is_favorite: !noteForm.is_favorite })}
                style={[styles.favoriteButton, noteForm.is_favorite && { backgroundColor: theme.colors.error + "20" }]}
              >
                <IconSymbol
                  name={noteForm.is_favorite ? "heart.fill" : "heart"}
                  size={24}
                  color={noteForm.is_favorite ? theme.colors.error : theme.colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </ThemedCard>

        {/* Form Fields */}
        <ThemedCard variant="elevated" padding="large" style={styles.formCard}>
          <ThemedInput
            label="Título *"
            value={noteForm.title}
            onChangeText={(text: string) => setNoteForm({ ...noteForm, title: text })}
            placeholder="Escribe el título de tu apunte"
            style={styles.input}
          />

          {/* Selector de materia moderno */}
          <View style={styles.subjectContainer}>
            <ThemedText variant="h3" style={{ marginBottom: 8, color: theme.colors.primary, fontWeight: "700" }}>
              Materia
            </ThemedText>
            <View style={{
              backgroundColor: theme.colors.surfaceLight,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: 4,
              paddingVertical: 2,
              marginBottom: 0,
            }}>
              <ClassSelector
                selectedClassId={noteForm.class_id}
                onSelectClass={(cls) => setNoteForm((prev) => ({ ...prev, class_id: cls?.id || "" }))}
                placeholder="Selecciona la materia de la nota"
                required
                style={{ marginBottom: 0, backgroundColor: 'transparent', borderWidth: 0 }}
              />
            </View>
          </View>

          <ThemedInput
            label="Contenido *"
            value={noteForm.content}
            onChangeText={(text: string) => setNoteForm({ ...noteForm, content: text })}
            placeholder="Escribe el contenido de tu apunte aquí..."
            multiline
            numberOfLines={12}
            style={[styles.input, styles.contentInput]}
          />

          <ThemedInput
            label="Etiquetas (separadas por comas)"
            value={noteForm.tags?.join(", ") || ""}
            onChangeText={(text: string) =>
              setNoteForm({
                ...noteForm,
                tags: text
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0),
              })
            }
            placeholder="Ej: Álgebra, Examen, Cuántica"
            style={styles.input}
          />
        </ThemedCard>

        {/* Attachments Section */}
        <ThemedCard variant="elevated" padding="large" style={styles.attachmentsCard}>
          <View style={styles.attachmentsHeader}>
            <IconSymbol name="paperclip" size={24} color={theme.colors.secondary} />
            <ThemedText variant="h3" style={styles.attachmentsTitle}>
              Archivos Adjuntos
            </ThemedText>
          </View>

          <View style={styles.attachmentButtons}>
            <ThemedButton
              title="Cámara"
              variant="outline"
              icon={<IconSymbol name="camera" size={18} color={theme.colors.primary} />}
              onPress={() => pickImage(true)}
              style={styles.attachmentButton}
            />
            <ThemedButton
              title="Galería"
              variant="outline"
              icon={<IconSymbol name="photo" size={18} color={theme.colors.primary} />}
              onPress={() => pickImage(false)}
              style={styles.attachmentButton}
            />
            <ThemedButton
              title="Documento"
              variant="outline"
              icon={<IconSymbol name="doc" size={18} color={theme.colors.primary} />}
              onPress={pickDocument}
              style={styles.attachmentButton}
            />
          </View>

          {/* Mostrar imágenes adjuntas */}
          {attachedImages.length > 0 && (
            <View style={styles.attachedSection}>
              <ThemedText variant="body" style={styles.attachedLabel}>
                Imágenes ({attachedImages.length})
              </ThemedText>
              <View style={styles.imagesGrid}>
                {attachedImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => viewImage(uri)} activeOpacity={0.8}>
                      <Image source={{ uri }} style={styles.attachedImage} />
                      <View style={styles.imageOverlay}>
                        <IconSymbol name="eye" size={16} color="white" />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeAttachment(uri, "image")} style={styles.removeButton}>
                      <IconSymbol name="xmark" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Mostrar documentos adjuntos */}
          {attachedDocuments.length > 0 && (
            <View style={styles.attachedSection}>
              <ThemedText variant="body" style={styles.attachedLabel}>
                Documentos ({attachedDocuments.length})
              </ThemedText>
              {attachedDocuments.map((uri, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.documentItem}
                  onPress={() => openDocument(uri)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="doc.fill" size={20} color={theme.colors.accent} />
                  <ThemedText variant="body" style={styles.documentName}>
                    {uri.substring(uri.lastIndexOf("/") + 1)}
                  </ThemedText>
                  <IconSymbol name="eye" size={16} color={theme.colors.primary} />
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation()
                      removeAttachment(uri, "document")
                    }} 
                    style={styles.removeDocButton}
                  >
                    <IconSymbol name="trash" size={16} color={theme.colors.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ThemedCard>

        {/* AI Summary Section - Solo mostrar si hay resumen o si se puede generar */}
        {!isNewNote && (noteForm.ai_summary || noteForm.content.trim()) && (
          <ThemedCard variant="elevated" padding="large" style={styles.formCard}>
            <View style={styles.aiSummaryHeader}>
              <IconSymbol name="brain" size={24} color={theme.colors.accent} />
              <ThemedText variant="h3" style={styles.aiSummaryTitle}>
                Resumen con IA
              </ThemedText>
            </View>
            
            {/* Si ya hay un resumen, mostrarlo primero */}
            {noteForm.ai_summary ? (
              <View style={styles.summaryContent}>
                <ThemedText variant="body" style={styles.summaryLabel}>
                  Resumen generado:
                </ThemedText>
                <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surfaceLight }]}>
                  <ThemedText variant="body" style={styles.summaryText}>
                    {noteForm.ai_summary}
                  </ThemedText>
                </View>
                <ThemedButton
                  title={generatingAISummary ? "Regenerando..." : "Regenerar Resumen"}
                  variant="outline"
                  icon={
                    generatingAISummary ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <IconSymbol name="arrow.clockwise" size={18} color={theme.colors.primary} />
                    )
                  }
                  onPress={handleGenerateAISummary}
                  disabled={generatingAISummary || !noteForm.content.trim()}
                  style={styles.regenerateSummaryButton}
                />
              </View>
            ) : (
              /* Si no hay resumen, mostrar opción para generar */
              <View>
                <ThemedText variant="body" color="secondary" style={styles.aiSummaryDescription}>
                  Genera un resumen automático de tu nota usando inteligencia artificial
                </ThemedText>
                <ThemedButton
                  title={generatingAISummary ? "Generando..." : "Generar Resumen"}
                  variant="outline"
                  icon={
                    generatingAISummary ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                    ) : (
                      <IconSymbol name="sparkles" size={18} color={theme.colors.primary} />
                    )
                  }
                  onPress={handleGenerateAISummary}
                  disabled={generatingAISummary || !noteForm.content.trim()}
                  style={styles.generateSummaryButton}
                />
              </View>
            )}

            {aiSummaryError && (
              <ThemedText variant="caption" color="error" style={styles.errorText}>
                {aiSummaryError}
              </ThemedText>
            )}
          </ThemedCard>
        )}

        {/* Save Button */}
        <ThemedButton
          title={isNewNote ? "Crear Apunte" : "Guardar Cambios"}
          variant="primary"
          icon={<IconSymbol name="checkmark" size={18} color="white" />}
          onPress={handleSaveNote}
          style={styles.saveButton}
        />
      </ScrollView>
      
      {/* Modal para ver imagen en pantalla completa */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity 
            style={styles.imageModalBackground}
            onPress={() => setImageModalVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.imageModalContent}>
              {selectedImageUri && (
                <Image 
                  source={{ uri: selectedImageUri }} 
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                style={styles.closeImageButton}
                onPress={() => setImageModalVisible(false)}
              >
                <IconSymbol name="xmark" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
      
      <AppModal {...modalProps} />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  favoriteButton: {
    padding: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  formCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  subjectContainer: {
    marginBottom: 16,
    zIndex: 1,
  },
  suggestionsCard: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    maxHeight: 150,
    zIndex: 10,
    padding: 0,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    marginLeft: 12,
  },
  contentInput: {
    height: 200,
    textAlignVertical: "top",
  },
  attachmentsCard: {
    marginBottom: 24,
  },
  attachmentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  attachmentsTitle: {
    marginLeft: 12,
    fontWeight: "600",
  },
  attachmentButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  attachmentButton: {
    flex: 1,
  },
  attachedSection: {
    marginTop: 16,
  },
  attachedLabel: {
    fontWeight: "600",
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageContainer: {
    position: "relative",
  },
  attachedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    marginLeft: 12,
  },
  removeDocButton: {
    padding: 8,
  },
  saveButton: {
    marginBottom: 20,
  },
  // Estilos para resumen de IA
  aiSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiSummaryTitle: {
    marginLeft: 12,
    fontWeight: "600",
  },
  aiSummaryDescription: {
    marginBottom: 16,
  },
  generateSummaryButton: {
    marginBottom: 16,
  },
  regenerateSummaryButton: {
    marginTop: 12,
  },
  summaryContainer: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  errorText: {
    marginTop: 8,
    marginBottom: 12,
  },
  summaryContent: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryLabel: {
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryText: {
    lineHeight: 22,
  },
  // Estilos para el modal de imagen
  imageOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: '90%',
    height: '80%',
    position: 'relative',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeImageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
})
