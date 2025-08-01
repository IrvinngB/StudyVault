import CoursesHeader from "@/components/courses/CoursesHeader"
import CoursesStats from "@/components/courses/CoursesStats"
import EnhancedCourseCard from "@/components/courses/Improve"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { type ClassData, classService } from "@/database/services/courseService"
import { useCommonStyles, useTheme } from "@/hooks/useTheme"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function CoursesScreen() {
  const { theme } = useTheme()
  const commonStyles = useCommonStyles()
  const [courses, setCourses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('active')

  // Filtrar cursos según el filtro activo
  const filteredCourses = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return courses.filter(course => course.is_active)
      case 'inactive':
        return courses.filter(course => !course.is_active)
      default:
        return courses
    }
  }, [courses, activeFilter])

  // Recargar cursos cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      loadCourses()
    }, []),
  )

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const coursesData = await classService.getAllClasses()
      setCourses(coursesData)
    } catch (error) {
      console.error("❌ Error al cargar cursos:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setError(errorMessage)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadCourses()
    setRefreshing(false)
  }

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    setActiveFilter(filter)
  }

  const renderCourseItem = ({ item }: { item: ClassData }) => <EnhancedCourseCard course={item} />

  const renderEmptyState = () => {
    if (error) {
      return (
        <ThemedView
          variant="surface"
          style={{
            flex: 1,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            justifyContent: "center",
            alignItems: "center",
            marginTop: theme.spacing.lg,
          }}
        >
          <IconSymbol
            name="exclamationmark.triangle"
            size={48}
            color={theme.colors.error}
            style={{ marginBottom: theme.spacing.md }}
          />
          <ThemedText
            variant="h3"
            style={{
              color: theme.colors.error,
              marginBottom: theme.spacing.sm,
              textAlign: "center",
            }}
          >
            Error al cargar cursos
          </ThemedText>
          <ThemedText
            variant="body"
            color="secondary"
            style={{
              textAlign: "center",
              marginBottom: theme.spacing.md,
            }}
          >
            {error}
          </ThemedText>
        </ThemedView>
      )
    }

    // Estado vacío sin error
    return (
      <ThemedView
        variant="surface"
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          justifyContent: "center",
          alignItems: "center",
          marginTop: theme.spacing.lg,
        }}
      >
        <IconSymbol name="book" size={64} color={theme.colors.secondary} style={{ marginBottom: theme.spacing.lg }} />
        <ThemedText
          variant="h2"
          style={{
            marginBottom: theme.spacing.sm,
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          ¡Comienza tu organización!
        </ThemedText>
        <ThemedText
          variant="body"
          color="secondary"
          style={{
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Crea tu primer curso para empezar a gestionar tus tareas, notas y horarios de estudio.
        </ThemedText>
      </ThemedView>
    )
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <ThemedView variant="background" style={{ flex: 1 }}>
        {loading && courses.length === 0 ? (
          <ThemedView
            variant="background"
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <ThemedText variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
              Cargando cursos...
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseItem}
            keyExtractor={(item) => item.id || `${item.name}-${item.created_at}`}
            ListHeaderComponent={() => (
              <>
                <CoursesHeader />
                <CoursesStats 
                  courses={courses} 
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange} 
                />
              </>
            )}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
            />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: theme.spacing.lg,
              paddingBottom: theme.spacing.xxl,
              flexGrow: 1,
            }}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  )
}
