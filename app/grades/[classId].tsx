"use client"

import React, { useEffect, useState } from "react"
import { FlatList, RefreshControl, Alert, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLocalSearchParams } from "expo-router"
import { ThemedView, ThemedText, ThemedButton, ThemedCard } from "@/components/ui/ThemedComponents"

import AddCategoryForm from "@/components/grades/Forms/AddCategoryForm"
import CategoryCard from "@/components/grades/Cards/CategoryCard"
import GradeScaleSelector from "@/components/grades/GradeScaleSelector"
import CourseHeaderCard from "@/components/grades/Cards/CourseHeaderCard"
import GradeSummaryCard from "@/components/grades/Cards/GradeSummaryCard"

import { classService } from "@/database/services/courseService"
import { gradesService } from "@/database/services/gradesService"
import { categoryService } from "@/database/services/categoryService"
import type { CategoryGradeData } from "@/database/services/categoryService"
import type { GradeData } from "@/database/services/gradesService"
import { calculateWeightedGrade } from "@/utils/calculateGrade"
import { useTheme } from "@/hooks/useTheme"

export default function GradesByCategoryScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>()
  const { theme } = useTheme()

  const [categories, setCategories] = useState<CategoryGradeData[]>([])
  const [evaluaciones, setEvaluaciones] = useState<GradeData[]>([])
  const [defaultMaxScore, setDefaultMaxScore] = useState<number | null>(null)
  const [notaActual, setNotaActual] = useState(0)
  const [cursoInfo, setCursoInfo] = useState({
    nombre: '',
    codigo: '',
    creditos: 0
  })

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
      setNotaActual(promedio)
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
                  </ThemedCard>
                )}

                {!showForm ? (
                  mostrarBoton && (
                    <ThemedButton
                      title="Agregar nueva categoría"
                      variant="primary"
                      onPress={() => setShowForm(true)}
                    />
                  )
                ) : (
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
    </ThemedView>
  )
}
