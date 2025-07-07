import { ThemedButton, ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function CourseNotesScreen() {
  const { theme } = useTheme();

  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="h1" style={{ marginBottom: theme.spacing.md, color: theme.colors.primary }}>
          📚 Apuntes del Curso
        </ThemedText>

        {/* Aquí puedes agregar la lógica para mostrar los apuntes */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="body" style={{ color: theme.colors.secondary }}>
            Aquí aparecerán los apuntes relacionados con este curso.
          </ThemedText>
        </View>

        <ThemedButton
          title="Agregar Apunte"
          variant="primary"
          onPress={() => {
            // Lógica para agregar un nuevo apunte
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}