"use client"

import NoteCard from "@/components/notes/NotesPreviewCard"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { classService } from "@/database/services/courseService"
import type { NoteData, UpdateNoteRequest } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useCommonStyles, useTheme } from "@/hooks/useTheme"
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SubjectNotesScreen() {
  const { theme } = useTheme()
  const commonStyles = useCommonStyles()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const subjectId = id || ""
  const { showError, showSuccess } = useModal()

  const { notes, loading, error, refreshNotes, updateNote } = useNotes()

  const [searchText, setSearchText] = useState("")
  const [subjectData, setSubjectData] = useState<{
    id: string
    name: string
    color: string
    code?: string
  } | null>(null)

  useFocusEffect(
    useCallback(() => {
      refreshNotes()
    }, [refreshNotes]),
  )

  // Cargar datos de la materia
  useEffect(() => {
    const loadSubjectData = async () => {
      if (!subjectId) return

      try {
        const classes = await classService.getAllClasses()
        const subject = classes.find((c) => c.id === subjectId)
        
        if (subject && subject.id) {
          setSubjectData({
            id: subject.id,
            name: subject.name,
            color: subject.color || theme.colors.primary,
            code: subject.code,
          })
        }
      } catch (error) {
        console.error("Error al cargar datos de la materia:", error)
      }
    }

    loadSubjectData()
  }, [subjectId, theme.colors.primary])

  // Filtrar notas por materia y búsqueda
  const getFilteredNotes = () => {
    let filteredNotes = notes.filter((note) => note.class_id === subjectId)

    if (searchText.trim()) {
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchText.toLowerCase()) ||
          note.content.toLowerCase().includes(searchText.toLowerCase()) ||
          (note.ai_summary && note.ai_summary.toLowerCase().includes(searchText.toLowerCase())) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase())),
      )
    }

    return filteredNotes
  }

  const handleNotePress = useCallback(
    (note: NoteData) => {
      router.push(`/notes/view/${note.id}`)
    },
    [router],
  )

  const handleEditNote = useCallback(
    (note: NoteData) => {
      router.push(`/notes/${note.id}`)
    },
    [router],
  )

  const handleFavoriteToggle = useCallback(
    async (noteId: string) => {
      const noteToUpdate = notes.find((n) => n.id === noteId)
      if (!noteToUpdate) return

      const newFavoriteStatus = !noteToUpdate.is_favorite

      try {
        const updated = await updateNote({
          id: noteId,
          is_favorite: newFavoriteStatus,
        } as UpdateNoteRequest)

        if (updated) {
          showSuccess(
            `Nota "${noteToUpdate.title}" ${newFavoriteStatus ? "añadida a favoritos" : "eliminada de favoritos"}.`,
          )
          await refreshNotes()
        } else {
          showError(`No se pudo actualizar el estado de favorito para "${noteToUpdate.title}".`)
        }
      } catch (e: any) {
        console.error("Error al alternar favorito:", e)
        showError(`No se pudo actualizar el estado de favorito: ${e.message || "Error desconocido"}`, "Error")
      }
    },
    [notes, updateNote, showSuccess, showError, refreshNotes],
  )

  const renderHeader = () => (
    <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: 60, paddingBottom: theme.spacing.md }}>
              {/* Header con información de la materia */}
        <View style={{
          marginBottom: theme.spacing.lg,
        }}>
          <View style={{ flex: 1 }}>
            <ThemedText variant="h1" style={{ 
              fontWeight: "800", 
              fontSize: 28, 
              marginBottom: 4,
              color: subjectData?.color || theme.colors.primary
            }}>
              {subjectData?.name || "Materia"}
            </ThemedText>
            {subjectData?.code && (
              <ThemedText variant="body" color="secondary">
                Código: {subjectData.code}
              </ThemedText>
            )}
          </View>
        </View>

      {/* Barra de búsqueda */}
      <View style={{
        flexDirection: "row",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
      }}>
        <View style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.sm,
        }}>
          <IconSymbol name="magnifyingglass" size={20} color={theme.colors.textMuted} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              paddingVertical: theme.spacing.xs,
              color: theme.colors.text,
            }}
            placeholder="Buscar en esta materia..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Estadísticas de la materia */}
      <View style={{
        flexDirection: "row",
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
      }}>
        <View style={{
          flex: 1,
          padding: theme.spacing.md,
          borderRadius: 16,
          backgroundColor: theme.colors.surface,
          alignItems: "center",
        }}>
          <IconSymbol name="doc.text" size={24} color={subjectData?.color || theme.colors.primary} />
          <ThemedText variant="h2" style={{ fontWeight: "700", marginTop: 4 }}>
            {getFilteredNotes().length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Notas
          </ThemedText>
        </View>
        <View style={{
          flex: 1,
          padding: theme.spacing.md,
          borderRadius: 16,
          backgroundColor: theme.colors.surface,
          alignItems: "center",
        }}>
          <IconSymbol name="star.fill" size={24} color={theme.colors.warning} />
          <ThemedText variant="h2" style={{ fontWeight: "700", marginTop: 4 }}>
            {getFilteredNotes().filter((n) => n.is_favorite).length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Favoritas
          </ThemedText>
        </View>
        <View style={{
          flex: 1,
          padding: theme.spacing.md,
          borderRadius: 16,
          backgroundColor: theme.colors.surface,
          alignItems: "center",
        }}>
          <IconSymbol name="brain" size={24} color={theme.colors.accent} />
          <ThemedText variant="h2" style={{ fontWeight: "700", marginTop: 4 }}>
            {getFilteredNotes().filter((n) => n.ai_summary).length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Con IA
          </ThemedText>
        </View>
      </View>

      {/* Botón para crear nueva nota */}
      <ThemedButton
        title="Nueva Nota"
        variant="primary"
        icon={<IconSymbol name="plus" size={18} color="white" />}
        onPress={() => router.push("/notes/create")}
        style={{ 
          marginBottom: theme.spacing.lg,
          backgroundColor: subjectData?.color || theme.colors.primary
        }}
      />
    </View>
  )

  const renderEmptyState = () => (
    <View style={{
      alignItems: "center",
      paddingVertical: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.lg,
    }}>
      <View style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
      }}>
        <IconSymbol
          name={searchText.trim() ? "magnifyingglass" : "note.text"}
          size={48}
          color={subjectData?.color || theme.colors.textMuted}
        />
      </View>
      <ThemedText variant="h3" style={{ 
        textAlign: "center", 
        marginBottom: theme.spacing.xs, 
        fontWeight: "600",
        color: subjectData?.color || theme.colors.primary
      }}>
        {searchText.trim() ? "Sin resultados" : "Sin notas en esta materia"}
      </ThemedText>
      <ThemedText
        variant="body"
        color="secondary"
        style={{ textAlign: "center", lineHeight: 20, marginBottom: theme.spacing.lg }}
      >
        {searchText.trim()
          ? "Intenta con otros términos de búsqueda"
          : `Crea tu primera nota para ${subjectData?.name || "esta materia"}`
        }
      </ThemedText>
      {!searchText.trim() && (
        <ThemedButton
          title="Crear Primera Nota"
          variant="primary"
          icon={<IconSymbol name="plus" size={18} color="white" />}
          onPress={() => router.push("/notes/create")}
          style={{ 
            alignSelf: "stretch", 
            paddingVertical: theme.spacing.md,
            backgroundColor: subjectData?.color || theme.colors.primary
          }}
        />
      )}
    </View>
  )

  if (loading && notes.length === 0) {
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
              <ActivityIndicator size="large" color={subjectData?.color || theme.colors.primary} />
              <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
                Cargando notas...
              </ThemedText>
            </ThemedView>
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (error) {
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
              {error}
            </ThemedText>
            <ThemedButton title="Reintentar" variant="outline" onPress={refreshNotes} />
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

  const filteredNotes = getFilteredNotes()

  return (
    <SafeAreaView style={commonStyles.container}>
      <ThemedView variant="background" style={commonStyles.container}>
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item: note }) => (
            <NoteCard
              note={note}
              onPress={handleNotePress}
              onEdit={handleEditNote}
              isFavorite={note.is_favorite}
              onFavoriteToggle={() => handleFavoriteToggle(note.id)}
              compact={false}
            />
          )}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            { paddingHorizontal: theme.spacing.md, paddingBottom: 100 },
            filteredNotes.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={refreshNotes} 
              tintColor={subjectData?.color || theme.colors.primary} 
            />
          }
        />
      </ThemedView>
    </SafeAreaView>
  )
} 