import {
    ThemedButton,
    ThemedInput,
    ThemedText,
    ThemedView
} from '@/components/ui/ThemedComponents';
import { CourseFormData, useCourses } from '@/hooks/modules/useCourses';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

interface CourseFormProps {
  onSuccess?: (courseId: string) => void;
}

const defaultCourse: CourseFormData = {
  name: '',
  code: '',
  description: '',
  color: '#3B82F6', // default color
  credits: undefined,
  semester: '2025-1',
  professor: '',
  location: '',
  is_active: true,
  grade_scale: 'percentage',
  target_grade: undefined,
  current_grade: undefined
};

export default function CourseForm({ onSuccess }: CourseFormProps) {
  const { theme } = useTheme();
  const { createCourse } = useCourses();  const [formData, setFormData] = useState<CourseFormData>(defaultCourse);
  const [errors, setErrors] = useState<{[key: string]: string | undefined}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string | undefined} = {};

    // Required fields validation
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del curso es requerido';
    }

    if (!formData.semester.trim()) {
      newErrors.semester = 'El semestre es requerido';
    }

    // Credits validation if provided
    if (formData.credits !== undefined && (isNaN(Number(formData.credits)) || Number(formData.credits) <= 0)) {
      newErrors.credits = 'Los créditos deben ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const newCourse = await createCourse(formData);
      if (newCourse) {        if (onSuccess) {
          onSuccess(newCourse.id);
        } else {
          router.back();
        }
      }
    } catch (error) {
      console.error('Error al crear el curso:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView>
      <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
        Nuevo Curso
      </ThemedText>

      <ThemedInput
        label="Nombre del curso *"
        placeholder="Introducción a la Programación"
        value={formData.name}
        onChangeText={(value) => handleChange('name', value)}
        error={errors.name}
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      <ThemedInput
        label="Código"
        placeholder="CS101"
        value={formData.code}
        onChangeText={(value) => handleChange('code', value)}
        error={errors.code}
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      <ThemedInput
        label="Semestre *"
        placeholder="2025-1"
        value={formData.semester}
        onChangeText={(value) => handleChange('semester', value)}
        error={errors.semester}
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      <ThemedInput
        label="Profesor"
        placeholder="Nombre del profesor"
        value={formData.professor || ''}
        onChangeText={(value) => handleChange('professor', value)}
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      <ThemedInput
        label="Ubicación"
        placeholder="Aula/Edificio"
        value={formData.location || ''}
        onChangeText={(value) => handleChange('location', value)}
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      <ThemedInput
        label="Créditos"
        placeholder="3"
        value={formData.credits?.toString() || ''}
        onChangeText={(value) => handleChange('credits', value ? parseFloat(value) : undefined)}
        keyboardType="numeric"
        error={errors.credits}
        containerStyle={{ marginBottom: theme.spacing.md }}
      />

      <ThemedInput
        label="Descripción"
        placeholder="Detalles sobre el curso..."
        value={formData.description || ''}
        onChangeText={(value) => handleChange('description', value)}
        multiline
        numberOfLines={3}
        containerStyle={{ marginBottom: theme.spacing.lg }}
      />

      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        marginTop: theme.spacing.md
      }}>
        <ThemedButton
          title="Cancelar"
          variant="outline"
          onPress={() => router.back()}
          style={{ flex: 1, marginRight: theme.spacing.sm }}
        />
        <ThemedButton
          title="Guardar Curso"
          variant="primary"
          onPress={handleSubmit}
          loading={isSubmitting}
          style={{ flex: 1, marginLeft: theme.spacing.sm }}
        />
      </View>
    </ThemedView>
  );
}
