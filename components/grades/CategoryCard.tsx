import React, { useState } from 'react';
import { View } from 'react-native';
import { ThemedCard, ThemedText, ThemedButton, ThemedInput } from '@/components/ui/ThemedComponents';
import { useTheme } from '@/hooks/useTheme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface Evaluacion {
  nombre: string;
  nota: number;
  notaMaxima: number;
  fecha: string;
  descripcion?: string;
}

interface CategoriaCardProps {
  nombre: string;
  porcentaje: number;
  evaluaciones: Evaluacion[];
  onAddEvaluacion: (evaluacion: Evaluacion) => void;
}

export default function CategoryCard({
  nombre,
  porcentaje,
  evaluaciones,
  onAddEvaluacion
}: CategoriaCardProps) {
  const { theme } = useTheme();
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    nota: '',
    notaMaxima: '',
    fecha: '',
    descripcion: ''
  });
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleSubmit = () => {
    const nota = parseFloat(formData.nota);
    const notaMaxima = parseFloat(formData.notaMaxima);

    if (!formData.nombre.trim() || isNaN(nota) || isNaN(notaMaxima) || notaMaxima <= 0) {
      alert('Completa los campos correctamente');
      return;
    }

    const nuevaEvaluacion: Evaluacion = {
      nombre: formData.nombre,
      nota,
      notaMaxima,
      fecha: formData.fecha,
      descripcion: formData.descripcion
    };

    onAddEvaluacion(nuevaEvaluacion);
    setFormData({ nombre: '', nota: '', notaMaxima: '', fecha: '', descripcion: '' });
    setFormVisible(false);
  };

  const handleConfirmDate = (date: Date) => {
    setFormData(prev => ({ ...prev, fecha: date.toISOString().split('T')[0] }));
    setDatePickerVisible(false);
  };

  return (
    <ThemedCard variant="outlined" padding="medium" style={{ marginTop: theme.spacing.md }}>
      <ThemedText variant="h3">{nombre}</ThemedText>
      <ThemedText>Porcentaje: {porcentaje}%</ThemedText>

      <ThemedButton
        title={formVisible ? 'Cancelar' : 'Agregar evaluación'}
        variant={formVisible ? 'outline' : 'primary'}
        onPress={() => setFormVisible(!formVisible)}
        style={{ marginTop: theme.spacing.sm }}
      />

      {formVisible && (
        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <ThemedInput
            label="Nombre"
            value={formData.nombre}
            onChangeText={text => setFormData(prev => ({ ...prev, nombre: text }))}
          />
          <ThemedInput
            label="Nota obtenida"
            value={formData.nota}
            keyboardType="numeric"
            onChangeText={text => setFormData(prev => ({ ...prev, nota: text }))}
          />
          <ThemedInput
            label="Nota máxima"
            value={formData.notaMaxima}
            keyboardType="numeric"
            onChangeText={text => setFormData(prev => ({ ...prev, notaMaxima: text }))}
          />
          <ThemedInput
            label="Descripción"
            value={formData.descripcion}
            onChangeText={text => setFormData(prev => ({ ...prev, descripcion: text }))}
            multiline
          />
          <ThemedButton
            title={formData.fecha || 'Seleccionar fecha'}
            variant="outline"
            onPress={() => setDatePickerVisible(true)}
          />
          <DateTimePickerModal
            isVisible={datePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={() => setDatePickerVisible(false)}
          />
          <ThemedButton title="Guardar evaluación" onPress={handleSubmit} />
        </View>
      )}

      {evaluaciones.length > 0 && (
        <View style={{ marginTop: theme.spacing.md }}>
          {evaluaciones.map((ev, index) => (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.surface,
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                marginBottom: theme.spacing.sm,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}
            >
              <ThemedText variant="body" style={{ fontWeight: 'bold' }}>{ev.nombre}</ThemedText>
              <ThemedText>Nota: {ev.nota} / {ev.notaMaxima}</ThemedText>
              <ThemedText>Fecha: {ev.fecha || 'No definida'}</ThemedText>
              {ev.descripcion && <ThemedText color="secondary">{ev.descripcion}</ThemedText>}
            </View>
          ))}
        </View>
      )}
    </ThemedCard>
  );
}
