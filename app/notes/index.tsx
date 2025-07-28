"use client"

import NoteCard from "@/components/notes/NotesPreviewCard"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { classService } from "@/database/services/courseService"
import type { NoteData, UpdateNoteRequest } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useCommonStyles, useTheme } from "@/hooks/useTheme"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type TabType = "todas" | "favoritas" | "materias"

interface SubjectGroup {
  id: string
  name: string
  color: string
  noteCount: number
}

export default function NotesIndexScreen() {
  const { theme } = useTheme()
  const commonStyles = useCommonStyles()
  const router = useRouter()
  const { showError, showSuccess } = useModal()

  const { notes, loading, error, refreshNotes, updateNote } = useNotes()

  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("todas")
  const [subjects, setSubjects] = useState<SubjectGroup[]>([])

  useFocusEffect(
    useCallback(() => {
      refreshNotes()
    }, [refreshNotes]),
  )

  // Load subjects and group notes
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const classes = await classService.getAllClasses()
        const subjectGroups: SubjectGroup[] = []

        // Get unique subjects from notes
        const subjectMap = new Map<string, { name: string; count: number }>()

        for (const note of notes) {
          if (note.class_id) {
            const classData = classes.find((c) => c.id === note.class_id)
            if (classData) {
              const existing = subjectMap.get(note.class_id)
              subjectMap.set(note.class_id, {
                name: classData.name,
                count: (existing?.count || 0) + 1,
              })
            }
          }
        }

        // Convert to array with colors
        const colors = [
          theme.colors.primary,
          theme.colors.success,
          theme.colors.warning,
          theme.colors.info,
          theme.colors.accent,
          theme.colors.secondary,
        ]

        let colorIndex = 0
        subjectMap.forEach((data, classId) => {
          subjectGroups.push({
            id: classId,
            name: data.name,
            color: colors[colorIndex % colors.length],
            noteCount: data.count,
          })
          colorIndex++
        })

        setSubjects(subjectGroups)
      } catch (error) {
        console.error("Error loading subjects:", error)
      }
    }

    if (notes.length > 0) {
      loadSubjects()
    }
  }, [notes, theme.colors])

  // Filter notes based on active tab and search
  const getFilteredNotes = () => {
    let filteredNotes = notes

    // Apply tab filter
    if (activeTab === "favoritas") {
      filteredNotes = filteredNotes.filter((note) => note.is_favorite)
    }

    // Apply search filter
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

  const handleSubjectPress = (subjectId: string) => {
    // Navigate to subject-specific notes view
    router.push(`/notes/subject/${subjectId}`)
  }

  const renderHeader = () => (
    <View style={{ paddingHorizontal: theme.spacing.md, paddingTop: 60, paddingBottom: theme.spacing.md }}>
      {/* Title and New Button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: theme.spacing.lg,
        }}
      >
        <View style={{ flex: 1 }}>
          <ThemedText variant="h1" style={{ fontWeight: "800", fontSize: 32, marginBottom: 4 }}>
            Notas
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Tu biblioteca de conocimiento
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/notes/create")}
          style={{
            backgroundColor: theme.colors.text,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 25,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <IconSymbol name="plus" size={16} color={theme.colors.background} />
          <ThemedText style={{ color: theme.colors.background, fontWeight: "600" }}>Nueva</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            gap: theme.spacing.sm,
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
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surface,
          }}
        >
          <IconSymbol name="line.3.horizontal.decrease" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
        }}
      >
        <View
          style={{
            flex: 1,
            padding: theme.spacing.md,
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
            alignItems: "center",
          }}
        >
          <IconSymbol name="doc.text" size={24} color={theme.colors.primary} />
          <ThemedText variant="h2" style={{ fontWeight: "700", marginTop: 4 }}>
            {notes.length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Notas
          </ThemedText>
        </View>
        <View
          style={{
            flex: 1,
            padding: theme.spacing.md,
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
            alignItems: "center",
          }}
        >
          <IconSymbol name="star.fill" size={24} color={theme.colors.warning} />
          <ThemedText variant="h2" style={{ fontWeight: "700", marginTop: 4 }}>
            {notes.filter((n) => n.is_favorite).length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Favoritas
          </ThemedText>
        </View>
        <View
          style={{
            flex: 1,
            padding: theme.spacing.md,
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
            alignItems: "center",
          }}
        >
          <IconSymbol name="book.closed" size={24} color={theme.colors.success} />
          <ThemedText variant="h2" style={{ fontWeight: "700", marginTop: 4 }}>
            {subjects.length}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Materias
          </ThemedText>
        </View>
      </View>

      {/* Tab Navigation */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 4,
          marginBottom: theme.spacing.lg,
        }}
      >
        {[
          { key: "todas", label: "Todas" },
          { key: "favoritas", label: "Favoritas" },
          { key: "materias", label: "Materias" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as TabType)}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: activeTab === tab.key ? theme.colors.background : "transparent",
              alignItems: "center",
            }}
          >
            <ThemedText
              variant="body"
              style={{
                fontWeight: activeTab === tab.key ? "600" : "500",
                color: activeTab === tab.key ? theme.colors.text : theme.colors.textMuted,
              }}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const renderSubjectItem = ({ item }: { item: SubjectGroup }) => (
    <TouchableOpacity
      onPress={() => handleSubjectPress(item.id)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View
          style={{
            width: 12,
            height: 40,
            borderRadius: 6,
            backgroundColor: item.color,
            marginRight: theme.spacing.md,
          }}
        />
        <View style={{ flex: 1 }}>
          <ThemedText variant="h3" style={{ fontWeight: "600", marginBottom: 2 }}>
            {item.name}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            {item.noteCount} notas
          </ThemedText>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleSubjectPress(item.id)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: theme.colors.background,
        }}
      >
        <ThemedText variant="caption" style={{ fontWeight: "500" }}>
          Ver todas
        </ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
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
          name={searchText.trim() || activeTab === "favoritas" ? "magnifyingglass" : "note.text"}
          size={48}
          color={theme.colors.textMuted}
        />
      </View>
      <ThemedText variant="h3" style={{ textAlign: "center", marginBottom: theme.spacing.xs, fontWeight: "600" }}>
        {searchText.trim() || activeTab === "favoritas" ? "Sin resultados" : "Sin notas"}
      </ThemedText>
      <ThemedText
        variant="body"
        color="secondary"
        style={{ textAlign: "center", lineHeight: 20, marginBottom: theme.spacing.lg }}
      >
        {searchText.trim() || activeTab === "favoritas"
          ? "Intenta con otros términos de búsqueda"
          : "Crea tu primera nota para comenzar"}
      </ThemedText>
      {!searchText.trim() && activeTab === "todas" && (
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

  const filteredNotes = getFilteredNotes()

  return (
    <SafeAreaView style={commonStyles.container}>
      <ThemedView variant="background" style={commonStyles.container}>
        {activeTab === "materias" ? (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={renderSubjectItem}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={refreshNotes} tintColor={theme.colors.primary} />
            }
          />
        ) : (
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
        )}
      </ThemedView>
    </SafeAreaView>
  )
}
