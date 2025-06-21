import { ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import React from 'react';

export default function NotesScreen() {
  return (
    <ThemedView variant="background" style={{ flex: 1, padding: 20 }}>
      <ThemedText variant="h1">Notas</ThemedText>
      <ThemedText variant="body">Pantalla de notas - Por implementar</ThemedText>
    </ThemedView>
  );
}
