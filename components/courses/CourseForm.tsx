import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { ApiClient } from '@/database/api/client';
import { classService } from '@/database/services/courseService';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

interface CourseFormData {
  name: string;
  code?: string;
  instructor?: string;
  color: string;
  credits?: number;
  semester?: string;
  description?: string;
  is_active: boolean;
}

interface CourseFormProps {
  onSuccess?: (courseId: string) => void;
}

const defaultCourse: CourseFormData = {
  name: '',
  code: '',
  instructor: '',
  color: '#3B82F6', // default color
  credits: undefined,
  semester: '2025-1',
  description: '',
  is_active: true
};

// Colores predefinidos para los cursos
const courseColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function CourseForm({ onSuccess }: CourseFormProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<CourseFormData>(defaultCourse);
  const [errors, setErrors] = useState<{[key: string]: string | undefined}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Verificar estado de autenticación al montar
  useEffect(() => {
    const checkAuth = async () => {
      const apiClient = ApiClient.getInstance();
      
      console.log('🔍 DEBUGGING AUTH STATE:');
      console.log('1. ApiClient instance:', !!apiClient);
      
      // Inicializar el cliente si no está inicializado
      await apiClient.initialize();
      
      const isAuth = apiClient.isAuthenticated();
      const currentUser = apiClient.getCurrentUser();
      
      console.log('2. Is authenticated:', isAuth);
      console.log('3. Current user:', currentUser);
      console.log('4. Has access_token:', !!currentUser?.access_token);
      console.log('5. Token preview:', currentUser?.access_token?.substring(0, 20) + '...');
      console.log('6. Token expires at:', currentUser?.expires_at);
      console.log('7. Current time:', Date.now());
      console.log('8. Token is expired:', currentUser?.expires_at ? currentUser.expires_at < Date.now() : 'No expiry');
      
      if (!isAuth) {
        Alert.alert(
          'Sesión requerida',
          'Debes iniciar sesión para crear cursos.',
          [{ 
            text: 'Ir a Login', 
            onPress: () => router.replace('/(auth)/login') 
          }]
        );
      }
    };
    
    checkAuth();
  }, []);

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

    if (!formData.semester?.trim()) {
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
      console.log('🚀 INICIANDO CREACIÓN DE CURSO');
      console.log('📋 Form data:', formData);
      
      // Debug: Verificar estado de auth antes de enviar
      const apiClient = ApiClient.getInstance();
      const isAuth = apiClient.isAuthenticated();
      const currentUser = apiClient.getCurrentUser();
      
      console.log('🔐 Pre-submit auth check:');
      console.log('- Is authenticated:', isAuth);
      console.log('- Has user:', !!currentUser);
      console.log('- Has access_token:', !!currentUser?.access_token);
      console.log('- Token length:', currentUser?.access_token?.length);
      
      if (!isAuth) {
        throw new Error('Usuario no autenticado. Por favor, inicia sesión.');
      }
      
      // Preparar datos para el API (eliminar campos que no acepta el backend)
      const courseDataToCreate = {
        name: formData.name.trim(),
        code: formData.code?.trim() || undefined,
        instructor: formData.instructor?.trim() || undefined,
        color: formData.color,
        credits: formData.credits || undefined,
        semester: formData.semester?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        is_active: formData.is_active
        // NO incluir is_synced ni needs_sync - estos no están en el schema del API
      };
      
      console.log('📤 Data to send to API:', courseDataToCreate);
      
      const newCourse = await classService.createClass(courseDataToCreate);
      
      if (newCourse) {
        console.log('✅ Curso creado exitosamente:', newCourse);
        Alert.alert(
          'Éxito', 
          'Curso creado correctamente',
          [{
            text: 'OK',
            onPress: () => {
              if (onSuccess && newCourse.id) {
                onSuccess(newCourse.id);
              } else {
                router.back();
              }
            }
          }]
        );
      }
    } catch (error) {
      console.error('❌ Error al crear el curso:', error);
      
      // Mejor manejo de errores
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('no autenticado')) {
        Alert.alert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{ 
            text: 'Ir a Login', 
            onPress: () => router.replace('/(auth)/login') 
          }]
        );
      } else {
        Alert.alert(
          'Error', 
          `No se pudo crear el curso: ${errorMessage}`,
          [{ text: 'OK' }]
        );
      }
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
            error={errors.code}
          />

          <ThemedInput
            label="Semestre *"
            placeholder="Ej: 2025-1"
            value={formData.semester || ''}
            onChangeText={(value) => handleChange('semester', value)}
            error={errors.semester}
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
            error={errors.credits}
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
                    borderWidth: 2
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
    </ThemedView>
  );
}