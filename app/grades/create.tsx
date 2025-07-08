import CourseForm from '@/components/courses/CourseForm';
import { ThemedView } from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function CreateCategoryScreen() {
  const { theme } = useTheme();

  const handleSuccess = (categoryId: string) => {
    console.log(`✅ Categoría creada exitosamente con ID: ${categoryId}`);
    // Navegar de vuelta a la lista de categorías
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView variant="background" style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ 
            padding: theme.spacing.lg,
            paddingBottom: theme.spacing.xxl
          }}
          showsVerticalScrollIndicator={false}
        >
          <CourseForm onSuccess={handleSuccess} />
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}