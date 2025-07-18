import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import {
  ThemedCard,
  ThemedText,
  ThemedInput,
  ThemedButton
} from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';

interface AddCategoryFormProps {
  onSubmit: (categoria: { nombre: string; porcentaje: number }) => void;
  onCancel?: () => void;
}

export default function AddCategoryForm({ onSubmit, onCancel }: AddCategoryFormProps) {
  const { theme } = useTheme();
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const porcentajeNum = parseFloat(porcentaje);

    if (!nombre.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    if (isNaN(porcentajeNum) || porcentajeNum <= 0 || porcentajeNum > 100) {
      setError('El porcentaje debe ser un número entre 1 y 100');
      return;
    }

    setError('');
    onSubmit({ nombre: nombre.trim(), porcentaje: porcentajeNum });
    setNombre('');
    setPorcentaje('');
  };

  return (
    <ThemedCard variant="outlined" padding="large" style={{ marginTop: theme.spacing.md }}>
      <ThemedText variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        ➕ Nueva Categoría
      </ThemedText>

      <View style={{ gap: theme.spacing.md }}>
        <ThemedInput
          label="Nombre de la categoría"
          value={nombre}
          onChangeText={setNombre}
          error={error.includes('nombre') ? error : undefined}
        />

        <ThemedInput
          label="Porcentaje que representa"
          value={porcentaje}
          onChangeText={setPorcentaje}
          keyboardType="numeric"
          error={error.includes('porcentaje') ? error : undefined}
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <ThemedButton
            title="Cancelar"
            variant="outline"
            onPress={onCancel}
            style={{ flex: 1 }}
          />
          <ThemedButton
            title="Agregar"
            variant="primary"
            onPress={handleSubmit}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </ThemedCard>
  );
}
