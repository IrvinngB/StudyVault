import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  TextInput,
  View,
  Button,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText, ThemedButton, ThemedCard, ThemedView } from '@/components/ui/ThemedComponents';

type Evaluacion = {
  nombre: string;
  nota: number;
  notaMaxima: number;
  fecha: string;
};

type Categoria = {
  id: string;
  nombre: string;
  porcentaje: number;
  evaluaciones: Evaluacion[];
};

type EvaluacionForm = {
  nombre: string;
  nota: string;
  notaMaxima: string;
  fecha: string;
  categoriaId: string;
};

const materia = {
  nombre: 'Matemáticas Aplicadas',
  codigo: 'MAT101',
  escala: 100,
  notaActual: 78,
};

const categoriasIniciales: Categoria[] = [
  {
    id: '1',
    nombre: 'Parcial',
    porcentaje: 33,
    evaluaciones: [],
  },
  {
    id: '2',
    nombre: 'Laboratorio',
    porcentaje: 33,
    evaluaciones: [],
  },
  {
    id: '3',
    nombre: 'Semestral',
    porcentaje: 34,
    evaluaciones: [],
  },
];

export default function GradesScreen() {
  const { theme } = useTheme();
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciales);
  const [modalVisible, setModalVisible] = useState(false);
  const [evaluacionData, setEvaluacionData] = useState<EvaluacionForm>({
    nombre: '',
    nota: '',
    notaMaxima: '',
    fecha: '',
    categoriaId: '',
  });

  const abrirModal = (categoriaId: string) => {
    setEvaluacionData({
      nombre: '',
      nota: '',
      notaMaxima: '',
      fecha: '',
      categoriaId,
    });
    setModalVisible(true);
  };

  const agregarEvaluacion = () => {
    const { nombre, nota, notaMaxima, fecha } = evaluacionData;
    if (
      !nombre.trim() ||
      isNaN(Number(nota)) ||
      isNaN(Number(notaMaxima)) ||
      Number(notaMaxima) <= 0
    ) {
      alert('Por favor, completa todos los campos correctamente');
      return;
    }

    const nuevaEvaluacion: Evaluacion = {
      nombre,
      nota: parseFloat(nota),
      notaMaxima: parseFloat(notaMaxima),
      fecha,
    };

    const nuevasCategorias = categorias.map((cat) =>
      cat.id === evaluacionData.categoriaId
        ? { ...cat, evaluaciones: [...cat.evaluaciones, nuevaEvaluacion] }
        : cat
    );

    setCategorias(nuevasCategorias);
    setModalVisible(false);
  };

  const calcularResumen = (): string => {
    let total = 0;

    categorias.forEach((cat) => {
      const sumaNotas = cat.evaluaciones.reduce((acc, ev) => {
        const notaEscalada = (ev.nota / ev.notaMaxima) * materia.escala;
        return acc + notaEscalada;
      }, 0);

      const promedio =
        cat.evaluaciones.length > 0 ? sumaNotas / cat.evaluaciones.length : 0;

      total += (promedio / materia.escala) * cat.porcentaje;
    });

    return ((total * materia.escala) / 100).toFixed(2);
  };

  return (
    <ScrollView style={{ flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.background }}>
      <ThemedCard variant="elevated" padding="medium">
        <ThemedText variant="h1">{materia.nombre}</ThemedText>
        <ThemedText>Código: {materia.codigo}</ThemedText>
        <ThemedText>Escala: {materia.escala}</ThemedText>
        <ThemedText>Nota actual: {materia.notaActual}</ThemedText>
      </ThemedCard>

      <ThemedText variant="h2" style={{ marginTop: theme.spacing.lg }}>Categorías:</ThemedText>

      {categorias.map((cat) => (
        <ThemedCard key={cat.id} variant="outlined" padding="medium" style={{marginTop: 20}}>
          <ThemedText variant="h3">{cat.nombre}</ThemedText>
          <ThemedText>Porcentaje: {cat.porcentaje}%</ThemedText>
          <ThemedText>Evaluaciones: {cat.evaluaciones.length}</ThemedText>

          <ThemedButton
            variant="outline"
            style={{ marginTop: theme.spacing.md }}
            title="Agregar evaluación"
            onPress={() => abrirModal(cat.id)}
            textStyle={{ color: theme.colors.primary }}
          />

          {cat.evaluaciones.map((ev, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#e6f0ff',
                padding: 10,
                borderRadius: 8,
                marginTop: 10,
              }}
            >
              <ThemedText variant="body" style={{ fontWeight: 'bold' }}>{ev.nombre}</ThemedText>
              <ThemedText>Nota: {ev.nota} / {ev.notaMaxima}</ThemedText>
              <ThemedText>Fecha: {ev.fecha}</ThemedText>
            </View>
          ))}
        </ThemedCard>
      ))}
      
      <ThemedCard variant="outlined" padding="medium" style={{marginTop: 20}}>
        <ThemedText variant="h2" style={{ marginTop: theme.spacing.lg }}>Resumen de Calificaciones</ThemedText>
        <ThemedText>Nota ponderada: {calcularResumen()} / {materia.escala}</ThemedText>
      </ThemedCard>
      

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 20
        }}>
          <View style={{
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: 10
          }}>
            <ThemedText>Nombre:</ThemedText>
            <TextInput
              style={{
                borderBottomWidth: 1,
                marginBottom: 10,
                padding: 5,
                color: theme.colors.text
              }}
              value={evaluacionData.nombre}
              onChangeText={(text) =>
                setEvaluacionData({ ...evaluacionData, nombre: text })
              }
            />

            <ThemedText>Nota:</ThemedText>
            <TextInput
              keyboardType="numeric"
              style={{
                borderBottomWidth: 1,
                marginBottom: 10,
                padding: 5,
                color: theme.colors.text
              }}
              value={evaluacionData.nota}
              onChangeText={(text) =>
                setEvaluacionData({ ...evaluacionData, nota: text })
              }
            />

            <ThemedText>Nota Máxima:</ThemedText>
            <TextInput
              keyboardType="numeric"
              style={{
                borderBottomWidth: 1,
                marginBottom: 10,
                padding: 5,
                color: theme.colors.text
              }}
              value={evaluacionData.notaMaxima}
              onChangeText={(text) =>
                setEvaluacionData({ ...evaluacionData, notaMaxima: text })
              }
            />

            <ThemedText>Fecha:</ThemedText>
            <TextInput
              style={{
                borderBottomWidth: 1,
                marginBottom: 10,
                padding: 5,
                color: theme.colors.text
              }}
              value={evaluacionData.fecha}
              onChangeText={(text) =>
                setEvaluacionData({ ...evaluacionData, fecha: text })
              }
            />

            <Button title="Guardar" onPress={agregarEvaluacion} />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
