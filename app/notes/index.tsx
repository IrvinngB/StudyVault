// app/notes/index.tsx
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// --- CAMBIO AQUÍ: APUNTAR A NotesPreviewCard.tsx ---
import NoteCard from '@/components/notes/NotesPreviewCard';
// IMPORTANTE: Importa NoteData y UpdateNoteRequest desde tu servicio de notas
import classService, { ClassData } from '@/database/services/courseService';
import type { NoteData, UpdateNoteRequest } from '@/database/services/notesService';


import { ThemedButton, ThemedCard, ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { useModal } from '@/hooks/modals';
import { useNotes } from '@/hooks/useNotes'; // Asumimos que este hook devuelve NoteData[]
import { useTheme } from '@/hooks/useTheme';

export default function NotesScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { showConfirm, showError, showSuccess } = useModal();

  // useNotes ahora devuelve NoteData[] directamente
  const {
    notes, // Estas 'notes' son de tipo NoteData[]
    loading,
    error,
    refreshNotes,
    updateNote, 
    notesStats,
  } = useNotes(); 

  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'subject'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [allClasses, setAllClasses] = useState<ClassData[]>([]);

   useFocusEffect(
    useCallback(() => {
      const loadInitialData = async () => {
        // 1. Cargar las notas (ya lo tienes)
        await refreshNotes();

        // 2. Cargar las clases (¡ESTO ES LO QUE FALTA!)
        try {
          const loadedClasses = await classService.getAllClasses();
          setAllClasses(loadedClasses);
        } catch (err: any) { // Es buena práctica tipar el error si es posible
          console.error("Error al cargar las materias en NotesScreen:", err);
          showError(`No se pudieron cargar las materias: ${err.message || 'Error desconocido'}`, 'Error');
        }
      };

      loadInitialData(); // Ejecuta la función de carga

      // Si refreshNotes o showError cambian, el efecto se re-ejecutará
    }, [refreshNotes, showError]) // <-- Asegúrate de tener estas dependencias si las usas
  );

  const onRefresh = refreshNotes;

  const totalNotes = notesStats.total;
  const favoriteNotesCount = notesStats.favorites;
  const subjectCount = Object.keys(notesStats.byClass).length;

  // Filtra las notas que ya son de tipo NoteData
  const getFilteredNotes = (): NoteData[] => { 
    switch (filterType) {
      case 'all':
        return notes;
      case 'favorites':
        // Usa note.is_favorite de NoteData
        return notes.filter(note => note.is_favorite);
      case 'subject':
        // Usa note.class_id de NoteData
        return selectedSubject ? notes.filter(note => note.class_id === selectedSubject) : [];
      default:
        return notes;
    }
  };

  const displayedNotes = getFilteredNotes();

  const handleNotePress = useCallback((note: NoteData) => { // Acepta NoteData
    console.log('Nota presionada:', note.title);
    router.push(`/notes/${note.id}`);
  }, [router]);

  const handleFavoriteToggle = useCallback(async (noteId: string) => {
    const noteToUpdate = notes.find(n => n.id === noteId);
    if (!noteToUpdate) return;

    const newFavoriteStatus = !noteToUpdate.is_favorite; // Usa is_favorite de NoteData

    showConfirm(
      `¿Quieres ${newFavoriteStatus ? 'añadir a' : 'eliminar de'} favoritos "${noteToUpdate.title}"?`,
      async () => {
        try {
          // updateNote espera un objeto de UpdateNoteRequest, que se basa en NoteData
          const updated = await updateNote({
            id: noteId,
            is_favorite: newFavoriteStatus, // Envía is_favorite
          } as UpdateNoteRequest); // Casteamos para asegurar el tipo si UpdateNoteRequest es más estricto

          if (updated) {
            showSuccess(`Nota "${noteToUpdate.title}" ${newFavoriteStatus ? 'añadida a favoritos' : 'eliminada de favoritos'}.`);
            await refreshNotes();
          } else {
            showError(`No se pudo actualizar el estado de favorito para "${noteToUpdate.title}".`);
          }
        } catch (e: any) {
          console.error("Error al alternar favorito:", e);
          showError(`No se pudo actualizar el estado de favorito: ${e.message || 'Error desconocido'}`, 'Error');
        }
      }
    );
  }, [notes, updateNote, showConfirm, showSuccess, showError, refreshNotes]);


  if (loading && notes.length === 0 && !error) {
    return (
      <ThemedView variant="background" style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
          Cargando tus apuntes...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView variant="background" style={styles.centeredContainer}>
        <ThemedText variant="h3" style={{ color: theme.colors.error, marginBottom: theme.spacing.sm, textAlign: "center" }}>
          {error}
        </ThemedText>
        <ThemedButton title="Reintentar" variant="outline" onPress={refreshNotes} />
      </ThemedView>
    );
  }

  return (
    <ThemedView variant="background" style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText variant="h2">Apuntes</ThemedText>
        <ThemedButton
          title="Agregar"
          variant="primary"
          onPress={() => {
            router.push({
              pathname: '/notes/[id]',
              params: { id: 'new' },
            });
          }}
          iconName="plus.circle.fill"
        />
      </ThemedView>

      <ThemedView style={[styles.cardsContainer, { marginBottom: theme.spacing.md }]}>
        <TouchableOpacity
          onPress={() => { setFilterType('all'); setSelectedSubject(null); }}
          style={styles.countCardTouchable}
        >
          <ThemedCard
            variant="elevated"
            padding="medium"
            style={[
              styles.countCard,
              filterType === 'all' && { backgroundColor: theme.colors.primary },
            ]}
          >
            <ThemedText
              variant="bodySmall"
              color={filterType === 'all' ? 'text' : 'secondary'}
            >
              Total
            </ThemedText>
            <ThemedText
              style={[
                styles.largeNumber,
                { marginTop: theme.spacing.xs },
                filterType === 'all' && { color: theme.colors.text },
              ]}
            >
              {totalNotes}
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setFilterType('favorites'); setSelectedSubject(null); }}
          style={styles.countCardTouchable}
        >
          <ThemedCard
            variant="elevated"
            padding="medium"
            style={[
              styles.countCard,
              filterType === 'favorites' && { backgroundColor: theme.colors.primary },
            ]}
          >
            <ThemedText
              variant="bodySmall"
              color={filterType === 'favorites' ? 'text' : 'secondary'}
            >
              Favoritos
            </ThemedText>
            <ThemedText
              style={[
                styles.largeNumber,
                { marginTop: theme.spacing.xs },
                { color: filterType === 'favorites' ? theme.colors.text : theme.colors.warning },
              ]}
            >
              {favoriteNotesCount}
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setFilterType('subject'); /* Aquí podrías abrir un modal o selector de materias */ }}
          style={styles.countCardTouchable}
        >
          <ThemedCard
            variant="elevated"
            padding="medium"
            style={[
              styles.countCard,
              filterType === 'subject' && { backgroundColor: theme.colors.primary },
            ]}
          >
            <ThemedText
              variant="bodySmall"
              color={filterType === 'subject' ? 'text' : 'secondary'}
            >
              Materias
            </ThemedText>
            <ThemedText
              style={[
                styles.largeNumber,
                { marginTop: theme.spacing.xs },
                { color: filterType === 'subject' ? theme.colors.text : theme.colors.success },
              ]}
            >
              {subjectCount}
            </ThemedText>
          </ThemedCard>
        </TouchableOpacity>
      </ThemedView>

      {filterType === 'subject' && selectedSubject && (
        <ThemedText variant="body" style={styles.selectedSubjectText}>
          Mostrando apuntes de: <ThemedText variant="body" color="primary">{selectedSubject}</ThemedText>
        </ThemedText>
      )}
      {filterType === 'subject' && !selectedSubject && (
        <ThemedText variant="body" color="secondary" style={styles.selectSubjectPrompt}>
          Toca la tarjeta "Materias" para seleccionar una materia.
        </ThemedText>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notesListContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {displayedNotes.length > 0 ? (
          displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note} // note es de tipo NoteData
              onPress={handleNotePress}
              isFavorite={note.is_favorite} // CAMBIO: Ahora pasamos note.is_favorite directamente
              onFavoriteToggle={() => handleFavoriteToggle(note.id)}
              className={note.class_id ? allClasses.find(cls => cls.id === note.class_id)?.name || 'Sin nombre' : 'Sin materia'}
            />
          ))
        ) : (
          <ThemedText variant="body" color="secondary" style={styles.emptyStateText}>
            {filterType === 'all' && "¡No hay apuntes creados aún. Empieza añadiendo uno!"}
            {filterType === 'favorites' && "No tienes apuntes marcados como favoritos."}
            {filterType === 'subject' && !selectedSubject && "Selecciona una materia para ver sus apuntes."}
            {filterType === 'subject' && selectedSubject && `No hay apuntes para la materia "${selectedSubject}".`}
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  countCardTouchable: {
    flex: 1,
  },
  countCard: {
    alignItems: 'center',
  },
  largeNumber: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  notesListContent: {
    paddingBottom: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 30,
  },
  selectedSubjectText: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  selectSubjectPrompt: {
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  }
});