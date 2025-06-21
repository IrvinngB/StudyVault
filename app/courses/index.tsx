import { ThemedButton, ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function CoursesScreen() {
  const { theme } = useTheme();

  const handleCreateCourse = () => {
    router.push('/courses/create');
  };

  return (
    <ThemedView variant="background" style={{ flex: 1, padding: theme.spacing.lg }}>
      {/* Header */}
      <View style={{ marginBottom: theme.spacing.xl }}>
        <ThemedText variant="h1" style={{ marginBottom: theme.spacing.sm }}>
          📚 Mis Cursos
        </ThemedText>
        <ThemedText variant="body" color="secondary">
          Gestiona tus materias y organiza tu semestre académico
        </ThemedText>
      </View>

      {/* Action Button */}
      <ThemedButton
        title="➕ Crear Nuevo Curso"
        variant="primary"
        size="large"
        onPress={handleCreateCourse}
        style={{ marginBottom: theme.spacing.lg }}
      />

      {/* Placeholder for courses list */}
      <ThemedView 
        variant="surface" 
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <ThemedText variant="h3" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          🎯 ¡Comienza tu organización!
        </ThemedText>
        <ThemedText variant="body" color="muted" style={{ textAlign: 'center' }}>
          Crea tu primer curso para empezar a gestionar tus tareas, notas y horarios de estudio.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}