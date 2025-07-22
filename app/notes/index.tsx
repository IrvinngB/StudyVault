"use client"

import TestDataCreator from "@/components/debug/TestDataCreator"
import NoteCard from "@/components/notes/NotesPreviewCard"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { classService, type ClassData } from "@/database/services/courseService"
import type { NoteData, UpdateNoteRequest } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useTheme } from "@/hooks/useTheme"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"

export default function NotesScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { showError, showSuccess } = useModal()

  const { notes, loading, error, refreshNotes, updateNote, notesStats } = useNotes()

  const [filterType, setFilterType] = useState<"all" | "favorites" | "subject">("all")
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [allClasses, setAllClasses] = useState<ClassData[]>([])

  useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        await refreshNotes()

        try {
          const loadedClasses = await classService.getAllClasses()
          setAllClasses(loadedClasses)
        } catch (err: any) {
          console.error("Error al cargar las materias en NotesScreen:", err)
          showError(`No se pudieron cargar las materias: ${err.message || "Error desconocido"}`, "Error")
        }
      }

      loadInitialData()
    }, [refreshNotes, showError]),
  )

  const onRefresh = refreshNotes

  const totalNotes = notesStats.total
  const favoriteNotesCount = notesStats.favorites
  const subjectCount = Object.keys(notesStats.byClass).length

  const getFilteredNotes = (): NoteData[] => {
    switch (filterType) {
      case "all":
        return notes
      case "favorites":
        return notes.filter((note) => note.is_favorite)
      case "subject":
        return selectedSubject ? notes.filter((note) => note.class_id === selectedSubject) : []
      default:
        return notes
    }
  }

  const displayedNotes = getFilteredNotes()

  const handleNotePress = useCallback(
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
    <View style={styles.headerContainer}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: theme.colors.primary + "20" }]}> 
              <IconSymbol name="note.text" size={28} color={theme.colors.primary} />
            </View>
            <View>
              <ThemedText variant="h1" style={styles.headerTitle}>
                Mis Apuntes
              </ThemedText>
              <ThemedText variant="body" color="secondary">
                {totalNotes} nota{totalNotes !== 1 ? "s" : ""} en total
              </ThemedText>
            </View>
          </View>
          <ThemedButton
            title="Nuevo"
            variant="primary"
            icon={<IconSymbol name="plus" size={18} color="white" />}
            onPress={() => {
              router.push("/notes/create")
            }}
          />
        </View>
      </View>

      {/* Enhanced Stats Cards */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          onPress={() => {
            setFilterType("all")
            setSelectedSubject(null)
          }}
          style={styles.statCard}
          activeOpacity={0.7}
        >
          <ThemedCard
            variant="elevated"
            padding="medium"
            style={[
              styles.statCardContent,
              filterType === "all" && {
                backgroundColor: theme.colors.primary,
                borderWidth: 2,
                borderColor: theme.colors.primary,
              },
            ]}
          >
            <View style={styles.statCardHeader}>
              <IconSymbol name="doc.text" size={24} color={filterType === "all" ? "white" : theme.colors.primary} />
              <ThemedText
                variant="h1"
                style={[styles.statNumber, { color: filterType === "all" ? "white" : theme.colors.primary }]}
              >
                {totalNotes}
              </ThemedText>
            </View>
            <ThemedText
              variant="body"
              style={[styles.statLabel, { color: filterType === "all" ? "white" : theme.colors.text }]}
            >
              Total
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setFilterType("favorites")
            setSelectedSubject(null)
          }}
          style={styles.statCard}
          activeOpacity={0.7}
        >
          <ThemedCard
            variant="elevated"
            padding="medium"
            style={[
              styles.statCardContent,
              filterType === "favorites" && {
                backgroundColor: theme.colors.error,
                borderWidth: 2,
                borderColor: theme.colors.error,
              },
            ]}
          >
            <View style={styles.statCardHeader}>
              <IconSymbol
                name="heart.fill"
                size={24}
                color={filterType === "favorites" ? "white" : theme.colors.error}
              />
              <ThemedText
                variant="h1"
                style={[styles.statNumber, { color: filterType === "favorites" ? "white" : theme.colors.error }]}
              >
                {favoriteNotesCount}
              </ThemedText>
            </View>
            <ThemedText
              variant="body"
              style={[styles.statLabel, { color: filterType === "favorites" ? "white" : theme.colors.text }]}
            >
              Favoritos
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setFilterType("subject")
          }}
          style={styles.statCard}
          activeOpacity={0.7}
        >
          <ThemedCard
            variant="elevated"
            padding="medium"
            style={[
              styles.statCardContent,
              filterType === "subject" && {
                backgroundColor: theme.colors.success,
                borderWidth: 2,
                borderColor: theme.colors.success,
              },
            ]}
          >
            <View style={styles.statCardHeader}>
              <IconSymbol name="folder" size={24} color={filterType === "subject" ? "white" : theme.colors.success} />
              <ThemedText
                variant="h1"
                style={[styles.statNumber, { color: filterType === "subject" ? "white" : theme.colors.success }]}
              >
                {subjectCount}
              </ThemedText>
            </View>
            <ThemedText
              variant="body"
              style={[styles.statLabel, { color: filterType === "subject" ? "white" : theme.colors.text }]}
            >
              Materias
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>
      </View>

      {/* Filter Status */}
      {filterType !== "all" && (
        <View style={styles.filterStatus}>
          <View style={[styles.filterBadge, { backgroundColor: theme.colors.info + "20" }]}> 
            <IconSymbol name="line.3.horizontal.decrease.circle" size={16} color={theme.colors.info} />
            <ThemedText variant="body" style={{ color: theme.colors.info, marginLeft: 8, fontWeight: "600" }}>
              {filterType === "favorites" && "Mostrando favoritos"}
              {filterType === "subject" && !selectedSubject && "Selecciona una materia"}
              {filterType === "subject" && selectedSubject && `Materia: ${selectedSubject}`}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => {
              setFilterType("all")
              setSelectedSubject(null)
            }}
            style={styles.clearFilter}
          >
            <IconSymbol name="xmark" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  const renderEmptyState = () => {
    if (totalNotes === 0) {
      // Si no hay notas en absoluto, mostrar el creador de datos de prueba
      return <TestDataCreator />
    }

    // Si hay notas pero el filtro no muestra ninguna
    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyStateIcon, { backgroundColor: theme.colors.surface }]}> 
          <IconSymbol
            name={filterType === "favorites" ? "heart" : filterType === "subject" ? "folder" : "note.text"}
            size={48}
            color={theme.colors.textMuted}
          />
        </View>
        <ThemedText variant="h3" style={styles.emptyStateTitle}>
          {filterType === "favorites" && "Sin favoritos aún"}
          {filterType === "subject" && !selectedSubject && "Selecciona una materia"}
          {filterType === "subject" && selectedSubject && "Sin notas en esta materia"}
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.emptyStateDescription}>
          {filterType === "favorites" && "Marca tus notas importantes como favoritas"}
          {filterType === "subject" && !selectedSubject && "Toca en 'Materias' para filtrar por materia"}
          {filterType === "subject" && selectedSubject && "Crea una nota para esta materia"}
        </ThemedText>
      </View>
    )
  }

  if (loading && notes.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ThemedView variant="background" style={styles.centeredContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
              Cargando tus apuntes...
            </ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ThemedView variant="background" style={styles.centeredContainer}>
          <View style={styles.errorContainer}>
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
    <SafeAreaView style={styles.container}>
      <ThemedView variant="background" style={styles.container}>
        <FlatList
          data={displayedNotes}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item: note }) => (
            <NoteCard
              note={note}
              onPress={handleNotePress}
              isFavorite={note.is_favorite}
              onFavoriteToggle={() => handleFavoriteToggle(note.id)}
              className={
                note.class_id ? allClasses.find((cls) => cls.id === note.class_id)?.name || "Sin nombre" : "Sin materia"
              }
            />
          )}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContainer,
            displayedNotes.length === 0 && totalNotes === 0 && { flex: 1 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        />
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
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
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
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    height: 100,
  },
  statCardContent: {
    height: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statCardHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  statLabel: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  filterStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
  },
  clearFilter: {
    padding: 8,
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyStateTitle: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
  },
  emptyStateDescription: {
    textAlign: "center",
    lineHeight: 22,
  },
  firstNoteButton: {
    marginTop: 24,
    alignSelf: "stretch",
    paddingVertical: 16,
  },
})