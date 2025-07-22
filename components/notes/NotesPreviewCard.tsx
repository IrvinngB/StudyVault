// src/components/notes/NotePreviewCard.tsx
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { NoteData } from '../../database/services/notesService'; // ¡Asegúrate de que esta ruta sea correcta!
import { ThemedCard, ThemedText, ThemedView } from '../ui/ThemedComponents'; // ¡Asegúrate de que esta ruta sea correcta!

interface NotePreviewCardProps {
  note: NoteData;
  onPress: (note: NoteData) => void;
  isFavorite: boolean; // Recibe el estado de favorito desde el padre
  onFavoriteToggle: () => void;
  className: string; // Nombre de la clase/materia
}

export default function NotePreviewCard({ note, onPress, isFavorite, onFavoriteToggle, className }: NotePreviewCardProps) {
  const { theme } = useTheme();

  // Función para obtener un fragmento del contenido de la nota
  const getExcerpt = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Esta función maneja el toque en la estrella de favorito
  const handleFavoritePress = (event: any) => {
    // *** CLAVE: Detiene la propagación del evento para que el onPress de la tarjeta padre no se active. ***
    event.stopPropagation(); 
    console.log('⭐️ Estrella tocada para nota ID:', note.id); // Log para depuración
    onFavoriteToggle(); // Llama a la función proporcionada por el padre
  };

  // Esta función maneja el toque en cualquier otra parte de la tarjeta
  const handleCardPress = () => {
    onPress(note);
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.8} style={styles.cardContainer}>
      <ThemedCard variant="elevated" padding="medium" style={styles.card}>
        {/* Encabezado de la tarjeta: Título de la nota y elementos de la derecha */}
        <ThemedView style={styles.header}>
          <ThemedText variant="h3" numberOfLines={1} ellipsizeMode="tail" style={styles.titleText}>
            {note.title}
          </ThemedText>
          <ThemedView style={styles.rightHeader}>
            {/* Botón de Favorito usando IconSymbol */}
            <TouchableOpacity 
              onPress={handleFavoritePress} 
              style={styles.favoriteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Aumenta el área de toque invisible
            >
              <IconSymbol
                name={isFavorite ? 'star.fill' : 'star'} // Usa el prop isFavorite para determinar el icono
                size={24} // Un poco más grande para facilitar el toque
                color={isFavorite ? theme.colors.warning : theme.colors.textSecondary}
              />
            </TouchableOpacity>
            {/* Etiqueta de la materia */}
            <ThemedView
              style={[
                styles.subjectTag,
                { backgroundColor: theme.colors.primary },
                { borderColor: theme.colors.primaryDark || theme.colors.primary },
              ]}
            >
              <ThemedText
                variant="caption"
                numberOfLines={1} 
                ellipsizeMode="tail"
                style={[
                  { color: theme.colors.text },
                  styles.subjectText
                ]}
              >
                {className}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Fragmento del contenido de la nota */}
        <ThemedText variant="bodySmall" color="secondary" style={styles.contentExcerpt}>
          {getExcerpt(note.content)}
        </ThemedText>

        {/* Etiquetas (Tags), si existen */}
        {note.tags && note.tags.length > 0 && (
          <ThemedView style={styles.tagsContainer}>
            {note.tags.map((tag, index) => (
              <ThemedView
                key={index} // Usar el índice como key solo si la lista de tags no cambia de orden
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <ThemedText variant="caption" color="secondary">{tag}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        )}

        {/* Fecha de actualización */}
        <ThemedText variant="caption" color="muted" style={styles.dateText}>
          Actualizado: {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : 'Fecha no disponible'}
        </ThemedText>
      </ThemedCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden', // Asegura que el borde redondeado se aplique a todo el TouchableOpacity
  },
  card: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Alinea verticalmente título y lado derecho
    marginBottom: 8,
  },
  titleText: {
    flex: 1, // Permite que el título ocupe el espacio disponible
    marginRight: 8,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectText: {
    maxWidth: 80, // Limita el ancho del texto para evitar desbordamientos
  },
  favoriteButton: {
    marginRight: 8,
    padding: 4, // Aumenta el área clickable alrededor de la estrella
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
  },
  contentExcerpt: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    marginTop: 5, 
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
  },
  dateText: {
    textAlign: 'right',
    marginTop: 4,
  },
});