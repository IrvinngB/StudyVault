import {
    ThemedButton,
    ThemedText,
    ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  
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
          onPress: () => {
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
              ¡Bienvenido! Organiza tu estudio de manera eficiente.
            </ThemedText>
          </ThemedView>
          
          <ThemedButton
            title="Salir"
            variant="outline"
            onPress={handleLogout}
            style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              marginTop: theme.spacing.xs
            }}
          />        
        </ThemedView>
        
        {/* Sección de acceso rápido */}
        <ThemedView style={{
          marginBottom: theme.spacing.xl,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg
        }}>         
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
            Acceso Rápido
          </ThemedText>          
          
          <ThemedButton
            title="Mis Cursos"
            variant="primary"
            onPress={() => {
              try {
                router.push("/courses" as any);
              } catch (error) {
                console.log('Error de navegación:', error);
                router.navigate("/courses" as any);
              }
            }}
            style={{ marginBottom: theme.spacing.sm }}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}