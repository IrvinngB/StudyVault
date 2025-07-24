"use client"


import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { classService } from "@/database/services/courseService"
import { notesService, type NoteData } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useCommonStyles, useTheme } from "@/hooks/useTheme"
import * as FileSystem from 'expo-file-system'
import * as IntentLauncher from 'expo-intent-launcher'
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Image, Linking, Modal, Platform, ScrollView, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function NoteViewScreen() {
  const { theme } = useTheme()
  const commonStyles = useCommonStyles()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showError, showSuccess, showConfirm } = useModal()

  const [note, setNote] = useState<NoteData | null>(null)
  const [className, setClassName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)

  useEffect(() => {
    const loadNote = async () => {
      if (!id) {
        showError("ID de nota no válido", "Error")
        router.back()
        return
      }

      try {
        setLoading(true)
        const loadedNote = await notesService.getNoteById(id as string)
        setNote(loadedNote)

        // Cargar nombre de la clase si existe
        if (loadedNote.class_id) {
          try {
            const classData = await classService.getClassById(loadedNote.class_id)
            setClassName(classData?.name || "Sin materia")
          } catch {
            setClassName("Sin materia")
          }
        } else {
          setClassName("Sin materia")
        }
      } catch (error: any) {
        console.error("Error al cargar la nota:", error)
        showError(`No se pudo cargar la nota: ${error.message}`, "Error")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    loadNote()
  }, [id, showError, router])

  const handleToggleFavorite = async () => {
    if (!note) return

    try {
      const updatedNote = await notesService.updateNote({
        id: note.id,
        is_favorite: !note.is_favorite
      })
      setNote(updatedNote)
      showSuccess(`Nota ${updatedNote.is_favorite ? "añadida a favoritos" : "eliminada de favoritos"}`, "Actualizado")
    } catch (error: any) {
      showError(`No se pudo actualizar: ${error.message}`, "Error")
    }
  }

  const handleDeleteNote = () => {
    if (!note) return

    showConfirm(
      `¿Estás seguro de que quieres eliminar "${note.title}"?

Esta acción no se puede deshacer.`,
      async () => {
        try {
          await notesService.deleteNote(note.id)
          showSuccess("Nota eliminada correctamente", "Eliminado", () => {
            router.back()
          })
        } catch (error: any) {
          showError(`No se pudo eliminar la nota: ${error.message}`, "Error")
        }
      },
      undefined,
      "Eliminar Nota",
    )
  }

  const viewImage = (uri: string) => {
    setSelectedImageUri(uri)
    setImageModalVisible(true)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  const openDocument = async (uri: string, mimeType: string) => {
    try {
      if (Platform.OS === 'android') {
        if (!FileSystem.documentDirectory) {
          throw new Error('Document directory is not available')
        }

        const fileName = uri.split('/').pop();
        if (!fileName) {
          throw new Error('Invalid file URI')
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
      showError('No se pudo abrir el documento');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <ThemedView
          variant="background"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.lg }}
        >
          <ThemedView
            variant="card"
            style={{ padding: theme.spacing.xl, borderRadius: theme.borderRadius.xl, alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
              Cargando nota...
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (!note) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <ThemedView
          variant="background"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.lg }}
        >
          <View style={{ alignItems: "center", gap: theme.spacing.md }}>
            <IconSymbol name="exclamationmark.triangle" size={48} color={theme.colors.error} />
            <ThemedText
              variant="h3"
              style={{ color: theme.colors.error, marginTop: theme.spacing.md, textAlign: "center" }}
            >
              Nota no encontrada
            </ThemedText>
            <ThemedButton
              title="Volver"
              variant="outline"
              onPress={() => router.back()}
              style={{ marginTop: theme.spacing.md }}
            />
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

  const images = note.attachments.filter((att) => att.type === "image")
  const documents = note.attachments.filter((att) => att.type === "document")

  return (
    <SafeAreaView style={commonStyles.container}>
      <ThemedView variant="background" style={commonStyles.container}>
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        >
          {/* Header Card */}
          <ThemedCard
            variant="elevated"
            padding="large"
            style={{ margin: theme.spacing.md, marginBottom: theme.spacing.sm }}
          >
            <ThemedView style={{ gap: theme.spacing.md }}>
              <ThemedText variant="h1">
                {note.title}
              </ThemedText>

              {/* Subject and Date */}
              <ThemedView style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
                  <IconSymbol name="book" size={16} color={theme.colors.primary} />
                  <ThemedText variant="body" color="secondary">
                    {className}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs }}>
                  <IconSymbol name="calendar" size={16} color={theme.colors.textMuted} />
                  <ThemedText variant="caption" color="secondary">
                    {formatDate(note.updated_at)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <ThemedView style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
                  {note.tags.map((tag, index) => (
                    <ThemedView
                      key={index}
                      variant="surface"
                      style={{
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: theme.spacing.xs,
                        borderRadius: theme.borderRadius.md,
                      }}
                    >
                      <ThemedText variant="caption">
                        {tag}
                      </ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              )}
            </ThemedView>
          </ThemedCard>

          {/* AI Summary */}
          {note.ai_summary && (
            <ThemedCard
              variant="elevated"
              padding="large"
              style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
                <IconSymbol name="brain" size={24} color={theme.colors.accent} />
                <ThemedText
                  variant="h3"
                  style={{ marginLeft: theme.spacing.sm, color: theme.colors.accent }}
                >
                  Resumen con IA
                </ThemedText>
              </ThemedView>
              {/* Mostrar resumen IA de forma amigable si es un objeto serializado */}
              {(() => {
                let summary = note.ai_summary;
                let parsed: any = null;
                try {
                  // Reemplazar comillas simples por dobles para intentar parsear como JSON
                  const jsonStr = summary.replace(/'/g, '"');
                  parsed = JSON.parse(jsonStr);
                } catch {
                  parsed = null;
                }
                if (parsed && typeof parsed === 'object') {
                  return (
                    <ThemedView style={{ gap: theme.spacing.xs }}>
                      {parsed.titulo && (
                        <ThemedText variant="body" style={{ fontWeight: "700", marginBottom: 2 }}>{parsed.titulo}</ThemedText>
                      )}
                      {parsed.puntos_clave && Array.isArray(parsed.puntos_clave) && (
                        <ThemedView style={{ marginBottom: 2 }}>
                          {parsed.puntos_clave.map((p: string, i: number) => (
                            <ThemedText key={i} variant="body" style={{ marginLeft: 8 }}>• {p}</ThemedText>
                          ))}
                        </ThemedView>
                      )}
                      {parsed.resumen && (
                        <ThemedText variant="body" style={{ marginBottom: 2 }}>{parsed.resumen}</ThemedText>
                      )}
                      {parsed.conceptos && Array.isArray(parsed.conceptos) && (
                        <ThemedText variant="body">Conceptos: {parsed.conceptos.join(", ")}</ThemedText>
                      )}
                    </ThemedView>
                  );
                } else {
                  return (
                    <ThemedText variant="body">{note.ai_summary}</ThemedText>
                  );
                }
              })()}
            </ThemedCard>
          )}

          {/* Content */}
          <ThemedCard
            variant="elevated"
            padding="large"
            style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}
          >
            <ThemedView style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
              <IconSymbol name="note.text" size={24} color={theme.colors.primary} />
              <ThemedText variant="h3" style={{ marginLeft: theme.spacing.sm }}>
                Contenido
              </ThemedText>
            </ThemedView>
            <ThemedText variant="body">
              {note.content}
            </ThemedText>
          </ThemedCard>

          {/* Attachments */}
          {(images.length > 0 || documents.length > 0) && (
            <ThemedCard
              variant="elevated"
              padding="large"
              style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm }}
            >
              <ThemedView style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing.md }}>
                <ThemedView style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  <IconSymbol name="paperclip" size={24} color={theme.colors.secondary} />
                  <ThemedText variant="h3" style={{ marginLeft: theme.spacing.sm }}>
                    Archivos Adjuntos ({note.attachments.length})
                  </ThemedText>
                </ThemedView>
                <ThemedButton
                  title="Ver todos"
                  variant="ghost"
                  size="small"
                  icon={<IconSymbol name="arrow.right" size={14} color={theme.colors.primary} />}
                  iconPosition="right"
                  onPress={() => router.push(`/attachments/noteId?id=${note.id}`)}
                />
              </ThemedView>

              {/* Images Preview */}
              {images.length > 0 && (
                <ThemedView style={{ marginBottom: theme.spacing.md }}>
                  <ThemedText variant="body" style={{ marginBottom: theme.spacing.sm }}>
                    Imágenes ({images.length})
                  </ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {images.slice(0, 5).map((attachment, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => viewImage(attachment.local_path)}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: theme.borderRadius.md,
                          marginRight: theme.spacing.sm,
                          position: "relative",
                        }}
                      >
                        <Image
                          source={{ uri: attachment.local_path }}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: theme.borderRadius.md,
                          }}
                          resizeMode="cover"
                        />
                        <ThemedView
                          variant="surface"
                          style={{
                            position: "absolute",
                            bottom: 4,
                            right: 4,
                            borderRadius: theme.borderRadius.xs,
                            padding: 2,
                            opacity: 0.8,
                          }}
                        >
                          <IconSymbol name="eye" size={16} color={theme.colors.text} />
                        </ThemedView>
                      </TouchableOpacity>
                    ))}
                    {images.length > 5 && (
                      <TouchableOpacity
                        onPress={() => router.push(`/attachments/noteId?id=${note.id}`)}
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: theme.borderRadius.md,
                          backgroundColor: theme.colors.surface,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ThemedText variant="caption" color="primary">
                          +{images.length - 5}
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                </ThemedView>
              )}

              {/* Documents Preview */}
              {documents.length > 0 && (
                <ThemedView style={{ gap: theme.spacing.xs }}>
                  <ThemedText variant="body" style={{ marginBottom: theme.spacing.sm }}>
                    Documentos ({documents.length})
                  </ThemedText>
                  {documents.slice(0, 3).map((attachment, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.xs,
                        gap: theme.spacing.sm,
                        backgroundColor: theme.colors.surface,
                      }}
                      onPress={() => openDocument(attachment.local_path, attachment.mime_type || 'application/octet-stream')}
                    >
                      <IconSymbol name="doc.fill" size={20} color={theme.colors.success} />
                      <ThemedText variant="body" style={{ flex: 1 }} numberOfLines={1}>
                        {attachment.filename}
                      </ThemedText>
                      <ThemedText variant="caption" color="secondary">
                        {attachment.size > 0 ? `${(attachment.size / 1024).toFixed(1)} KB` : ""}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                  {documents.length > 3 && (
                    <ThemedButton
                      title={`Ver ${documents.length - 3} documento${documents.length - 3 !== 1 ? "s" : ""} más`}
                      variant="ghost"
                      size="small"
                      onPress={() => router.push(`/attachments/noteId?id=${note.id}`)}
                    />
                  )}
                </ThemedView>
              )}
            </ThemedCard>
          )}

          {/* Action Buttons */}
          <ThemedCard
            variant="elevated"
            padding="large"
            style={{ margin: theme.spacing.md }}
          >
            <ThemedView style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <ThemedButton
                title={note.is_favorite ? "❤️ Favorito" : "🤍 Favorito"}
                variant={note.is_favorite ? "error" : "outline"}
                onPress={handleToggleFavorite}
                style={{ flex: 1 }}
              />
              <ThemedButton
                title="✏️ Editar"
                variant="primary"
                onPress={() => router.push(`/notes/${note.id}`)}
                style={{ flex: 1 }}
              />
              <ThemedButton
                title="🗑️ Eliminar"
                variant="error"
                onPress={handleDeleteNote}
                style={{ flex: 1 }}
              />
            </ThemedView>
          </ThemedCard>
        </ScrollView>

        {/* Modal para ver imagen en pantalla completa */}
        <Modal
          visible={imageModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <ThemedView 
            variant="background"
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.9)",
            }}
          >
            <TouchableOpacity
              style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
              onPress={() => setImageModalVisible(false)}
              activeOpacity={1}
            >
              <ThemedView style={{ width: "90%", height: "80%", position: "relative" }}>
                {selectedImageUri && (
                  <Image
                    source={{ uri: selectedImageUri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                )}
                <ThemedButton
                  title="Cerrar"
                  variant="primary"
                  icon={<IconSymbol name="xmark" size={20} color="white" />}
                  iconOnly
                  onPress={() => setImageModalVisible(false)}
                  style={{
                    position: "absolute",
                    top: theme.spacing.lg,
                    right: theme.spacing.lg,
                  }}
                />
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  )
}
