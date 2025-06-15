// app/(tabs)/themes-demo.tsx
import {
  ThemedButton,
  ThemedCard,
  ThemedInput,
  ThemedText,
  ThemedView
} from '@/components/ui/ThemedComponents';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView } from 'react-native';

export default function ThemesDemo() {
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
          <ThemedText variant="h1" style={{ textAlign: 'center', marginBottom: theme.spacing.sm }}>
            🎨 StudyVault Themes
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={{ textAlign: 'center' }}>
            Prueba todos los temas disponibles y ve cómo se adaptan los componentes
          </ThemedText>
        </ThemedView>

        {/* Theme Selector */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemeSelector />
          
          {/* Info sobre temas claros/oscuros */}
          <ThemedView style={{ 
            marginTop: theme.spacing.md, 
            paddingTop: theme.spacing.md, 
            borderTopWidth: 1, 
            borderTopColor: theme.colors.border 
          }}>
            <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
              ✨ Nuevos Temas Claros Disponibles
            </ThemedText>
            <ThemedText variant="bodySmall" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
              Ahora cada tema tiene una versión clara y oscura:
            </ThemedText>
            <ThemedView style={{ gap: theme.spacing.xs }}>
              <ThemedText variant="bodySmall" color="muted">
                🌊 Azul Profundo → 🌅 Azul Profundo Claro
              </ThemedText>
              <ThemedText variant="bodySmall" color="muted">
                💜 Púrpura → 🌸 Púrpura Claro
              </ThemedText>
              <ThemedText variant="bodySmall" color="muted">
                🔴 Rojo Carmesí → 🌹 Rojo Carmesí Claro
              </ThemedText>
              <ThemedText variant="bodySmall" color="muted" style={{ color: theme.colors.success }}>
                🍀 Verde Esmeralda → 🌿 Verde Esmeralda Claro
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedCard>

        {/* Typography Examples */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
            📝 Tipografía
          </ThemedText>
          
          <ThemedText variant="h1" style={{ marginBottom: theme.spacing.sm }}>
            Título Principal (H1)
          </ThemedText>
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.sm }}>
            Título Secundario (H2)
          </ThemedText>
          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            Título Terciario (H3)
          </ThemedText>
          <ThemedText variant="body" style={{ marginBottom: theme.spacing.sm }}>
            Texto del cuerpo principal. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </ThemedText>
          <ThemedText variant="bodySmall" style={{ marginBottom: theme.spacing.sm }}>
            Texto del cuerpo pequeño para información secundaria.
          </ThemedText>
          <ThemedText variant="caption" color="muted">
            Texto de caption para información adicional y metadatos.
          </ThemedText>
        </ThemedCard>

        {/* Buttons Examples */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
            🔘 Botones
          </ThemedText>
          
          <ThemedView style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            <ThemedButton title="Botón Primario" variant="primary" />
            <ThemedButton title="Botón Secundario" variant="secondary" />
            <ThemedButton title="Botón Outline" variant="outline" />
            <ThemedButton title="Botón Ghost" variant="ghost" />
          </ThemedView>

          <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
            Estados y Tamaños
          </ThemedText>
          <ThemedView style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            <ThemedButton title="Éxito" variant="success" size="small" />
            <ThemedButton title="Advertencia" variant="warning" size="medium" />
            <ThemedButton title="Error" variant="error" size="large" />
            <ThemedButton title="Deshabilitado" variant="primary" disabled />
            <ThemedButton title="Cargando" variant="primary" loading />
          </ThemedView>
        </ThemedCard>

        {/* Colors Examples */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
            🌈 Colores del Tema
          </ThemedText>
          
          <ThemedView style={{ gap: theme.spacing.sm }}>
            <ThemedText color="primary">Texto Primario</ThemedText>
            <ThemedText color="secondary">Texto Secundario</ThemedText>
            <ThemedText color="muted">Texto Atenuado</ThemedText>
            <ThemedText color="success">Texto de Éxito</ThemedText>
            <ThemedText color="warning">Texto de Advertencia</ThemedText>
            <ThemedText color="error">Texto de Error</ThemedText>
          </ThemedView>

          <ThemedView style={{ 
            flexDirection: 'row', 
            flexWrap: 'wrap', 
            gap: theme.spacing.sm, 
            marginTop: theme.spacing.md 
          }}>
            {Object.entries(theme.colors).map(([key, color]) => (
              <ThemedView 
                key={key}
                style={{
                  backgroundColor: color,
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.sm,
                  minWidth: 80,
                  alignItems: 'center',
                }}
              >
                <ThemedText 
                  variant="caption" 
                  style={{ 
                    color: shouldUseWhiteText(color) ? '#FFFFFF' : '#000000',
                    fontWeight: '600' 
                  }}
                >
                  {key}
                </ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        </ThemedCard>

        {/* Forms Examples */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
            📋 Formularios
          </ThemedText>
          
          <ThemedInput 
            label="Nombre de usuario"
            placeholder="Ingresa tu nombre de usuario"
            style={{ marginBottom: theme.spacing.md }}
          />
          
          <ThemedInput 
            label="Email"
            placeholder="tu@email.com"
            keyboardType="email-address"
            style={{ marginBottom: theme.spacing.md }}
          />
          
          <ThemedInput 
            label="Contraseña"
            placeholder="••••••••"
            secureTextEntry
            error="La contraseña debe tener al menos 8 caracteres"
            style={{ marginBottom: theme.spacing.md }}
          />
          
          <ThemedButton title="Iniciar Sesión" variant="primary" />
        </ThemedCard>

        {/* Cards Examples */}
        <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.lg }}>
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
            🃏 Tarjetas
          </ThemedText>
          
          <ThemedCard variant="elevated" padding="medium" style={{ marginBottom: theme.spacing.md }}>
            <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
              Tarjeta Elevada
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              Esta tarjeta tiene sombra y se ve flotante sobre el fondo.
            </ThemedText>
          </ThemedCard>

          <ThemedCard variant="outlined" padding="medium" style={{ marginBottom: theme.spacing.md }}>
            <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
              Tarjeta con Borde
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              Esta tarjeta tiene un borde definido sin sombra.
            </ThemedText>
          </ThemedCard>

          <ThemedCard variant="flat" padding="medium">
            <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
              Tarjeta Plana
            </ThemedText>
            <ThemedText variant="body" color="secondary">
              Esta tarjeta es completamente plana, sin sombra ni borde.
            </ThemedText>
          </ThemedCard>
        </ThemedCard>

        {/* StudyVault Specific Examples */}
        <ThemedCard variant="elevated" padding="medium">
          <ThemedText variant="h2" style={{ marginBottom: theme.spacing.md }}>
            📚 Componentes StudyVault
          </ThemedText>
          
          <ThemedCard variant="outlined" padding="small" style={{ marginBottom: theme.spacing.md }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedView>
                <ThemedText variant="h3">Matemáticas II</ThemedText>
                <ThemedText variant="bodySmall" color="secondary">Examen: 15 Jun 2025</ThemedText>
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
          </ThemedCard>

          <ThemedCard variant="outlined" padding="small" style={{ marginBottom: theme.spacing.md }}>
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <ThemedView>
                <ThemedText variant="h3">Historia Mundial</ThemedText>
                <ThemedText variant="bodySmall" color="secondary">Ensayo: 20 Jun 2025</ThemedText>
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
          </ThemedCard>

          <ThemedView style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <ThemedButton title="Agregar Tarea" variant="primary" style={{ flex: 1 }} />
            <ThemedButton title="Ver Calendario" variant="outline" style={{ flex: 1 }} />
          </ThemedView>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
}

// Helper function to determine text color based on background
function shouldUseWhiteText(backgroundColor: string): boolean {
  // Lista de colores oscuros que necesitan texto blanco
  const darkColors = [
    '#1E3A8A', '#7C3AED', '#DA1E37', '#641220', '#6E1423', '#85182A', // Temas oscuros originales
    '#0F172A', '#1E293B', '#334155', '#475569', // Deep blue dark
    '#1C1917', '#292524', '#44403C', '#57534E', // Purple dark  
    '#A11D33', '#BD1F36', '#C71F37', // Crimson red dark
    '#064E3B', '#065F46', '#047857', '#10B981' // Verde Esmeralda dark
  ];
  
  // Verificar si el color está en la lista de colores oscuros
  if (darkColors.includes(backgroundColor)) {
    return true;
  }
  
  // Verificar patrones hexadecimales oscuros (números bajos = oscuro)
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calcular luminancia (fórmula simplificada)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Si la luminancia es menor a 0.5, usar texto blanco
    return luminance < 0.5;
  }
  
  return false;
}
