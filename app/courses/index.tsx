import {
    ThemedButton,
    ThemedText,
    ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';

export default function CoursesScreen() {
  const { theme } = useTheme();

  const handleAddCourse = () => {
    router.push('/courses/create' as any);
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
        <ThemedView style={{
          marginBottom: theme.spacing.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText variant="h1" style={{ marginBottom: theme.spacing.xs }}>
              📚 Mis Cursos
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              Aquí podrás ver tus cursos y organizarlos de manera eficiente.
            </ThemedText>
          </ThemedView>

          <ThemedButton
            title="+ Nuevo"
            variant="primary"
            size="small"
            onPress={handleAddCourse}
          />
        </ThemedView>

        {/* Empty State */}
        <ThemedView style={{
          padding: theme.spacing.xl,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            No hay cursos
          </ThemedText>    
          <ThemedText color="secondary" style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            Aún no has agregado ningún curso. ¡Pulsa el botón &quot;Nuevo&quot; para empezar!
          </ThemedText>
          <ThemedButton
            title="Agregar mi primer curso"
            variant="primary"
            onPress={handleAddCourse}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}