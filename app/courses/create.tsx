import CourseForm from '@/components/courses/CourseForm';
import { ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';

export default function CreateCourseScreen() {
  const { theme } = useTheme();  const handleSuccess = (courseId: string) => {
    // Navigate back to the courses list after successful creation
    router.back();
  };

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xxl
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h1" style={{ marginBottom: theme.spacing.xs }}>
            📝 Agregar Curso
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            Completa el formulario para agregar un nuevo curso a StudyVault.
          </ThemedText>
        </ThemedView>

        {/* Course Form */}
        <CourseForm onSuccess={handleSuccess} />
      </ScrollView>
    </ThemedView>
  );
}
