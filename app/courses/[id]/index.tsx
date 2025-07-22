"use client"

import { AppModal } from "@/components/ui/AppModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { type ClassData, classService } from "@/database/services/courseService"
import { useModal } from "@/hooks/modals"
import { useTheme } from "@/hooks/useTheme"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Linking, ScrollView, TouchableOpacity, View } from "react-native"

export default function CourseDetailScreen() {
  const { theme } = useTheme()
  const { modalProps, showError, showSuccess, showConfirm, showInfo } = useModal()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [course, setCourse] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadCourseDetails()
    }
  }, [id])

  const loadCourseDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const foundCourse = await classService.getClassById(id as string)
      setCourse(foundCourse)
    } catch (error) {
      console.error("Error al cargar detalles del curso:", error)
      setError("Error al cargar los detalles del curso")
    } finally {
      setLoading(false)
    }
  }

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
    } catch (error) {
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

  if (loading) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
          Cargando detalles del curso...
        </ThemedText>
      </ThemedView>
    )
  }

  if (error || !course) {
    return (
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
    )
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
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

        {/* Course Information */}
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
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
        <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
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
            <ThemedButton
              title="Notas del Curso"
              variant="outline"
              onPress={() => {
                showInfo("La gestión de notas estará disponible pronto.", "Próximamente")
              }}
            />
          </View>
        </ThemedCard>

        {/* Management Actions */}
        <ThemedCard variant="elevated" padding="large">
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
      <AppModal {...modalProps} />
    </ThemedView>
  )
}
