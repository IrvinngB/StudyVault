"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { classService } from "@/database/services/courseService"
import type { NoteData } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useCommonStyles, useTheme } from "@/hooks/useTheme"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function NoteViewScreen() {
  const { theme } = useTheme()
  const commonStyles = useCommonStyles()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showError, showSuccess } = useModal()

  const { notes, loading, error, refreshNotes } = useNotes()

  const [note, setNote] = useState<NoteData | null>(null)
  const [subjectName, setSubjectName] = useState<string>("")

  useEffect(() => {
    const loadNote = async () => {
      if (!id) return

      try {
        await refreshNotes()
        const foundNote = notes.find((n) => n.id === id)
        
        if (foundNote) {
          setNote(foundNote)
          
          // Cargar nombre de la materia
          if (foundNote.class_id) {
            try {
              const classes = await classService.getAllClasses()
              const subject = classes.find((c) => c.id === foundNote.class_id)
              if (subject) {
                setSubjectName(subject.name)
              }
            } catch (error) {
              console.error("Error al cargar nombre de materia:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar la nota:", error)
      }
    }

    loadNote()
  }, [id, notes])

  const handleEdit = () => {
    if (note) {
      router.push(`/notes/${note.id}`)
    }
  }

  const handleShare = () => {
    // Implementar compartir nota
    showSuccess("Función de compartir próximamente disponible")
  }

  const handleDelete = () => {
    if (!note) return

    showError(
      "¿Estás seguro de que quieres eliminar esta nota?",
      "Eliminar Nota",
      () => {
        // Implementar eliminación
        showSuccess("Nota eliminada correctamente")
        router.back()
      }
    )
  }

  if (loading && !note) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <ThemedView
          variant="background"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.lg }}
        >
          <View style={{ alignItems: "center" }}>
            <ThemedView
              variant="card"
              style={{ padding: theme.spacing.xl, borderRadius: theme.borderRadius.xl, alignItems: "center" }}
            >
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
                Cargando nota...
              </ThemedText>
            </ThemedView>
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (error || !note) {
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
              style={{ color: theme.colors.error, marginBottom: theme.spacing.sm, textAlign: "center" }}
            >
              {error || "Nota no encontrada"}
            </ThemedText>
            <ThemedButton title="Volver" variant="outline" onPress={() => router.back()} />
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ThemedView variant="background" style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border
        }}>
          <ThemedText variant="h3" style={{ flex: 1, textAlign: "center" }}>
            Ver Nota
          </ThemedText>
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <TouchableOpacity onPress={handleShare} style={{ padding: theme.spacing.sm }}>
              <IconSymbol name="square.and.arrow.up" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit} style={{ padding: theme.spacing.sm }}>
              <IconSymbol name="pencil" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.md,
            paddingBottom: theme.spacing.xxl
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Información de la nota */}
          <ThemedView variant="surface" style={{
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
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
                  {note.title}
                </ThemedText>
                <ThemedText variant="body" color="secondary">
                  {subjectName && `Materia: ${subjectName}`}
                </ThemedText>
                {note.updated_at && (
                  <ThemedText variant="caption" color="secondary">
                    Última actualización: {note.updated_at}
                  </ThemedText>
                )}
              </View>
              {note.is_favorite && (
                <IconSymbol name="heart.fill" size={24} color={theme.colors.error} />
              )}
            </View>

            {/* Etiquetas */}
            {note.tags && note.tags.length > 0 && (
              <View style={{ marginBottom: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: theme.spacing.xs }}>
                  Etiquetas:
                </ThemedText>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
                  {note.tags.map((tag, index) => (
                    <View key={index} style={{
                      backgroundColor: theme.colors.primary + "20",
                      paddingHorizontal: theme.spacing.sm,
                      paddingVertical: theme.spacing.xs,
                      borderRadius: theme.borderRadius.sm,
                    }}>
                      <ThemedText variant="caption" style={{ color: theme.colors.primary, fontWeight: "500" }}>
                        {tag}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ThemedView>

          {/* Contenido */}
          <ThemedView variant="surface" style={{
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border
          }}>
            <ThemedText variant="h3" style={{
              fontWeight: "600",
              marginBottom: theme.spacing.md
            }}>
              Contenido
            </ThemedText>
            <ThemedText variant="body" style={{
              lineHeight: 24,
              textAlign: "justify"
            }}>
              {note.content}
            </ThemedText>
          </ThemedView>

          {/* Resumen de IA */}
          {note.ai_summary && (
            <ThemedView variant="surface" style={{
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.accent
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                <IconSymbol name="brain" size={24} color={theme.colors.accent} />
                <ThemedText variant="h3" style={{
                  marginLeft: theme.spacing.sm,
                  fontWeight: "600"
                }}>
                  Resumen con IA
                </ThemedText>
              </View>
              
              {/* Mostrar resumen IA de forma amigable */}
              {(() => {
                let summary = note.ai_summary;
                let parsed: any = null;
                try {
                  const jsonStr = summary.replace(/'/g, '"');
                  parsed = JSON.parse(jsonStr);
                } catch {
                  parsed = null;
                }
                
                if (parsed && typeof parsed === 'object') {
                  return (
                    <View>
                      {parsed.titulo && (
                        <ThemedText variant="h3" style={{ fontWeight: "700", marginBottom: 4 }}>
                          {parsed.titulo}
                        </ThemedText>
                      )}
                      {parsed.puntos_clave && Array.isArray(parsed.puntos_clave) && (
                        <View style={{ marginBottom: 8 }}>
                          <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: 2 }}>
                            Puntos clave:
                          </ThemedText>
                          {parsed.puntos_clave.map((p: string, i: number) => (
                            <ThemedText key={i} variant="body" style={{ marginLeft: 12, marginBottom: 1 }}>
                              • {p}
                            </ThemedText>
                          ))}
                        </View>
                      )}
                      {parsed.resumen && (
                        <View style={{ marginBottom: 8 }}>
                          <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: 2 }}>
                            Resumen:
                          </ThemedText>
                          <ThemedText variant="body">{parsed.resumen}</ThemedText>
                        </View>
                      )}
                      {parsed.conceptos && Array.isArray(parsed.conceptos) && (
                        <View style={{ marginBottom: 4 }}>
                          <ThemedText variant="body" style={{ fontWeight: "600", marginBottom: 2 }}>
                            Conceptos:
                          </ThemedText>
                          <ThemedText variant="body">{parsed.conceptos.join(", ")}</ThemedText>
                        </View>
                      )}
                    </View>
                  );
                } else {
                  return (
                    <ThemedText variant="body" style={{ lineHeight: 22 }}>
                      {note.ai_summary}
                    </ThemedText>
                  );
                }
              })()}
            </ThemedView>
          )}

          {/* Archivos adjuntos */}
          {note.attachments && note.attachments.length > 0 && (
            <ThemedView variant="surface" style={{
              padding: theme.spacing.lg,
              borderRadius: theme.borderRadius.lg,
              marginBottom: theme.spacing.md,
              borderWidth: 1,
              borderColor: theme.colors.border
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
                <IconSymbol name="paperclip" size={24} color={theme.colors.secondary} />
                <ThemedText variant="h3" style={{
                  marginLeft: theme.spacing.sm,
                  fontWeight: "600"
                }}>
                  Archivos Adjuntos ({note.attachments.length})
                </ThemedText>
              </View>
              
              <View style={{ gap: theme.spacing.sm }}>
                {note.attachments.map((attachment, index) => (
                  <View key={index} style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.surfaceLight
                  }}>
                    <IconSymbol 
                      name={attachment.type === "image" ? "photo" : "doc.fill"} 
                      size={20} 
                      color={theme.colors.accent} 
                    />
                    <ThemedText variant="body" style={{
                      marginLeft: theme.spacing.sm,
                      flex: 1
                    }}>
                      {attachment.filename}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </ThemedView>
          )}

          {/* Botones de acción */}
          <View style={{ gap: theme.spacing.sm }}>
            <ThemedButton
              title="Editar Nota"
              variant="primary"
              icon={<IconSymbol name="pencil" size={18} color="white" />}
              onPress={handleEdit}
            />
            <ThemedButton
              title="Compartir"
              variant="outline"
              icon={<IconSymbol name="square.and.arrow.up" size={18} color={theme.colors.primary} />}
              onPress={handleShare}
            />
            <ThemedButton
              title="Eliminar Nota"
              variant="outline"
              icon={<IconSymbol name="trash" size={18} color={theme.colors.error} />}
              onPress={handleDelete}
              style={{ borderColor: theme.colors.error }}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  )
}
