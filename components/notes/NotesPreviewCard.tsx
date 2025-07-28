"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedText } from "@/components/ui/ThemedComponents"
import { classService } from "@/database/services/courseService"
import type { NoteData } from "@/database/services/notesService"
import { useTheme } from "@/hooks/useTheme"
import { useEffect, useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"

interface NoteCardProps {
  note: NoteData
  onPress: (note: NoteData) => void
  onEdit?: (note: NoteData) => void
  isFavorite: boolean
  onFavoriteToggle: () => void
  compact?: boolean
}

export default function NoteCard({
  note,
  onPress,
  onEdit,
  isFavorite,
  onFavoriteToggle,
  compact = false,
}: NoteCardProps) {
  const { theme } = useTheme()
  const [className, setClassName] = useState<string>("")

  useEffect(() => {
    const loadClassName = async () => {
      if (note.class_id) {
        try {
          const classData = await classService.getClassById(note.class_id)
          setClassName(classData?.name || "Sin materia")
        } catch {
          setClassName("Sin materia")
        }
      } else {
        setClassName("Sin materia")
      }
    }
    loadClassName()
  }, [note.class_id])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "Hoy"
      if (diffDays === 2) return "Ayer"
      if (diffDays <= 7) return `Hace ${diffDays - 1} días`

      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  const getSubjectColor = (subjectName: string) => {
    const colors = [
      theme.colors.primary,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.info,
      theme.colors.accent,
      theme.colors.secondary,
    ]
    let hash = 0
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const subjectColor = getSubjectColor(className)
  const hasAttachments = note.attachments && note.attachments.length > 0

  // Truncate content for preview
  const getPreviewContent = (content: string, maxLength = 120) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  return (
    <TouchableOpacity onPress={() => onPress(note)} activeOpacity={0.7} style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <View style={[styles.subjectDot, { backgroundColor: subjectColor }]} />
              <ThemedText variant="h3" style={styles.title} numberOfLines={1}>
                {note.title}
              </ThemedText>
              <TouchableOpacity onPress={onFavoriteToggle} style={styles.favoriteButton}>
                <IconSymbol
                  name={isFavorite ? "star.fill" : "star"}
                  size={20}
                  color={isFavorite ? theme.colors.warning : theme.colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            <ThemedText variant="caption" color="secondary" style={styles.subjectText}>
              {className}
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <IconSymbol name="ellipsis" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Content Preview */}
        <ThemedText
          variant="body"
          color="secondary"
          style={{ marginBottom: theme.spacing.md, lineHeight: 20 }}
          numberOfLines={2}
        >
          {getPreviewContent(note.content)}
        </ThemedText>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.background }]}>
                <ThemedText variant="caption" style={styles.tagText}>
                  {tag}
                </ThemedText>
              </View>
            ))}
            {note.tags.length > 3 && (
              <View style={[styles.tag, { backgroundColor: theme.colors.background }]}>
                <ThemedText variant="caption" style={styles.tagText}>
                  +{note.tags.length - 3}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText variant="caption" color="secondary">
            Actualizado {formatDate(note.updated_at)}
          </ThemedText>

          <View style={styles.indicators}>
            {hasAttachments && (
              <View style={styles.indicator}>
                <IconSymbol name="paperclip" size={14} color={theme.colors.textMuted} />
                <ThemedText variant="caption" color="secondary" style={styles.indicatorText}>
                  {note.attachments!.length}
                </ThemedText>
              </View>
            )}
            {note.ai_summary && (
              <View style={styles.indicator}>
                <IconSymbol name="brain" size={14} color={theme.colors.accent} />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  card: {
    overflow: "hidden",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: "600",
    fontSize: 18,
    flex: 1,
    marginLeft: 8,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subjectText: {
    fontWeight: "500",
    fontSize: 12,
    marginLeft: 16,
  },
  favoriteButton: {
    padding: 4,
    marginLeft: 8,
  },
  menuButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontWeight: "500",
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indicators: {
    flexDirection: "row",
    gap: 8,
  },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  indicatorText: {
    fontWeight: "500",
    fontSize: 10,
  },
})
