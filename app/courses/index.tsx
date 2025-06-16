import {
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/lib/hooks/useAuth';
import React from 'react';
import { ScrollView } from 'react-native';

export default function CoursesScreen() {
  const { theme } = useTheme();
  const { user} = useAuth();



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
              📚 StudyVault
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              Aqui podras ver tus cursos y organizarlos de manera eficiente.
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
       
      </ScrollView>
    </ThemedView>
  );
}