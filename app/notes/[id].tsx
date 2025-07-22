// app/notes/[id].tsx
import { AppModal } from "@/components/ui/AppModal";
import { IconSymbol } from '@/components/ui/IconSymbol'; // Asegúrate de tenerlo si usas iconos
import { ThemedButton, ThemedCard, ThemedInput, ThemedText, ThemedView } from '@/components/ui/ThemedComponents'; // Añadido ThemedCard
import { ClassData, classService } from '@/database/services/courseService';
import { useModal } from '@/hooks/modals';
import { useTheme } from '@/hooks/useTheme';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, // Necesario para mostrar miniaturas de imágenes
    FlatList, // Necesario para los contenedores de los botones y listas
    Image,
    Keyboard,
    ScrollView, // Necesario para la lista de sugerencias de materias
    TouchableOpacity,
    View
} from 'react-native';

// Importa tu notesService. Ahora está completamente integrado.
import { AttachmentData, CreateNoteRequest, NoteData, notesService, UpdateNoteRequest } from '@/database/services/notesService';


export default function NoteDetailScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { modalProps, showError, showSuccess, showConfirm } = useModal();

  // Estados para el formulario de la nota
  const [noteForm, setNoteForm] = useState<NoteData>({
    id: '',
    title: '',
    class_id: '', // Aquí almacenamos la class_id mapeada
    content: '',
    tags: [],
    updated_at: '',
    is_favorite: false,
    local_files_path: '',
    attachments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);

  // --- NUEVOS ESTADOS PARA ADJUNTOS ---
  // Estos almacenan las URIs locales. La lógica para subir a un servidor y mapear a AttachmentData
  // necesitará ser implementada si quieres persistencia real de archivos.
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedDocuments, setAttachedDocuments] = useState<string[]>([]);

  // --- NUEVOS ESTADOS PARA SUGERENCIAS DE MATERIAS ---
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassData[]>([]);
  const [subjectNameToIdMap, setSubjectNameToIdMap] = useState<Record<string, string>>({}); // Para buscar el ID por nombre
  const [filteredSubjects, setFilteredSubjects] = useState<string[]>([]); // Nombres de materias filtradas para sugerencias
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const subjectInputRef = useRef<any>(null);

  // Efecto para cargar la nota y las materias cuando cambia el ID
  useEffect(() => {
    const loadNoteAndSubjects = async () => {
      setLoading(true);
      setError(null);

      // --- Cargar las materias disponibles PRIMERO ---
        let loadedClasses: ClassData[] = [];
        let loadedSubjectNameToIdMap: Record<string, string> = {};
        try {
        loadedClasses = await classService.getAllClasses();
        setAvailableClasses(loadedClasses);

        loadedSubjectNameToIdMap = loadedClasses.reduce((acc, curr) => {
            if (curr.id && curr.name) { // Asegúrate de que id y name existen
            acc[curr.name] = curr.id;
            }
            return acc;
        }, {} as Record<string, string>);
        setSubjectNameToIdMap(loadedSubjectNameToIdMap);

        // Inicializa filteredSubjects con todos los nombres de materias
        setFilteredSubjects(loadedClasses.map(c => c.name).sort());
        // Y allSubjects para tu lógica de autocompletado
        setAllSubjects(loadedClasses.map(c => c.name).sort());

        } catch (err: any) {
        console.error("Error al cargar las clases para sugerencias:", err);
        // Puedes optar por no mostrar un error crítico si solo afecta las sugerencias
        }

        // --- Lógica para cargar la nota (existente o nueva) ---
        if (id === 'new') {
        setIsNewNote(true);
        setNoteForm({
            id: '',
            title: '',
            class_id: '',
            content: '',
            tags: [],
            updated_at: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
            is_favorite: false,
            local_files_path: '',
            attachments: [],
        });
        } else if (typeof id === 'string') {
        setIsNewNote(false);
        try {
            const loadedNote = await notesService.getNoteById(id);
            if (loadedNote) {
            setNoteForm({
                id: loadedNote.id,
                title: loadedNote.title,
                class_id: loadedNote.class_id || '', // Asigna el UUID de la clase
                content: loadedNote.content,
                tags: loadedNote.tags || [],
                updated_at: loadedNote.updated_at || '',
                is_favorite: loadedNote.is_favorite || false,
                local_files_path: loadedNote.local_files_path || '',
                attachments: loadedNote.attachments || [],
                user_id: loadedNote.user_id, // Asegúrate de cargar user_id si lo necesitas
            });
            } else {
            setError("Nota no encontrada.");
            }
        } catch (err: any) {
            console.error("Error al cargar la nota:", err);
            setError(`Error al cargar la nota: ${err.message || 'Error desconocido'}`);
        }
        } else {
        setError("ID de nota inválido.");
        }
        setLoading(false); // Asegúrate de que loading se apague después de que todas las operaciones hayan terminado
    };
    loadNoteAndSubjects(); // Llama a la función que inicia la carga
  }, [id]); // Asegúrate de que el useEffect dependa de `id` para recargar si la nota cambia


  // Manejador para guardar la nota (Crear o Actualizar)
  const handleSaveNote = async () => {
    console.log("Intentando guardar nota:", noteForm);

    // TODO: Si quieres persistir adjuntos, necesitarías subir los archivos a un servicio de almacenamiento
    // (como AWS S3, Firebase Storage, o tu propio backend de archivos) y luego pasar las URLs resultantes
    // como `AttachmentData` en `local_files_path` y `attachments` a tu API.
    const attachmentsToSave: AttachmentData[] = [
      ...attachedImages.map(uri => ({
        filename: uri.substring(uri.lastIndexOf('/') + 1),
        type: 'image' as 'image',
        size: 0, // Debes obtener el tamaño real del archivo
        local_path: uri,
        // mime_type, thumbnail_path... si es necesario
      })),
      ...attachedDocuments.map(uri => ({
        filename: uri.substring(uri.lastIndexOf('/') + 1),
        type: 'document' as 'document',
        size: 0, // Debes obtener el tamaño real del archivo
        local_path: uri,
        // mime_type, thumbnail_path... si es necesario
      })),
    ];


    try {
      setLoading(true);
      // Preparar los datos para la API usando los tipos de tu notesService
      const dataToSave: CreateNoteRequest = {
        class_id: noteForm.class_id, // Mapeamos 'subject' de la UI a 'class_id' del backend
        title: noteForm.title,
        content: noteForm.content,
        tags: noteForm.tags,
        is_favorite: noteForm.is_favorite,
        local_files_path: 'StudyFiles', // Valor por defecto o dinámico
        attachments: attachmentsToSave,
        // lesson_date y ai_summary se añadirían si los recolectas en tu UI
      };

      if (isNewNote) {
        // Usar el servicio de creación
        const createdNote = await notesService.createNote(dataToSave);
        showSuccess('Nota creada exitosamente!', 'Éxito');
        // Si el ID cambia (es generado por el backend), navega a la nueva URL de la nota
        router.replace(`/notes/${createdNote.id}`);
      } else {
        // Usar el servicio de actualización
        const updateRequest: UpdateNoteRequest = {
          id: noteForm.id!, // Aseguramos que el id existe para una nota existente
          ...dataToSave
        };
        await notesService.updateNote(updateRequest);
        showSuccess('Nota actualizada exitosamente!', 'Éxito');
        router.back();
      }
    } catch (e: any) {
      console.error("Error al guardar la nota:", e);
      showError(`Hubo un error al guardar la nota: ${e.message || 'Error desconocido'}`, 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Manejador para eliminar la nota
  const handleDeleteNote = () => {
    showConfirm(
      `¿Estás seguro de que quieres eliminar "${noteForm.title}"?`,
      async () => {
        try {
          setLoading(true);
          await notesService.deleteNote(noteForm.id!); // Aseguramos que el id existe
          showSuccess('Nota eliminada correctamente.', 'Eliminado', () => router.back());
        } catch (e: any) {
          console.error("Error al eliminar la nota:", e);
          showError(`No se pudo eliminar la nota: ${e.message || 'Error desconocido'}`, 'Error');
        } finally {
          setLoading(false);
        }
      },
      undefined,
      'Eliminar Nota'
    );
  };

  // --- FUNCIONES PARA ADJUNTOS (IMÁGENES Y DOCUMENTOS) ---
  const pickImage = async (fromCamera: boolean) => {
     let result: ImagePicker.ImagePickerResult;
    try {
      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showError('Se necesita permiso para acceder a la cámara.', 'Permiso Denegado');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showError('Se necesita permiso para acceder a la galería.', 'Permiso Denegado');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

        if (!result.canceled && result.assets && result.assets.length > 0) {
      
        const assets = result.assets;

        setAttachedImages((prev) => [...prev, assets[0].uri]);
        }
    } catch (err) {
        console.error("Error al seleccionar imagen:", err);
        showError('Error al seleccionar la imagen.', 'Error');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Puedes añadir más tipos
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachedDocuments((prev) => [...prev, result.assets[0].uri]);
        showSuccess(`Documento "${result.assets[0].name}" adjuntado.`, 'Adjunto');
      }
    } catch (err: any) {
      console.error("Error al seleccionar documento:", err);
      showError('Error al seleccionar el documento.', 'Error');
    }
  };


  // --- Renderizado de la UI ---
  if (loading) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
          Cargando nota...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.lg }}>
        <ThemedText variant="h3" style={{ color: theme.colors.error, marginBottom: theme.spacing.sm, textAlign: "center" }}>
          {error}
        </ThemedText>
        <ThemedButton title="Volver" variant="outline" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: isNewNote ? 'Nueva Nota' : noteForm.title || 'Detalle de Nota',
          headerRight: () => (
            !isNewNote && (
              <ThemedButton
                title="Eliminar"
                variant="error"
                onPress={handleDeleteNote}
                style={{ marginLeft: theme.spacing.md }}
              />
            )
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedInput
          label="Título"
          value={noteForm.title}
          onChangeText={(text: string) => setNoteForm({ ...noteForm, title: text })}
          placeholder="Escribe el título de tu apunte"
          style={{ marginBottom: theme.spacing.md }}
        />

        {/* --- CAMPO DE MATERIA CON AUTOCOMPLETADO --- */}
        <View style={{ marginBottom: theme.spacing.md, zIndex: 1 }}>
        <ThemedInput
            label="Materia"
            // Muestra el nombre de la materia basándose en el class_id actual
            // Si noteForm.class_id es un UUID, búsca su nombre
            value={availableClasses.find(cls => cls.id === noteForm.class_id)?.name || ''}
            onChangeText={(text: string) => {
            // No actualices noteForm.class_id directamente aquí, solo la UI para autocompletado
            setNoteForm(prev => ({ ...prev, class_id: '' })); // Limpia el UUID si el usuario está escribiendo un nuevo nombre
            // Filtra las sugerencias por el nombre escrito
            const filtered = allSubjects.filter(
                (subjectName) => subjectName.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredSubjects(filtered);
            setShowSubjectSuggestions(true);
            }}
            onFocus={() => {
            // Si el input tiene un valor (un nombre de materia que ya existe), filtralo.
            // Si está vacío, muestra todas las sugerencias.
            const currentSubjectName = availableClasses.find(cls => cls.id === noteForm.class_id)?.name || '';
            if (currentSubjectName.length > 0) {
                const filtered = allSubjects.filter(
                (subjectName) => subjectName.toLowerCase().includes(currentSubjectName.toLowerCase())
                );
                setFilteredSubjects(filtered);
            } else {
                setFilteredSubjects(allSubjects);
            }
            setShowSubjectSuggestions(true);
            }}
            onBlur={() => {
            // Este setTimeout es crucial para que el evento onPress de las sugerencias se dispare antes de ocultar
            setTimeout(() => setShowSubjectSuggestions(false), 200);
            }}
            placeholder="Ej: Matemáticas, Historia"
            ref={subjectInputRef} // Asigna la referencia
        />

        {showSubjectSuggestions && filteredSubjects.length > 0 && (
            <ThemedCard variant="elevated" style={{
            position: 'absolute',
            top: 70,
            left: 0,
            right: 0,
            maxHeight: 150,
            zIndex: 10,
            padding: 0,
            }}>
            <FlatList
                data={filteredSubjects}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => {
                    const selectedClass = availableClasses.find(cls => cls.name === item);
                    if (selectedClass && selectedClass.id) {
                        setNoteForm(prev => ({ ...prev, class_id: selectedClass.id })); // ¡Almacena el UUID!
                    }
                    setShowSubjectSuggestions(false);
                    Keyboard.dismiss(); // Oculta el teclado
                    }}
                    style={{
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    }}
                >
                    <ThemedText>{item}</ThemedText>
                </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="always"
            />
            </ThemedCard>
        )}
        </View>

        {/* --- CAMPO DE CONTENIDO MÁS GRANDE --- */}
        <ThemedInput
          label="Contenido"
          value={noteForm.content}
          onChangeText={(text: string) => setNoteForm({ ...noteForm, content: text })}
          placeholder="Escribe el contenido de tu apunte aquí..."
          multiline
          numberOfLines={15} // Aumentado para más espacio inicial
          style={{ marginBottom: theme.spacing.md, height: 250, textAlignVertical: 'top' }} // Aumentado la altura
        />

        {/* --- SECCIÓN PARA ADJUNTAR ARCHIVOS (IMÁGENES Y DOCUMENTOS) --- */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm, color: theme.colors.primary }}>
            Adjuntar Archivos
          </ThemedText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: theme.spacing.md }}>
            <ThemedButton
              title="Tomar Foto"
              variant="outline"
              onPress={() => pickImage(true)}
              style={{ flex: 1, marginRight: theme.spacing.xs }}
              iconName="camera" // Asegúrate de que `ThemedButton` acepte `iconName`
            />
            <ThemedButton
              title="Galería"
              variant="outline"
              onPress={() => pickImage(false)}
              style={{ flex: 1, marginLeft: theme.spacing.xs }}
              iconName="photo.on.rectangle" // Asegúrate de que `ThemedButton` acepte `iconName`
            />
          </View>
          <ThemedButton
            title="Adjuntar Documento (PDF)"
            variant="outline"
            onPress={pickDocument}
            style={{ marginBottom: theme.spacing.md }}
            iconName="doc" // Asegúrate de que `ThemedButton` acepte `iconName`
          />

          {/* Mostrar imágenes adjuntas */}
          {attachedImages.length > 0 && (
            <View style={{ marginBottom: theme.spacing.sm }}>
              <ThemedText variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: theme.spacing.xs }}>
                Imágenes:
              </ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                {attachedImages.map((uri, index) => (
                  <View key={index} style={{
                    width: 80,
                    height: 80,
                    borderRadius: theme.borderRadius.md,
                    overflow: 'hidden',
                    backgroundColor: theme.colors.surface,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Image
                      source={{ uri }}
                      style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                    />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Mostrar documentos adjuntos */}
          {attachedDocuments.length > 0 && (
            <View>
              <ThemedText variant="bodySmall" style={{ color: theme.colors.secondary, marginBottom: theme.spacing.xs }}>
                Documentos:
              </ThemedText>
              {attachedDocuments.map((uri, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs, padding: theme.spacing.xs, borderRadius: theme.borderRadius.sm, backgroundColor: theme.colors.surfaceLight }}>
                  <IconSymbol name="doc.fill" size={18} color={theme.colors.accent} style={{ marginRight: theme.spacing.xs }} />
                  <ThemedText variant="body" style={{ flex: 1 }}>
                    {uri.substring(uri.lastIndexOf('/') + 1)} {/* Extrae solo el nombre del archivo */}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </ThemedCard>


        <ThemedInput
          label="Etiquetas (separadas por comas)"
          value={noteForm.tags?.join(', ') || ''} // Usamos encadenamiento opcional y fallback a string vacío
          onChangeText={(text: string) => setNoteForm({ ...noteForm, tags: text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) })}
          placeholder="Ej: Álgebra, Examen, Cuántica"
          style={{ marginBottom: theme.spacing.lg }}
        />

        <ThemedButton
          title="Guardar Apunte"
          variant="primary"
          onPress={handleSaveNote}
          style={{ marginBottom: theme.spacing.md }}
        />
        {!isNewNote && (
          <ThemedText variant="bodySmall" color="secondary" style={{ textAlign: 'center' }}>
            Última actualización: {noteForm.updated_at}
          </ThemedText>
        )}
      </ScrollView>
      <AppModal {...modalProps} />
    </ThemedView>
  );
}