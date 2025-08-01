import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText } from "@/components/ui/ThemedComponents"
import type { ClassData } from "@/database/services/courseService"
import { useTheme } from "@/hooks/useTheme"
import { TouchableOpacity, View } from "react-native"

interface CoursesStatsProps {
  courses: ClassData[]
  activeFilter: 'all' | 'active' | 'inactive'
  onFilterChange?: (filter: 'all' | 'active' | 'inactive') => void
}

export default function CoursesStats({ courses, activeFilter, onFilterChange }: CoursesStatsProps) {
  const { theme } = useTheme()

  // Calcular estadísticas
  const totalCourses = courses.length
  const activeCourses = courses.filter(course => course.is_active)
  const inactiveCourses = courses.filter(course => !course.is_active)
  
  // Calcular créditos totales de cursos activos
  const totalCreditsActive = activeCourses.reduce((total, course) => {
    return total + (course.credits || 0)
  }, 0)

  const stats = [
    {
      icon: "book",
      value: totalCourses.toString(),
      label: "Total Clases",
      color: theme.colors.primary,
    },
    {
      icon: "graduationcap",
      value: totalCreditsActive.toString(),
      label: "Créditos Activos",
      color: theme.colors.success || "#4CAF50",
    },
  ]

  const handleFilterChange = (filter: 'all' | 'active' | 'inactive') => {
    onFilterChange?.(filter)
  }

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}
      >
        {stats.map((stat, index) => (
          <ThemedCard
            key={index}
            variant="elevated"
            padding="medium"
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: theme.spacing.lg,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${stat.color}15`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: theme.spacing.sm,
              }}
            >
              <IconSymbol name={stat.icon as any} size={24} color={stat.color} />
            </View>

            <ThemedText
              variant="h1"
              style={{
                fontSize: 32,
                fontWeight: "bold",
                marginBottom: theme.spacing.xs,
              }}
            >
              {stat.value}
            </ThemedText>

            <ThemedText variant="body" color="secondary">
              {stat.label}
            </ThemedText>
          </ThemedCard>
        ))}
      </View>

      {/* Filtro de cursos */}
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        <TouchableOpacity
          onPress={() => handleFilterChange('all')}
          style={{
            flex: 1,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.spacing.sm,
            backgroundColor: activeFilter === 'all' ? theme.colors.primary : `${theme.colors.primary}15`,
            alignItems: "center",
          }}
        >
          <ThemedText
            variant="body"
            style={{
              color: activeFilter === 'all' ? 'white' : theme.colors.primary,
              fontWeight: activeFilter === 'all' ? 'bold' : 'normal',
            }}
          >
            Todas ({totalCourses})
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilterChange('active')}
          style={{
            flex: 1,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.spacing.sm,
            backgroundColor: activeFilter === 'active' ? theme.colors.success : `${theme.colors.success}15`,
            alignItems: "center",
          }}
        >
          <ThemedText
            variant="body"
            style={{
              color: activeFilter === 'active' ? 'white' : theme.colors.success,
              fontWeight: activeFilter === 'active' ? 'bold' : 'normal',
            }}
          >
            Activas ({activeCourses.length})
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilterChange('inactive')}
          style={{
            flex: 1,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.spacing.sm,
            backgroundColor: activeFilter === 'inactive' ? theme.colors.warning : `${theme.colors.warning}15`,
            alignItems: "center",
          }}
        >
          <ThemedText
            variant="body"
            style={{
              color: activeFilter === 'inactive' ? 'white' : theme.colors.warning,
              fontWeight: activeFilter === 'inactive' ? 'bold' : 'normal',
            }}
          >
            Inactivas ({inactiveCourses.length})
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  )
}
