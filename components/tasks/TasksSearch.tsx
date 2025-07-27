"use client"

import { ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { Ionicons } from "@expo/vector-icons"
import { TextInput, TouchableOpacity } from "react-native"

interface TasksSearchProps {
  searchText: string
  onSearchChange: (text: string) => void
  onFilterPress: () => void
}

export function TasksSearch({ searchText, onSearchChange, onFilterPress }: TasksSearchProps) {
  const { theme } = useTheme()

  return (
    <ThemedView
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.sm,
      }}
    >
      <ThemedView
        variant="surface"
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Ionicons name="search" size={20} color={theme.colors.primary} style={{ marginRight: theme.spacing.sm }} />
        <TextInput
          placeholder="Buscar tareas..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchText}
          onChangeText={onSearchChange}
          style={{
            flex: 1,
            fontSize: 16,
            color: theme.colors.text,
          }}
        />
      </ThemedView>

      <TouchableOpacity
        onPress={onFilterPress}
        style={{
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}
      >
        <Ionicons name="filter" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </ThemedView>
  )
}
