import {
  ThemedButton,
  ThemedCard,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();

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
            📚 StudyVault
          </ThemedText>
          <ThemedText variant="body" color="secondary">
            ¡Bienvenido de vuelta! Organiza tu estudio de manera eficiente.
          </ThemedText>
        </ThemedView>
        
        {/* Status Card */}
        <ThemedCard style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            ✅ Sistema Operativo
          </ThemedText>
          
          <ThemedText color="success" style={{ marginBottom: theme.spacing.xs }}>
            Base de datos inicializada correctamente
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Todas las migraciones aplicadas • Sistema listo para usar
          </ThemedText>
        </ThemedCard>

        {/* Quick Stats */}
        <ThemedView style={{
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg
        }}>
          <ThemedCard variant="elevated" padding="medium" style={{ flex: 1 }}>
            <ThemedText variant="h2" color="primary" style={{ textAlign: 'center' }}>
              5
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ textAlign: 'center' }}>
              Cursos
            </ThemedText>
          </ThemedCard>
          
          <ThemedCard variant="elevated" padding="medium" style={{ flex: 1 }}>
            <ThemedText variant="h2" color="warning" style={{ textAlign: 'center' }}>
              12
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ textAlign: 'center' }}>
              Tareas
            </ThemedText>
          </ThemedCard>
          
          <ThemedCard variant="elevated" padding="medium" style={{ flex: 1 }}>
            <ThemedText variant="h2" color="success" style={{ textAlign: 'center' }}>
              28
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={{ textAlign: 'center' }}>
              Notas
            </ThemedText>
          </ThemedCard>
        </ThemedView>

        {/* Recent Tasks */}
        <ThemedCard style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            📋 Tareas Próximas
          </ThemedText>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            <ThemedView style={{ 
              backgroundColor: theme.colors.surfaceLight,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Examen de Cálculo Diferencial
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Matemáticas III • Vence mañana
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ 
                backgroundColor: theme.colors.error,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm
              }}>
                <ThemedText variant="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  ALTA
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ 
              backgroundColor: theme.colors.surfaceLight,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Proyecto Final - Base de Datos
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Programación • Vence en 5 días
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ 
                backgroundColor: theme.colors.warning,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm
              }}>
                <ThemedText variant="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  MEDIA
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ 
              backgroundColor: theme.colors.surfaceLight,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <ThemedView style={{ flex: 1 }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Leer Capítulo 8 - Historia
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Historia • Vence en 1 semana
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ 
                backgroundColor: theme.colors.success,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm
              }}>
                <ThemedText variant="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  BAJA
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Quick Actions */}
        <ThemedCard style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            ⚡ Acciones Rápidas
          </ThemedText>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            <ThemedButton 
              title="📝 Nueva Tarea"
              variant="primary" 
              onPress={() => {}}
            />
            
            <ThemedView style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <ThemedButton 
                title="📚 Agregar Curso"
                variant="secondary" 
                onPress={() => {}}
                style={{ flex: 1 }}
              />
              
              <ThemedButton 
                title="📓 Tomar Nota"
                variant="secondary" 
                onPress={() => {}}
                style={{ flex: 1 }}
              />
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Today's Schedule */}
        <ThemedCard style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            📅 Horario de Hoy
          </ThemedText>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            <ThemedView style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border
            }}>
              <ThemedView style={{ width: 60 }}>
                <ThemedText variant="caption" color="primary" style={{ fontWeight: '600' }}>
                  09:00
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  10:30
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Cálculo Diferencial
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Aula 304 • Prof. García
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border
            }}>
              <ThemedView style={{ width: 60 }}>
                <ThemedText variant="caption" color="primary" style={{ fontWeight: '600' }}>
                  11:00
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  12:30
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Programación Avanzada
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Lab 2 • Prof. Rodríguez
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm
            }}>
              <ThemedView style={{ width: 60 }}>
                <ThemedText variant="caption" color="primary" style={{ fontWeight: '600' }}>
                  14:00
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  15:30
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Historia Contemporánea
                </ThemedText>
                <ThemedText variant="caption" color="secondary">
                  Aula 201 • Prof. López
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Progress Card */}
        <ThemedCard>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            📊 Progreso de la Semana
          </ThemedText>
          
          <ThemedView style={{ 
            backgroundColor: theme.colors.surfaceLight,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            alignItems: 'center'
          }}>
            <ThemedText variant="h1" color="success" style={{ marginBottom: theme.spacing.xs }}>
              73%
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={{ textAlign: 'center', marginBottom: theme.spacing.md }}>
              Has completado 8 de 11 tareas programadas esta semana
            </ThemedText>
            
            {/* Progress Bar */}
            <ThemedView style={{ 
              width: '100%',
              height: 8,
              backgroundColor: theme.colors.border,
              borderRadius: theme.borderRadius.full,
              overflow: 'hidden'
            }}>
              <ThemedView style={{ 
                width: '73%',
                height: '100%',
                backgroundColor: theme.colors.success,
                borderRadius: theme.borderRadius.full
              }} />
            </ThemedView>
          </ThemedView>
        </ThemedCard>

      </ScrollView>
    </ThemedView>
  );
}
