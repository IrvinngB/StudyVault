"use client"

import React, { useEffect, useState } from "react"
import { FlatList, RefreshControl, Alert } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { ThemedView, ThemedText } from "@/components/ui/ThemedComponents"

import AddCategoryForm from "@/components/grades/AddCategoryForm"
import CategoryCard from "@/components/grades/CategoryCard"
import { categoryService } from "@/database/services/categoryService"
import type { CategoryGradeData } from "@/database/services/categoryService"
import { useTheme } from "@/hooks/useTheme"

export default function GradesByCategoryScreen() {
  const { classId } = useLocalSearchParams<{ classId: string }>()
  const { theme } = useTheme()
  const [categories, setCategories] = useState<CategoryGradeData[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (classId) loadCategories()
  }, [classId])

  const loadCategories = async () => {
    if (!classId) return
    setLoading(true)
    try {
      console.log("🟡 GradesScreen: Cargando categorías para clase", classId)
      const response = await categoryService.getCategoriesByClassId(classId)
      console.log("✅ Categorías recibidas:", response.length)
      setCategories(response)
    } catch (error: any) {
      console.error("❌ Error cargando categorías", error)
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
          <AddCategoryForm
            classId={classId}
            onSuccess={handleNewCategory}
            onCancel={() => {}}
          />
        )}

        data={categories}
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
          !loading ? (
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
