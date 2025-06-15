import {
  ThemedButton,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/lib/hooks/useAuth';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
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
              📚 StudyVault
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              ¡Bienvenido de vuelta{user?.name ? `, ${user.name}` : ''}! Organiza tu estudio de manera eficiente.
            </ThemedText>
          </ThemedView>
          
          <ThemedButton
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            style={{ 
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              marginTop: theme.spacing.xs
            }}
          />
        </ThemedView>
        
        {/* Aquí irán los datos de la base de datos más adelante */}
      </ScrollView>
    </ThemedView>
  );
}