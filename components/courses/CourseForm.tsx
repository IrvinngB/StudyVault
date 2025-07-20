import { AppModal } from '@/components/ui/AppModal';
import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { classService, CreateClassRequest } from '@/database/services/courseService';
import { useModal } from '@/hooks/modals';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

interface CourseFormData {
  name: string;
  code?: string;
  instructor?: string;
  color: string;
  credits?: number;
  semester?: string;
  description?: string;
  syllabus_url?: string;
  is_active: boolean;
}

interface CourseFormProps {
  onSuccess?: (courseId: string) => void;
}

const defaultCourse: CourseFormData = {
  name: '',
  code: '',
  instructor: '',
  color: '#3B82F6',
  credits: undefined,
  semester: '2025-1',
  description: '',
  syllabus_url: '',
  is_active: true
};

const courseColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function CourseForm({ onSuccess }: CourseFormProps) {
  const { theme } = useTheme();
  const { modalProps, showInfo, showSuccess, showError } = useModal();
  const [formData, setFormData] = useState<CourseFormData>(defaultCourse);
  const [errors, setErrors] = useState<{[key: string]: string | undefined}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string | undefined} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del curso es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showSyllabusInfo = () => {
    showInfo(
      'Es el enlace donde tu universidad publica la información del curso:\n\n' +
      '• eCampus (UTP)\n' +
      '• Microsoft Teams\n' +
      '• Google Classroom\n' +
      '• Moodle\n\n' +
      'Ahí encontrarás tareas, material de clase, calificaciones y anuncios del profesor.',
      '📚 ¿Qué es el Aula Virtual?'
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      console.log('🚀 INICIANDO CREACIÓN DE CURSO');
      console.log('📋 Form data:', formData);
      
      // Preparar datos siguiendo el patrón correcto - solo enviar campos con valor
      const courseDataToCreate: CreateClassRequest = {
        name: formData.name.trim(),
        ...(formData.code?.trim() && { code: formData.code.trim() }),
        ...(formData.instructor?.trim() && { instructor: formData.instructor.trim() }),
        color: formData.color,
        ...(formData.credits && { credits: formData.credits }),
        ...(formData.semester?.trim() && { semester: formData.semester.trim() }),
        ...(formData.description?.trim() && { description: formData.description.trim() }),
        ...(formData.syllabus_url?.trim() && { syllabus_url: formData.syllabus_url.trim() }),
        is_active: formData.is_active
      };
      
      console.log('📤 Data to send to API:', courseDataToCreate);
      
      const newCourse = await classService.createClass(courseDataToCreate);
      
      if (newCourse) {
        console.log('✅ Curso creado exitosamente:', newCourse);
        showSuccess(
          `El curso "${newCourse.name}" ha sido creado correctamente.`,
          '🎉 ¡Éxito!',
          () => {
            if (onSuccess && newCourse.id) {
              onSuccess(newCourse.id);
            } else {
              router.back();
            }
          }
        );
        
        // Reset form
        setFormData(defaultCourse);
        setErrors({});
      }
    } catch (error) {
      console.error('❌ Error al crear el curso:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      showError(`No se pudo crear el curso: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView>
      <ThemedCard variant="elevated" padding="large">
        {/* Header */}
        <View style={{ marginBottom: theme.spacing.xl }}>
          <ThemedText variant="h1" color="primary" style={{ marginBottom: theme.spacing.xs }}>
            📚 Nuevo Curso
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Completa la información de tu nueva materia
          </ThemedText>
        </View>

        {/* Form Fields */}
        <View style={{ gap: theme.spacing.md }}>
          <ThemedInput
            label="Nombre del curso *"
            placeholder="Ej: Introducción a la Programación"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            error={errors.name}
          />

          <ThemedInput
            label="Código del curso"
            placeholder="Ej: CS101"
            value={formData.code || ''}
            onChangeText={(value) => handleChange('code', value)}
          />

          <ThemedInput
            label="Semestre"
            placeholder="Ej: 2025-1"
            value={formData.semester || ''}
            onChangeText={(value) => handleChange('semester', value)}
          />

          <ThemedInput
            label="Profesor"
            placeholder="Nombre del profesor"
            value={formData.instructor || ''}
            onChangeText={(value) => handleChange('instructor', value)}
          />

          <ThemedInput
            label="Créditos"
            placeholder="3"
            value={formData.credits?.toString() || ''}
            onChangeText={(value) => handleChange('credits', value ? parseFloat(value) : undefined)}
            keyboardType="numeric"
          />

          {/* Color Selector */}
          <View>
            <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
              Color del curso
            </ThemedText>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              gap: theme.spacing.sm 
            }}>
              {courseColors.map((color) => (
                <ThemedButton
                  key={color}
                  title=""
                  variant={formData.color === color ? "primary" : "outline"}
                  onPress={() => handleChange('color', color)}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: color,
                    borderColor: formData.color === color ? theme.colors.primary : color,
                    borderWidth: 2,
                    borderRadius: theme.borderRadius.sm
                  }}
                />
              ))}
            </View>
          </View>

          <ThemedInput
            label="Descripción"
            placeholder="Detalles sobre el curso..."
            value={formData.description || ''}
            onChangeText={(value) => handleChange('description', value)}
            multiline
            numberOfLines={3}
          />

          {/* Syllabus URL with Info Button */}
          <View>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: theme.spacing.sm 
            }}>
              <ThemedText variant="bodySmall" color="secondary" style={{ flex: 1 }}>
                Enlace del Aula Virtual
              </ThemedText>
              <TouchableOpacity
                onPress={showSyllabusInfo}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <ThemedText 
                  variant="caption" 
                  color="primary" 
                  style={{ fontWeight: 'bold' }}
                >
                  ?
                </ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedInput
              placeholder="eCampus, Teams, Classroom..."
              value={formData.syllabus_url || ''}
              onChangeText={(value) => handleChange('syllabus_url', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginTop: theme.spacing.xl,
          gap: theme.spacing.md
        }}>
          <ThemedButton
            title="Cancelar"
            variant="outline"
            onPress={() => router.back()}
            style={{ flex: 1 }}
            disabled={isSubmitting}
          />
          <ThemedButton
            title={isSubmitting ? "Creando..." : "Crear Curso"}
            variant="primary"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{ flex: 1 }}
          />
        </View>
      </ThemedCard>

      <AppModal {...modalProps} />
    </ThemedView>
  );
}