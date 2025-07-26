"use client"

import NoteCard from "@/components/notes/NotesPreviewCard"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import type { NoteData, UpdateNoteRequest } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useCommonStyles, useTheme } from "@/hooks/useTheme"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function NotesIndexScreen() {
  const { theme } = useTheme()
  const commonStyles = useCommonStyles()
  const router = useRouter()
  const { showError, showSuccess } = useModal()

  const { notes, loading, error, refreshNotes, updateNote } = useNotes()

  const [searchText, setSearchText] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [filterFavorites, setFilterFavorites] = useState(false)

  useFocusEffect(
    useCallback(() => {
      refreshNotes()
    }, [refreshNotes]),
  )

  // Aplicar filtros
  let filteredNotes = notes

  if (filterFavorites) {
    filteredNotes = filteredNotes.filter((note) => note.is_favorite)
  }

  if (searchText.trim()) {
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchText.toLowerCase()) ||
        note.content.toLowerCase().includes(searchText.toLowerCase()) ||
        (note.ai_summary && note.ai_summary.toLowerCase().includes(searchText.toLowerCase())) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase())),
    )
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
    <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: 80, paddingBottom: theme.spacing.xs }}>
      {/* Title */}
      <ThemedText variant="h1" style={{ fontWeight: "700", marginBottom: theme.spacing.lg }}>
        Mis Notas
      </ThemedText>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
        <View
          style={{
            flex: 1,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.surface,
          }}
        >
          <ThemedText variant="h2" style={{ fontWeight: "700", color: theme.colors.primary }}>
            {notes.length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Total de notas
          </ThemedText>
        </View>
        <View
          style={{
            flex: 1,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.surface,
          }}
        >
          <ThemedText variant="h2" style={{ fontWeight: "700", color: theme.colors.error }}>
            {notes.filter((n) => n.is_favorite).length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Favoritas
          </ThemedText>
        </View>
      </View>

      {/* Actions */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing.md,
        }}
      >
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: showSearch ? theme.colors.primary : theme.colors.surface,
            }}
          >
            <IconSymbol name="magnifyingglass" size={20} color={showSearch ? "white" : theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterFavorites(!filterFavorites)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: filterFavorites ? theme.colors.error : theme.colors.surface,
            }}
          >
            <IconSymbol name="heart.fill" size={20} color={filterFavorites ? "white" : theme.colors.error} />
          </TouchableOpacity>
        </View>
        <ThemedButton
          title="Nueva Nota"
          variant="primary"
          icon={<IconSymbol name="plus" size={18} color="white" />}
          onPress={() => router.push("/notes/create")}
          style={{ paddingHorizontal: theme.spacing.lg }}
        />
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.sm,
            gap: theme.spacing.sm,
            backgroundColor: theme.colors.surface,
          }}
        >
          <IconSymbol name="magnifyingglass" size={20} color={theme.colors.textMuted} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              paddingVertical: theme.spacing.xs,
              color: theme.colors.text,
            }}
            placeholder="Buscar notas..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus={showSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter Info */}
      {(searchText.trim() || filterFavorites) && (
        <View style={{ marginBottom: theme.spacing.sm }}>
          <ThemedText variant="caption" color="secondary">
            {filteredNotes.length} nota{filteredNotes.length !== 1 ? "s" : ""}
            {searchText.trim() && ` para "${searchText}"`}
            {filterFavorites && " favoritas"}
          </ThemedText>
        </View>
      )}
    </View>
  )

  const renderEmptyState = () => (
    <View
      style={{
        alignItems: "center",
        paddingVertical: theme.spacing.xl * 2,
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
        }}
      >
        <IconSymbol
          name={searchText.trim() || filterFavorites ? "magnifyingglass" : "note.text"}
          size={48}
          color={theme.colors.textMuted}
        />
      </View>
      <ThemedText variant="h3" style={{ textAlign: "center", marginBottom: theme.spacing.xs, fontWeight: "600" }}>
        {searchText.trim() || filterFavorites ? "Sin resultados" : "Sin notas"}
      </ThemedText>
      <ThemedText
        variant="body"
        color="secondary"
        style={{ textAlign: "center", lineHeight: 20, marginBottom: theme.spacing.lg }}
      >
        {searchText.trim() || filterFavorites
          ? "Intenta con otros términos de búsqueda o filtros"
          : "Crea tu primera nota para comenzar"}
      </ThemedText>
      {!searchText.trim() && !filterFavorites && (
        <ThemedButton
          title="Crear Primera Nota"
          variant="primary"
          icon={<IconSymbol name="plus" size={18} color="white" />}
          onPress={() => router.push("/notes/create")}
          style={{ alignSelf: "stretch", paddingVertical: theme.spacing.md }}
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
              <ActivityIndicator size="large" color={theme.colors.primary} />
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
            <RefreshControl refreshing={loading} onRefresh={refreshNotes} tintColor={theme.colors.primary} />
          }
        />
      </ThemedView>
    </SafeAreaView>
  )
}
