"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText } from "@/components/ui/ThemedComponents"
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
      theme.colors.secondary,
      theme.colors.accent,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.info,
    ]
    let hash = 0
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const subjectColor = getSubjectColor(className)
  const hasAttachments = note.attachments && note.attachments.length > 0

  return (
    <TouchableOpacity onPress={() => onPress(note)} activeOpacity={0.7} style={styles.container}>
      <ThemedCard variant="elevated" padding="medium" style={styles.card}>
        {/* Color indicator */}
        <View style={[styles.colorIndicator, { backgroundColor: subjectColor }]} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <ThemedText variant="h3" style={styles.title} numberOfLines={2}>
              {note.title}
            </ThemedText>

            {/* Subject */}
            <View style={styles.subjectContainer}>
              <View style={[styles.subjectDot, { backgroundColor: subjectColor }]} />
              <ThemedText variant="caption" color="secondary" numberOfLines={1} style={styles.subjectText}>
                {className}
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onFavoriteToggle} style={styles.favoriteButton}>
              <IconSymbol
                name={isFavorite ? "heart.fill" : "heart"}
                size={18}
                color={isFavorite ? theme.colors.error : theme.colors.textMuted}
              />
            </TouchableOpacity>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(note)}
                style={[styles.editButton, { backgroundColor: theme.colors.surface }]}
              >
                <IconSymbol name="pencil" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.surface }]}>
                <ThemedText variant="caption" style={styles.tagText}>
                  {tag}
                </ThemedText>
              </View>
            ))}
            {note.tags.length > 3 && (
              <View style={[styles.tag, { backgroundColor: theme.colors.surface }]}>
                <ThemedText variant="caption" style={styles.tagText}>
                  +{note.tags.length - 3}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.indicators}>
            {hasAttachments && (
              <View style={styles.indicator}>
                <IconSymbol name="paperclip" size={12} color={theme.colors.textMuted} />
                <ThemedText variant="caption" color="secondary" style={styles.indicatorText}>
                  {note.attachments!.length}
                </ThemedText>
              </View>
            )}
            {note.ai_summary && (
              <View style={styles.indicator}>
                <IconSymbol name="brain" size={12} color={theme.colors.accent} />
                <ThemedText variant="caption" style={{ color: theme.colors.accent, fontSize: 10 }}>
                  IA
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText variant="caption" color="secondary">
            {formatDate(note.updated_at)}
          </ThemedText>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    overflow: "hidden",
    position: "relative",
  },
  colorIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingTop: 4,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: 20,
  },
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  subjectText: {
    fontWeight: "600",
    fontSize: 11,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  favoriteButton: {
    padding: 4,
  },
  editButton: {
    padding: 6,
    borderRadius: 10,
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
    borderRadius: 10,
  },
  tagText: {
    fontWeight: "500",
    fontSize: 10,
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
