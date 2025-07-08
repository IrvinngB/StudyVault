import CourseCard from '@/components/courses/Coursescard';
import { ThemedButton, ThemedText, ThemedView } from '@/components/ui/ThemedComponents';
import { ClassData, classService } from '@/database/services/courseService';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';

export default function GradesScreen() {
  const { theme } = useTheme();
  const [courses, setCourses] = useState<ClassData[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<ClassData[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recargar cursos cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      loadGrades();
    }, [])
  );

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const coursesData = await classService.getAllClasses();
      
      setCourses(coursesData);
      setFilteredCourses(coursesData); // Inicialmente mostrar todos los cursos
    } catch (error) {
      console.error('❌ Error al cargar cursos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      
      // Mostrar lista vacía en caso de error
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGrades();
    setRefreshing(false);
  };

  const handleCreateGrades = () => {
    router.push('/grades/create');
  };

  const handleRetry = () => {
    loadGrades();
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = courses.filter(course =>
      course.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  const renderCourseItem = ({ item }: { item: ClassData }) => (
    <CourseCard course={item} />
  );

  const renderEmptyState = () => {
    if (error) {
      return (
        <ThemedView 
          variant="surface" 
          style={{
            flex: 1,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: theme.spacing.lg
          }}
        >
          <Ionicons 
            name="warning" 
            size={48} 
            color={theme.colors.error} 
            style={{ marginBottom: theme.spacing.md }}
          />
          <ThemedText 
            variant="h3" 
            style={{ 
              color: theme.colors.error,
              marginBottom: theme.spacing.sm,
              textAlign: 'center'
            }}
          >
            Error al cargar cursos
          </ThemedText>
          <ThemedText 
            variant="body" 
            style={{ 
              color: theme.colors.secondary,
              textAlign: 'center',
              marginBottom: theme.spacing.md 
            }}
          >
            {error}
          </ThemedText>
          <ThemedButton
            title="Reintentar"
            variant="outline"
            onPress={handleRetry}
          />
        </ThemedView>
      );
    }

    // Estado vacío sin error
    return (
      <ThemedView 
        variant="surface" 
        style={{
          flex: 1,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: theme.spacing.lg
        }}
      >
        <Ionicons 
          name="flag" 
          size={48} 
          color={theme.colors.secondary} 
          style={{ marginBottom: theme.spacing.md }}
        />
        <ThemedText 
          variant="h3" 
          style={{ 
            color: theme.colors.secondary,
            marginBottom: theme.spacing.sm,
            textAlign: 'center'
          }}
        >
          ¡Comienza tu organización!
        </ThemedText>
        <ThemedText 
          variant="body" 
          style={{ 
            color: theme.colors.secondary,
            textAlign: 'center'
          }}
        >
          Crea tu primer curso para empezar a gestionar tus tareas, notas y horarios de estudio.
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView variant="background" style={{ flex: 1, padding: theme.spacing.lg }}>
      {/* Header */}
      <View style={{ marginBottom: theme.spacing.xl }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: theme.spacing.sm 
        }}>
          <Ionicons 
            name="book" 
            size={32} 
            color={theme.colors.primary} 
            style={{ marginRight: theme.spacing.sm }}
          />
          <ThemedText variant="h1">
            Mis Cursos
          </ThemedText>
        </View>
        <ThemedText 
          variant="body" 
          style={{ color: theme.colors.secondary }}
        >
          Gestiona tus materias y organiza tu semestre académico
        </ThemedText>
      </View>

      <View style={{marginBottom: theme.spacing.xl}}> 
        
      </View>


      

      {/* Action Button */}
      <ThemedButton
        title="Agregar nueva categoría"
        variant="primary"
        size="large"
        onPress={handleCreateGrades}
        style={{ marginBottom: theme.spacing.lg }}
      />

      {/* Courses List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText 
            variant="body" 
            style={{ 
              color: theme.colors.secondary,
              marginTop: theme.spacing.md 
            }}
          >
            Cargando cursos...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={searchText ? filteredCourses : courses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id || `${item.name}-${item.created_at}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: theme.spacing.xl
          }}
        />
      )}
    </ThemedView>
  );
}