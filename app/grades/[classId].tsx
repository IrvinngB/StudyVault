"use client"

import { ThemedButton, ThemedCard, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import { Alert, FlatList, RefreshControl, View } from "react-native"

import CategoryCard from "@/components/grades/Cards/CategoryCard"
import CourseHeaderCard from "@/components/grades/Cards/CourseHeaderCard"
import GradeSummaryCard from "@/components/grades/Cards/GradeSummaryCard"
import { CategoryManagerModal } from "@/components/grades/CategoryManagerModal"
import AddCategoryForm from "@/components/grades/Forms/AddCategoryForm"
import GradeScaleSelector from "@/components/grades/GradeScaleSelector"

import type { CategoryGradeData } from "@/database/services/categoryService"
import { categoryService } from "@/database/services/categoryService"
import { classService } from "@/database/services/courseService"
import type { GradeData } from "@/database/services/gradesService"
import { gradesService } from "@/database/services/gradesService"
import { useTheme } from "@/hooks/useTheme"
import { calculateFinalGrade, calculateWeightedGrade } from "@/utils/calculateGrade"

export default function GradesByCategoryScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>()
  const { theme } = useTheme()

  const [categories, setCategories] = useState<CategoryGradeData[]>([])
  const [evaluaciones, setEvaluaciones] = useState<GradeData[]>([])
  const [defaultMaxScore, setDefaultMaxScore] = useState<number | null>(null)
  const [notaActual, setNotaActual] = useState(0)
  const [notaFinal, setNotaFinal] = useState(0)
  const [cursoInfo, setCursoInfo] = useState({
    nombre: '',
    codigo: '',
    creditos: 0
  })

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)

  useEffect(() => {
    if (classId) loadScale()
  }, [classId])

  useEffect(() => {
    if (classId && defaultMaxScore !== null) {
      loadAllData()
    }
  }, [classId, defaultMaxScore])

  const loadScale = async () => {
    try {
      const key = `gradingScale:${classId}`
      const stored = await AsyncStorage.getItem(key)
      if (stored) setDefaultMaxScore(Number(stored))
    } catch (error) {
      console.error("❌ Error al cargar escala:", error)
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [grades, cats, clase] = await Promise.all([
        gradesService.getGrades(classId),
        categoryService.getCategoriesByClassId(classId),
        classService.getClassById(classId)
      ])

      setEvaluaciones(grades)
      setCategories(cats)

      setCursoInfo({
        nombre: clase.name,
        codigo: clase.code ?? '',
        creditos: clase.credits ?? 0
      })

      const promedio = calculateWeightedGrade(grades, cats, defaultMaxScore!)
      const notaFinalCalculada = calculateFinalGrade(grades, cats, defaultMaxScore!)
      setNotaActual(promedio)
      setNotaFinal(notaFinalCalculada)
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la información del curso")
      console.error("❌ Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const handleNewCategory = (cat: CategoryGradeData) => {
    setCategories(prev => [...prev, cat])
    setShowForm(false)
  }

  const handleCategoriesUpdated = (updatedCategories: CategoryGradeData[]) => {
    setCategories(updatedCategories)
    // Recalcular promedio con las nuevas categorías
    const promedio = calculateWeightedGrade(evaluaciones, updatedCategories, defaultMaxScore!)
    const notaFinalCalculada = calculateFinalGrade(evaluaciones, updatedCategories, defaultMaxScore!)
    setNotaActual(promedio)
    setNotaFinal(notaFinalCalculada)
  }

  const handleScaleSelect = async (scale: number) => {
    try {
      const key = `gradingScale:${classId}`
      await AsyncStorage.setItem(key, String(scale))
      setDefaultMaxScore(scale)
    } catch (error) {
      console.error("❌ No se pudo guardar la escala:", error)
      Alert.alert("Error", "No se pudo guardar la escala seleccionada")
    }
  }

  const porcentajeActual = categories.reduce((acc, cat) => acc + cat.percentage, 0)
  const mostrarBoton = defaultMaxScore !== null && (defaultMaxScore !== 100 || porcentajeActual < 100)
  const porcentajeDisponible = defaultMaxScore === 100 ? 100 - porcentajeActual : null

  // ✅ Preparar resumen para GradeSummaryCard
  const resumenCategorias =
    defaultMaxScore === 100
      ? categories.map(cat => ({
          nombre: cat.name,
          porcentaje: cat.percentage,
          evaluaciones: evaluaciones
            .filter(ev => ev.category_id === cat.id)
            .map(ev => ({
              nota: ev.score,
              notaMaxima: ev.max_score
            }))
        }))
      : []

  if (!classId) {
    return (
      <ThemedView
        variant="background"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText variant="h3">ID de curso inválido</ThemedText>
      </ThemedView>
    )
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      {defaultMaxScore !== null && (
        <CourseHeaderCard
          nombre={cursoInfo.nombre}
          codigo={cursoInfo.codigo}
          creditos={cursoInfo.creditos}
          escala={defaultMaxScore}
          notaActual={notaActual}
          notaFinal={notaFinal}
        />
      )}

      <FlatList
        ListHeaderComponent={() => (
          <View style={{ marginBottom: theme.spacing.md }}>
            {!defaultMaxScore ? (
              <GradeScaleSelector classId={classId} onSelect={handleScaleSelect} />
            ) : (
              <>
                {porcentajeDisponible !== null && porcentajeDisponible > 0 && (
                  <ThemedCard variant="outlined" padding="medium" style={{ marginBottom: theme.spacing.sm }}>
                    <ThemedText variant="body">
                      Te queda {porcentajeDisponible}% por asignar en categorías.
                    </ThemedText>
                    <ThemedText variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                      • Nota actual: Basada en evaluaciones entregadas
                    </ThemedText>
                    <ThemedText variant="bodySmall" color="secondary">
                      • Nota final: Si no entregas nada más (asume 0 en faltantes)
                    </ThemedText>
                  </ThemedCard>
                )}

                {porcentajeDisponible === 0 && (
                  <ThemedCard variant="outlined" padding="medium" style={{ marginBottom: theme.spacing.sm }}>
                    <ThemedText variant="bodySmall" color="secondary">
                      • Nota actual: Basada en evaluaciones entregadas
                    </ThemedText>
                    <ThemedText variant="bodySmall" color="secondary">
                      • Nota final: Si no entregas nada más (asume 0 en faltantes)
                    </ThemedText>
                  </ThemedCard>
                )}

                <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                  <ThemedButton
                    title="Gestión Inteligente"
                    variant="primary"
                    onPress={() => setShowCategoryManager(true)}
                    style={{ flex: 1 }}
                  />
                  {mostrarBoton && (
                    <ThemedButton
                      title="Nueva Categoría"
                      variant="outline"
                      onPress={() => setShowForm(true)}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>

                {showForm && (
                  <AddCategoryForm
                    classId={classId}
                    onSuccess={handleNewCategory}
                    onCancel={() => setShowForm(false)}
                    porcentajeActual={porcentajeActual}
                  />
                )}
              </>
            )}
          </View>
        )}

        data={defaultMaxScore ? categories : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            classId={classId}
            categoryId={item.id}
            nombre={item.name}
            porcentaje={item.percentage}
            onUpdate={loadAllData}
          />
        )}

        ListFooterComponent={() =>
          defaultMaxScore === 100 && (
            <GradeSummaryCard categorias={resumenCategorias} escala={defaultMaxScore} />
          )
        }

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }

        ListEmptyComponent={() =>
          !loading && defaultMaxScore ? (
            <ThemedView style={{ padding: 16 }}>
              <ThemedText variant="bodySmall">
                No hay categorías. Agrega una para comenzar.
              </ThemedText>
            </ThemedView>
          ) : null
        }

        contentContainerStyle={{ padding: 16 }}
      />

      {/* Modal de gestión inteligente de categorías */}
      <CategoryManagerModal
        visible={showCategoryManager}
        classId={classId}
        onClose={() => setShowCategoryManager(false)}
        onCategoriesUpdated={handleCategoriesUpdated}
      />
    </ThemedView>
  )
}
