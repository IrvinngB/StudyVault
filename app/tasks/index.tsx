import { ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import React from 'react';

export default function TasksScreen() {
  return (
    <ThemedView variant="background" style={{ flex: 1, padding: 20 }}>
      <ThemedText variant="h1">Tareas</ThemedText>
      <ThemedText variant="body">Pantalla de tareas - Por implementar</ThemedText>
    </ThemedView>
  );
}
