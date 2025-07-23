"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { notesService, type NoteData } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useTheme } from "@/hooks/useTheme"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"

export default function AttachmentsScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { noteId } = useLocalSearchParams<{ noteId: string }>()
  const { showError, showSuccess } = useModal()

  const [note, setNote] = useState<NoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)

  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) {
        showError("ID de nota no válido", "Error")
        router.back()
        return
      }

      try {
        setLoading(true)
        const loadedNote = await notesService.getNoteById(noteId)
        setNote(loadedNote)
      } catch (error: any) {
        console.error("Error al cargar la nota:", error)
        showError(`No se pudo cargar la nota: ${error.message}`, "Error")
        router.back()
      } finally {
        setLoading(false)
      }
    }

    loadNote()
  }, [noteId, showError, router])

  const handleRemoveAttachment = async (attachmentPath: string, type: "image" | "document") => {
    if (!note) return

    Alert.alert(
      "Eliminar adjunto",
      `¿Estás seguro de que quieres eliminar este ${type === "image" ? "imagen" : "documento"}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedAttachments = note.attachments.filter((att) => att.local_path !== attachmentPath)

              await notesService.updateNote({
                id: note.id,
                attachments: updatedAttachments,
              })

              setNote((prev) => (prev ? { ...prev, attachments: updatedAttachments } : null))
              showSuccess(`${type === "image" ? "Imagen" : "Documento"} eliminado correctamente`)
            } catch (error: any) {
              showError(`No se pudo eliminar el adjunto: ${error.message}`, "Error")
            }
          },
        },
      ],
    )
  }

  const handleOpenDocument = (uri: string, filename: string) => {
    Alert.alert("Abrir Documento", `¿Deseas abrir ${filename}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Abrir",
        onPress: () => {
          showSuccess("Abriendo documento...", "Info")
        },
      },
    ])
  }

  const viewImage = (uri: string) => {
    setSelectedImageUri(uri)
    setImageModalVisible(true)
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView variant="background" style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText variant="body" style={{ marginTop: 16, color: theme.colors.secondary }}>
            Cargando adjuntos...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView variant="background" style={styles.centeredContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={theme.colors.error} />
          <ThemedText variant="h3" style={{ color: theme.colors.error, marginTop: 16, textAlign: "center" }}>
            Nota no encontrada
          </ThemedText>
          <ThemedButton title="Volver" variant="outline" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </ThemedView>
      </SafeAreaView>
    )
  }

  const images = note.attachments.filter((att) => att.type === "image")
  const documents = note.attachments.filter((att) => att.type === "document")
  const totalAttachments = note.attachments.length

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ThemedView variant="background" style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            title: "Archivos Adjuntos",
            headerRight: () => (
              <ThemedButton
                title="Editar Nota"
                variant="outline"
                onPress={() => router.push(`/notes/${note.id}`)}
                style={{ marginLeft: 16 }}
              />
            ),
          }}
        />

        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info */}
          <View
            style={{
              margin: theme.spacing.md,
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.md,
              backgroundColor: theme.colors.surface,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: theme.spacing.md,
                  backgroundColor: theme.colors.primary + "20",
                }}
              >
                <IconSymbol name="paperclip" size={28} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText
                  variant="h2"
                  style={{ fontWeight: "700", marginBottom: theme.spacing.sm }}
                  numberOfLines={2}
                >
                  {note.title}
                </ThemedText>
                <ThemedText variant="body" color="secondary">
                  {totalAttachments} archivo{totalAttachments !== 1 ? "s" : ""} adjunto
                  {totalAttachments !== 1 ? "s" : ""}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Images Section */}
          {images.length > 0 && (
            <View
              style={{
                marginHorizontal: theme.spacing.md,
                marginBottom: theme.spacing.lg,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                <IconSymbol name="photo" size={24} color={theme.colors.accent} />
                <ThemedText
                  variant="h3"
                  style={{ marginLeft: theme.spacing.sm, fontWeight: "600" }}
                >
                  Imágenes ({images.length})
                </ThemedText>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.sm,
                }}
              >
                {images.map((attachment, index) => (
                  <View key={index} style={{ width: "48%", marginBottom: theme.spacing.md }}>
                    <TouchableOpacity
                      onPress={() => viewImage(attachment.local_path)}
                      activeOpacity={0.8}
                      style={{ position: "relative", marginBottom: theme.spacing.sm }}
                    >
                      <Image
                        source={{ uri: attachment.local_path }}
                        style={{
                          width: "100%",
                          height: 150,
                          borderRadius: theme.borderRadius.sm,
                        }}
                        resizeMode="cover"
                      />
                      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: theme.borderRadius.sm }}>
                        <IconSymbol name="eye" size={16} color="white" />
                      </View>
                    </TouchableOpacity>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={() => viewImage(attachment.local_path)}
                        style={{ backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, borderRadius: theme.borderRadius.sm }}
                      >
                        <IconSymbol name="eye" size={14} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleRemoveAttachment(attachment.local_path, "image")}
                        style={{ backgroundColor: theme.colors.error, paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, borderRadius: theme.borderRadius.sm }}
                      >
                        <IconSymbol name="trash" size={14} color="white" />
                      </TouchableOpacity>
                    </View>

                    <ThemedText variant="caption" style={{ marginTop: theme.spacing.xs }} numberOfLines={1}>
                      {attachment.filename}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Documents Section */}
          {documents.length > 0 && (
            <View
              style={{
                marginHorizontal: theme.spacing.md,
                marginBottom: theme.spacing.lg,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                <IconSymbol name="doc" size={24} color={theme.colors.success} />
                <ThemedText
                  variant="h3"
                  style={{ marginLeft: theme.spacing.sm, fontWeight: "600" }}
                >
                  Documentos ({documents.length})
                </ThemedText>
              </View>

              <View style={{ gap: theme.spacing.md }}>
                {documents.map((attachment, index) => (
                  <View key={index} style={{ borderRadius: theme.borderRadius.md, overflow: "hidden", backgroundColor: theme.colors.surface }}>
                    <View style={{ flexDirection: "row", alignItems: "center", padding: theme.spacing.md }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: theme.spacing.md,
                          backgroundColor: theme.colors.success + "20",
                        }}
                      >
                        <IconSymbol name="doc.fill" size={24} color={theme.colors.success} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <ThemedText variant="body" style={{ fontWeight: "500" }} numberOfLines={2}>
                          {attachment.filename}
                        </ThemedText>
                        <ThemedText variant="caption" color="secondary">
                          {attachment.size > 0 ? `${(attachment.size / 1024).toFixed(1)} KB` : "Tamaño desconocido"}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: theme.spacing.md, backgroundColor: theme.colors.surface }}>
                      <TouchableOpacity
                        onPress={() => handleOpenDocument(attachment.local_path, attachment.filename)}
                        style={{ backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, borderRadius: theme.borderRadius.sm, flexDirection: "row", alignItems: "center" }}
                      >
                        <IconSymbol name="eye" size={16} color="white" />
                        <ThemedText variant="caption" style={{ color: "white", marginLeft: 4, fontWeight: "600" }}>
                          Abrir
                        </ThemedText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleRemoveAttachment(attachment.local_path, "document")}
                        style={{ backgroundColor: theme.colors.error, paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.sm, borderRadius: theme.borderRadius.sm, marginLeft: theme.spacing.sm }}
                      >
                        <IconSymbol name="trash" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Empty State */}
          {totalAttachments === 0 && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.md }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: theme.spacing.md, backgroundColor: theme.colors.surface }}>
                <IconSymbol name="paperclip" size={48} color={theme.colors.textMuted} />
              </View>
              <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
                Sin archivos adjuntos
              </ThemedText>
              <ThemedText variant="body" color="secondary" style={{ textAlign: "center", marginBottom: theme.spacing.md }}>
                Esta nota no tiene archivos adjuntos. Puedes agregar imágenes o documentos editando la nota.
              </ThemedText>
              <ThemedButton
                title="Editar Nota"
                variant="primary"
                icon={<IconSymbol name="pencil" size={18} color="white" />}
                onPress={() => router.push(`/notes/${note.id}`)}
                style={{ width: "100%" }}
              />
            </View>
          )}
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
                  <Image source={{ uri: selectedImageUri }} style={styles.fullScreenImage} resizeMode="contain" />
                )}
                <TouchableOpacity style={styles.closeImageButton} onPress={() => setImageModalVisible(false)}>
                  <IconSymbol name="xmark" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  imageModalBackground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContent: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 8,
    overflow: "hidden",
  },
  fullScreenImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  closeImageButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
})
