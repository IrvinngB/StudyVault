import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { ClassData, classService } from '@/database/services/courseService';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';

export default function EditCourseScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  // Estados del formulario
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de los campos del curso
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('');
  const [semester, setSemester] = useState('');
  const [syllabusUrl, setSyllabusUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedColor, setSelectedColor] = useState(theme.colors.primary);

  // Colores predefinidos para selección
  const colorOptions = [
    '#2196F3', // Azul
    '#4CAF50', // Verde
    '#FF9800', // Naranja
    '#9C27B0', // Púrpura
    '#F44336', // Rojo
    '#607D8B', // Azul gris
    '#795548', // Marrón
    '#E91E63', // Rosa
    '#00BCD4', // Cian
    '#8BC34A', // Verde claro
    '#FFC107', // Ámbar
    '#3F51B5'  // Índigo
  ];

  useEffect(() => {
    if (id) {
      loadCourseData();
    } else {
      setError('No se encontró el ID del curso');
      setLoading(false);
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const course = await classService.getClassById(id as string);
      
      // Cargar datos del curso en el formulario
      setCourseName(course.name || '');
      setCourseCode(course.code || '');
      setInstructor(course.instructor || '');
      setDescription(course.description || '');
      setCredits(course.credits?.toString() || '');
      setSemester(course.semester || '');
      setSyllabusUrl(course.syllabus_url || '');
      setIsActive(course.is_active ?? true);
      setSelectedColor(course.color || theme.colors.primary);
      
    } catch (error) {
      console.error('❌ Error al cargar curso:', error);
      setError('Error al cargar los datos del curso');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      if (!courseName.trim()) {
        Alert.alert('Error de validación', 'El nombre del curso es obligatorio.');
        return false;
      }

      if (credits && credits.trim() && isNaN(Number(credits))) {
        Alert.alert('Error de validación', 'Los créditos deben ser un número válido.');
        return false;
      }

      if (syllabusUrl && syllabusUrl.trim()) {
        try {
          // Validación más simple y robusta para URLs
          const urlToValidate = syllabusUrl.trim();
          const isValidUrl = urlToValidate.startsWith('http://') || 
                           urlToValidate.startsWith('https://') || 
                           urlToValidate.includes('.');
          
          if (!isValidUrl) {
            Alert.alert('Error de validación', 'La URL del aula virtual no es válida.');
            return false;
          }
        } catch (urlError) {
          Alert.alert('Error de validación', 'Error al validar la URL del aula virtual.');
          return false;
        }
      }

      return true;
    } catch (error) {
      Alert.alert('Error de validación', 'Error inesperado durante la validación.');
      return false;
    }
  };

  const handleSave = async () => {
    if (!id) {
      Alert.alert('Error', 'No se puede guardar el curso sin ID válido');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Preparar datos exactamente como lo espera el backend
      const updatedCourse: Partial<ClassData> = {};
      
      // Solo incluir campos que han sido modificados o tienen valor
      updatedCourse.name = courseName.trim();
      
      if (courseCode.trim()) updatedCourse.code = courseCode.trim();
      if (instructor.trim()) updatedCourse.instructor = instructor.trim();
      if (description.trim()) updatedCourse.description = description.trim();
      if (credits && !isNaN(Number(credits))) updatedCourse.credits = Number(credits);
      if (semester.trim()) updatedCourse.semester = semester.trim();
      if (syllabusUrl.trim()) updatedCourse.syllabus_url = syllabusUrl.trim();
      
      updatedCourse.is_active = isActive;
      updatedCourse.color = selectedColor;

      const result = await classService.updateClass(id as string, updatedCourse);

      Alert.alert(
        '✅ Curso Actualizado',
        `"${courseName}" ha sido actualizado correctamente.`,
        [{
          text: 'OK',
          onPress: () => router.back()
        }]
      );

    } catch (error) {
      console.error('❌ Error completo al actualizar curso:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      Alert.alert(
        'Error al actualizar',
        `No se pudo actualizar el curso:\n${errorMessage}`,
        [
          { 
            text: 'Reintentar', 
            onPress: () => handleSave()
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      '⚠️ Descartar Cambios',
      '¿Estás seguro de que quieres descartar los cambios realizados?',
      [
        { text: 'Continuar Editando', style: 'cancel' },
        { 
          text: 'Descartar', 
          style: 'destructive', 
          onPress: () => router.back()
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText variant="body" style={{ marginTop: theme.spacing.md, color: theme.colors.secondary }}>
          Cargando datos del curso...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg }}>
        <Ionicons name="warning" size={48} color={theme.colors.error} style={{ marginBottom: theme.spacing.md }} />
        <ThemedText variant="h3" style={{ color: theme.colors.error, marginBottom: theme.spacing.sm, textAlign: 'center' }}>
          {error}
        </ThemedText>
        <ThemedButton
          title="Volver"
          variant="outline"
          onPress={() => router.back()}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.xxl
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: selectedColor,
                  borderRadius: theme.borderRadius.lg,
                  marginRight: theme.spacing.md,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <ThemedText variant="h2" style={{ color: 'white', fontWeight: 'bold' }}>
                  {courseName.charAt(0).toUpperCase() || 'C'}
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="h1" style={{ color: theme.colors.primary }}>
                  Editar Curso
                </ThemedText>
                <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
                  Actualiza la información del curso
                </ThemedText>
              </View>
            </View>
          </ThemedCard>

          {/* Basic Information */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md, color: theme.colors.primary }}>
              📝 Información Básica
            </ThemedText>

            <ThemedInput
              label="Nombre del Curso *"
              value={courseName}
              onChangeText={setCourseName}
              placeholder="Ej: Cálculo Diferencial"
              style={{ marginBottom: theme.spacing.md }}
            />

            <ThemedInput
              label="Código del Curso"
              value={courseCode}
              onChangeText={setCourseCode}
              placeholder="Ej: MAT101"
              style={{ marginBottom: theme.spacing.md }}
            />

            <ThemedInput
              label="Profesor/Instructor"
              value={instructor}
              onChangeText={setInstructor}
              placeholder="Ej: Dr. Juan Pérez"
              style={{ marginBottom: theme.spacing.md }}
            />

            <ThemedInput
              label="Descripción"
              value={description}
              onChangeText={setDescription}
              placeholder="Descripción breve del curso..."
              multiline
              numberOfLines={3}
              style={{ marginBottom: theme.spacing.md }}
            />
          </ThemedCard>

          {/* Academic Details */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md, color: theme.colors.primary }}>
              🎓 Detalles Académicos
            </ThemedText>

            <ThemedInput
              label="Créditos"
              value={credits}
              onChangeText={setCredits}
              placeholder="Ej: 3"
              keyboardType="numeric"
              style={{ marginBottom: theme.spacing.md }}
            />

            <ThemedInput
              label="Semestre/Período"
              value={semester}
              onChangeText={setSemester}
              placeholder="Ej: 2024-1, Otoño 2024"
              style={{ marginBottom: theme.spacing.md }}
            />

            <ThemedInput
              label="URL del Aula Virtual"
              value={syllabusUrl}
              onChangeText={setSyllabusUrl}
              placeholder="https://classroom.example.com"
              keyboardType="url"
              autoCapitalize="none"
              style={{ marginBottom: theme.spacing.md }}
            />

            {/* Active Status */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
              paddingTop: theme.spacing.md,
              borderTopWidth: 1,
              borderTopColor: theme.colors.border
            }}>
              <View style={{ flex: 1 }}>
              <ThemedText variant="body" style={{ fontWeight: '600' }}>
                Curso Activo
              </ThemedText>
              <ThemedText variant="caption" style={{ color: theme.colors.secondary }}>
                Los cursos inactivos no aparecerán en listas principales
              </ThemedText>
              </View>
              
              <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary + '40'
              }}
              thumbColor={isActive ? theme.colors.primary : theme.colors.secondary}
              />
            </View>
          </ThemedCard>

          {/* Color Selection */}
          <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
            <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md, color: theme.colors.primary }}>
              🎨 Color del Curso
            </ThemedText>

            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.sm
            }}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: color,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: selectedColor === color ? 3 : 0,
                    borderColor: theme.colors.primary,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={24} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ThemedCard>

          {/* Action Buttons */}
          <View style={{ gap: theme.spacing.sm }}>
            <ThemedButton
              title={saving ? "Guardando..." : "💾 Guardar Cambios"}
              variant="primary"
              size="large"
              onPress={handleSave}
              disabled={saving}
            />

            <ThemedButton
              title="❌ Cancelar"
              variant="outline"
              size="large"
              onPress={handleCancel}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}