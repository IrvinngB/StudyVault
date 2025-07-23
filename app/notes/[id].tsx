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
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from "expo-image-picker"
import * as IntentLauncher from 'expo-intent-launcher'
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
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
  const [attachedDocuments, setAttachedDocuments] = useState<{ uri: string, name: string, mimeType: string }[]>([])

  // Estados para resumen de IA
  const [generatingAISummary, setGeneratingAISummary] = useState(false)
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null)

  // Estados para visualización de medios
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)

  // Estados para vista de adjuntos
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false)

  // Efecto para cargar la nota y las materias cuando cambia el ID
  useEffect(() => {
    const loadNoteAndSubjects = async () => {
      setLoading(true)
      setError(null)

      try {
        await classService.getAllClasses()
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
              ai_summary: loadedNote.ai_summary,
            })

            // Cargar archivos adjuntos existentes
            if (loadedNote.attachments) {
              const images = loadedNote.attachments.filter((att) => att.type === "image").map((att) => att.local_path)
              const documents = loadedNote.attachments
                .filter((att) => att.type === "document")
                .map((att) => ({
                  uri: att.local_path,
                  name: att.filename,
                  mimeType: att.filename.endsWith('.pdf') ? 'application/pdf' : 'text/plain'
                }))

              setAttachedImages(images)
              setAttachedDocuments(documents)
            }
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
      ...attachedDocuments.map((doc) => ({
        filename: doc.name,
        type: "document" as const,
        size: 0,
        local_path: doc.uri,
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
        ai_summary: noteForm.ai_summary,
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
      setNoteForm((prev) => ({
        ...prev,
        ai_summary: result.ai_summary,
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
          quality: 0.8,
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
          quality: 0.8,
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
        type: [
          "application/pdf",
          "text/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        setAttachedDocuments((prev) => [...prev, {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || ""
        }])
        showSuccess(`Documento "${asset.name}" adjuntado.`, "Adjunto")
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
      setAttachedDocuments((prev) => prev.filter((item) => item.uri !== uri))
    }
  }

  // Función para ver imagen en pantalla completa
  const viewImage = (uri: string) => {
    setSelectedImageUri(uri)
    setImageModalVisible(true)
  }

  // Función para abrir documento
  const openDocument = async (uri: string, mimeType: string) => {
    try {
      if (Platform.OS === 'android') {
        if (!FileSystem.documentDirectory) {
          throw new Error('Document directory is not available');
        }

        const fileName = uri.split('/').pop();
        if (!fileName) {
          throw new Error('Invalid file URI');
        }

        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({ from: uri, to: fileUri });

        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: mimeType,
        });
      } else {
        Linking.openURL(uri);
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
  }

  // Renderizado de la UI
  if (loading) {
    return (
      <ThemedView variant="background" style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing.lg
      }}>
        <View style={{ alignItems: "center" }}>
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
      <ThemedView variant="background" style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: theme.spacing.lg
      }}>
        <View style={{
          alignItems: "center",
          gap: theme.spacing.md
        }}>
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

  const totalAttachments = attachedImages.length + attachedDocuments.length

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <ThemedText variant="h3" style={{ flex: 1, textAlign: "center" }}>
          {isNewNote ? "Nueva Nota" : noteForm.title || "Detalle de Nota"}
        </ThemedText>
        {!isNewNote && (
          <TouchableOpacity 
            onPress={handleDeleteNote}
            style={{ padding: theme.spacing.sm }}
          >
            <IconSymbol name="trash" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xxl
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Card */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: "center",
              justifyContent: "center",
              marginRight: theme.spacing.md,
              backgroundColor: theme.colors.primary + "20"
            }}>
              <IconSymbol name="note.text" size={32} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="h2" style={{
                fontWeight: "700",
                marginBottom: 4
              }}>
                {isNewNote ? "Nueva Nota" : "Editar Nota"}
              </ThemedText>
              <ThemedText variant="body" color="secondary">
                {isNewNote ? "Crea un nuevo apunte" : `Última actualización: ${noteForm.updated_at}`}
              </ThemedText>
            </View>
            {!isNewNote && (
              <TouchableOpacity
                onPress={() => setNoteForm({ ...noteForm, is_favorite: !noteForm.is_favorite })}
                style={{
                  padding: theme.spacing.sm,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: noteForm.is_favorite ? theme.colors.error + "20" : "transparent"
                }}
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
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.md }}>
          <ThemedInput
            label="Título *"
            value={noteForm.title}
            onChangeText={(text: string) => setNoteForm({ ...noteForm, title: text })}
            placeholder="Escribe el título de tu apunte"
            style={{ marginBottom: theme.spacing.md }}
          />

          {/* Selector de materia moderno */}
          <View style={{
            marginBottom: theme.spacing.md,
            zIndex: 1
          }}>
            <ThemedText variant="h3" style={{ marginBottom: 8, color: theme.colors.primary, fontWeight: "700" }}>
              Materia
            </ThemedText>
            <View
              style={{
                backgroundColor: theme.colors.surfaceLight,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: 4,
                paddingVertical: 2,
                marginBottom: 0,
              }}
            >
              <ClassSelector
                selectedClassId={noteForm.class_id}
                onSelectClass={(cls) => setNoteForm((prev) => ({ ...prev, class_id: cls?.id || "" }))}
                placeholder="Selecciona la materia de la nota"
                required
                style={{ marginBottom: 0, backgroundColor: "transparent", borderWidth: 0 }}
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
            style={{
              marginBottom: theme.spacing.md,
              height: 200,
              textAlignVertical: "top"
            }}
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
            style={{ marginBottom: theme.spacing.md }}
          />
        </ThemedCard>

        {/* AI Summary Section - Mostrar siempre si hay resumen o si se puede generar */}
        {!isNewNote && (
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.md }}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.sm
            }}>
              <IconSymbol name="brain" size={24} color={theme.colors.accent} />
              <ThemedText variant="h3" style={{
                marginLeft: theme.spacing.sm,
                fontWeight: "600"
              }}>
                Resumen con IA
              </ThemedText>
            </View>

            {/* Si ya hay un resumen, mostrarlo */}
            {noteForm.ai_summary ? (
              <View style={{ marginTop: theme.spacing.xs }}>
                <ThemedText variant="body" style={{
                  fontWeight: "600",
                  marginBottom: theme.spacing.xs
                }}>
                  Resumen actual:
                </ThemedText>
                <View
                  style={{
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    marginVertical: theme.spacing.sm,
                    borderLeftWidth: 4,
                    backgroundColor: theme.colors.surfaceLight,
                    borderLeftColor: theme.colors.accent
                  }}
                >
                  {/* Mostrar resumen IA de forma amigable si es un objeto serializado */}
                  {(() => {
                    let summary = noteForm.ai_summary;
                    let parsed: any = null;
                    // Intentar parsear el string como objeto JS
                    try {
                      // Reemplazar comillas simples por dobles para intentar parsear como JSON
                      const jsonStr = summary.replace(/'/g, '"');
                      parsed = JSON.parse(jsonStr);
                    } catch {
                      parsed = null;
                    }
                    if (parsed && typeof parsed === 'object') {
                      return (
                        <View>
                          {parsed.titulo && (
                            <ThemedText variant="h3" style={{ fontWeight: "700", marginBottom: 4 }}>{parsed.titulo}</ThemedText>
                          )}
                          {parsed.puntos_clave && Array.isArray(parsed.puntos_clave) && (
                            <View style={{ marginBottom: 8 }}>
                              <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: 2 }}>Puntos clave:</ThemedText>
                              {parsed.puntos_clave.map((p: string, i: number) => (
                                <ThemedText key={i} variant="body" style={{ marginLeft: 12, marginBottom: 1 }}>• {p}</ThemedText>
                              ))}
                            </View>
                          )}
                          {parsed.resumen && (
                            <View style={{ marginBottom: 8 }}>
                              <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: 2 }}>Resumen:</ThemedText>
                              <ThemedText variant="body">{parsed.resumen}</ThemedText>
                            </View>
                          )}
                          {parsed.conceptos && Array.isArray(parsed.conceptos) && (
                            <View style={{ marginBottom: 4 }}>
                              <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: 2 }}>Conceptos:</ThemedText>
                              <ThemedText variant="body">{parsed.conceptos.join(", ")}</ThemedText>
                            </View>
                          )}
                        </View>
                      );
                    } else {
                      // Si no se puede parsear, mostrar como antes
                      return (
                        <ThemedText variant="body" style={{ lineHeight: 22 }}>
                          {noteForm.ai_summary}
                        </ThemedText>
                      );
                    }
                  })()}
                </View>
                <View style={{
                  flexDirection: "row",
                  gap: theme.spacing.sm,
                  marginTop: theme.spacing.sm
                }}>
                  <ThemedButton
                    title={generatingAISummary ? "Regenerando..." : "Regenerar"}
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
                    style={{ flex: 1 }}
                  />
                  <ThemedButton
                    title="Eliminar"
                    variant="outline"
                    icon={<IconSymbol name="trash" size={18} color={theme.colors.error} />}
                    onPress={() => setNoteForm((prev) => ({ ...prev, ai_summary: undefined }))}
                    style={{ flex: 1, borderColor: theme.colors.error }}
                  />
                </View>
              </View>
            ) : (
              /* Si no hay resumen, mostrar opción para generar */
              <View>
                <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
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
                  style={{ marginBottom: theme.spacing.md }}
                />
              </View>
            )}

            {aiSummaryError && (
              <ThemedText variant="caption" color="error" style={{
                marginTop: theme.spacing.xs,
                marginBottom: theme.spacing.sm
              }}>
                {aiSummaryError}
              </ThemedText>
            )}
          </ThemedCard>
        )}

        {/* Attachments Section */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.xl }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: theme.spacing.md
          }}>
            <IconSymbol name="paperclip" size={24} color={theme.colors.secondary} />
            <ThemedText variant="h3" style={{
              marginLeft: theme.spacing.sm,
              fontWeight: "600",
              flex: 1
            }}>
              Archivos Adjuntos
            </ThemedText>
            {totalAttachments > 0 && (
              <TouchableOpacity
                onPress={() => setShowAttachmentsModal(true)}
                style={{
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 6,
                  borderRadius: theme.borderRadius.sm,
                  backgroundColor: theme.colors.primary + "20"
                }}
              >
                <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                  Ver todos ({totalAttachments})
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          <View style={{
            flexDirection: "row",
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.md
          }}>
            <ThemedButton
              title="Cámara"
              variant="outline"
              icon={<IconSymbol name="camera" size={18} color={theme.colors.primary} />}
              onPress={() => pickImage(true)}
              style={{ flex: 1 }}
            />
            <ThemedButton
              title="Galería"
              variant="outline"
              icon={<IconSymbol name="photo" size={18} color={theme.colors.primary} />}
              onPress={() => pickImage(false)}
              style={{ flex: 1 }}
            />
            <ThemedButton
              title="Documento"
              variant="outline"
              icon={<IconSymbol name="doc" size={18} color={theme.colors.primary} />}
              onPress={pickDocument}
              style={{ flex: 1 }}
            />
          </View>

          {/* Preview de adjuntos */}
          {totalAttachments > 0 && (
            <View style={{ marginTop: theme.spacing.md }}>
              <ThemedText variant="body" style={{
                fontWeight: "600",
                marginBottom: theme.spacing.sm
              }}>
                Vista previa:
              </ThemedText>

              {/* Mostrar solo las primeras 3 imágenes */}
              {attachedImages.length > 0 && (
                <View style={{
                  flexDirection: "row",
                  gap: theme.spacing.xs,
                  marginBottom: theme.spacing.sm
                }}>
                  {attachedImages.slice(0, 3).map((uri, index) => (
                    <TouchableOpacity key={index} onPress={() => viewImage(uri)} style={{ position: "relative" }}>
                      <Image source={{ uri }} style={{
                        width: 60,
                        height: 60,
                        borderRadius: theme.borderRadius.sm,
                        resizeMode: "cover"
                      }} />
                      <TouchableOpacity
                        onPress={() => removeAttachment(uri, "image")}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          backgroundColor: "#ff4444",
                          borderRadius: 10,
                          width: 20,
                          height: 20,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconSymbol name="xmark" size={12} color="white" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                  {attachedImages.length > 3 && (
                    <TouchableOpacity
                      onPress={() => setShowAttachmentsModal(true)}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: theme.borderRadius.sm,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderStyle: "dashed",
                        backgroundColor: theme.colors.surface
                      }}
                    >
                      <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: "600" }}>
                        +{attachedImages.length - 3}
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Mostrar documentos */}
              {attachedDocuments.length > 0 && (
                <View style={{ gap: theme.spacing.xs }}>
                  {attachedDocuments.slice(0, 2).map((doc, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: theme.spacing.xs,
                        borderRadius: theme.borderRadius.sm,
                        gap: theme.spacing.xs,
                        backgroundColor: theme.colors.surface
                      }}
                      onPress={() => openDocument(doc.uri, doc.mimeType)}
                    >
                      <IconSymbol 
                        name={doc.mimeType === "application/pdf" ? "doc.richtext" : "doc.fill"} 
                        size={16} 
                        color={theme.colors.accent} 
                      />
                      <ThemedText variant="caption" style={{
                        flex: 1,
                        fontWeight: "500"
                      }} numberOfLines={1}>
                        {doc.name}
                      </ThemedText>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation()
                          removeAttachment(doc.uri, "document")
                        }}
                        style={{ padding: 4 }}
                      >
                        <IconSymbol name="xmark" size={12} color={theme.colors.error} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                  {attachedDocuments.length > 2 && (
                    <ThemedText variant="caption" color="secondary" style={{
                      textAlign: "center",
                      fontStyle: "italic"
                    }}>
                      y {attachedDocuments.length - 2} más...
                    </ThemedText>
                  )}
                </View>
              )}
            </View>
          )}
        </ThemedCard>

        {/* Save Button */}
        <ThemedButton
          title={isNewNote ? "Crear Apunte" : "Guardar Cambios"}
          variant="primary"
          icon={<IconSymbol name="checkmark" size={18} color="white" />}
          onPress={handleSaveNote}
          style={{ marginBottom: theme.spacing.lg }}
        />
      </ScrollView>

      {/* Modal para ver imagen en pantalla completa */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.9)",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center"
            }}
            onPress={() => setImageModalVisible(false)}
            activeOpacity={1}
          >
            <View style={{
              width: "90%",
              height: "80%",
              position: "relative"
            }}>
              {selectedImageUri && (
                <Image source={{ uri: selectedImageUri }} style={{
                  width: "100%",
                  height: "100%"
                }} resizeMode="contain" />
              )}
              <TouchableOpacity style={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: 20,
                padding: theme.spacing.xs
              }} onPress={() => setImageModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal para ver todos los adjuntos */}
      <Modal
        visible={showAttachmentsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAttachmentsModal(false)}
      >
        <ThemedView variant="background" style={{ flex: 1 }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border
          }}>
            <ThemedText variant="h2" style={{ fontWeight: "700" }}>
              Archivos Adjuntos
            </ThemedText>
            <TouchableOpacity onPress={() => setShowAttachmentsModal(false)} style={{ padding: theme.spacing.xs }}>
              <IconSymbol name="xmark" size={24} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{
            flex: 1,
            paddingHorizontal: theme.spacing.lg
          }}>
            {/* Imágenes */}
            {attachedImages.length > 0 && (
              <View style={{ marginVertical: theme.spacing.lg }}>
                <ThemedText variant="h3" style={{
                  fontWeight: "600",
                  marginBottom: theme.spacing.md
                }}>
                  Imágenes ({attachedImages.length})
                </ThemedText>
                <View style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.sm
                }}>
                  {attachedImages.map((uri, index) => (
                    <View key={index} style={{
                      position: "relative",
                      width: 100,
                      height: 100
                    }}>
                      <TouchableOpacity onPress={() => viewImage(uri)} activeOpacity={0.8}>
                        <Image source={{ uri }} style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: theme.borderRadius.sm,
                          resizeMode: "cover"
                        }} />
                        <View style={{
                          position: "absolute",
                          bottom: 4,
                          right: 4,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          borderRadius: theme.borderRadius.sm,
                          padding: 4
                        }}>
                          <IconSymbol name="eye" size={16} color="white" />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeAttachment(uri, "image")} style={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "#ff4444",
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <IconSymbol name="trash" size={14} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Documentos */}
            {attachedDocuments.length > 0 && (
              <View style={{ marginVertical: theme.spacing.lg }}>
                <ThemedText variant="h3" style={{
                  fontWeight: "600",
                  marginBottom: theme.spacing.md
                }}>
                  Documentos ({attachedDocuments.length})
                </ThemedText>
                {attachedDocuments.map((doc, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: theme.spacing.md,
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.xs,
                      backgroundColor: theme.colors.surface
                    }}
                    onPress={() => openDocument(doc.uri, doc.mimeType)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol 
                      name={doc.mimeType === "application/pdf" ? "doc.richtext" : "doc.fill"} 
                      size={24} 
                      color={theme.colors.accent} 
                    />
                    <View style={{
                      flex: 1,
                      marginLeft: theme.spacing.sm
                    }}>
                      <ThemedText variant="body" style={{ fontWeight: "500" }}>
                        {doc.name}
                      </ThemedText>
                      <ThemedText variant="caption" color="secondary">
                        Toca para abrir
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation()
                        removeAttachment(doc.uri, "document")
                      }}
                      style={{ padding: theme.spacing.xs }}
                    >
                      <IconSymbol name="trash" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {totalAttachments === 0 && (
              <View style={{
                alignItems: "center",
                paddingVertical: 60,
                paddingHorizontal: theme.spacing.lg
              }}>
                <IconSymbol name="paperclip" size={48} color={theme.colors.textMuted} />
                <ThemedText variant="h3" style={{
                  textAlign: "center",
                  marginTop: theme.spacing.md,
                  marginBottom: theme.spacing.xs,
                  fontWeight: "600"
                }}>
                  Sin archivos adjuntos
                </ThemedText>
                <ThemedText variant="body" color="secondary" style={{
                  textAlign: "center",
                  lineHeight: 20
                }}>
                  Usa los botones de arriba para agregar imágenes o documentos
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>

      <AppModal {...modalProps} />
    </ThemedView>
  )
}

