import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNotes } from '../../hooks/useNotes';
import { localFileManager } from '../../lib/utils/localFileManager';
import type { CreateNoteRequest, AttachmentData } from '../../database/services/notesService';

interface NotesExampleProps {
  classId: string;
  className?: string;
}

export const NotesExample: React.FC<NotesExampleProps> = ({ classId, className }) => {
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    generateAISummary,
    refreshNotes,
  } = useNotes({ class_id: classId });

  const [isCreating, setIsCreating] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) {
      Alert.alert('Error', 'Por favor completa el título y contenido');
      return;
    }

    const noteData: CreateNoteRequest = {
      class_id: classId,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: selectedTags,
      lesson_date: new Date().toISOString().split('T')[0],
    };

    const result = await createNote(noteData);
    if (result) {
      setNewNoteTitle('');
      setNewNoteContent('');
      setSelectedTags([]);
      setIsCreating(false);
      Alert.alert('Éxito', 'Nota creada correctamente');
    }
  };

  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la nota "${noteTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteNote(noteId);
            if (success) {
              Alert.alert('Éxito', 'Nota eliminada correctamente');
            }
          },
        },
      ]
    );
  };

  const handleGenerateAISummary = async (noteId: string) => {
    const summary = await generateAISummary(noteId);
    if (summary) {
      Alert.alert('Resumen generado', summary);
    }
  };

  const handleAddImage = async (noteId: string) => {
    try {
      const result = await localFileManager.pickImage({
        noteId,
        classId,
      });

      if (result.success && result.attachment) {
        // Aquí actualizarías la nota con el nuevo archivo adjunto
        // Por simplicidad, solo mostramos un alert
        Alert.alert('Éxito', `Imagen agregada: ${result.attachment.filename}`);
      } else {
        Alert.alert('Error', result.error || 'No se pudo agregar la imagen');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al agregar imagen');
    }
  };

  const handleTakePhoto = async (noteId: string) => {
    try {
      const result = await localFileManager.takePhoto({
        noteId,
        classId,
      });

      if (result.success && result.attachment) {
        Alert.alert('Éxito', `Foto tomada: ${result.attachment.filename}`);
      } else {
        Alert.alert('Error', result.error || 'No se pudo tomar la foto');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al tomar foto');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando notas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={refreshNotes}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Notas {className ? `- ${className}` : ''}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreating(!isCreating)}
        >
          <Text style={styles.buttonText}>
            {isCreating ? 'Cancelar' : 'Nueva Nota'}
          </Text>
        </TouchableOpacity>
      </View>

      {isCreating && (
        <View style={styles.createForm}>
          <TextInput
            style={styles.input}
            placeholder="Título de la nota"
            value={newNoteTitle}
            onChangeText={setNewNoteTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Contenido de la nota"
            value={newNoteContent}
            onChangeText={setNewNoteContent}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateNote}>
            <Text style={styles.buttonText}>Crear Nota</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.notesList}>
        {notes.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay notas para esta clase. ¡Crea tu primera nota!
          </Text>
        ) : (
          notes.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                {note.is_favorite && <Text style={styles.favoriteIcon}>⭐</Text>}
              </View>
              
              <Text style={styles.noteContent} numberOfLines={3}>
                {note.content}
              </Text>
              
              {note.ai_summary && (
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryLabel}>Resumen IA:</Text>
                  <Text style={styles.summaryText}>{note.ai_summary}</Text>
                </View>
              )}
              
              {note.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {note.tags.map((tag, index) => (
                    <Text key={index} style={styles.tag}>
                      #{tag}
                    </Text>
                  ))}
                </View>
              )}
              
              <View style={styles.noteActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleGenerateAISummary(note.id!)}
                >
                  <Text style={styles.actionButtonText}>🤖 IA</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddImage(note.id!)}
                >
                  <Text style={styles.actionButtonText}>📷 Imagen</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleTakePhoto(note.id!)}
                >
                  <Text style={styles.actionButtonText}>📸 Foto</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteNote(note.id!, note.title)}
                >
                  <Text style={styles.actionButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.noteDate}>
                {note.lesson_date || 'Sin fecha'}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  createForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  notesList: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 32,
  },
  noteCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  summaryContainer: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#666',
    marginRight: 4,
    marginBottom: 4,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffe0e0',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#333',
  },
  noteDate: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});
