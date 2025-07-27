"use client"

import { AppModal } from "@/components/ui/AppModal"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedCard, ThemedInput, ThemedText } from "@/components/ui/ThemedComponents"
import { classService, type CreateClassRequest } from "@/database/services/courseService"
import { useModal } from "@/hooks/modals"
import { useTheme } from "@/hooks/useTheme"
import { useState } from "react"
import { ScrollView, Switch, TouchableOpacity, View } from "react-native"

interface CourseFormProps {
  onSuccess?: (courseId: string) => void
}

export default function CourseForm({ onSuccess }: CourseFormProps) {
  const { theme } = useTheme()
  const { modalProps, showError, showSuccess } = useModal()

  // Estados del formulario
  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [instructor, setInstructor] = useState("")
  const [description, setDescription] = useState("")
  const [credits, setCredits] = useState("")
  const [semester, setSemester] = useState("")
  const [syllabusUrl, setSyllabusUrl] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [selectedColor, setSelectedColor] = useState(theme.colors.primary)
  const [loading, setLoading] = useState(false)

  // Colores predefinidos mejorados
  const colorOptions = [
    { color: "#2196F3", name: "Azul" },
    { color: "#4CAF50", name: "Verde" },
    { color: "#FF9800", name: "Naranja" },
    { color: "#9C27B0", name: "Púrpura" },
    { color: "#F44336", name: "Rojo" },
    { color: "#00BCD4", name: "Cian" },
    { color: "#795548", name: "Marrón" },
    { color: "#E91E63", name: "Rosa" },
    { color: "#607D8B", name: "Azul Gris" },
    { color: "#8BC34A", name: "Verde Claro" },
    { color: "#FFC107", name: "Ámbar" },
    { color: "#3F51B5", name: "Índigo" },
  ]

  const validateForm = (): boolean => {
    if (!courseName.trim()) {
      showError("El nombre del curso es obligatorio.", "Error de validación")
      return false
    }

    if (credits && credits.trim() && isNaN(Number(credits))) {
      showError("Los créditos deben ser un número válido.", "Error de validación")
      return false
    }

    if (syllabusUrl && syllabusUrl.trim()) {
      const urlToValidate = syllabusUrl.trim()
      const isValidUrl =
        urlToValidate.startsWith("http://") || urlToValidate.startsWith("https://") || urlToValidate.includes(".")

      if (!isValidUrl) {
        showError("La URL del aula virtual no es válida.", "Error de validación")
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      const courseData: CreateClassRequest = {
        name: courseName.trim(),
        code: courseCode.trim() || undefined,
        instructor: instructor.trim() || undefined,
        description: description.trim() || undefined,
        credits: credits && !isNaN(Number(credits)) ? Number(credits) : undefined,
        semester: semester.trim() || undefined,
        syllabus_url: syllabusUrl.trim() || undefined,
        color: selectedColor,
        is_active: isActive,
      }

      const newCourse = await classService.createClass(courseData)

      showSuccess(`"${courseName}" ha sido creado exitosamente.`, "✅ Curso Creado", () => {
        if (onSuccess && newCourse.id) {
          onSuccess(newCourse.id)
        }
      })

      // Limpiar formulario
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      showError(`No se pudo crear el curso: ${errorMessage}`, "Error")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCourseName("")
    setCourseCode("")
    setInstructor("")
    setDescription("")
    setCredits("")
    setSemester("")
    setSyllabusUrl("")
    setIsActive(true)
    setSelectedColor(theme.colors.primary)
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
          <View
            style={{
              width: 50,
              height: 50,
              backgroundColor: selectedColor,
              borderRadius: theme.borderRadius.lg,
              marginRight: theme.spacing.md,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ThemedText variant="h2" style={{ color: "white", fontWeight: "bold" }}>
              {courseName.charAt(0).toUpperCase() || "C"}
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="h1" style={{ color: theme.colors.primary }}>
              Nuevo Curso
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              Completa la información del curso
            </ThemedText>
          </View>
        </View>
      </ThemedCard>

      {/* Información Básica */}
      <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
          <IconSymbol name="doc.text" size={24} color={theme.colors.primary} />
          <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary }}>
            Información Básica
          </ThemedText>
        </View>

        <ThemedInput
          label="Nombre del Curso *"
          value={courseName}
          onChangeText={setCourseName}
          placeholder="Ej: Cálculo Diferencial"
          style={{ marginBottom: theme.spacing.md }}
        />

        <ThemedInput
          label="Código del Curso"
          value={courseCode}
          onChangeText={setCourseCode}
          placeholder="Ej: MAT101"
          style={{ marginBottom: theme.spacing.md }}
        />

        <ThemedInput
          label="Profesor/Instructor"
          value={instructor}
          onChangeText={setInstructor}
          placeholder="Ej: Dr. Juan Pérez"
          style={{ marginBottom: theme.spacing.md }}
        />

        <ThemedInput
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción breve del curso..."
          multiline
          numberOfLines={3}
        />
      </ThemedCard>

      {/* Detalles Académicos */}
      <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
          <IconSymbol name="graduationcap" size={24} color={theme.colors.primary} />
          <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary }}>
            Detalles Académicos
          </ThemedText>
        </View>

        <View style={{ flexDirection: "row", gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <View style={{ flex: 1 }}>
            <ThemedInput
              label="Créditos"
              value={credits}
              onChangeText={setCredits}
              placeholder="3"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 2 }}>
            <ThemedInput
              label="Semestre/Período"
              value={semester}
              onChangeText={setSemester}
              placeholder="2024-1, Otoño 2024"
            />
          </View>
        </View>

        <ThemedInput
          label="URL del Aula Virtual"
          value={syllabusUrl}
          onChangeText={setSyllabusUrl}
          placeholder="https://classroom.example.com"
          keyboardType="url"
          autoCapitalize="none"
          style={{ marginBottom: theme.spacing.md }}
        />

        {/* Estado Activo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <View style={{ flex: 1 }}>
            <ThemedText variant="body" style={{ fontWeight: "600" }}>
              Curso Activo
            </ThemedText>
            <ThemedText variant="caption" color="secondary">
              Los cursos inactivos no aparecerán en listas principales
            </ThemedText>
          </View>

          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + "40",
            }}
            thumbColor={isActive ? theme.colors.primary : theme.colors.secondary}
          />
        </View>
      </ThemedCard>

      {/* Selección de Color */}
      <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.md }}>
          <IconSymbol name="paintbrush" size={24} color={theme.colors.primary} />
          <ThemedText variant="h2" style={{ marginLeft: theme.spacing.sm, color: theme.colors.primary }}>
            Color del Curso
          </ThemedText>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          {colorOptions.map((option) => (
            <TouchableOpacity
              key={option.color}
              onPress={() => setSelectedColor(option.color)}
              style={{
                width: 50,
                height: 50,
                borderRadius: theme.borderRadius.md,
                backgroundColor: option.color,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: selectedColor === option.color ? 3 : 0,
                borderColor: theme.colors.primary,
                shadowColor: option.color,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {selectedColor === option.color && <IconSymbol name="checkmark" size={24} color="white" />}
            </TouchableOpacity>
          ))}
        </View>
      </ThemedCard>

      {/* Botones de Acción */}
      <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
        <ThemedButton
          title={loading ? "Creando curso..." : "Crear Curso"}
          variant="primary"
          size="large"
          onPress={handleSubmit}
          disabled={loading}
          icon={!loading ? <IconSymbol name="plus" size={18} color="white" /> : undefined}
        />

        <ThemedButton
          title="Limpiar Formulario"
          variant="outline"
          size="large"
          onPress={resetForm}
          disabled={loading}
        />
      </View>

      <AppModal {...modalProps} />
    </ScrollView>
  )
}
