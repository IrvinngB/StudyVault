"use client"

import NoteCard from "@/components/notes/NotesPreviewCard"
import { AppModal } from "@/components/ui/AppModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { classService, type ClassData } from "@/database/services/courseService"
import type { NoteData, UpdateNoteRequest } from "@/database/services/notesService"
import { useModal } from "@/hooks/modals"
import { useNotes } from "@/hooks/useNotes"
import { useCommonStyles, useTheme } from "@/hooks/useTheme"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type TabType = "details" | "notes"

export default function UnifiedCourseScreen() {
  const { theme } = useTheme()
  const commonStyles = useCommonStyles()
  const { modalProps, showError, showSuccess, showConfirm, showInfo } = useModal()
  const { id } = useLocalSearchParams<{ id: string }>()

  // Course state
  const [course, setCourse] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Notes state
  const { notes, loading: notesLoading, refreshNotes, updateNote } = useNotes()
  const [searchText, setSearchText] = useState("")
  const [showSearch, setShowSearch] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>("details")

  const loadCourseDetails = useCallback(async () => {
    if (!id) {
      setError("ID del curso no válido")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const foundCourse = await classService.getClassById(id as string)

      if (!foundCourse) {
        setError("Curso no encontrado")
      } else {
        setCourse(foundCourse)
      }
    } catch (err: any) {
      console.error("Error al cargar detalles del curso:", err)
      setError(err.message || "Error al cargar los detalles del curso")
    } finally {
      setLoading(false)
    }
  }, [id])

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await Promise.all([loadCourseDetails(), refreshNotes()])
      }
      loadData()
    }, [loadCourseDetails, refreshNotes]),
  )

  // Course actions
  const handleEditCourse = () => {
    if (course?.id) {
      router.push(`/courses/edit/${course.id}` as any)
    } else {
      showError("No se puede editar este curso.", "Error")
    }
  }

  const handleDeleteCourse = () => {
    if (!course) return
    showConfirm(
      `¿Estás seguro de que quieres eliminar "${course.name}"?\n\nEsta acción no se puede deshacer.`,
      confirmDeleteCourse,
      undefined,
      "Eliminar Curso",
    )
  }

  const confirmDeleteCourse = async () => {
    if (!course?.id) return
    try {
      await classService.deleteClass(course.id)
      showSuccess(`"${course.name}" ha sido eliminado correctamente.`, "Curso Eliminado", () => router.back())
    } catch (err: any) {
      console.error("Error al eliminar curso:", err)
      showError("No se pudo eliminar el curso. Intenta de nuevo.", "Error")
    }
  }

  const handleOpenSyllabus = () => {
    if (!course?.syllabus_url) return
    let url = course.syllabus_url
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`
    }
    Linking.openURL(url).catch(() => {
      showError("No se pudo abrir el enlace. Verifica que sea válido.", "Error")
    })
  }

  // Notes actions
  const courseNotes = notes.filter((note) => {
    const noteClassId = String(note.class_id)
    const courseId = String(id)
    return noteClassId === courseId
  })

  const filteredNotes = searchText.trim()
    ? courseNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchText.toLowerCase()) ||
          note.content.toLowerCase().includes(searchText.toLowerCase()) ||
          (note.ai_summary && note.ai_summary.toLowerCase().includes(searchText.toLowerCase())) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase())),
      )
    : courseNotes

  const handleNotePress = useCallback(
    (note: NoteData) => {
      router.push(`/notes/view/${note.id}`)
    },
    [],
  )

  const handleEditNote = useCallback(
    (note: NoteData) => {
      router.push(`/notes/${note.id}`)
    },
    [],
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  // Loading state
  if (loading && !course) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <ThemedView variant="background" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
            Cargando información del curso...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    )
  }

  // Error state
  if (error || !course) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <ThemedView
          variant="background"
          style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.lg }}
        >
          <IconSymbol
            name="xmark.circle"
            size={48}
            color={theme.colors.error}
            style={{ marginBottom: theme.spacing.md }}
          />
          <ThemedText
            variant="h3"
            style={{ color: theme.colors.error, marginBottom: theme.spacing.sm, textAlign: "center" }}
          >
            {error || "Curso no encontrado"}
          </ThemedText>
          <ThemedButton title="Volver" variant="outline" onPress={() => router.back()} />
        </ThemedView>
      </SafeAreaView>
    )
  }

  const renderTabBar = () => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: 4,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          backgroundColor: activeTab === "details" ? theme.colors.primary : "transparent",
          alignItems: "center",
        }}
        onPress={() => setActiveTab("details")}
      >
        <ThemedText
          variant="body"
          style={{
            color: activeTab === "details" ? "white" : theme.colors.text,
            fontWeight: activeTab === "details" ? "600" : "400",
          }}
        >
          Información
        </ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          backgroundColor: activeTab === "notes" ? theme.colors.primary : "transparent",
          alignItems: "center",
        }}
        onPress={() => setActiveTab("notes")}
      >
        <ThemedText
          variant="body"
          style={{
            color: activeTab === "notes" ? "white" : theme.colors.text,
            fontWeight: activeTab === "notes" ? "600" : "400",
          }}
        >
          Notas ({courseNotes.length})
        </ThemedText>
      </TouchableOpacity>
    </View>
  )

  const renderCourseHeader = () => (
    <ThemedCard
      variant="elevated"
      padding="large"
      style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
        <View
          style={{
            width: 60,
            height: 60,
            backgroundColor: course.color || theme.colors.primary,
            borderRadius: theme.borderRadius.lg,
            marginRight: theme.spacing.md,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: course.color || theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <ThemedText
            variant="h1"
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: 24,
            }}
          >
            {course.name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText variant="h1" style={{ color: theme.colors.primary, marginBottom: theme.spacing.xs }}>
            {course.name}
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: course.is_active ? theme.colors.success : theme.colors.warning,
                marginRight: theme.spacing.xs,
              }}
            />
            <ThemedText variant="bodySmall" style={{ color: theme.colors.secondary }}>
              {course.is_active ? "Activo" : "Inactivo"}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Course metadata */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
        {course.code && (
          <View
            style={{
              backgroundColor: theme.colors.surfaceLight || `${theme.colors.primary}20`,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <IconSymbol name="doc.text" size={16} color={theme.colors.primary} />
            <ThemedText variant="bodySmall" style={{ color: theme.colors.primary, marginLeft: 4 }}>
              {course.code}
            </ThemedText>
          </View>
        )}
        {course.semester && (
          <View
            style={{
              backgroundColor: theme.colors.surfaceLight || `${theme.colors.secondary}20`,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <IconSymbol name="calendar" size={16} color={theme.colors.secondary} />
            <ThemedText variant="bodySmall" style={{ color: theme.colors.secondary, marginLeft: 4 }}>
              {course.semester}
            </ThemedText>
          </View>
        )}
        {course.credits && (
          <View
            style={{
              backgroundColor: theme.colors.surfaceLight || `${theme.colors.accent}20`,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <IconSymbol name="star" size={16} color={theme.colors.accent} />
            <ThemedText variant="bodySmall" style={{ color: theme.colors.accent, marginLeft: 4 }}>
              {course.credits} créditos
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedCard>
  )

  const renderDetailsContent = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
      {/* Course Information */}
      <ThemedCard
        variant="elevated"
        padding="large"
        style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
          <IconSymbol name="doc.text.fill" size={24} color={theme.colors.primary} />
          <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary }}>
            Información del Curso
          </ThemedText>
        </View>

        {/* Instructor */}
        {course.instructor && (
          <View style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
              <IconSymbol name="person.crop.circle" size={20} color={theme.colors.primary} />
              <ThemedText variant="h3" style={{ marginLeft: theme.spacing.xs, fontWeight: "600" }}>
                Profesor
              </ThemedText>
            </View>
            <ThemedText variant="body" style={{ color: theme.colors.text, marginLeft: 28 }}>
              {course.instructor}
            </ThemedText>
          </View>
        )}

        {/* Description */}
        {course.description && (
          <View style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
              <IconSymbol name="note.text" size={20} color={theme.colors.primary} />
              <ThemedText variant="h3" style={{ marginLeft: theme.spacing.xs, fontWeight: "600" }}>
                Descripción
              </ThemedText>
            </View>
            <ThemedText variant="body" style={{ color: theme.colors.text, marginLeft: 28, lineHeight: 22 }}>
              {course.description}
            </ThemedText>
          </View>
        )}

        {/* Syllabus/Virtual Classroom */}
        {course.syllabus_url && (
          <View style={{ marginBottom: theme.spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.xs }}>
              <IconSymbol name="arrow.right" size={20} color={theme.colors.primary} />
              <ThemedText variant="h3" style={{ marginLeft: theme.spacing.xs, fontWeight: "600" }}>
                Aula Virtual
              </ThemedText>
            </View>
            <TouchableOpacity
              onPress={handleOpenSyllabus}
              style={{
                backgroundColor: theme.colors.surfaceLight || `${theme.colors.primary}10`,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.sm,
                marginLeft: 28,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <ThemedText variant="body" style={{ color: theme.colors.primary, flex: 1 }}>
                {course.syllabus_url}
              </ThemedText>
              <IconSymbol name="arrow.right" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Metadata */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingTop: theme.spacing.md,
            gap: theme.spacing.xs,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconSymbol name="calendar" size={16} color={theme.colors.secondary} />
            <ThemedText variant="bodySmall" style={{ color: theme.colors.secondary, marginLeft: theme.spacing.xs }}>
              Creado: {formatDate(course.created_at)}
            </ThemedText>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconSymbol name="arrow.clockwise" size={16} color={theme.colors.secondary} />
            <ThemedText variant="bodySmall" style={{ color: theme.colors.secondary, marginLeft: theme.spacing.xs }}>
              Actualizado: {formatDate(course.updated_at)}
            </ThemedText>
          </View>
        </View>
      </ThemedCard>

      {/* Quick Actions */}
      <ThemedCard
        variant="elevated"
        padding="large"
        style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.lg }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
          <IconSymbol name="bolt" size={24} color={theme.colors.secondary} />
          <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary }}>
            Acciones Rápidas
          </ThemedText>
        </View>
        <View style={{ gap: theme.spacing.sm }}>
          <ThemedButton
            title="Ver Tareas"
            variant="outline"
            onPress={() => {
              showInfo("La gestión de tareas estará disponible pronto.", "Próximamente")
            }}
          />
          <ThemedButton
            title="Ver Calificaciones"
            variant="outline"
            onPress={() => {
              if (course?.id) {
                router.push({
                  pathname: "/grades/[classId]",
                  params: { classId: course.id },
                })
              } else {
                showError("No se puede navegar: el curso no tiene un ID válido.", "Error")
              }
            }}
          />
        </View>
      </ThemedCard>

      {/* Management Actions */}
      <ThemedCard variant="elevated" padding="large" style={{ marginHorizontal: theme.spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
          <IconSymbol name="gear" size={24} color={theme.colors.accent} />
          <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary }}>
            Gestión del Curso
          </ThemedText>
        </View>
        <View style={{ gap: theme.spacing.sm }}>
          <ThemedButton title="Editar Curso" variant="secondary" onPress={handleEditCourse} />
          <ThemedButton title="Eliminar Curso" variant="error" onPress={handleDeleteCourse} />
        </View>
      </ThemedCard>
    </ScrollView>
  )

  const renderNotesContent = () => {
    const renderNotesHeader = () => (
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.md }}>
        {/* Actions */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.surface,
            }}
          >
            <IconSymbol name="magnifyingglass" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <ThemedButton
            title="Nueva Nota"
            variant="primary"
            icon={<IconSymbol name="plus" size={18} color="white" />}
            onPress={() => {
              router.push({
                pathname: "/notes/create",
                params: { classId: id },
              })
            }}
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
              placeholder="Buscar en las notas de esta materia..."
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

        {/* Search Results Info */}
        {searchText.trim() && (
          <View style={{ marginBottom: theme.spacing.sm }}>
            <ThemedText variant="caption" color="secondary">
              {filteredNotes.length} resultado{filteredNotes.length !== 1 ? "s" : ""} para &quot;{searchText}&quot;
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
            name={searchText.trim() ? "magnifyingglass" : "note.text"}
            size={48}
            color={theme.colors.textMuted}
          />
        </View>
        <ThemedText variant="h3" style={{ textAlign: "center", marginBottom: theme.spacing.xs, fontWeight: "600" }}>
          {searchText.trim() ? "Sin resultados" : "Sin notas en esta materia"}
        </ThemedText>
        <ThemedText
          variant="body"
          color="secondary"
          style={{ textAlign: "center", lineHeight: 20, marginBottom: theme.spacing.lg }}
        >
          {searchText.trim() ? "Intenta con otros términos de búsqueda" : "Crea tu primera nota para esta materia"}
        </ThemedText>
        {!searchText.trim() && (
          <ThemedButton
            title="Crear Primera Nota"
            variant="primary"
            icon={<IconSymbol name="plus" size={18} color="white" />}
            onPress={() => {
              router.push({
                pathname: "/notes/create",
                params: { classId: id },
              })
            }}
            style={{ alignSelf: "stretch", paddingVertical: theme.spacing.md }}
          />
        )}
      </View>
    )

    return (
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderNotesHeader}
        renderItem={({ item: note }) => (
          <NoteCard
            note={note}
            onPress={handleNotePress}
            onEdit={handleEditNote}
            isFavorite={note.is_favorite}
            onFavoriteToggle={() => handleFavoriteToggle(note.id)}
            compact={true}
          />
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          { paddingHorizontal: theme.spacing.md, paddingBottom: 100 },
          filteredNotes.length === 0 && { flex: 1 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={notesLoading} onRefresh={refreshNotes} tintColor={theme.colors.primary} />
        }
      />
    )
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ThemedView variant="background" style={{ flex: 1 }}>
        {/* Course Header - Always visible */}
        <View style={{ paddingTop: theme.spacing.md }}>
          {renderCourseHeader()}
          {renderTabBar()}
        </View>

        {/* Content based on active tab */}
        {activeTab === "details" ? renderDetailsContent() : renderNotesContent()}

        <AppModal {...modalProps} />
      </ThemedView>
    </SafeAreaView>
  )
}