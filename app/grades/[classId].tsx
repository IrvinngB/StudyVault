"use client"

import React, { useEffect, useState } from "react"
import { FlatList, RefreshControl, Alert, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLocalSearchParams } from "expo-router"
import { ThemedView, ThemedText, ThemedButton } from "@/components/ui/ThemedComponents"

import AddCategoryForm from "@/components/grades/AddCategoryForm"
import CategoryCard from "@/components/grades/CategoryCard"
import GradeScaleSelector from "@/components/grades/GradeScaleSelector"
import { categoryService } from "@/database/services/categoryService"
import type { CategoryGradeData } from "@/database/services/categoryService"
import { useTheme } from "@/hooks/useTheme"

export default function GradesByCategoryScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>()
  const { theme } = useTheme()
  const [categories, setCategories] = useState<CategoryGradeData[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [defaultMaxScore, setDefaultMaxScore] = useState<number | null>(null)

  useEffect(() => {
    if (classId) {
      loadScale()
      loadCategories()
    }
  }, [classId])

  const loadScale = async () => {
    try {
      const key = `gradingScale:${classId}`
      const stored = await AsyncStorage.getItem(key)
      if (stored) setDefaultMaxScore(Number(stored))
    } catch (error) {
      console.error("❌ Error al cargar escala:", error)
    }
  }

  const loadCategories = async () => {
    if (!classId) return
    setLoading(true)
    try {
      const response = await categoryService.getCategoriesByClassId(classId)
      setCategories(response)
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudieron cargar las categorías")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCategories()
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
      <FlatList
        ListHeaderComponent={() => (
          <View style={{ marginBottom: theme.spacing.md }}>
            {!defaultMaxScore ? (
              <GradeScaleSelector classId={classId} onSelect={handleScaleSelect} />
            ) : !showForm ? (
              <ThemedButton
                title="Agregar nueva categoría"
                variant="primary"
                onPress={() => setShowForm(true)}
              />
            ) : (
              <AddCategoryForm
                classId={classId}
                onSuccess={handleNewCategory}
                onCancel={() => setShowForm(false)}
              />
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
          />
        )}

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
