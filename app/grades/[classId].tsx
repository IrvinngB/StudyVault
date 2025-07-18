import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ThemedText, ThemedButton } from '@/components/ui/ThemedComponents';
import CourseHeaderCard from '@/components/grades/CourseHeaderCard';
import CategoryCard from '@/components/grades/CategoryCard';
import GradeSummaryCard from '@/components/grades/GradeSummaryCard';
import AddCategoryForm from '@/components/grades/AddCategoryForm';
import { classService } from '@/database/services/courseService';
import { gradeService, GradeData } from '@/database/services/gradesService';

interface Categoria {
  id: string;
  name: string;
  percentage: number;
  evaluaciones: GradeData[];
}

export default function GradesScreen() {
  const { theme } = useTheme();
  const { classId } = useLocalSearchParams<{ classId: string }>();

  const [materia, setMateria] = useState<any>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clase = await classService.getClassById(classId);
        setMateria(clase);

        const allGrades = await gradeService.getAllGrades();
        const gradesDeClase = allGrades.filter(g => g.class_id === classId);

        const agrupadas = gradesDeClase.reduce((acc, grade) => {
          const existente = acc.find(c => c.name === grade.name);
          if (existente) {
            existente.evaluaciones.push(grade);
          } else {
            acc.push({
              id: grade.name,
              name: grade.name,
              percentage: grade.weight ?? 0,
              evaluaciones: [grade]
            });
          }
          return acc;
        }, [] as Categoria[]);

        setCategorias(agrupadas);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (classId) fetchData();
  }, [classId]);

  const handleAddCategoria = async (categoria: { nombre: string; porcentaje: number }) => {
    setCategorias(prev => [
      ...prev,
      {
        id: categoria.nombre,
        name: categoria.nombre,
        percentage: categoria.porcentaje,
        evaluaciones: []
      }
    ]);
    setShowAddCategoryForm(false);
  };

  const handleAddEvaluacion = async (categoriaId: string, evaluacion: {
    nombre: string;
    nota: number;
    notaMaxima: number;
    fecha: string;
    descripcion?: string;
  }) => {
    try {
      const nueva = await gradeService.createGrade({
        class_id: String(classId),
        name: categoriaId,
        title: evaluacion.nombre,
        description: evaluacion.descripcion,
        value: evaluacion.notaMaxima,
        score: evaluacion.nota,
        graded_at: evaluacion.fecha,
        weight: categorias.find(c => c.id === categoriaId)?.percentage ?? 0
      });

      setCategorias(prev =>
        prev.map(cat =>
          cat.id === categoriaId
            ? { ...cat, evaluaciones: [...cat.evaluaciones, nueva] }
            : cat
        )
      );
    } catch (error) {
      console.error('Error al crear evaluación:', error);
    }
  };

  if (loading || !materia) {
    return (
      <ScrollView style={{ padding: theme.spacing.md }}>
        <ThemedText>Cargando información de la materia...</ThemedText>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.background }}>
      <CourseHeaderCard
        nombre={materia.name}
        codigo={materia.code}
        creditos={materia.credits}
        escala={materia.escala ?? 100}
        notaActual={materia.notaActual ?? 0}
      />

      {categorias.length === 0 ? (
        <AddCategoryForm onSubmit={handleAddCategoria} />
      ) : (
        <>
          {categorias.map(cat => (
            <CategoryCard
                key={cat.id}
                nombre={cat.name}
                porcentaje={cat.percentage}
                evaluaciones={cat.evaluaciones.map(ev => ({
                    nombre: ev.title ?? 'Sin título',
                    nota: ev.score,
                    notaMaxima: ev.value,
                    fecha: ev.graded_at ?? '',
                    descripcion: ev.description
                }))}
                onAddEvaluacion={(ev) => handleAddEvaluacion(cat.id, ev)}
            />
        ))}


          {showAddCategoryForm ? (
            <AddCategoryForm
              onSubmit={handleAddCategoria}
              onCancel={() => setShowAddCategoryForm(false)}
            />
          ) : (
            <ThemedButton
              title="Agregar nueva categoría"
              onPress={() => setShowAddCategoryForm(true)}
              style={{ marginTop: theme.spacing.lg }}
            />
          )}

          <GradeSummaryCard
            categorias={categorias.map(cat => ({
                nombre: cat.name,
                porcentaje: cat.percentage,
                evaluaciones: cat.evaluaciones.map(ev => ({
                nombre: ev.title ?? 'Sin título',
                nota: ev.score,
                notaMaxima: ev.value,
                fecha: ev.graded_at ?? '',
                descripcion: ev.description
            }))
        }))}
        escala={materia.escala ?? 100}
    />

        </>
      )}
    </ScrollView>
  );
}
