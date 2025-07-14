import { ThemedButton, ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { ClassData, classService } from '@/database/services/courseService';
import { useTheme } from '@/hooks/useTheme';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, TextInput, TouchableOpacity, View } from 'react-native';

type DiaSemana = 'Lun' | 'Mar' | 'Mié' | 'Jue' | 'Vie' | 'Sáb' | 'Dom';
type Hora = string;

interface Clase {
  idCurso: string;
  salon?: string;
}

type Horario = Record<DiaSemana, Record<Hora, Clase | null>>;

const dias: DiaSemana[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function HorarioClases() {
  const { theme } = useTheme();
  const [horas, setHoras] = useState<Hora[]>([]);
  const [horario, setHorario] = useState<Horario>({
    Dom: {}, Lun: {}, Mar: {}, Mié: {}, Jue: {}, Vie: {}, Sáb: {},
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [verDetalle, setVerDetalle] = useState<{ dia: DiaSemana; hora: Hora } | null>(null);
  const [claseActual, setClaseActual] = useState<{ dia: DiaSemana; hora: Hora } | null>(null);
  const [idCurso, setIdCurso] = useState('');
  const [salon, setSalon] = useState('');
  const [courses, setCourses] = useState<ClassData[]>([]);

  useEffect(() => {
    classService.getAllClasses().then(setCourses).catch(() => setCourses([]));
  }, []);

  const abreviar = (texto: string, max: number = 4) =>
    texto.length > max ? texto.slice(0, max) + '…' : texto;

  const abrirEditor = (dia: DiaSemana, hora: Hora) => {
    setClaseActual({ dia, hora });
    const clase = horario[dia]?.[hora];
    setIdCurso(clase?.idCurso || '');
    setSalon(clase?.salon || '');
    setModalVisible(true);
  };

  const mostrarDetalleClase = (dia: DiaSemana, hora: Hora) => {
    const clase = horario[dia]?.[hora];
    if (clase) {
      setVerDetalle({ dia, hora });
    } else {
      abrirEditor(dia, hora);
    }
  };

  const guardarClase = () => {
    if (!idCurso.trim()) {
      alert('Por favor, selecciona un curso antes de guardar.');
      return;
    }
    if (claseActual) {
      const nuevoHorario = { ...horario };
      if (!nuevoHorario[claseActual.dia]) nuevoHorario[claseActual.dia] = {};
      nuevoHorario[claseActual.dia][claseActual.hora] = { idCurso, salon };
      setHorario(nuevoHorario);
    }
    setModalVisible(false);
  };

  const agregarFilaHora = () => {
    const nueva = '';
    if (!horas.includes(nueva)) {
      setHoras([...horas, nueva]);
    }
  };

  const actualizarHora = (index: number, valor: string) => {
    const nuevasHoras = [...horas];
    nuevasHoras[index] = valor;
    setHoras(nuevasHoras);
  };

  const obtenerNombreCurso = (id: string) => {
    const curso = courses.find(c => c.id === id);
    return curso ? curso.name : '';
  };

  return (
    <ThemedView variant="background" style={{ flex: 1, padding: theme.spacing.lg }}>
      <ThemedText variant="h1" style={{ marginBottom: theme.spacing.md }}>
        Horario de Clases
      </ThemedText>

      <ThemedButton title="Agregar fila" onPress={agregarFilaHora} size="small" style={{ marginBottom: theme.spacing.md }} />

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.sm }}>
        <View style={{ width: 40 }} />
        {dias.map(dia => (
          <ThemedView key={dia} style={{ flex: 1, alignItems: 'center', padding: 4 }}>
            <ThemedText variant="bodySmall">{dia}</ThemedText>
          </ThemedView>
        ))}
      </View>

      {horas.map((hora, index) => (
        <View key={index} style={{ flexDirection: 'row', marginBottom: 2 }}>
          <TextInput
            value={hora}
            onChangeText={(text) => actualizarHora(index, text)}
            placeholder="Hora"
            style={{
              width: 40,
              borderBottomWidth: 1,
              borderColor: theme.colors.border,
              color: theme.colors.text,
              marginRight: 4,
              textAlign: 'center',
              fontSize: 12,
            }}
          />
          {dias.map(dia => {
            const clase = horario[dia]?.[hora];
            return (
              <TouchableOpacity
                key={dia}
                onPress={() => mostrarDetalleClase(dia, hora)}
                style={{
                  flex: 1,
                  minHeight: 40,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: theme.borderRadius.sm,
                  marginHorizontal: 1,
                  paddingHorizontal: 2,
                }}
              >
                <ThemedText variant="bodySmall">
                  {clase ? abreviar(obtenerNombreCurso(clase.idCurso)) : ''}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <Modal visible={modalVisible} transparent>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
          <ThemedView style={{ backgroundColor: theme.colors.surface, padding: 20, borderRadius: theme.borderRadius.lg, width: '80%' }}>
            <ThemedText variant="h2" style={{ marginBottom: theme.spacing.sm }}>
              Editar Clase
            </ThemedText>
            <ThemedText>Curso:</ThemedText>
            <Picker
              selectedValue={idCurso}
              onValueChange={(value) => setIdCurso(value)}
              style={{ color: theme.colors.text }}
              dropdownIconColor={theme.colors.text}
            >
              <Picker.Item label="Selecciona un curso" value="" />
              {courses.map(course => (
                <Picker.Item key={course.id} label={course.name} value={course.id} />
              ))}
            </Picker>
            <ThemedText>Salón:</ThemedText>
            <TextInput
              value={salon}
              onChangeText={setSalon}
              style={{
                borderBottomWidth: 1,
                marginBottom: 20,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }}
            />
            <ThemedButton title="Guardar" onPress={guardarClase} />
          </ThemedView>
        </ThemedView>
      </Modal>

      {verDetalle && (
        <Modal transparent visible>
          <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
            <ThemedView style={{ backgroundColor: theme.colors.surface, padding: 20, borderRadius: theme.borderRadius.lg, width: '80%' }}>
              <ThemedText variant="h2" style={{ marginBottom: theme.spacing.sm }}>
                Detalle de Clase
              </ThemedText>
              <ThemedText>
                Materia: {obtenerNombreCurso(horario[verDetalle.dia][verDetalle.hora]?.idCurso || '')}
              </ThemedText>
              <ThemedText>
                Salón: {horario[verDetalle.dia][verDetalle.hora]?.salon}
              </ThemedText>
              <ThemedButton
                title="Editar"
                onPress={() => {
                  abrirEditor(verDetalle.dia, verDetalle.hora);
                  setVerDetalle(null);
                }}
                style={{ marginTop: theme.spacing.md }}
              />
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
    </ThemedView>
  );
}