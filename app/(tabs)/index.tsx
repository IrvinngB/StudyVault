// app/(tabs)/index.tsx
import {
  ThemedButton,
  ThemedCard,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import { useDatabaseCleanTest } from '@/lib/hooks/useDatabaseCleanTest';
import { useDatabaseTest } from '@/lib/hooks/useDatabaseTest';
import React from 'react';
import { ScrollView, Switch, Text } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [useCleanTest, setUseCleanTest] = React.useState(false);
  const { isReady, stats, error } = useDatabaseTest();
  const cleanTestStatus = useDatabaseCleanTest(useCleanTest);

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
        
        {/* Database Status Card */}
        <ThemedCard style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🔧 Estado de la Base de Datos
          </ThemedText>
          
          {error ? (
            <ThemedText color="error">
              ❌ Error: {error}
            </ThemedText>
          ) : !isReady ? (
            <ThemedText color="secondary">
              🔄 Inicializando base de datos...
            </ThemedText>
          ) : (
            <ThemedView>
              <ThemedText color="success" style={{ marginBottom: theme.spacing.xs }}>
                ✅ Base de datos lista
              </ThemedText>
                {stats && (
                <ThemedView style={{ marginTop: theme.spacing.sm }}>
                  <ThemedText variant="caption" color="secondary">
                    📊 Estadísticas:
                  </ThemedText>
                  <Text style={{ 
                    fontFamily: 'SpaceMono', 
                    fontSize: 12, 
                    color: '#666',
                    marginTop: theme.spacing.xs 
                  }}>
                    {JSON.stringify(stats, null, 2)}
                  </Text>
                </ThemedView>
              )}
            </ThemedView>
          )}
        </ThemedCard>
        
        {/* Clean Migration Test Card */}
        <ThemedCard style={{ marginBottom: theme.spacing.md }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            🧹 Prueba de Migración Limpia
          </ThemedText>
          
          <ThemedView style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: theme.spacing.sm 
          }}>
            <ThemedText>Estado: {cleanTestStatus.phase}</ThemedText>
            <Switch 
              value={useCleanTest} 
              onValueChange={setUseCleanTest}
              disabled={cleanTestStatus.phase !== 'init'} 
            />
          </ThemedView>
          
          {cleanTestStatus.error ? (
            <ThemedText color="error">
              ❌ Error: {cleanTestStatus.error}
            </ThemedText>
          ) : cleanTestStatus.isComplete ? (
            <ThemedView>
              <ThemedText color="success" style={{ marginBottom: theme.spacing.xs }}>
                ✅ Prueba completada exitosamente
              </ThemedText>
              {cleanTestStatus.results && (
                <ThemedView style={{ marginTop: theme.spacing.sm }}>
                  <ThemedText variant="caption" color="secondary">
                    📊 Resultados:
                  </ThemedText>
                  <Text style={{ 
                    fontFamily: 'SpaceMono', 
                    fontSize: 12, 
                    color: '#666',
                    marginTop: theme.spacing.xs 
                  }}>
                    {JSON.stringify({
                      dbHealth: cleanTestStatus.results.dbHealth,
                      userCount: cleanTestStatus.results.users?.length || 0,
                      courseCount: cleanTestStatus.results.courses?.length || 0
                    }, null, 2)}
                  </Text>
                </ThemedView>
              )}
            </ThemedView>
          ) : cleanTestStatus.phase !== 'init' ? (            <ThemedText color="primary">
              🔄 Ejecutando prueba de migración limpia ({cleanTestStatus.phase})...
            </ThemedText>
          ) : (
            <ThemedText color="secondary">
              ⏸️ La prueba no se ha iniciado (activa el switch para probar)
            </ThemedText>
          )}
        </ThemedCard>

        {/* Stats Cards */}
        <ThemedView style={{ 
          flexDirection: 'row', 
          gap: theme.spacing.sm, 
          marginBottom: theme.spacing.lg 
        }}>
          <ThemedCard variant="elevated" padding="medium" style={{ flex: 1 }}>
            <ThemedText variant="h2" color="primary" style={{ textAlign: 'center' }}>
              5
            </ThemedText>
            <ThemedText variant="caption" color="muted" style={{ textAlign: 'center' }}>
              Tareas Pendientes
            </ThemedText>
          </ThemedCard>

          <ThemedCard variant="elevated" padding="medium" style={{ flex: 1 }}>
            <ThemedText variant="h2" color="success" style={{ textAlign: 'center' }}>
              12
            </ThemedText>
            <ThemedText variant="caption" color="muted" style={{ textAlign: 'center' }}>
              Completadas
            </ThemedText>
          </ThemedCard>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            ⚡ Acciones Rápidas
          </ThemedText>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            <ThemedButton 
              title="📝 Nueva Tarea" 
              variant="primary" 
              size="medium"
            />
            <ThemedButton 
              title="📅 Ver Calendario" 
              variant="outline" 
              size="medium"
            />
            <ThemedButton 
              title="📋 Mis Notas" 
              variant="secondary" 
              size="medium"
            />
          </ThemedView>
        </ThemedCard>

        {/* Recent Tasks */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            📋 Tareas Recientes
          </ThemedText>
          
          {/* Task Items */}
          <ThemedView style={{ gap: theme.spacing.sm }}>
            
            {/* Task 1 */}
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
                  Estudiar Cálculo Integral
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary">
                  Vence: Mañana
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ 
                backgroundColor: theme.colors.warning,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm
              }}>
                <ThemedText variant="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  ALTA
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Task 2 */}
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
                  Leer Capítulo 5 - Historia
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary">
                  Vence: En 3 días
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

            {/* Task 3 */}
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
                  Proyecto Final - Química
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary">
                  Vence: Próxima semana
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ 
                backgroundColor: theme.colors.primary,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm
              }}>
                <ThemedText variant="caption" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                  MEDIA
                </ThemedText>
              </ThemedView>
            </ThemedView>

          </ThemedView>
        </ThemedCard>

        {/* Today's Schedule */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            🕐 Horario de Hoy
          </ThemedText>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            
            {/* Schedule Item 1 */}
            <ThemedView style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border
            }}>
              <ThemedView style={{ 
                width: 60,
                alignItems: 'center'
              }}>
                <ThemedText variant="bodySmall" color="primary" style={{ fontWeight: '600' }}>
                  09:00
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  10:30
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Matemáticas II
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary">
                  Aula 205 - Prof. García
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Schedule Item 2 */}
            <ThemedView style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border
            }}>
              <ThemedView style={{ 
                width: 60,
                alignItems: 'center'
              }}>
                <ThemedText variant="bodySmall" color="primary" style={{ fontWeight: '600' }}>
                  14:00
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  15:30
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Laboratorio Química
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary">
                  Lab 3 - Prof. Martínez
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Schedule Item 3 */}
            <ThemedView style={{ 
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: theme.spacing.sm
            }}>
              <ThemedView style={{ 
                width: 60,
                alignItems: 'center'
              }}>
                <ThemedText variant="bodySmall" color="primary" style={{ fontWeight: '600' }}>
                  16:00
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  17:00
                </ThemedText>
              </ThemedView>
              <ThemedView style={{ flex: 1, marginLeft: theme.spacing.md }}>
                <ThemedText variant="body" style={{ fontWeight: '600' }}>
                  Sesión de Estudio
                </ThemedText>
                <ThemedText variant="bodySmall" color="secondary">
                  Biblioteca - Preparar examen
                </ThemedText>
              </ThemedView>
            </ThemedView>

          </ThemedView>
        </ThemedCard>

        {/* Progress Section */}
        <ThemedCard variant="elevated" padding="medium">
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.md }}>
            📈 Progreso Semanal
          </ThemedText>
          
          <ThemedView style={{ 
            backgroundColor: theme.colors.surfaceLight,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            alignItems: 'center'
          }}>
            <ThemedText variant="h2" color="success" style={{ marginBottom: theme.spacing.xs }}>
              75%
            </ThemedText>
            <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
              ¡Buen trabajo! Has completado el 75% de tus tareas esta semana.
            </ThemedText>
            
            {/* Progress Bar Visual */}
            <ThemedView style={{ 
              width: '100%',
              height: 8,
              backgroundColor: theme.colors.border,
              borderRadius: theme.borderRadius.full,
              marginTop: theme.spacing.md,
              overflow: 'hidden'
            }}>
              <ThemedView style={{ 
                width: '75%',
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