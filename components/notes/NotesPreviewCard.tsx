"use client"

import { IconSymbol } from "@/components/ui/IconSymbol"
import { ThemedCard, ThemedText } from "@/components/ui/ThemedComponents"
import { useTheme } from "@/hooks/useTheme"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import type { NoteData } from "../../database/services/notesService"

interface NotePreviewCardProps {
  note: NoteData
  onPress: (note: NoteData) => void
  isFavorite: boolean
  onFavoriteToggle: () => void
  className: string
}

export default function NotePreviewCard({
  note,
  onPress,
  isFavorite,
  onFavoriteToggle,
  className,
}: NotePreviewCardProps) {
  const { theme } = useTheme()

  // Función para obtener un icono emoji basado en el contenido o título de la nota
  const getNoteEmoji = (title: string, content: string, tags: string[]) => {
    const text = (title + " " + content + " " + tags.join(" ")).toLowerCase()
    
    // Buscar palabras clave y asignar emojis apropiados
    if (text.includes("matemática") || text.includes("algebra") || text.includes("cálculo") || text.includes("números")) return "🔢"
    if (text.includes("literatura") || text.includes("poesía") || text.includes("novela") || text.includes("libro")) return "📚"
    if (text.includes("historia") || text.includes("antiguo") || text.includes("fecha") || text.includes("guerra")) return "📜"
    if (text.includes("ciencia") || text.includes("física") || text.includes("química") || text.includes("experimento")) return "🔬"
    if (text.includes("biología") || text.includes("célula") || text.includes("dna") || text.includes("organismo")) return "🧬"
    if (text.includes("geografía") || text.includes("mapa") || text.includes("país") || text.includes("continente")) return "🌍"
    if (text.includes("arte") || text.includes("pintura") || text.includes("dibujo") || text.includes("creativo")) return "🎨"
    if (text.includes("música") || text.includes("canción") || text.includes("nota musical") || text.includes("instrumento")) return "🎵"
    if (text.includes("deporte") || text.includes("ejercicio") || text.includes("físico") || text.includes("entrenamiento")) return "⚽"
    if (text.includes("idioma") || text.includes("inglés") || text.includes("francés") || text.includes("español")) return "🗣️"
    if (text.includes("tecnología") || text.includes("computadora") || text.includes("programación") || text.includes("código")) return "💻"
    if (text.includes("economía") || text.includes("dinero") || text.includes("mercado") || text.includes("finanzas")) return "💰"
    if (text.includes("psicología") || text.includes("mente") || text.includes("comportamiento") || text.includes("emociones")) return "🧠"
    if (text.includes("filosofía") || text.includes("pensamiento") || text.includes("reflexión") || text.includes("idea")) return "🤔"
    if (text.includes("examen") || text.includes("test") || text.includes("evaluación") || text.includes("prueba")) return "📝"
    if (text.includes("importante") || text.includes("clave") || text.includes("crucial") || text.includes("fundamental")) return "🔑"
    if (text.includes("idea") || text.includes("concepto") || text.includes("innovación") || text.includes("creativo")) return "💡"
    
    // Por defecto
    return "📋"
  }

  // Función para obtener un fragmento del contenido de la nota
  const getExcerpt = (text: string, maxLength = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Función para obtener color de la materia basado en el hash del nombre
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

  const subjectColor = getSubjectColor(className || "Sin materia")

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "Hoy"
      if (diffDays === 2) return "Ayer"
      if (diffDays <= 7) return `Hace ${diffDays - 1} días`
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    } catch {
      return "Fecha no disponible"
    }
  }

  const handleFavoritePress = (event: any) => {
    event.stopPropagation()
    onFavoriteToggle()
  }

  const handleCardPress = () => {
    onPress(note)
  }

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.7} style={styles.cardContainer}>
      <ThemedCard variant="elevated" padding="none" style={styles.card}>
        {/* Header con indicador de color de materia */}
        <View style={[styles.colorIndicator, { backgroundColor: subjectColor }]} />

        <View style={styles.cardContent}>
          {/* Header con emoji, título y botón de favorito */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <View style={styles.emojiContainer}>
                  <ThemedText style={styles.noteEmoji}>
                    {getNoteEmoji(note.title, note.content, note.tags || [])}
                  </ThemedText>
                </View>
                <ThemedText variant="h3" numberOfLines={2} ellipsizeMode="tail" style={styles.titleText}>
                  {note.title}
                </ThemedText>
              </View>
              {note.tags && note.tags.length > 0 && (
                <View style={styles.tagsPreview}>
                  <IconSymbol name="tag" size={12} color={theme.colors.textMuted} />
                  <ThemedText variant="caption" color="secondary" style={styles.tagCount}>
                    {note.tags.length} etiqueta{note.tags.length !== 1 ? "s" : ""}
                  </ThemedText>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleFavoritePress}
              style={[styles.favoriteButton, isFavorite && { backgroundColor: theme.colors.warning + "20" }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol
                name={isFavorite ? "heart.fill" : "heart"}
                size={20}
                color={isFavorite ? theme.colors.error : theme.colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Contenido de la nota */}
          <ThemedText variant="body" color="secondary" style={styles.contentExcerpt} numberOfLines={3}>
            {getExcerpt(note.content)}
          </ThemedText>

          {/* Resumen de IA si está disponible */}
          {note.ai_summary && (
            <View style={[styles.aiSummaryPreview, { backgroundColor: theme.colors.accent + "10" }]}>
              <View style={styles.aiSummaryHeader}>
                <IconSymbol name="sparkles" size={14} color={theme.colors.accent} />
                <ThemedText variant="caption" style={[styles.aiSummaryLabel, { color: theme.colors.accent }]}>
                  Resumen IA
                </ThemedText>
              </View>
              <ThemedText variant="caption" color="secondary" style={styles.aiSummaryText} numberOfLines={2}>
                {getExcerpt(note.ai_summary, 80)}
              </ThemedText>
            </View>
          )}

          {/* Footer con materia y fecha */}
          <View style={styles.footer}>
            <View style={styles.subjectContainer}>
              <View style={[styles.subjectDot, { backgroundColor: subjectColor }]} />
              <ThemedText variant="caption" color="secondary" numberOfLines={1} style={styles.subjectText}>
                {className}
              </ThemedText>
            </View>

            <View style={styles.metaContainer}>
              {note.attachments && note.attachments.length > 0 && (
                <View style={styles.attachmentIndicator}>
                  <IconSymbol name="paperclip" size={12} color={theme.colors.textMuted} />
                  <ThemedText variant="caption" color="secondary" style={styles.attachmentCount}>
                    {note.attachments.length}
                  </ThemedText>
                </View>
              )}
              <ThemedText variant="caption" color="secondary">
                {formatDate(note.updated_at || "")}
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedCard>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
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
    height: 4,
    zIndex: 1,
  },
  cardContent: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  emojiContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  noteEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  titleText: {
    fontWeight: "700",
    lineHeight: 24,
    flex: 1,
  },
  tagsPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: 52, // Alinear con el texto del título
  },
  tagCount: {
    marginLeft: 4,
    fontSize: 11,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contentExcerpt: {
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subjectText: {
    fontWeight: "600",
    flex: 1,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachmentIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  attachmentCount: {
    fontSize: 11,
  },
  // Estilos para resumen de IA
  aiSummaryPreview: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  aiSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  aiSummaryLabel: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aiSummaryText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: "italic",
  },
})
