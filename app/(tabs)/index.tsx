import { Ionicons } from '@expo/vector-icons';
<<<<<<< HEAD
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const App = () => {
=======
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const App = () => {
  // Esto es lo nuevo: useRouter para navegar entre pantallas
  const router = useRouter();

>>>>>>> 9bd0cb2 (feat: agregar sección de perfil con políticas, información de la app, edición de perfil y apartado de ayuda con contactos)
  const navItems = [
    { id: 'schedule', icon: 'calendar-outline', label: 'Horarios', color: '#4F46E5' },
    { id: 'tasks', icon: 'checkmark-circle-outline', label: 'Tareas', color: '#059669' },
    { id: 'notes', icon: 'book-outline', label: 'Notas', color: '#DC2626' },
    { id: 'analytics', icon: 'bar-chart-outline', label: 'Análisis', color: '#7C3AED' },
    { id: 'settings', icon: 'settings-outline', label: 'Ajustes', color: '#6B7280' }
  ];

  const quickActions = [
    { id: 'add-task', icon: 'add-circle', label: 'Nueva Tarea', color: '#059669' },
    { id: 'add-note', icon: 'create', label: 'Nueva Nota', color: '#DC2626' },
    { id: 'pomodoro', icon: 'time', label: 'Pomodoro', color: '#F59E0B' },
    { id: 'calendar', icon: 'today', label: 'Calendario', color: '#4F46E5' }
  ];

  const handleNavPress = (itemId: string) => {
    console.log(`Navegando a: ${itemId}`);
    // Aquí se implementará la navegación más adelante
  };

  const handleQuickAction = (actionId: string) => {
    console.log(`Acción rápida: ${actionId}`);
    // Aquí se implementarán las acciones rápidas
  };

<<<<<<< HEAD
=======
  // Nueva función para navegar al perfil
  const handleProfilePress = () => {
    router.push('/profile'); // Esto navega a la pantalla de perfil
  };

>>>>>>> 9bd0cb2 (feat: agregar sección de perfil con políticas, información de la app, edición de perfil y apartado de ayuda con contactos)
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola! 👋</Text>
          <Text style={styles.title}>StudyVault</Text>
        </View>
<<<<<<< HEAD
        <TouchableOpacity style={styles.profileButton}>
=======
        {/* Botón del perfil actualizado con navegación */}
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
>>>>>>> 9bd0cb2 (feat: agregar sección de perfil con políticas, información de la app, edición de perfil y apartado de ayuda con contactos)
          <Ionicons name="person-circle-outline" size={32} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { borderColor: action.color }]}
                onPress={() => handleQuickAction(action.id)}
              >
                <Ionicons name={action.icon as any} size={24} color={action.color} />
                <Text style={[styles.quickActionLabel, { color: action.color }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Hoy</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
              <Text style={styles.summaryText}>3 tareas completadas</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="calendar" size={20} color="#4F46E5" />
              <Text style={styles.summaryText}>2 clases pendientes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="time" size={20} color="#F59E0B" />
              <Text style={styles.summaryText}>45 min estudiados</Text>
            </View>
          </View>
        </View>

        {/* Next Class */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próxima Clase</Text>
          <View style={styles.nextClassCard}>
            <View style={styles.nextClassInfo}>
              <Text style={styles.nextClassName}>Matemáticas Avanzadas</Text>
              <Text style={styles.nextClassTime}>14:30 - 16:00</Text>
              <Text style={styles.nextClassRoom}>Aula 205</Text>
            </View>
            <View style={styles.nextClassTime}>
              <Text style={styles.timeRemaining}>en 2h 15min</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => handleNavPress(item.id)}
          >
            <Ionicons name={item.icon as any} size={24} color={item.color} />
            <Text style={[styles.navLabel, { color: item.color }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 4,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  nextClassCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextClassInfo: {
    flex: 1,
  },
  nextClassName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  nextClassTime: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  nextClassRoom: {
    fontSize: 14,
    color: '#64748B',
  },
  timeRemaining: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default App;