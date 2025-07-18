import React from 'react';
import { View } from 'react-native';
import { ThemedCard, ThemedText } from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';

interface CourseHeaderCardProps {
  nombre: string;
  codigo?: string;
  creditos?: number;
  escala: number;
  notaActual: number;
}

export default function CourseHeaderCard({
  nombre,
  codigo,
  creditos,
  escala,
  notaActual
}: CourseHeaderCardProps) {
  const { theme } = useTheme();

  return (
    <ThemedCard variant="elevated" padding="large" style={{ marginBottom: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Nota actual */}
        <View style={{ justifyContent: 'center' }}>
          <ThemedText
            variant="h1"
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: theme.spacing.xs
            }}
          >
            {notaActual.toFixed(1)}
          </ThemedText>
          <ThemedText variant="caption" color="secondary">
            Nota actual
          </ThemedText>
        </View>

        {/* Info del curso */}
        <View style={{ alignItems: 'flex-end' }}>
          <ThemedText variant="h2" style={{ fontWeight: 'bold', marginBottom: theme.spacing.xs }}>
            {nombre}
          </ThemedText>
          {codigo && (
            <ThemedText variant="bodySmall" color="secondary">
              Código: {codigo}
            </ThemedText>
          )}
          {creditos !== undefined && (
            <ThemedText variant="bodySmall" color="secondary">
              Créditos: {creditos}
            </ThemedText>
          )}
          <ThemedText variant="bodySmall" color="secondary">
            Escala: {escala}
          </ThemedText>
        </View>
      </View>
    </ThemedCard>
  );
}
