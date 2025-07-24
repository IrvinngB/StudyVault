"use client"

import { ClassSelector } from "@/components/calendar/ClassSelector"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { ClassData } from "@/database/services/courseService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useTheme } from "@/hooks/useTheme"
import * as DocumentPicker from "expo-document-picker"
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from "expo-image-picker"
import * as IntentLauncher from 'expo-intent-launcher'
import { useRouter } from "expo-router"
import { useState } from 'react'
import { ActivityIndicator, Image, Linking, Modal, Platform, SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from 'react-native'

export default function CreateNoteScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { showError, showSuccess } = useModal()
  const { createNote, loading } = useNotes()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const [attachedDocuments, setAttachedDocuments] = useState<{ uri: string, name: string, mimeType: string }[]>([])
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null)

  const handleCreateNote = async () => {
    if (!title.trim()) {
      showError("El título es requerido")
      return
    }

    try {
      const attachmentsToSave = [
        ...attachedImages.map((uri: string) => ({
          filename: uri.substring(uri.lastIndexOf('/') + 1),
          type: 'image' as const,
          size: 0,
          local_path: uri,
        })),
        ...attachedDocuments.map((doc: { uri: string; name: string; mimeType: string }) => ({
          filename: doc.name,
          type: 'document' as const,
          size: 0,
          local_path: doc.uri,
        })),
      ]

      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
        class_id: selectedClass?.id,
        is_favorite: false,
        attachments: attachmentsToSave,
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

  // Adjuntar imagen desde cámara o galería
  const pickImage = async (fromCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult
    try {
      if (fromCamera) {
        // Verificar permisos de cámara
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
          showError("Se necesitan permisos de cámara")
          return
        }
        result = await ImagePicker.launchCameraAsync({ 
          mediaTypes: ImagePicker.MediaTypeOptions.Images, 
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3]
        })
      } else {
        // Verificar permisos de galería
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          showError("Se necesitan permisos de galería")
          return
        }
        result = await ImagePicker.launchImageLibraryAsync({ 
          mediaTypes: ImagePicker.MediaTypeOptions.Images, 
          quality: 0.7,
          allowsEditing: true,
          aspect: [4, 3]
        })
      }
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const assets = result.assets
        setAttachedImages((prev) => [...prev, assets[0].uri])
      }
    } catch (err) {
      console.error("Error picking image:", err)
      showError("No se pudo adjuntar la imagen")
    }
  }

  // Adjuntar documento (incluye PDF)
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        copyToCacheDirectory: true,
        type: ['application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      })
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        setAttachedDocuments((prev) => [...prev, { 
          uri: asset.uri, 
          name: asset.name, 
          mimeType: asset.mimeType || "" 
        }])
      }
    } catch (err) {
      console.error("Error picking document:", err)
      showError("No se pudo adjuntar el documento")
    }
  }

  // Eliminar adjunto
  const removeAttachment = (uri: string, type: 'image' | 'document') => {
    if (type === 'image') {
      setAttachedImages((prev: string[]) => prev.filter((img: string) => img !== uri))
    } else {
      setAttachedDocuments((prev: { uri: string; name: string; mimeType: string }[]) =>
        prev.filter((doc: { uri: string; name: string; mimeType: string }) => doc.uri !== uri)
      )
    }
  }

  // Ver imagen en modal propio
  const viewImage = (uri: string) => {
    setSelectedImageUri(uri)
    setImageModalVisible(true)
  }

  // Abrir documento (PDF)
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
      showError('No se pudo abrir el documento');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView variant="background" style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={{ padding: theme.spacing.sm, marginRight: theme.spacing.sm }}
            >
              <IconSymbol name="chevron.left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <ThemedText variant="h2" style={{
                fontSize: 24,
                fontWeight: "700",
                marginBottom: 2
              }}>
                Nueva Nota
              </ThemedText>
              <ThemedText variant="body" color="secondary">
                Crea un nuevo apunte
              </ThemedText>
            </View>
          </View>
        </View>

        <ScrollView 
          style={{ flex: 1, paddingHorizontal: theme.spacing.md }} 
          showsVerticalScrollIndicator={false}
        >
          {/* Información principal */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
              <IconSymbol name="doc.text" size={20} color={theme.colors.primary} />
              <ThemedText variant="h3" style={{ marginLeft: theme.spacing.sm, fontWeight: "600" }}>
                Información de la Nota
              </ThemedText>
            </View>
            <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg, lineHeight: 20 }}>
              Completa la información básica de tu apunte
            </ThemedText>

            {/* Título */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <ThemedText variant="body" style={{ marginBottom: theme.spacing.sm, fontWeight: "600" }}>
                Título *
              </ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  fontSize: 16,
                  minHeight: 48,
                  backgroundColor: theme.colors.surfaceLight,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }}
                placeholder="Escribe el título de tu apunte"
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
                multiline={false}
              />
            </View>

            {/* Selector de materia */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <ThemedText variant="body" style={{ marginBottom: theme.spacing.sm, fontWeight: "600" }}>
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
            <View style={{ marginBottom: theme.spacing.lg }}>
              <ThemedText variant="body" style={{ marginBottom: theme.spacing.sm, fontWeight: "600" }}>
                Etiquetas (separadas por comas)
              </ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  fontSize: 16,
                  minHeight: 48,
                  backgroundColor: theme.colors.surfaceLight,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }}
                placeholder="Ej: Álgebra, Examen, Cuántica"
                placeholderTextColor={theme.colors.textMuted}
                value={tags}
                onChangeText={setTags}
                multiline={false}
              />
            </View>

            {/* Contenido */}
            <View style={{ marginBottom: theme.spacing.lg }}>
              <ThemedText variant="body" style={{ marginBottom: theme.spacing.sm, fontWeight: "600" }}>
                Contenido
              </ThemedText>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  fontSize: 16,
                  minHeight: 120,
                  backgroundColor: theme.colors.surfaceLight,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }}
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
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.sm }}>
              <IconSymbol name="paperclip" size={20} color={theme.colors.success} />
              <ThemedText variant="h3" style={{ marginLeft: theme.spacing.sm, fontWeight: "600" }}>
                Archivos Adjuntos
              </ThemedText>
            </View>
            <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg, lineHeight: 20 }}>
              Adjunta imágenes o documentos a tu nota
            </ThemedText>
            
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: theme.spacing.sm
            }}>
              <TouchableOpacity
                onPress={() => pickImage(true)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.sm,
                  borderWidth: 2,
                  borderRadius: theme.borderRadius.lg,
                  borderStyle: "dashed",
                  borderColor: theme.colors.primary
                }}
              >
                <IconSymbol name="camera" size={24} color={theme.colors.primary} />
                <ThemedText variant="body" style={{
                  marginTop: theme.spacing.sm,
                  fontSize: 12,
                  fontWeight: "500",
                  color: theme.colors.primary
                }}>
                  Cámara
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => pickImage(false)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.sm,
                  borderWidth: 2,
                  borderRadius: theme.borderRadius.lg,
                  borderStyle: "dashed",
                  borderColor: theme.colors.info
                }}
              >
                <IconSymbol name="photo" size={24} color={theme.colors.info} />
                <ThemedText variant="body" style={{
                  marginTop: theme.spacing.sm,
                  fontSize: 12,
                  fontWeight: "500",
                  color: theme.colors.info
                }}>
                  Galería
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickDocument}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.sm,
                  borderWidth: 2,
                  borderRadius: theme.borderRadius.lg,
                  borderStyle: "dashed",
                  borderColor: theme.colors.warning
                }}
              >
                <IconSymbol name="doc" size={24} color={theme.colors.warning} />
                <ThemedText variant="body" style={{
                  marginTop: theme.spacing.sm,
                  fontSize: 12,
                  fontWeight: "500",
                  color: theme.colors.warning
                }}>
                  Documento
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Preview de adjuntos */}
            {(attachedImages.length > 0 || attachedDocuments.length > 0) && (
              <View style={{ marginTop: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: theme.spacing.sm }}>
                  Vista previa:
                </ThemedText>
                
                {/* Imágenes */}
                {attachedImages.length > 0 && (
                  <View style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: theme.spacing.sm,
                    marginBottom: theme.spacing.sm
                  }}>
                    {attachedImages.map((uri, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        onPress={() => viewImage(uri)} 
                        style={{ position: "relative" }}
                      >
                        <Image 
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: theme.borderRadius.md
                          }} 
                          source={{ uri }} 
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removeAttachment(uri, "image")}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            backgroundColor: theme.colors.error,
                            borderRadius: 10,
                            width: 20,
                            height: 20,
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <IconSymbol name="xmark" size={12} color="white" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {/* Documentos */}
                {attachedDocuments.length > 0 && (
                  <View style={{ gap: theme.spacing.sm }}>
                    {attachedDocuments.map((doc, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: theme.spacing.sm,
                          borderRadius: theme.borderRadius.md,
                          backgroundColor: theme.colors.surface
                        }}
                        onPress={() => openDocument(doc.uri, doc.mimeType)}
                      >
                        <IconSymbol 
                          name={doc.mimeType === "application/pdf" ? "doc.richtext" : "doc"} 
                          size={16} 
                          color={theme.colors.accent} 
                        />
                        <ThemedText 
                          variant="body" 
                          style={{
                            flex: 1,
                            fontWeight: "500",
                            marginLeft: theme.spacing.sm
                          }} 
                          numberOfLines={1}
                        >
                          {doc.name}
                        </ThemedText>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation()
                            removeAttachment(doc.uri, "document")
                          }}
                          style={{ padding: theme.spacing.xs }}
                        >
                          <IconSymbol name="xmark" size={12} color={theme.colors.error} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </ThemedCard>
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
              style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
              onPress={() => setImageModalVisible(false)}
              activeOpacity={1}
            >
              <View style={{ width: "90%", height: "80%", position: "relative" }}>
                {selectedImageUri && (
                  <Image 
                    style={{ width: "100%", height: "100%", borderRadius: theme.borderRadius.lg }} 
                    source={{ uri: selectedImageUri }} 
                    resizeMode="contain" 
                  />
                )}
                <TouchableOpacity 
                  style={{
                    position: "absolute",
                    top: theme.spacing.md,
                    right: theme.spacing.md,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: theme.spacing.sm
                  }} 
                  onPress={() => setImageModalVisible(false)}
                >
                  <IconSymbol name="xmark" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Footer con botones */}
        <View style={{
          flexDirection: "row",
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          gap: theme.spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background
        }}>
          <ThemedButton
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
            style={{ flex: 1 }}
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
            style={{ flex: 2 }}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  )
}