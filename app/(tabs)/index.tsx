import {
  ThemedButton,
  ThemedCard,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';

import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { signOut } = useAuth();  const handleLogout = async () => {
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
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              router.replace('/(auth)/login');
            }
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
        {/* Encabezado */}
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
        
        {/* Bienvenida */}
        <ThemedCard 
          variant="elevated"
          padding="medium"
          style={{ 
            marginBottom: theme.spacing.lg,
            backgroundColor: theme.colors.primary + '20',
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary
          }}
        >
          <ThemedView style={{ alignItems: 'center' }}>
            <ThemedText variant="h3" style={{ marginBottom: theme.spacing.xs }}>
              🎉 ¡Bienvenido a StudyVault!
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
              Tu plataforma de estudio está lista. Comienza organizando tus cursos, tareas y horarios.
            </ThemedText>
          </ThemedView>
        </ThemedCard>
        
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
            title="� Mis Cursos"
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
          
          <ThemedButton
            title="📝 Mis Tareas"
            variant="secondary"
            onPress={() => {
              try {
                router.push("/tasks" as any);
              } catch (error) {
                console.log('Error de navegación:', error);
                router.navigate("/tasks" as any);
              }
            }}
            style={{ marginBottom: theme.spacing.sm }}
          />
          
          <ThemedButton
            title="📓 Mis Notas"
            variant="outline"
            onPress={() => {
              try {
                router.push("/notes" as any);
              } catch (error) {
                console.log('Error de navegación:', error);
                router.navigate("/notes" as any);
              }
            }}
          />
          
          <ThemedButton
            title="Calificaciones"
            variant="primary"
            onPress={() => {
              try {
                router.push("/grades" as any);
              } catch (error) {
                console.log('Error de navegación:', error);
                router.navigate("/grades" as any);
              }
            }}
            style={{ marginBottom: theme.spacing.sm }}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}