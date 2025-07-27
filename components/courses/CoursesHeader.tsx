"use client"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedButton, ThemedText } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { router } from "expo-router"
import { View } from "react-native"

export default function CoursesHeader() {
  const { theme } = useTheme()

  const handleCreateCourse = () => {
    router.push("/courses/create")
  }

  return (
    <View style={{ marginBottom: theme.spacing.xl }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <ThemedText variant="h1" style={{ marginBottom: theme.spacing.xs }}>
            Mis Clases
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Gestiona tus asignaturas
          </ThemedText>
        </View>

        <ThemedButton
          title="Agregar"
          variant="primary"
          size="medium"
          icon={<IconSymbol name="plus" size={18} color="white" />}
          onPress={handleCreateCourse}
          style={{
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
          }}
        />
      </View>
    </View>
  )
}
