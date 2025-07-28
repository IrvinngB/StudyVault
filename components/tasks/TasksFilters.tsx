"use client"

import { ThemedButton, ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { TextInput } from "react-native"

type FilterType = "all" | "pending" | "completed" | "in_progress" | "overdue"
type SortType = "due_date" | "priority" | "class" | "completion"

interface TasksFiltersProps {
  activeFilter: FilterType
  sortBy: SortType
  searchText: string
  onFilterChange: (filter: FilterType) => void
  onSortChange: (sort: SortType) => void
  onSearchChange: (text: string) => void
}

export function TasksFilters({
  activeFilter,
  sortBy,
  searchText,
  onFilterChange,
  onSortChange,
  onSearchChange,
}: TasksFiltersProps) {
  const { theme } = useTheme()

  const filterOptions = [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Pendientes" },
    { key: "completed", label: "Completadas" },
    { key: "overdue", label: "Atrasadas" },
  ] as const

  return (
    <ThemedView style={{ marginBottom: theme.spacing.lg }}>
      {/* Search Input */}
      <TextInput
        placeholder="Buscar tareas..."
        value={searchText}
        onChangeText={onSearchChange}
        style={{
          backgroundColor: theme.colors.surfaceLight,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.sm,
          marginBottom: theme.spacing.md,
          color: theme.colors.text,
        }}
        placeholderTextColor={theme.colors.textMuted}
      />

      {/* Filter Buttons */}
      <ThemedView
        style={{
          flexDirection: "row",
          gap: theme.spacing.xs,
          flexWrap: "wrap",
        }}
      >
        {filterOptions.map((filter) => (
          <ThemedButton
            key={filter.key}
            title={filter.label}
            variant={activeFilter === filter.key ? "primary" : "outline"}
            size="small"
            onPress={() => onFilterChange(filter.key as FilterType)}
          />
        ))}
      </ThemedView>
    </ThemedView>
  )
}
