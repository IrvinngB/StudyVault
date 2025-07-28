"use client"

import { ThemedButton, ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

interface TasksHeaderProps {
  onCreateTask: () => void
}

export function TasksHeader({ onCreateTask }: TasksHeaderProps) {
  const { theme } = useTheme()

  return (
    <ThemedView style={{ marginBottom: theme.spacing.lg }}>
      <ThemedView
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: theme.spacing.sm,
        }}
      >
        <ThemedView style={{ flex: 1 }}>
          <ThemedText variant="h1" style={{ fontSize: 32, fontWeight: "bold", marginBottom: 4 }}>
            Tareas
          </ThemedText>
          <ThemedText variant="body" color="primary" style={{ fontSize: 16 }}>
            Organiza tu trabajo académico
          </ThemedText>
        </ThemedView>

        <ThemedButton
          title="Nueva"
          variant="secondary"
          size="medium"
          onPress={() => {
            console.log("Botón Nueva presionado, navegando a /calendar")
            router.push("/calendar")
          }}
          icon={<Ionicons name="add" size={18} color="white" />}
          style={{
            paddingHorizontal: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
          }}
        />
      </ThemedView>
    </ThemedView>
  )
}
