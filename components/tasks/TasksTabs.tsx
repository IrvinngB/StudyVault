"use client"

import { ThemedText, ThemedView } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { TouchableOpacity } from "react-native"

interface TasksTabsProps {
  activeTab: "tasks" | "exams"
  onTabChange: (tab: "tasks" | "exams") => void
}

export function TasksTabs({ activeTab, onTabChange }: TasksTabsProps) {
  const { theme } = useTheme()

  return (
    <ThemedView
      style={{
        flexDirection: "row",
        marginBottom: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <TouchableOpacity
        onPress={() => onTabChange("tasks")}
        style={{
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          backgroundColor: activeTab === "tasks" ? theme.colors.background : "transparent",
          ...(activeTab === "tasks" ? theme.shadows.small : {}),
        }}
      >
        <ThemedText
          variant="body"
          style={{
            textAlign: "center",
            fontWeight: activeTab === "tasks" ? "600" : "normal",
            color: activeTab === "tasks" ? theme.colors.text : theme.colors.textMuted,
          }}
        >
          Tareas
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onTabChange("exams")}
        style={{
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          backgroundColor: activeTab === "exams" ? theme.colors.background : "transparent",
          ...(activeTab === "exams" ? theme.shadows.small : {}),
        }}
      >
        <ThemedText
          variant="body"
          style={{
            textAlign: "center",
            fontWeight: activeTab === "exams" ? "600" : "normal",
            color: activeTab === "exams" ? theme.colors.text : theme.colors.textMuted,
          }}
        >
          Exámenes
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}
